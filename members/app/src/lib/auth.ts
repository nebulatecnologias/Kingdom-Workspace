import "server-only";
import type { ShellUser } from "@/components/shell/app-shell";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/** The signed-in member for the shell, or null (also null when Supabase is not configured yet). */
export async function getCurrentUser(): Promise<ShellUser> {
  if (!hasSupabase()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", data.user.id)
    .maybeSingle();
  return { name: profile?.full_name || data.user.email || "", email: profile?.email ?? data.user.email ?? "" };
}
