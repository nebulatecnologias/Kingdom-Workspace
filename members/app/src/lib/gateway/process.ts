import "server-only";
import { isLocale, type Locale } from "@/i18n/config";
import { renderUnlockedEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { issueInvite, productTitles } from "@/lib/invites";
import { siteUrl } from "@/lib/request";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderEventType } from "./events";

export type Outcome = { result: "processed" | "rejected"; note: string | null };

type ApplyResult = {
  order_id: string;
  status: string;
  user_id: string | null;
  email: string;
  name: string;
  locale: string;
  products: string[];
  granted: string[];
  unmapped: string[];
  revoked: number;
  restored: number;
};

/** Signing secrets to accept: the stored current one, the previous one while its grace period lasts, and the env seed. */
export async function gatewaySecrets(): Promise<string[]> {
  const { data } = await createAdminClient()
    .from("integration_secrets")
    .select("secret_current, secret_previous, previous_valid_until")
    .eq("name", "gateway")
    .maybeSingle();
  const secrets: string[] = [];
  if (data) {
    secrets.push(data.secret_current);
    if (data.secret_previous && data.previous_valid_until && new Date(data.previous_valid_until) > new Date()) secrets.push(data.secret_previous);
  }
  if (process.env.GATEWAY_WEBHOOK_SECRET) secrets.push(process.env.GATEWAY_WEBHOOK_SECRET);
  return [...new Set(secrets.filter(Boolean))];
}

/** Suspend access while a dispute is open (default), or keep it until the dispute is lost. */
function disputeSuspends() {
  return process.env.DISPUTE_SUSPENDS_ACCESS !== "false";
}

/**
 * Applies an order event and sends the email it calls for.
 * Throws on unexpected failures so the webhook answers 500 and the gateway retries;
 * on a retry, emails are sent again even if the grant already happened the first time.
 */
export async function handleOrderEvent(type: OrderEventType, data: unknown, isRetry: boolean): Promise<Outcome> {
  const admin = createAdminClient();
  const { data: applied, error } = await admin.rpc("gateway_apply_event", {
    p_type: type,
    p_data: data,
    p_suspend_on_dispute: disputeSuspends(),
  });
  if (error) {
    if (error.code === "22023") return { result: "rejected", note: error.message };
    throw new Error(`gateway_apply_event failed: ${error.message}`);
  }
  const r = applied as ApplyResult;
  const notes: string[] = [`order ${r.status}`];
  if (r.unmapped.length) notes.push(`unknown gateway products: ${r.unmapped.join(", ")}`);
  if (r.revoked) notes.push(`access removed: ${r.revoked}`);
  if (r.restored) notes.push(`access restored: ${r.restored}`);

  const shouldEmail = type === "order.paid" && r.products.length > 0 && (r.granted.length > 0 || isRetry);
  if (shouldEmail && r.user_id) {
    const { data: profile } = await admin.from("profiles").select("full_name, locale").eq("id", r.user_id).single();
    const locale: Locale = isLocale(profile?.locale) ? profile.locale : "en";
    const order = (data as { order?: { reference?: string | null; amount?: number | null } }).order;
    const ids = r.granted.length ? r.granted : r.products;
    const { ok } = await sendEmail({
      to: r.email,
      template: "unlocked",
      locale,
      email: renderUnlockedEmail({
        locale,
        siteUrl: siteUrl(),
        name: (profile?.full_name || r.name || "").split(" ")[0],
        productTitles: await productTitles(ids, locale),
        orderRef: order?.reference,
        amountCents: order?.amount,
      }),
    });
    notes.push(ok ? "unlocked email sent" : "unlocked email failed (will retry)");
  } else if (shouldEmail) {
    const { emailed } = await issueInvite({
      email: r.email,
      fullName: r.name,
      locale: isLocale(r.locale) ? r.locale : "en",
      productIds: r.products,
      source: "gateway",
      orderId: r.order_id,
    });
    notes.push(emailed ? "invite sent" : "invite email failed (will retry)");
  }
  return { result: "processed", note: notes.join("; ") };
}
