/**
 * Sends a signed gateway event to the webhook, exactly as the Kingdom gateway would.
 *
 *   npm run webhook:simulate -- --type paid --email ana@example.co.za --name "Ana Sitoe" --products prod_noah_ark,prod_money_gods_way --locale pt
 *   npm run webhook:simulate -- --type refunded --order ord_123 --email ana@example.co.za          (full refund)
 *   npm run webhook:simulate -- --type refunded --order ord_123 --email ana@example.co.za --refund 5000
 *   npm run webhook:simulate -- --type disputed --order ord_123 --email ana@example.co.za
 *   npm run webhook:simulate -- --type resolved --outcome won --order ord_123 --email ana@example.co.za
 *   npm run webhook:simulate -- --type test
 *
 * Options: --url (default NEXT_PUBLIC_SITE_URL or http://localhost:3000), --secret (default GATEWAY_WEBHOOK_SECRET),
 * --event-id (reuse one to test deduplication), --member <user id> (padlock purchase), --amount <cents>, --test-mode,
 * --bad-signature, --json (print only the JSON result).
 */
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { signatureHeader } from "../src/lib/gateway/signature";

const TYPES: Record<string, string> = {
  paid: "order.paid",
  refunded: "order.refunded",
  disputed: "order.disputed",
  resolved: "order.dispute_resolved",
  test: "integration.test",
};

const { values } = parseArgs({
  options: {
    type: { type: "string", default: "paid" },
    email: { type: "string" },
    name: { type: "string", default: "Test Buyer" },
    products: { type: "string", default: "" },
    locale: { type: "string", default: "en" },
    order: { type: "string" },
    amount: { type: "string", default: "14900" },
    refund: { type: "string" },
    outcome: { type: "string" },
    member: { type: "string" },
    "event-id": { type: "string" },
    url: { type: "string" },
    secret: { type: "string" },
    "test-mode": { type: "boolean", default: false },
    "bad-signature": { type: "boolean", default: false },
    json: { type: "boolean", default: false },
  },
});

const type = TYPES[values.type ?? ""] ?? values.type!;
const secret: string = values.secret ?? process.env.GATEWAY_WEBHOOK_SECRET ?? "";
if (!secret) throw new Error("No signing secret: pass --secret or set GATEWAY_WEBHOOK_SECRET");
if (type !== "integration.test" && !values.email) throw new Error("--email is required");

const amount = Number(values.amount);
const orderId = values.order ?? `ord_sim_${Date.now()}`;
const refunded = type === "order.refunded" ? Number(values.refund ?? amount) : 0;

const event = {
  id: values["event-id"] ?? `evt_sim_${randomUUID()}`,
  type,
  api_version: "2026-09-01",
  created_at: new Date().toISOString(),
  livemode: !values["test-mode"],
  data:
    type === "integration.test"
      ? { message: "Hello from the simulator" }
      : {
          order: {
            id: orderId,
            reference: `KG-SIM-${orderId.slice(-6).toUpperCase()}`,
            status: type === "order.paid" ? "paid" : type.replace("order.", ""),
            amount,
            currency: "ZAR",
            refunded_amount: refunded,
            ...(type === "order.refunded" ? { full_refund: refunded >= amount } : {}),
            paid_at: new Date().toISOString(),
            provider: "paystack",
            provider_reference: `T${Date.now()}`,
          },
          customer: { email: values.email, name: values.name, phone: null },
          locale: values.locale,
          items: (values.products ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((product_id) => ({ product_id, quantity: 1, unit_amount: amount })),
          metadata: { member_user_id: values.member ?? null, source: values.member ? "padlock" : "checkout" },
          ...(type === "order.dispute_resolved" ? { outcome: values.outcome ?? "won" } : {}),
        },
};

async function main() {
  const body = JSON.stringify(event);
  const base = (values.url ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const res = await fetch(`${base}/api/webhooks/gateway`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "KingdomGateway-Webhooks/1.0 (simulator)",
      "X-Kingdom-Event-Id": event.id,
      "X-Kingdom-Event-Type": event.type,
      "X-Kingdom-Signature": signatureHeader([values["bad-signature"] ? "wrong-secret" : secret], body),
    },
    body,
  });
  const result = { status: res.status, eventId: event.id, orderId, response: await res.json().catch(() => null) };
  console.log(values.json ? JSON.stringify(result) : result);
  if (!res.ok && !values["bad-signature"]) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
