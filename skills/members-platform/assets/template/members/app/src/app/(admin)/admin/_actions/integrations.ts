"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { adminContext, audit, fail, type ActionResult } from "@/lib/admin/context";
import { gatewaySecrets } from "@/lib/gateway/process";
import { signatureHeader } from "@/lib/gateway/signature";
import { siteUrl } from "@/lib/request";

export type SecretState = { status: "idle" | "saved" | "error"; message?: string };

const GRACE_HOURS = 24;

/**
 * Stores the signing secret shown by the gateway when the integration is created or its secret rotated.
 * The previous secret keeps working for 24 hours, the same grace period the gateway uses.
 */
export async function saveGatewaySecret(_prev: SecretState, fd: FormData): Promise<SecretState> {
  const { profile, db } = await adminContext("/admin/integrations");
  const secret = String(fd.get("secret") ?? "").trim();
  if (!/^\S{16,200}$/.test(secret)) return { status: "error", message: "err_secret" };
  const { data: current } = await db.from("integration_secrets").select("id, secret_current").eq("name", "gateway").maybeSingle();
  if (current?.secret_current === secret) return { status: "saved" };
  const previous = current?.secret_current ?? process.env.GATEWAY_WEBHOOK_SECRET ?? null;
  const row = {
    name: "gateway",
    secret_current: secret,
    secret_previous: previous,
    previous_valid_until: previous ? new Date(Date.now() + GRACE_HOURS * 3_600_000).toISOString() : null,
  };
  const { error } = current
    ? await db.from("integration_secrets").update(row).eq("id", current.id)
    : await db.from("integration_secrets").insert(row);
  if (error) {
    console.error("saveGatewaySecret failed", error.message);
    return { status: "error", message: "err_generic" };
  }
  await audit(profile, "admin.integration.secret_set", { type: "integration", id: "gateway" }, { rotated: Boolean(previous) });
  revalidatePath("/admin/integrations");
  return { status: "saved" };
}

/** Shows the stored secret to an admin (recorded in the activity log). */
export async function revealGatewaySecret(): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/integrations");
  const { data } = await db.from("integration_secrets").select("secret_current").eq("name", "gateway").maybeSingle();
  const secret = data?.secret_current ?? process.env.GATEWAY_WEBHOOK_SECRET ?? null;
  if (!secret) return fail("err_not_found");
  await audit(profile, "admin.integration.secret_revealed", { type: "integration", id: "gateway" });
  return { ok: true, data: { secret } };
}

/**
 * Signs an `integration.test` event with the current secret and posts it to our own webhook,
 * checking the whole path the gateway will use: URL, signature and processing.
 */
export async function sendTestEvent(): Promise<ActionResult> {
  const { profile } = await adminContext("/admin/integrations");
  const [secret] = await gatewaySecrets();
  if (!secret) return fail("err_no_secret");
  const id = `evt_admin_test_${randomUUID()}`;
  const body = JSON.stringify({ id, type: "integration.test", api_version: "2026-09-01", created_at: new Date().toISOString(), livemode: true, data: { sent_by: "admin" } });
  let status = 0;
  try {
    const res = await fetch(`${siteUrl()}/api/webhooks/gateway`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "KingdomMembers-Admin-Test/1.0",
        "X-Kingdom-Event-Id": id,
        "X-Kingdom-Event-Type": "integration.test",
        "X-Kingdom-Signature": signatureHeader([secret], body),
      },
      body,
      signal: AbortSignal.timeout(10_000),
      redirect: "manual",
    });
    status = res.status;
  } catch (e) {
    console.error("test event failed", e);
  }
  await audit(profile, "admin.integration.test", { type: "integration", id: "gateway" }, { status });
  revalidatePath("/admin/integrations");
  return status >= 200 && status < 300 ? { ok: true } : fail(status ? "err_test_status" : "err_test_unreachable");
}
