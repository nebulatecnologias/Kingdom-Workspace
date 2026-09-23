import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const LIMITS = {
  login: { limit: 10, windowSeconds: 15 * 60 },
  link: { limit: 5, windowSeconds: 15 * 60 },
  invite: { limit: 10, windowSeconds: 15 * 60 },
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
