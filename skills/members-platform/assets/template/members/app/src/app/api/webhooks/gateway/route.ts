import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { alertAdmins } from "@/lib/alerts";
import { retryFailedEmails } from "@/lib/email/retry";
import { gatewayEvent, isOrderEvent, parseOrderData } from "@/lib/gateway/events";
import { gatewaySecrets, handleOrderEvent, type Outcome } from "@/lib/gateway/process";
import { verifySignature } from "@/lib/gateway/signature";
import { allow } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Receives events from the Kingdom payment gateway (contract in docs/prompt-gateway.md).
 * Signed with HMAC-SHA256, deduplicated by event id, applied in one database transaction.
 * 2xx means "received, do not send again"; 5xx asks the gateway to retry later.
 */
export const maxDuration = 30;

const MAX_BODY_BYTES = 256 * 1024;

const json = (body: unknown, status = 200) => Response.json(body, { status });

async function logRejected(request: Request, reason: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await allow("webhookRejected", ip))) return;
  await createAdminClient().from("webhook_events").insert({
    event_id: `rejected_${randomUUID()}`,
    type: (request.headers.get("x-kingdom-event-type") ?? "unknown").slice(0, 100),
    signature_ok: false,
    result: "rejected",
    error: reason,
    payload: { header_event_id: request.headers.get("x-kingdom-event-id")?.slice(0, 200) ?? null, ip },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  if (Buffer.byteLength(body) > MAX_BODY_BYTES) return json({ error: "payload too large" }, 413);

  const secrets = await gatewaySecrets();
  if (!secrets.length) {
    console.error("gateway webhook: no signing secret configured (GATEWAY_WEBHOOK_SECRET)");
    return json({ error: "webhook not configured" }, 503);
  }
  const check = verifySignature({ header: request.headers.get("x-kingdom-signature"), body, secrets });
  if (!check.ok) {
    await logRejected(request, `signature ${check.reason}`);
    return json({ error: "invalid signature" }, 401);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(body);
  } catch {
    await logRejected(request, "body is not JSON");
    return json({ error: "invalid JSON" }, 400);
  }
  const envelope = gatewayEvent.safeParse(parsedJson);
  if (!envelope.success) {
    await logRejected(request, `invalid event: ${envelope.error.issues.map((i) => i.path.join(".") || i.message).join(", ")}`);
    return json({ error: "invalid event" }, 400);
  }
  const event = envelope.data;
  const admin = createAdminClient();

  const { data: claim, error: claimError } = await admin.rpc("claim_webhook_event", {
    p_event_id: event.id,
    p_type: event.type,
    p_payload: parsedJson,
  });
  if (claimError) {
    console.error("gateway webhook: claim failed", claimError.message);
    return json({ error: "temporarily unavailable" }, 503);
  }
  if (claim === "duplicate") return json({ received: true, duplicate: true });

  let outcome: Outcome;
  try {
    // Test pings prove the connection, so they are acknowledged in either mode.
    if (event.type === "integration.test") {
      outcome = { result: "processed", note: "integration test received" };
    } else if (!event.livemode && process.env.GATEWAY_ACCEPT_TEST_EVENTS !== "true") {
      outcome = { result: "processed", note: "test-mode event ignored (GATEWAY_ACCEPT_TEST_EVENTS is off)" };
    } else if (isOrderEvent(event.type)) {
      const data = parseOrderData(event.type, event.data);
      outcome = data.ok
        ? await handleOrderEvent(event.type, data.data, claim === "retry")
        : { result: "rejected", note: `invalid data: ${data.error}` };
    } else {
      outcome = { result: "processed", note: `event type ${event.type} is not used` };
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("gateway webhook: processing failed", event.id, message);
    await admin.from("webhook_events").update({ result: "error", error: message.slice(0, 2000) }).eq("event_id", event.id);
    after(() => alertAdmins("webhook_error", [`webhook_error_event:${event.id}`]));
    return json({ error: "processing failed, retry later" }, 500);
  }

  await admin.from("webhook_events").update({ result: outcome.result, error: outcome.note }).eq("event_id", event.id);
  after(() => retryFailedEmails(5).catch((e) => console.error("email retry failed", e)));
  // A buyer paid for something we can't match to a product: a person has to fix the mapping and give access.
  if (outcome.unmapped?.length) after(() => alertAdmins("unknown_product", [`unknown_products:${outcome.unmapped!.join(", ")}`]));
  if (outcome.result === "rejected") return json({ received: true, result: "rejected", reason: outcome.note }, 422);
  return json({ received: true, result: outcome.result });
}
