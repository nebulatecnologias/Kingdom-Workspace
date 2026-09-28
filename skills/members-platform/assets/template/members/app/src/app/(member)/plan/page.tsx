import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Check, Crown } from "lucide-react";
import { PlanWaiter } from "@/components/plan/plan-waiter";
import { Notice } from "@/components/ui/notice";
import { toLocale } from "@/i18n/config";
import { requireMember } from "@/lib/auth";
import { getLibrary } from "@/lib/catalogue";
import { formatZarShort } from "@/lib/format";
import { getPlan, memberPlan, planOpen } from "@/lib/plan";
import { safeNext } from "@/lib/request";
import { isSphere } from "@/lib/spheres";
import { createAdminClient } from "@/lib/supabase/admin";

/** When a trial started now would end. */
function daysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("plan_title") };
}

/**
 * The monthly plan: everything in the library for R75 a month, the first 30 days free. Members who ask for
 * the monthly picks in the welcome questions land here; the gateway takes the card and the payments.
 */
export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const sp = await searchParams;
  const profile = await requireMember("/plan");
  const t = await getTranslations();
  const intlTag = await getLocale();
  const next = safeNext(typeof sp.next === "string" ? sp.next : null, "/home");
  const [plan, mine, items, { data: picks }] = await Promise.all([
    getPlan(),
    memberPlan(profile.id),
    getLibrary(toLocale(intlTag)),
    createAdminClient().from("curation_subscriptions").select("spheres, unsubscribed_at").eq("user_id", profile.id).maybeSingle(),
  ]);
  const date = (iso: string | Date) => new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", timeZone: "Africa/Johannesburg" }).format(new Date(iso));
  const price = formatZarShort(plan?.priceCents ?? 7500);
  const trialDays = plan?.trialDays ?? 30;
  const spheres = picks && !picks.unsubscribed_at ? (picks.spheres as string[]).filter(isSphere) : [];
  const count = items.filter((p) => p.visibility === "visible").length;

  if (mine?.active) {
    const line =
      mine.status === "trialing" && mine.trialEndsAt
        ? mine.cancelAtPeriodEnd
          ? t("plan_endsOn", { date: date(mine.trialEndsAt) })
          : t("plan_trialUntil", { date: date(mine.trialEndsAt), price })
        : mine.status === "past_due"
          ? t("plan_pastDue")
          : mine.cancelAtPeriodEnd && mine.accessUntil
            ? t("plan_endsOn", { date: date(mine.accessUntil) })
            : mine.currentPeriodEnd
              ? t("plan_renews", { date: date(mine.currentPeriodEnd), price })
              : "";
    return (
      <section className="card card-pad plan-have">
        <span className="plan-crown" aria-hidden="true">
          <Crown className="icon" />
        </span>
        <h1>{sp.status === "started" ? t("plan_welcome") : t("plan_haveTitle")}</h1>
        <p className="muted">{line}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <Link className="btn btn-primary" href="/library">
            {t("plan_openLibrary")}
            <ArrowRight className="icon icon-sm" aria-hidden="true" />
          </Link>
          {mine.manageUrl ? (
            <a className="btn btn-ghost" href={mine.manageUrl} target="_blank" rel="noopener noreferrer">
              {t("plan_manage")}
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  if (sp.status === "started") {
    return (
      <section className="card card-pad plan-have">
        <h1>{t("plan_confirming")}</h1>
        <PlanWaiter />
      </section>
    );
  }

  const trialEnd = daysFromNow(trialDays);
  const open = planOpen(plan);
  const benefits = [
    t("plan_b_all", { n: count }),
    spheres.length ? t("plan_b_picks", { spheres: spheres.map((s) => t(`sphere_${s}`)).join(", ") }) : t("plan_b_picksAny"),
    t("plan_b_use"),
    t("plan_b_cancel", { date: date(trialEnd) }),
  ];

  return (
    <div className="plan">
      {sp.checkout === "unavailable" || !open ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="warn">{t("plan_unavailable")}</Notice>
        </div>
      ) : null}
      {mine && !mine.active ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="info">{t("plan_ended")}</Notice>
        </div>
      ) : null}
      <section className="plan-offer card" aria-labelledby="plan-title">
        <div className="plan-copy">
          <span className="pill pill-orange">{t("plan_eyebrow")}</span>
          <h1 id="plan-title">{t("plan_headline")}</h1>
          <p className="lead">{t("plan_lead", { days: trialDays })}</p>
          <ul className="plan-list">
            {benefits.map((b) => (
              <li key={b}>
                <Check className="icon icon-sm" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="plan-box">
          <span className="pill pill-soft-green">{t("plan_free", { days: trialDays })}</span>
          <p className="plan-price">
            <b className="tnum">{price}</b>
            <span>{t("plan_perMonth")}</span>
          </p>
          <p className="plan-today">{t("plan_today", { date: date(trialEnd), price })}</p>
          {open ? (
            // A plain link: the checkout route redirects to the gateway, so it must never be prefetched.
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a className="btn btn-primary btn-lg btn-block" href="/api/checkout/plan">
              {t("plan_cta", { days: trialDays })}
            </a>
          ) : (
            <button type="button" className="btn btn-primary btn-lg btn-block" disabled>
              {t("plan_cta", { days: trialDays })}
            </button>
          )}
          <p className="hint">{t("plan_small")}</p>
          <Link className="btn btn-quiet btn-block" href={next}>
            {t("plan_notNow")}
          </Link>
        </div>
      </section>
    </div>
  );
}
