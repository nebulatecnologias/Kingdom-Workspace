import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** POPIA access request: everything we hold about the signed-in member, as a JSON download. */
export async function GET() {
  const profile = await getProfile();
  if (!profile) return new Response("Sign in first.", { status: 401 });
  const supabase = await createClient();
  const admin = createAdminClient();
  const [{ data: me }, { data: entitlements }, { data: orders }, { data: progress }, { data: invites }, { data: emails }] = await Promise.all([
    supabase.from("profiles").select("email, full_name, locale, status, terms_accepted_at, created_at, last_seen_at").eq("id", profile.id).single(),
    supabase.from("entitlements").select("product:products(slug), source, granted_at, revoked_at, revoked_reason").eq("user_id", profile.id),
    supabase.from("orders").select("reference, amount_cents, currency, refunded_cents, status, created_at").eq("user_id", profile.id),
    supabase.from("reading_progress").select("product:products(slug), chapter_position, updated_at").eq("user_id", profile.id),
    admin.from("invites").select("status, created_at, expires_at, accepted_at").eq("email", profile.email),
    admin.from("email_log").select("template, status, created_at").eq("to_email", profile.email),
  ]);
  const body = {
    exported_at: new Date().toISOString(),
    controller: "Shelton Douglas Group (Pty) Ltd (Kingdom Library)",
    profile: me,
    library: entitlements ?? [],
    orders: orders ?? [],
    reading_progress: progress ?? [],
    invites: invites ?? [],
    emails_sent: emails ?? [],
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kingdom-members-my-data.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
