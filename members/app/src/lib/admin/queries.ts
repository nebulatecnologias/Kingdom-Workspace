import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isLocale, type Locale } from "@/i18n/config";
import type { ProductType } from "@/lib/catalogue";

/**
 * Reads for the admin pages. They run with the service role, so callers must come through adminContext().
 * Titles and section names are shown in the admin's language, with English as the fallback.
 */

type Db = SupabaseClient;

export type InviteStatus = "sent" | "opened" | "accepted" | "expired" | "revoked";

/** Text safe to put inside a PostgREST or() filter: no separators, wildcards or quotes. */
export function searchTerm(q: unknown) {
  return typeof q === "string" ? q.replace(/[,()%*\\"'`:]/g, " ").trim().slice(0, 80) : "";
}

const pick = <T extends { locale: string }>(rows: T[] | null | undefined, locale: Locale) =>
  (rows ?? []).find((r) => r.locale === locale) ?? (rows ?? []).find((r) => r.locale === "en") ?? (rows ?? [])[0];

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------
export type AdminProduct = {
  id: string;
  slug: string;
  type: ProductType;
  access: "paid" | "free";
  visibility: "visible" | "soon" | "hidden";
  sectionId: string | null;
  sortOrder: number;
  title: string;
  coverPath: string | null;
  fieldColour: string;
  priceCents: number;
  gatewayProductId: string | null;
  checkoutUrl: string | null;
  pageCount: number;
  freeSample: boolean;
};

export async function adminProducts(db: Db, locale: Locale): Promise<AdminProduct[]> {
  const { data, error } = await db
    .from("products")
    .select("id, slug, type, access, visibility, section_id, sort_order, cover_path, field_colour, price_cents, gateway_product_id, checkout_url, page_count, free_sample, product_translations(locale, title)")
    .order("sort_order")
    .order("slug");
  if (error) throw new Error(`products: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    type: p.type,
    access: p.access,
    visibility: p.visibility,
    sectionId: p.section_id,
    sortOrder: p.sort_order,
    title: pick(p.product_translations as { locale: string; title: string }[], locale)?.title ?? p.slug,
    coverPath: p.cover_path,
    fieldColour: p.field_colour ?? "#f3eee8",
    priceCents: p.price_cents,
    gatewayProductId: p.gateway_product_id,
    checkoutUrl: p.checkout_url,
    pageCount: p.page_count ?? 0,
    freeSample: p.free_sample,
  }));
}

export type AdminSection = { id: string; slug: string; sortOrder: number; name: string; names: Record<Locale, string> };

export async function adminSections(db: Db, locale: Locale): Promise<AdminSection[]> {
  const { data, error } = await db.from("sections").select("id, slug, sort_order, section_translations(locale, name)").order("sort_order").order("slug");
  if (error) throw new Error(`sections: ${error.message}`);
  return (data ?? []).map((s) => {
    const rows = s.section_translations as { locale: string; name: string }[];
    const names = { en: "", pt: "", es: "" } as Record<Locale, string>;
    for (const r of rows ?? []) if (isLocale(r.locale)) names[r.locale] = r.name;
    return { id: s.id, slug: s.slug, sortOrder: s.sort_order, name: pick(rows, locale)?.name ?? s.slug, names };
  });
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------
export type Overview = {
  members: number;
  members_month: number;
  pending: number;
  expiring_week: number;
  unlocks_month: number;
  sales_month_cents: number;
  weeks: { members: number; invites: number; unlocks: number }[];
};

export async function overview(db: Db): Promise<Overview> {
  const { data, error } = await db.rpc("admin_overview");
  if (error) throw new Error(`admin_overview: ${error.message}`);
  return data as Overview;
}

// ---------------------------------------------------------------------------
// Invites
// ---------------------------------------------------------------------------
export type AdminInvite = {
  id: string;
  email: string;
  fullName: string;
  locale: Locale;
  status: InviteStatus;
  source: "gateway" | "manual";
  productIds: string[];
  createdAt: string;
  expiresAt: string;
};

/** A pending invite whose date has passed is shown as expired, even before the nightly job marks it. */
export function effectiveStatus(status: InviteStatus, expiresAt: string): InviteStatus {
  return (status === "sent" || status === "opened") && new Date(expiresAt) <= new Date() ? "expired" : status;
}

type InviteRow = {
  id: string; email: string; full_name: string; locale: string; status: InviteStatus; source: "gateway" | "manual";
  product_ids: string[] | null; created_at: string; expires_at: string;
};

const toInvite = (r: InviteRow): AdminInvite => ({
  id: r.id,
  email: r.email,
  fullName: r.full_name,
  locale: isLocale(r.locale) ? r.locale : "en",
  status: effectiveStatus(r.status, r.expires_at),
  source: r.source,
  productIds: r.product_ids ?? [],
  createdAt: r.created_at,
  expiresAt: r.expires_at,
});

const INVITE_COLUMNS = "id, email, full_name, locale, status, source, product_ids, created_at, expires_at";

export async function listInvites(db: Db, opts: { q?: string; limit?: number } = {}): Promise<AdminInvite[]> {
  let query = db.from("invites").select(INVITE_COLUMNS).order("created_at", { ascending: false }).limit(opts.limit ?? 300);
  const q = searchTerm(opts.q);
  if (q) query = query.or(`email.ilike.*${q}*,full_name.ilike.*${q}*`);
  const { data, error } = await query;
  if (error) throw new Error(`invites: ${error.message}`);
  return ((data ?? []) as InviteRow[]).map(toInvite);
}

/** Live invites, soonest to expire first. */
export async function pendingInvites(db: Db, limit = 6): Promise<AdminInvite[]> {
  const { data, error } = await db
    .from("invites")
    .select(INVITE_COLUMNS)
    .in("status", ["sent", "opened"])
    .gt("expires_at", new Date().toISOString())
    .order("expires_at")
    .limit(limit);
  if (error) throw new Error(`invites: ${error.message}`);
  return ((data ?? []) as InviteRow[]).map(toInvite);
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------
export type AdminMember = {
  id: string;
  email: string;
  fullName: string;
  locale: Locale;
  role: "member" | "admin";
  status: "active" | "deactivated";
  createdAt: string;
  lastSeenAt: string | null;
  productIds: string[];
};

export async function listMembers(db: Db, opts: { q?: string; limit?: number } = {}): Promise<{ rows: AdminMember[]; total: number }> {
  let query = db
    .from("profiles")
    .select("id, email, full_name, locale, role, status, created_at, last_seen_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 300);
  const q = searchTerm(opts.q);
  if (q) query = query.or(`email.ilike.*${q}*,full_name.ilike.*${q}*`);
  const [{ data, error, count }, { count: total }] = await Promise.all([query, db.from("profiles").select("id", { count: "exact", head: true })]);
  if (error) throw new Error(`profiles: ${error.message}`);
  const ids = (data ?? []).map((p) => p.id);
  const { data: grants } = ids.length
    ? await db.from("entitlements").select("user_id, product_id").in("user_id", ids).is("revoked_at", null)
    : { data: [] as { user_id: string; product_id: string }[] };
  const byUser = new Map<string, string[]>();
  for (const g of grants ?? []) byUser.set(g.user_id, [...(byUser.get(g.user_id) ?? []), g.product_id]);
  return {
    total: total ?? count ?? 0,
    rows: (data ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      locale: isLocale(p.locale) ? p.locale : "en",
      role: p.role,
      status: p.status,
      createdAt: p.created_at,
      lastSeenAt: p.last_seen_at,
      productIds: byUser.get(p.id) ?? [],
    })),
  };
}

export type MemberGrant = { productId: string; source: "order" | "manual" | "free"; grantedAt: string; orderRef: string | null };

export async function memberDetail(db: Db, id: string) {
  const { data: p } = await db.from("profiles").select("id, email, full_name, locale, role, status, created_at, last_seen_at, terms_accepted_at").eq("id", id).maybeSingle();
  if (!p) return null;
  const [{ data: grants }, { data: orders }, { data: factors }] = await Promise.all([
    db.from("entitlements").select("product_id, source, granted_at, orders(reference, gateway_order_id)").eq("email", p.email).is("revoked_at", null),
    db.from("orders").select("id, gateway_order_id, reference, amount_cents, refunded_cents, status, created_at").eq("email", p.email).order("created_at", { ascending: false }).limit(20),
    db.auth.admin.mfa.listFactors({ userId: p.id }),
  ]);
  return {
    member: {
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      locale: (isLocale(p.locale) ? p.locale : "en") as Locale,
      role: p.role as "member" | "admin",
      status: p.status as "active" | "deactivated",
      createdAt: p.created_at as string,
      lastSeenAt: p.last_seen_at as string | null,
      termsAcceptedAt: p.terms_accepted_at as string | null,
      twoStep: (factors?.factors ?? []).some((f) => f.status === "verified"),
    },
    grants: (grants ?? []).map((g) => {
      const o = g.orders as unknown as { reference: string | null; gateway_order_id: string } | null;
      return { productId: g.product_id, source: g.source, grantedAt: g.granted_at, orderRef: o ? o.reference ?? o.gateway_order_id : null } as MemberGrant;
    }),
    orders: orders ?? [],
  };
}

// ---------------------------------------------------------------------------
// Activity (audit log)
// ---------------------------------------------------------------------------
export type AuditRow = {
  id: number;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  meta: Record<string, unknown> | null;
  at: string;
};

export async function auditRows(db: Db, opts: { limit?: number; before?: number; target?: { type: string; id: string } } = {}) {
  let query = db.from("audit_log").select("id, actor_id, action, target_type, target_id, meta, at").order("id", { ascending: false }).limit(opts.limit ?? 12);
  if (opts.before) query = query.lt("id", opts.before);
  if (opts.target) query = query.eq("target_type", opts.target.type).eq("target_id", opts.target.id);
  const { data, error } = await query;
  if (error) throw new Error(`audit_log: ${error.message}`);
  return (data ?? []) as AuditRow[];
}
