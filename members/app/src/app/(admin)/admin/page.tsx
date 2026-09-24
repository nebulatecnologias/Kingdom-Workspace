import type { Metadata } from "next";
import { IntentLink as Link } from "@/components/shell/intent-link";
import { getLocale, getTranslations } from "next-intl/server";
import { Bell, Lock, Mail, ShieldCheck, Users } from "lucide-react";
import { Countdown } from "@/components/admin/countdown";
import { Feed } from "@/components/admin/feed";
import { InvitePill } from "@/components/admin/invite-pill";
import { ResendButton } from "@/components/admin/resend-button";
import { Avatar } from "@/components/shell/app-shell";
import { Notice } from "@/components/ui/notice";
import { toLocale } from "@/i18n/config";
import { describeActivity } from "@/lib/admin/activity";
import { adminContext } from "@/lib/admin/context";
import { adminProducts, auditRows, overview, pendingInvites } from "@/lib/admin/queries";
import { timeLeft } from "@/lib/admin/time";
import { formatZar } from "@/lib/format";
import { hasIssues, healthIssues } from "@/lib/health";
import { verifiedFactorId } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("ad_title") };
}

function Bars({ values }: { values: number[] }) {
  const max = Math.max(0, ...values);
  if (!max) return null;
  return (
    <div className="bars" aria-hidden="true">
      {values.map((v, i) => (
        <i key={i} style={{ height: `${Math.max(8, Math.round((v / max) * 100))}%` }} />
      ))}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const { db } = await adminContext("/admin");
  const t = await getTranslations();
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  const [stats, pending, rows, products, factorId, health] = await Promise.all([
    overview(db),
    pendingInvites(db, 6),
    auditRows(db, { limit: 8 }),
    adminProducts(db, locale),
    verifiedFactorId(),
    healthIssues(db, 24),
  ]);
  const feed = await describeActivity(db, rows);
  const title = (id: string) => products.find((p) => p.id === id)?.title ?? "—";
  const next = pending[0];
  const twoStep = !!factorId;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("ad_title")}</h1>
          <p>{t("ad_lead")}</p>
        </div>
      </div>

      {!twoStep ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="info">
            {t.rich("mfa_nudge", { link: (c) => <Link href="/admin/security">{c}</Link> })}
          </Notice>
        </div>
      ) : null}

      {hasIssues(health) ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="warn">
            <b style={{ fontWeight: 500 }}>{t("att_title")}</b>
            {health.webhookErrors ? <span style={{ display: "block" }}>{t("att_webhook_errors", { n: health.webhookErrors })}</span> : null}
            {health.badSignatures ? <span style={{ display: "block" }}>{t("att_bad_signatures", { n: health.badSignatures })}</span> : null}
            {health.emailsGivenUp ? <span style={{ display: "block" }}>{t("att_emails_given_up", { n: health.emailsGivenUp })}</span> : null}
            {health.unknownProducts.length ? <span style={{ display: "block" }}>{t("att_unknown_products", { ids: health.unknownProducts.join(", ") })}</span> : null}
            <Link href="/admin/integrations" style={{ display: "inline-block", marginTop: 4 }}>
              {t("att_open")}
            </Link>
          </Notice>
        </div>
      ) : null}

      <div className="kpis">
        <div className="card kpi">
          <span className="kpi-label">
            <Users className="icon icon-sm" aria-hidden="true" />
            {t("kpi_members")}
          </span>
          <div className="kpi-row">
            <span className="kpi-value tnum">{stats.members}</span>
            <Bars values={stats.weeks.map((w) => w.members)} />
          </div>
          <span className="kpi-delta">{t("kpi_delta", { n: stats.members_month })}</span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">
            <Mail className="icon icon-sm" aria-hidden="true" />
            {t("kpi_invites")}
          </span>
          <div className="kpi-row">
            <span className="kpi-value tnum">{stats.pending}</span>
            <Bars values={stats.weeks.map((w) => w.invites)} />
          </div>
          <span className="kpi-delta" style={stats.expiring_week ? { color: "var(--amber-ink)" } : undefined}>
            {t("kpi_deltaWeek", { n: stats.expiring_week })}
          </span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">
            <Lock className="icon icon-sm" aria-hidden="true" />
            {t("kpi_unlocks")}
          </span>
          <div className="kpi-row">
            <span className="kpi-value tnum">{stats.unlocks_month}</span>
            <Bars values={stats.weeks.map((w) => w.unlocks)} />
          </div>
          <span className="kpi-delta">{t("kpi_deltaUnlock", { amount: formatZar(stats.sales_month_cents, intlTag) })}</span>
        </div>
        {next ? (
          <div className="card countdown">
            <div className="countdown-top">
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 18 }}>{t("cd_title2", { name: (next.fullName || next.email).split(" ")[0] })}</b>
                <span className="muted" style={{ display: "block", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {next.email}
                </span>
              </div>
              <span className="pill pill-red">{t("cd_expiring")}</span>
            </div>
            <Countdown until={next.expiresAt} label={t("expiresIn", { t: timeLeft(next.expiresAt, (n) => t("days", { n })) })} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span className="muted tnum" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                {t("expiresIn", { t: timeLeft(next.expiresAt, (n) => t("days", { n })) })}
              </span>
              <ResendButton id={next.id} email={next.email} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="admin-grid">
        <section className="card" aria-labelledby="pending-title">
          <div className="card-head">
            <h2 className="card-title" id="pending-title">
              <span className="status-dot" style={{ background: "var(--orange-500)", boxShadow: "0 0 0 4px var(--orange-soft)" }} />
              {t("ad_pending")}
              <span className="pill pill-grey tnum">{stats.pending}</span>
            </h2>
            <Link className="btn btn-ghost btn-sm" href="/admin/invites">
              {t("viewAll")}
            </Link>
          </div>
          {pending.length ? (
            <div className="team">
              {pending.map((i) => (
                <div className="person" key={i.id}>
                  <Avatar name={i.fullName || i.email} size={44} />
                  <div className="who">
                    <b>{i.fullName || i.email}</b>
                    <span className="pk">
                      <span className="pk-t">{i.productIds[0] ? title(i.productIds[0]) : "—"}</span>
                      {i.productIds.length > 1 ? <span className="pk-n">+{i.productIds.length - 1}</span> : null}
                    </span>
                  </div>
                  <InvitePill status={i.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <Mail className="icon" aria-hidden="true" />
              <p>{t("ad_noPending")}</p>
            </div>
          )}
        </section>
        <section className="card" aria-labelledby="feed-title">
          <div className="card-head">
            <h2 className="card-title" id="feed-title">
              <Bell className="icon" aria-hidden="true" />
              {t("feed_title")}
            </h2>
            <Link className="btn btn-ghost btn-sm" href="/admin/activity">
              {t("viewAll")}
            </Link>
          </div>
          {feed.length ? (
            <Feed items={feed} />
          ) : (
            <div className="empty">
              <ShieldCheck className="icon" aria-hidden="true" />
              <p>{t("feed_empty")}</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
