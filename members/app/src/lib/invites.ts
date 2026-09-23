import "server-only";
import { isLocale, type Locale } from "@/i18n/config";
import { renderInviteEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { siteUrl } from "@/lib/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateToken, hashToken, looksLikeToken } from "@/lib/tokens";

export type InviteState = "valid" | "expired" | "used" | "invalid";

export type InviteView = {
  id: string;
  email: string;
  fullName: string;
  locale: Locale;
  expiresAt: string;
  productIds: string[];
};

function ttlDays(override?: number) {
  const n = override ?? Number(process.env.INVITE_TTL_DAYS ?? 7);
  return Number.isFinite(n) && n !== 0 ? n : 7;
}

/** Looks an invite up by its token without consuming it (opening a link must not use it up). */
export async function findInvite(token: string): Promise<{ state: InviteState; invite?: InviteView }> {
  if (!looksLikeToken(token)) return { state: "invalid" };
  const admin = createAdminClient();
  const { data } = await admin
    .from("invites")
    .select("id, email, full_name, locale, status, expires_at, product_ids")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!data) return { state: "invalid" };
  const invite: InviteView = {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    locale: isLocale(data.locale) ? data.locale : "en",
    expiresAt: data.expires_at,
    productIds: data.product_ids ?? [],
  };
  if (data.status === "accepted") return { state: "used", invite };
  if (data.status === "revoked") return { state: "invalid", invite };
  if (data.status === "expired" || new Date(data.expires_at) <= new Date()) return { state: "expired", invite };
  return { state: "valid", invite };
}

export async function markInviteOpened(id: string) {
  await createAdminClient()
    .from("invites")
    .update({ status: "opened", opened_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "sent");
}

/** Gives access by email; the grant is linked to the account when it is created. Idempotent. */
export async function grantByEmail(opts: { email: string; productIds: string[]; source: "order" | "manual"; orderId?: string }) {
  const admin = createAdminClient();
  const email = opts.email.toLowerCase();
  if (!opts.productIds.length) return;
  const { data: existing } = await admin
    .from("entitlements")
    .select("product_id")
    .eq("email", email)
    .in("product_id", opts.productIds)
    .is("revoked_at", null);
  const have = new Set((existing ?? []).map((e) => e.product_id));
  const rows = opts.productIds
    .filter((id) => !have.has(id))
    .map((product_id) => ({ email, product_id, source: opts.source, order_id: opts.orderId ?? null }));
  if (rows.length) {
    const { error } = await admin.from("entitlements").insert(rows);
    if (error && error.code !== "23505") throw new Error(error.message);
  }
}

async function productTitles(productIds: string[], locale: Locale) {
  if (!productIds.length) return [];
  const { data } = await createAdminClient()
    .from("product_translations")
    .select("product_id, locale, title")
    .in("product_id", productIds)
    .in("locale", [locale, "en"]);
  return productIds
    .map((id) => (data ?? []).find((r) => r.product_id === id && r.locale === locale)?.title ?? (data ?? []).find((r) => r.product_id === id)?.title)
    .filter((x): x is string => Boolean(x));
}

/**
 * Creates (or refreshes) the pending invite for an email and emails a new single-use link.
 * A person never has two live links: a newer invite replaces the older token and merges the products.
 */
export async function issueInvite(opts: {
  email: string;
  fullName?: string;
  locale: Locale;
  productIds: string[];
  source: "gateway" | "manual";
  orderId?: string;
  createdBy?: string;
  /** Defaults to INVITE_TTL_DAYS (7). Negative values are only for tests (already-expired invites). */
  expiresInDays?: number;
}): Promise<{ inviteId: string; url: string; expiresAt: Date; emailed: boolean }> {
  const admin = createAdminClient();
  const email = opts.email.trim().toLowerCase();
  const { token, hash } = generateToken();
  const expiresAt = new Date(Date.now() + ttlDays(opts.expiresInDays) * 86_400_000);

  const { data: pending } = await admin
    .from("invites")
    .select("id, product_ids, full_name")
    .eq("email", email)
    .in("status", ["sent", "opened", "expired"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let inviteId: string;
  let productIds = [...new Set(opts.productIds)];
  if (pending) {
    productIds = [...new Set([...(pending.product_ids ?? []), ...productIds])];
    const { error } = await admin
      .from("invites")
      .update({
        token_hash: hash,
        product_ids: productIds,
        status: "sent",
        opened_at: null,
        expires_at: expiresAt.toISOString(),
        locale: opts.locale,
        full_name: opts.fullName || pending.full_name,
      })
      .eq("id", pending.id);
    if (error) throw new Error(error.message);
    inviteId = pending.id;
  } else {
    const { data, error } = await admin
      .from("invites")
      .insert({
        email,
        full_name: opts.fullName ?? "",
        locale: opts.locale,
        token_hash: hash,
        product_ids: productIds,
        expires_at: expiresAt.toISOString(),
        source: opts.source,
        order_id: opts.orderId ?? null,
        created_by: opts.createdBy ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    inviteId = data.id;
  }

  if (opts.source === "manual") await grantByEmail({ email, productIds: opts.productIds, source: "manual" });

  const url = `${siteUrl()}/invite/${token}?lang=${opts.locale}`;
  const { ok } = await sendEmail({
    to: email,
    template: "invite",
    locale: opts.locale,
    link: url,
    email: renderInviteEmail({
      locale: opts.locale,
      siteUrl: siteUrl(),
      name: (opts.fullName || pending?.full_name || email.split("@")[0]).split(" ")[0],
      url,
      expiresAt,
      productTitles: await productTitles(productIds, opts.locale),
    }),
  });
  return { inviteId, url, expiresAt, emailed: ok };
}
