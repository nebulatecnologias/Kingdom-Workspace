import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Bell, Lock, Mail, Users } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("ad_title") };
}

// Phase 0: layout only. Real figures, the invite countdown and the activity feed arrive in Phase 4.
export default async function AdminOverviewPage() {
  const t = await getTranslations();
  const kpis = [
    { label: t("kpi_members"), icon: Users },
    { label: t("kpi_invites"), icon: Mail },
    { label: t("kpi_unlocks"), icon: Lock },
  ];
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("ad_title")}</h1>
          <p>{t("ad_lead")}</p>
        </div>
      </div>
      <div className="kpis">
        {kpis.map(({ label, icon: Icon }) => (
          <div className="card kpi" key={label}>
            <span className="kpi-label">
              <Icon className="icon icon-sm" aria-hidden="true" />
              {label}
            </span>
            <div className="kpi-row">
              <span className="kpi-value">—</span>
            </div>
          </div>
        ))}
      </div>
      <section className="card">
        <div className="card-head">
          <h2 className="card-title">
            <Bell className="icon" aria-hidden="true" />
            {t("feed_title")}
          </h2>
        </div>
        <div className="empty">
          <p>{t("empty_mine")}</p>
        </div>
      </section>
    </>
  );
}
