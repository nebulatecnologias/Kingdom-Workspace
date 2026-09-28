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

/** The signed-in auth user, checked with the auth server. Cached per request. */
const getAuthUser = cache(async () => {
  if (!hasSupabase()) return null;
  const { data } = await (await createClient()).auth.getUser();
  return data.user ?? null;
});

/** The signed-in member's profile, or null. Cached per request. */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getAuthUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("id, email, full_name, locale, role, status")
    .eq("id", user.id)
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

/**
 * Whether this session still has to pass the authenticator app: true when the account has a verified
 * factor and the session has not used it yet. Cached per request.
 */
export const needsSecondFactor = cache(async (): Promise<boolean> => {
  const user = await getAuthUser();
  if (!user || !(user.factors ?? []).some((f) => f.status === "verified")) return false;
  // getClaims verifies the session token before we trust the level it states.
  const { data } = await (await createClient()).auth.getClaims();
  return data?.claims?.aal !== "aal2";
});

/** The verified authenticator app of the signed-in user, if any. */
export async function verifiedFactorId() {
  const user = await getAuthUser();
  return (user?.factors ?? []).find((f) => f.status === "verified" && f.factor_type === "totp")?.id ?? null;
}

/**
 * Use in admin pages and actions: an active administrator; members are sent to their library.
 * Admins with two-step verification on are asked for their code first.
 */
export async function requireAdmin(next = "/admin"): Promise<Profile> {
  const p = await requireMember(next);
  if (p.role !== "admin") redirect("/library");
  if (await needsSecondFactor()) redirect(`/auth/verify?next=${encodeURIComponent(next)}`);
  return p;
}
