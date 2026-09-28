import "server-only";
import { isLocale, type Locale } from "@/i18n/config";
import { renderPlanStartedEmail, renderTrialEndingEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { siteUrl } from "@/lib/request";
import { createAdminClient } from "@/lib/supabase/admin";

/** The one monthly plan: everything in the library, charged by the gateway after a free trial. */
export const PLAN_CODE = "all_access";

export type Plan = { code: string; priceCents: number; trialDays: number; checkoutUrl: string | null; gatewayPlanId: string | null; active: boolean };

/** The plan is offered only once it is switched on and linked to the gateway's checkout. */
export const planOpen = (plan: Plan | null): plan is Plan => Boolean(plan?.active && plan.checkoutUrl);

export async function getPlan(): Promise<Plan | null> {
  const { data } = await createAdminClient().from("plans").select("code, price_cents, trial_days, checkout_url, gateway_plan_id, active").eq("code", PLAN_CODE).maybeSingle();
  if (!data) return null;
  return { code: data.code, priceCents: data.price_cents, trialDays: data.trial_days, checkoutUrl: data.checkout_url, gatewayPlanId: data.gateway_plan_id, active: data.active };
}

export type MemberPlan = {
  status: "trialing" | "active" | "past_due" | "canceled" | "expired";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  accessUntil: string | null;
  cancelAtPeriodEnd: boolean;
  manageUrl: string | null;
  /** Access right now (the database decides, with the same rule as every page). */
  active: boolean;
};

/** The member's most recent subscription, or null if they never had one. */
export async function memberPlan(userId: string): Promise<MemberPlan | null> {
  const admin = createAdminClient();
  const [{ data }, { data: active }] = await Promise.all([
    admin
      .from("subscriptions")
      .select("status, trial_ends_at, current_period_end, access_until, cancel_at_period_end, manage_url")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.rpc("plan_active", { p_user_id: userId }),
  ]);
  if (!data) return null;
  return {
    status: data.status,
    trialEndsAt: data.trial_ends_at,
    currentPeriodEnd: data.current_period_end,
    accessUntil: data.access_until,
    cancelAtPeriodEnd: data.cancel_at_period_end,
    manageUrl: data.manage_url,
    active: active === true,
  };
}

type Applied = { subscription_id: string; user_id: string | null; email: string; status: string; trial_ends_at: string | null; stale: boolean; new: boolean; started_email_sent: boolean };

/**
 * Applies a subscription.* event (the gateway's full view of the subscription). The first time a plan
 * starts, the member gets an email saying what happens next. Throws on unexpected failures (the gateway retries).
 */
export async function handleSubscriptionEvent(data: unknown): Promise<{ result: "processed" | "rejected"; note: string }> {
  const admin = createAdminClient();
  const { data: applied, error } = await admin.rpc("gateway_apply_subscription", { p_data: data });
  if (error) {
    if (error.code === "22023") return { result: "rejected", note: error.message };
    throw new Error(`gateway_apply_subscription failed: ${error.message}`);
  }
  const r = applied as Applied;
  if (r.stale) return { result: "processed", note: `older than the stored subscription (${r.status}); ignored` };
  const notes = [`subscription ${r.status}`];
  if (!r.user_id) notes.push("no account with this email yet: linked when they join");

  const plan = await getPlan();
  if (r.user_id && !r.started_email_sent && (r.status === "trialing" || r.status === "active") && plan) {
    const { data: profile } = await admin.from("profiles").select("full_name, locale").eq("id", r.user_id).single();
    const locale: Locale = isLocale(profile?.locale) ? profile.locale : "en";
    const { ok } = await sendEmail({
      to: r.email,
      template: "plan_started",
      locale,
      email: renderPlanStartedEmail({
        locale,
        siteUrl: siteUrl(),
        name: (profile?.full_name || "").split(" ")[0],
        trialEndsAt: r.status === "trialing" ? r.trial_ends_at : null,
        priceCents: plan.priceCents,
      }),
    });
    if (ok) await admin.from("subscriptions").update({ started_email_sent_at: new Date().toISOString() }).eq("id", r.subscription_id);
    notes.push(ok ? "welcome email sent" : "welcome email failed");
  }
  return { result: "processed", note: notes.join("; ") };
}

/** Three days before a free trial turns into a paid month, the member is reminded once. Runs with the daily job. */
export async function sendTrialReminders(limit = 40, now = new Date()) {
  const admin = createAdminClient();
  const soon = new Date(now.getTime() + 3 * 86_400_000).toISOString();
  const { data } = await admin
    .from("subscriptions")
    .select("id, email, trial_ends_at, manage_url, profile:profiles(full_name, locale, status)")
    .eq("status", "trialing")
    .eq("cancel_at_period_end", false)
    .is("trial_reminder_sent_at", null)
    .gt("trial_ends_at", now.toISOString())
    .lte("trial_ends_at", soon)
    .limit(limit);
  const plan = await getPlan();
  let reminded = 0;
  for (const s of (data ?? []) as unknown as { id: string; email: string; trial_ends_at: string; manage_url: string | null; profile: { full_name: string; locale: string; status: string } | null }[]) {
    if (!plan || s.profile?.status === "deactivated") continue;
    const locale: Locale = isLocale(s.profile?.locale) ? s.profile.locale : "en";
    const { ok } = await sendEmail({
      to: s.email,
      template: "trial_ending",
      locale,
      email: renderTrialEndingEmail({
        locale,
        siteUrl: siteUrl(),
        name: (s.profile?.full_name || "").split(" ")[0],
        chargeDate: s.trial_ends_at,
        priceCents: plan.priceCents,
        manageUrl: s.manage_url,
      }),
    });
    if (ok) {
      await admin.from("subscriptions").update({ trial_reminder_sent_at: now.toISOString() }).eq("id", s.id);
      reminded++;
    }
  }
  return { trialReminders: reminded };
}
