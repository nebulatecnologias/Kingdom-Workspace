import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const LIMITS = {
  login: { limit: 10, windowSeconds: 15 * 60 },
  link: { limit: 5, windowSeconds: 15 * 60 },
  invite: { limit: 10, windowSeconds: 15 * 60 },
  // Only limits how many rejected webhook deliveries get logged, so a flood cannot fill the table.
  webhookRejected: { limit: 30, windowSeconds: 15 * 60 },
  // Admin alert emails: one per kind per hour, and one daily summary.
  alert: { limit: 1, windowSeconds: 60 * 60 },
  alertDaily: { limit: 1, windowSeconds: 20 * 60 * 60 },
} as const;

/** Registers a hit and returns true while the caller is within the limit. Fails open if the check itself errors. */
export async function allow(kind: keyof typeof LIMITS, ...parts: string[]) {
  const { limit, windowSeconds } = LIMITS[kind];
  const { data, error } = await createAdminClient().rpc("hit_rate_limit", {
    p_key: [kind, ...parts].join(":").toLowerCase(),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed", error.message);
    return true;
  }
  return data === true;
}
