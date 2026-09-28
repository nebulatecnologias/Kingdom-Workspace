import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { MessagesSquare } from "lucide-react";
import { CommentReview } from "@/components/admin/comment-review";
import { IntentLink as Link } from "@/components/shell/intent-link";
import { adminContext } from "@/lib/admin/context";
import { timeOrDate } from "@/lib/admin/time";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav_comments") };
}

const TABS = ["pending", "approved", "rejected"] as const;
type Tab = (typeof TABS)[number];

type Row = {
  id: string;
  body: string;
  status: Tab;
  created_at: string;
  user_id: string;
  author: { full_name: string; email: string } | null;
  product: { slug: string; translations: { locale: string; title: string }[] } | null;
};

/** Moderation queue: comments wait here until an administrator approves them; oldest first. */
export default async function CommentsPage({ searchParams }: PageProps<"/admin/comments">) {
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.status as Tab) ? (sp.status as Tab) : "pending";
  const { db } = await adminContext("/admin/comments");
  const t = await getTranslations();
  const intlTag = await getLocale();
  const [{ data }, ...counts] = await Promise.all([
    db
      .from("product_comments")
      .select("id, body, status, created_at, user_id, author:profiles!product_comments_user_id_fkey(full_name, email), product:products(slug, translations:product_translations(locale, title))")
      .eq("status", tab)
      .order("created_at", { ascending: tab === "pending" })
      .limit(100),
    ...TABS.map((s) => db.from("product_comments").select("id", { count: "exact", head: true }).eq("status", s)),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const count = Object.fromEntries(TABS.map((s, i) => [s, counts[i].count ?? 0])) as Record<Tab, number>;
  const title = (r: Row) => r.product?.translations.find((x) => x.locale === "en")?.title ?? r.product?.translations[0]?.title ?? "—";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav_comments")}</h1>
          <p>{t("cmad_lead")}</p>
        </div>
      </div>
      <nav className="filters scroll" aria-label={t("nav_comments")} style={{ marginBottom: 16 }}>
        {TABS.map((s) => (
          <Link key={s} className="filter" href={s === "pending" ? "/admin/comments" : `/admin/comments?status=${s}`} aria-current={tab === s ? "page" : undefined}>
            {t(`cmad_${s}`)}
            <span className="count">{count[s]}</span>
          </Link>
        ))}
      </nav>
      {rows.length ? (
        <ul className="card cmad-list">
          {rows.map((r) => {
            const who = r.author?.full_name || r.author?.email || "—";
            return (
              <li key={r.id} className="cmad-row">
                <div className="cmad-meta">
                  <Link href={`/admin/members/${r.user_id}`}>
                    <b>{who}</b>
                  </Link>
                  <span className="muted">
                    {t("cmad_on")}{" "}
                    <a href={`/products/${r.product?.slug ?? ""}#comments-title`} target="_blank" rel="noopener noreferrer">
                      {title(r)}
                    </a>
                  </span>
                  <span className="muted tnum">{timeOrDate(r.created_at, intlTag)}</span>
                </div>
                <p className="cmad-body">{r.body}</p>
                <CommentReview id={r.id} status={r.status} who={who} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card empty">
          <MessagesSquare className="icon" aria-hidden="true" />
          <p>{t(`cmad_empty_${tab}`)}</p>
        </div>
      )}
    </>
  );
}
