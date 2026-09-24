"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";
import { emailSignInLink } from "@/lib/access";
import { renderResetEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { findInvite, issueInvite } from "@/lib/invites";
import { allow } from "@/lib/rate-limit";
import { clientIp, homeFor, safeNext, siteUrl } from "@/lib/request";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/tokens";

/** Result shown by the auth forms. Messages are translation keys. */
export type FormState = {
  status: "idle" | "error" | "sent" | "reset_sent";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "password" | "terms" | "email", string>>;
  email?: string;
};

const emailSchema = z.email().max(254);
const normaliseEmail = (v: FormDataEntryValue | null) => String(v ?? "").trim().toLowerCase();
/**
 * Language for an email to someone we have no profile or invite for: the one they picked (language selector,
 * or a link from one of our emails, both stored in the cookie). Never guessed from the browser: English otherwise.
 */
async function chosenLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : "en";
}

async function audit(action: string, targetType: string, targetId: string, meta?: Record<string, unknown>, actorId?: string) {
  await createAdminClient().from("audit_log").insert({ action, target_type: targetType, target_id: targetId, meta: meta ?? null, actor_id: actorId ?? null });
}

// ---------------------------------------------------------------------------
// Accept an invite: create the account, link purchases, sign in.
// ---------------------------------------------------------------------------
export async function acceptInvite(token: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIp();
  if (!(await allow("invite", ip))) return { status: "error", message: "err_rate" };

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const noPassword = formData.get("nopw") === "on";
  const password = String(formData.get("password") ?? "");
  const terms = formData.get("terms") === "on";
  const fieldErrors: FormState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "err_name";
  if (!noPassword && password.length < 8) fieldErrors.password = "err_pw";
  if (!terms) fieldErrors.terms = "err_terms";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const found = await findInvite(token);
  if (found.state !== "valid" || !found.invite) redirect(`/invite/${token}`);

  const admin = createAdminClient();
  const { data: consumed, error: consumeError } = await admin.rpc("consume_invite", { p_token_hash: hashToken(token) }).single<{
    result: string;
    invite_id: string;
    email: string;
    locale: Locale;
  }>();
  if (consumeError) {
    console.error("consume_invite failed", consumeError.message);
    return { status: "error", message: "err_generic" };
  }
  if (consumed.result !== "ok") redirect(`/invite/${token}`);

  const email = consumed.email;
  const locale = isLocale(consumed.locale) ? consumed.locale : "en";
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: noPassword ? undefined : password,
    email_confirm: true,
    user_metadata: { full_name: name, locale, terms_accepted: "true" },
  });

  if (createError || !created.user) {
    const exists = createError?.code === "email_exists" || /already been registered/i.test(createError?.message ?? "");
    if (exists) {
      // Already a member: attach the new purchases to the existing account and ask them to sign in.
      const { data: profile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
      if (profile) await admin.rpc("link_entitlements", { p_user_id: profile.id, p_email: email });
      redirect(`/login?notice=account_exists&email=${encodeURIComponent(email)}`);
    }
    // Give the invite back so the person can try again.
    await admin.from("invites").update({ status: "opened", accepted_at: null }).eq("id", consumed.invite_id);
    console.error("createUser failed", createError?.message);
    return { status: "error", message: "err_generic" };
  }

  await admin.rpc("link_entitlements", { p_user_id: created.user.id, p_email: email });

  const supabase = await createClient();
  if (noPassword) {
    const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (!error && link.properties?.hashed_token) {
      await supabase.auth.verifyOtp({ type: "email", token_hash: link.properties.hashed_token });
    }
  } else {
    await supabase.auth.signInWithPassword({ email, password });
  }
  await setLocale(locale);
  await admin.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", created.user.id);
  await audit("invite.accepted", "invite", consumed.invite_id, { email }, created.user.id);
  redirect("/library?welcome=1");
}

// ---------------------------------------------------------------------------
// Email link: signs in existing members; re-issues the invite for buyers without an account.
// The reply is always the same so the form never reveals who is a customer.
// ---------------------------------------------------------------------------
async function sendAccessLink(email: string, locale: Locale) {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id, full_name, locale, status").eq("email", email).maybeSingle();

  if (profile) {
    if (profile.status !== "active") return;
    await emailSignInLink({ email, fullName: profile.full_name, locale: isLocale(profile.locale) ? profile.locale : locale });
    return;
  }

  // No account yet: bought something (pending invite or grants by email)? Send a fresh invite.
  const [{ data: invite }, { data: grants }] = await Promise.all([
    admin.from("invites").select("source, locale, full_name").eq("email", email).in("status", ["sent", "opened", "expired"]).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("entitlements").select("product_id").eq("email", email).is("user_id", null).is("revoked_at", null),
  ]);
  if (!invite && !grants?.length) return;
  await issueInvite({
    email,
    fullName: invite?.full_name ?? undefined,
    locale: invite && isLocale(invite.locale) ? invite.locale : locale,
    productIds: (grants ?? []).map((g) => g.product_id),
    source: invite?.source === "manual" ? "manual" : "gateway",
  });
}

export async function requestLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normaliseEmail(formData.get("email"));
  if (!emailSchema.safeParse(email).success) return { status: "error", fieldErrors: { email: "err_email" } };
  const ip = await clientIp();
  if (!(await allow("link", ip)) || !(await allow("link", email))) return { status: "error", message: "err_rate" };
  try {
    await sendAccessLink(email, await chosenLocale());
  } catch (e) {
    console.error("sendAccessLink failed", e);
  }
  return { status: "sent", email };
}

// ---------------------------------------------------------------------------
// Password sign-in and recovery
// ---------------------------------------------------------------------------
export async function signInWithPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normaliseEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  if (!emailSchema.safeParse(email).success) return { status: "error", fieldErrors: { email: "err_email" }, email };
  const ip = await clientIp();
  if (!(await allow("login", ip)) || !(await allow("login", email))) return { status: "error", message: "err_rate", email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { status: "error", message: "err_login", email };

  const { data: profile } = await supabase.from("profiles").select("locale, status, role").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    return { status: "error", message: "err_login", email };
  }
  if (isLocale(profile.locale)) await setLocale(profile.locale);
  await createAdminClient().from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", data.user.id);
  const next = String(formData.get("next") ?? "");
  redirect(next ? safeNext(next) : homeFor(profile.role));
}

export async function forgotPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = normaliseEmail(formData.get("email"));
  if (!emailSchema.safeParse(email).success) return { status: "error", fieldErrors: { email: "err_email" }, email };
  const ip = await clientIp();
  if (!(await allow("link", ip)) || !(await allow("link", email))) return { status: "error", message: "err_rate", email };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("full_name, locale, status").eq("email", email).maybeSingle();
  if (profile?.status === "active") {
    const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
    if (!error && data.properties?.hashed_token) {
      const locale: Locale = isLocale(profile.locale) ? profile.locale : await chosenLocale();
      const url = `${siteUrl()}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery&lang=${locale}`;
      await sendEmail({
        to: email,
        template: "reset",
        locale,
        link: url,
        email: renderResetEmail({ locale, siteUrl: siteUrl(), name: (profile.full_name || "").split(" ")[0], url }),
      });
    }
  }
  return { status: "reset_sent", email };
}

/** Second step of every emailed link: a button press (not the page load) uses the one-time token. */
export async function confirmLink(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = formData.get("type") === "recovery" ? "recovery" : "email";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) redirect("/login?error=link");
  const { data: profile } = await supabase.from("profiles").select("locale, status, role").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirect("/login?error=link");
  }
  if (isLocale(profile.locale)) await setLocale(profile.locale);
  await createAdminClient().from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", data.user.id);
  const next = String(formData.get("next") ?? "");
  redirect(type === "recovery" ? "/auth/reset" : next ? safeNext(next) : homeFor(profile.role));
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { status: "error", fieldErrors: { password: "err_pw" } };
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) redirect("/login?error=link");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", message: "err_generic" };
  redirect("/library?notice=password");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
