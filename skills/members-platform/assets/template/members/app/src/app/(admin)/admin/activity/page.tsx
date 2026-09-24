import type { Metadata } from "next";
import { IntentLink as Link } from "@/components/shell/intent-link";
import { getTranslations } from "next-intl/server";
import { Bell } from "lucide-react";
import { Feed } from "@/components/admin/feed";
import { describeActivity } from "@/lib/admin/activity";
import { adminContext } from "@/lib/admin/context";
import { auditRows } from "@/lib/admin/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("feed_title") };
}

const PAGE = 50;

/** The full audit log, newest first: every admin action, gateway event and account change. */
export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  const { db } = await adminContext("/admin/activity");
  const sp = await searchParams;
  const t = await getTranslations();
  const before = Number(sp.before);
  const rows = await auditRows(db, { limit: PAGE, before: Number.isInteger(before) && before > 0 ? before : undefined });
  const feed = await describeActivity(db, rows);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("feed_title")}</h1>
          <p>{t("act_lead")}</p>
        </div>
      </div>
      <section className="card">
        {feed.length ? (
          <Feed items={feed} />
        ) : (
          <div className="empty">
            <Bell className="icon" aria-hidden="true" />
            <p>{t("feed_empty")}</p>
          </div>
        )}
      </section>
      <div className="actions" style={{ justifyContent: "center" }}>
        {sp.before ? (
          <Link className="btn btn-ghost btn-sm" href="/admin/activity">
            {t("act_newest")}
          </Link>
        ) : null}
        {rows.length === PAGE ? (
          <Link className="btn btn-ghost btn-sm" href={`/admin/activity?before=${rows[rows.length - 1].id}`}>
            {t("act_older")}
          </Link>
        ) : null}
      </div>
    </>
  );
}
