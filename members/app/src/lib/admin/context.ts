import "server-only";
import { requireAdmin, type Profile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Every admin page and action starts here: it checks the session is an active administrator (with the
 * second factor when they turned it on) and only then hands out the service-role client.
 */
export async function adminContext(next = "/admin") {
  const profile = await requireAdmin(next);
  return { profile, db: createAdminClient() };
}

/** Records who did what. Admin actions call it after the change succeeded. */
export async function audit(
  actor: Pick<Profile, "id"> | null,
  action: string,
  target: { type: string; id: string },
  meta?: Record<string, unknown>,
) {
  const { error } = await createAdminClient()
    .from("audit_log")
    .insert({ actor_id: actor?.id ?? null, action, target_type: target.type, target_id: target.id, meta: meta ?? null });
  if (error) console.error("audit failed", action, error.message);
}

export type ActionResult = { ok: true; message?: string; data?: Record<string, unknown> } | { ok: false; error: string };

export const fail = (error: string): ActionResult => ({ ok: false, error });
