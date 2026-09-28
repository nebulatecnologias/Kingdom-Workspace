import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Things an admin should look at, over the last `hours`:
 * - webhookErrors: events we could not process (the gateway will retry, but something is wrong);
 * - badSignatures: deliveries with a wrong or old signature (secret mismatch, or someone probing);
 * - emailsGivenUp: invites or "unlocked" emails that failed every retry;
 * - unknownProducts: paid orders for gateway products not linked to any product (the buyer got nothing).
 */
export type HealthIssues = {
  webhookErrors: number;
  badSignatures: number;
  emailsGivenUp: number;
  unknownProducts: string[];
};

export async function healthIssues(db: SupabaseClient, hours = 24): Promise<HealthIssues> {
  const since = new Date(Date.now() - hours * 3_600_000).toISOString();
  const stuck = new Date(Date.now() - 15 * 60_000).toISOString();
  const [errors, stuckRows, bad, gaveUp, gateway] = await Promise.all([
    db.from("webhook_events").select("event_id", { count: "exact", head: true }).eq("result", "error").gte("received_at", since),
    db.from("webhook_events").select("event_id", { count: "exact", head: true }).eq("result", "processing").lt("received_at", stuck).gte("received_at", since),
    db.from("webhook_events").select("event_id", { count: "exact", head: true }).eq("signature_ok", false).gte("received_at", since),
    db
      .from("email_log")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .is("next_attempt_at", null)
      .in("template", ["invite", "unlocked"])
      .gte("created_at", since),
    db.from("audit_log").select("meta").like("action", "gateway.order.%").gte("at", since).limit(500),
  ]);
  const unknown = new Set<string>();
  for (const r of gateway.data ?? []) for (const id of ((r.meta as { unmapped?: string[] } | null)?.unmapped ?? [])) unknown.add(id);
  return {
    webhookErrors: (errors.count ?? 0) + (stuckRows.count ?? 0),
    badSignatures: bad.count ?? 0,
    emailsGivenUp: gaveUp.count ?? 0,
    unknownProducts: [...unknown],
  };
}

export const hasIssues = (h: HealthIssues) => h.webhookErrors > 0 || h.badSignatures > 0 || h.emailsGivenUp > 0 || h.unknownProducts.length > 0;
