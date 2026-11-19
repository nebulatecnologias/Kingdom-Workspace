import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** The signed-in user's profile (checked with the auth server), or null. Cached per request. */
export const getMe = cache(async (): Promise<Profile | null> => {
  if (!hasSupabase()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase
    .from("profiles")
    .select("id, full_name, role, job_title, phone_whatsapp, avatar_url, color, active")
    .eq("id", data.user.id)
    .maybeSingle<Profile>();
  return p ?? null;
});

/** Use in pages and actions: an active team member, or a redirect to sign in. */
export async function requireMember(next = "/"): Promise<Profile> {
  const me = await getMe();
  if (!me || !me.active) redirect(`/login${next && next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`);
  return me;
}

export async function requireAdmin(next = "/"): Promise<Profile> {
  const me = await requireMember(next);
  if (me.role !== "admin") redirect("/");
  return me;
}
