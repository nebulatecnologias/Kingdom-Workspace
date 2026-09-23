import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { ShellUser } from "@/components/shell/app-shell";
import { isLocale, type Locale } from "@/i18n/config";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  locale: Locale;
  role: "member" | "admin";
  status: "active" | "deactivated";
};

/** The signed-in member's profile, or null. Cached per request. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  if (!hasSupabase()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase
    .from("profiles")
    .select("id, email, full_name, locale, role, status")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!p) return null;
  return {
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    locale: isLocale(p.locale) ? p.locale : "en",
    role: p.role === "admin" ? "admin" : "member",
    status: p.status === "deactivated" ? "deactivated" : "active",
  };
});

export async function getCurrentUser(): Promise<ShellUser> {
  const p = await getProfile();
  return p ? { name: p.fullName || p.email, email: p.email } : null;
}

/** Use in member pages and actions: an active member, or a redirect to sign in. */
export async function requireMember(next = "/library"): Promise<Profile> {
  const p = await getProfile();
  if (!p || p.status !== "active") redirect(`/login?next=${encodeURIComponent(next)}`);
  return p;
}

/** Use in admin pages and actions: an active administrator; members are sent to their library. */
export async function requireAdmin(next = "/admin"): Promise<Profile> {
  const p = await requireMember(next);
  if (p.role !== "admin") redirect("/library");
  return p;
}
