import { isCronRequest } from "@/lib/cron";
import { createAdminClient } from "@/lib/supabase/admin";

/** Daily: marks pending invites that ran out of time as expired, and clears old rate-limit windows. */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return Response.json({ error: "unauthorised" }, { status: 401 });
  const admin = createAdminClient();
  const { data: expired, error } = await admin.rpc("expire_invites");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  await admin.rpc("prune_rate_limits");
  return Response.json({ expired });
}
