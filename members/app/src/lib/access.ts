import "server-only";
import type { Locale } from "@/i18n/config";
import { renderSignInEmail, renderUnlockedEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { productTitles } from "@/lib/invites";
import { siteUrl } from "@/lib/request";
import { createAdminClient } from "@/lib/supabase/admin";

/** Emails a one-time sign-in link to an existing account. Returns false when the link or email failed. */
export async function emailSignInLink(opts: { email: string; fullName: string; locale: Locale }) {
  const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "magiclink", email: opts.email });
  if (error || !data.properties?.hashed_token) {
    console.error("generateLink failed", error?.message);
    return false;
  }
  const url = `${siteUrl()}/auth/confirm?token_hash=${data.properties.hashed_token}&type=email&lang=${opts.locale}`;
  const { ok } = await sendEmail({
    to: opts.email,
    template: "signin",
    locale: opts.locale,
    link: url,
    email: renderSignInEmail({ locale: opts.locale, siteUrl: siteUrl(), name: (opts.fullName || "").split(" ")[0], url }),
  });
  return ok;
}

/**
 * Gives products to a person by hand. Linked to the account straight away when it exists.
 * Returns the products that were not already active.
 */
export async function grantManually(opts: { email: string; userId: string | null; productIds: string[] }) {
  const db = createAdminClient();
  const email = opts.email.toLowerCase();
  if (!opts.productIds.length) return [];
  const { data: existing } = await db.from("entitlements").select("product_id").eq("email", email).in("product_id", opts.productIds).is("revoked_at", null);
  const have = new Set((existing ?? []).map((e) => e.product_id));
  const fresh = [...new Set(opts.productIds)].filter((id) => !have.has(id));
  if (!fresh.length) return [];
  const { error } = await db.from("entitlements").insert(fresh.map((product_id) => ({ email, user_id: opts.userId, product_id, source: "manual" })));
  if (error && error.code !== "23505") throw new Error(error.message);
  return fresh;
}

/** Removes a product from a person, whatever gave it to them (order, manual). */
export async function removeAccess(opts: { email: string; productId: string; reason: string }) {
  const { data, error } = await createAdminClient()
    .from("entitlements")
    .update({ revoked_at: new Date().toISOString(), revoked_reason: opts.reason })
    .eq("email", opts.email.toLowerCase())
    .eq("product_id", opts.productId)
    .is("revoked_at", null)
    .select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

/** "New in your library" for an existing member. */
export async function emailUnlocked(opts: { email: string; fullName: string; locale: Locale; productIds: string[] }) {
  const titles = await productTitles(opts.productIds, opts.locale);
  if (!titles.length) return false;
  const { ok } = await sendEmail({
    to: opts.email,
    template: "unlocked",
    locale: opts.locale,
    email: renderUnlockedEmail({ locale: opts.locale, siteUrl: siteUrl(), name: (opts.fullName || "").split(" ")[0], productTitles: titles }),
  });
  return ok;
}
