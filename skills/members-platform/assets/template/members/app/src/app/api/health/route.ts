import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * For an uptime monitor (e.g. UptimeRobot, Better Stack): 200 when the app can reach its database,
 * 503 otherwise. Reveals nothing else.
 */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const { error } = await createAdminClient().from("products").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers });
  }
}
