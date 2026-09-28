import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditRow } from "./queries";

/**
 * Turns audit log rows into feed lines: a message key (feed_*) plus its values.
 * Messages mark the person with <m>, codes and product names with <c>, and the admin who acted with <adm>.
 */
export type FeedItem = { id: number; key: string; values: Record<string, string>; at: string; href?: string };

const KNOWN = new Set([
  "invite.accepted",
  "profile.deleted",
  "admin.invite.sent",
  "admin.invite.resent",
  "admin.invite.link_copied",
  "admin.invite.revoked",
  "admin.access.granted",
  "admin.access.removed",
  "admin.member.link_sent",
  "admin.member.deactivated",
  "admin.member.reactivated",
  "admin.member.email_changed",
  "admin.product.created",
  "admin.product.updated",
  "admin.product.content",
  "admin.product.deleted",
  "admin.showcase.reordered",
  "admin.showcase.updated",
  "admin.section.created",
  "admin.section.updated",
  "admin.section.deleted",
  "admin.section.reordered",
  "admin.integration.secret_set",
  "admin.integration.secret_revealed",
  "admin.integration.test",
  "admin.mfa.enabled",
  "admin.mfa.disabled",
]);

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

export async function describeActivity(db: SupabaseClient, rows: AuditRow[]): Promise<FeedItem[]> {
  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter((x): x is string => !!x))];
  const orderIds = [...new Set(rows.filter((r) => r.target_type === "order" && r.target_id).map((r) => r.target_id!))];
  const [{ data: actors }, { data: orders }] = await Promise.all([
    actorIds.length ? db.from("profiles").select("id, full_name, email").in("id", actorIds) : Promise.resolve({ data: [] as { id: string; full_name: string; email: string }[] }),
    orderIds.length ? db.from("orders").select("id, reference, gateway_order_id, email, user_id").in("id", orderIds) : Promise.resolve({ data: [] as { id: string; reference: string | null; gateway_order_id: string; email: string; user_id: string | null }[] }),
  ]);
  // Buyers who have an account are shown by name.
  const buyerIds = [...new Set((orders ?? []).map((o) => o.user_id).filter((x): x is string => !!x && !actorIds.includes(x)))];
  const { data: buyers } = buyerIds.length ? await db.from("profiles").select("id, full_name, email").in("id", buyerIds) : { data: [] as { id: string; full_name: string; email: string }[] };
  const people = [...(actors ?? []), ...(buyers ?? [])];
  const actorName = (id: string | null) => {
    const a = people.find((x) => x.id === id);
    return a ? a.full_name || a.email : "";
  };

  return rows.map((r) => {
    const meta = r.meta ?? {};
    const base = { id: r.id, at: r.at };
    if (r.action.startsWith("gateway.order.")) {
      const o = (orders ?? []).find((x) => x.id === r.target_id);
      const values = { ref: o?.reference ?? o?.gateway_order_id ?? str(meta.gateway_order_id), who: actorName(o?.user_id ?? null) || o?.email || "" };
      const href = o?.user_id ? `/admin/members/${o.user_id}` : undefined;
      const status = str(meta.status);
      const kind = r.action.slice("gateway.order.".length);
      const key =
        kind === "paid" ? "feed_paid"
        : kind === "refunded" ? (status === "partially_refunded" ? "feed_refund_partial" : "feed_refund")
        : kind === "disputed" ? "feed_disputed"
        : kind === "dispute_resolved" ? (status === "dispute_lost" ? "feed_dispute_lost" : "feed_dispute_won")
        : "feed_other";
      return { ...base, key, values: key === "feed_other" ? { action: r.action } : values, href };
    }
    if (!KNOWN.has(r.action)) return { ...base, key: "feed_other", values: { action: r.action } };
    const who = str(meta.name) || str(meta.email);
    const values = {
      who,
      actor: actorName(r.actor_id) || "—",
      pack: str(meta.title),
      // A new account is named by its owner (the actor); otherwise by the email it used.
      email: (r.action === "invite.accepted" && actorName(r.actor_id)) || str(meta.email),
    };
    const href =
      r.target_type === "profile" && r.action !== "profile.deleted" ? `/admin/members/${r.target_id}`
      : r.target_type === "product" && r.action !== "admin.product.deleted" ? `/admin/products/${r.target_id}`
      : r.action === "invite.accepted" && r.actor_id ? `/admin/members/${r.actor_id}`
      : undefined;
    return { ...base, key: `feed_${r.action.replace(/^admin\./, "").replace(/\./g, "_")}`, values, href };
  });
}
