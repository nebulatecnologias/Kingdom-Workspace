import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { Art } from "@/components/catalogue/art";
import { PackCard } from "@/components/catalogue/pack-card";
import { Notice } from "@/components/ui/notice";
import { toLocale } from "@/i18n/config";
import { requireMember } from "@/lib/auth";
import { getLibrary, getProgress, isReading, type LibraryItem } from "@/lib/catalogue";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav_library") };
}

const FILTERS = ["all", "mine", "locked"] as const;
type Filter = (typeof FILTERS)[number];

function filterItems(items: LibraryItem[], filter: Filter, q: string) {
  let list = items;
  if (filter === "mine") list = list.filter((p) => p.visibility === "visible" && p.owned);
  if (filter === "locked") list = list.filter((p) => p.visibility === "visible" && !p.owned);
  const needle = q.trim().toLocaleLowerCase();
  if (needle) list = list.filter((p) => p.title.toLocaleLowerCase().includes(needle));
  return list;
}

export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const profile = await requireMember();
  const sp = await searchParams;
  const t = await getTranslations();
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  const filter: Filter = FILTERS.includes(sp.filter as Filter) ? (sp.filter as Filter) : "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";

  const [items, progress] = await Promise.all([getLibrary(locale), getProgress(profile.id)]);
  const shown = filterItems(items, filter, q);
  const covers = await signedImageUrls(items.map((p) => p.coverPath));
  const first = (profile.fullName || profile.email).split(" ")[0];

  const counts: Record<Filter, number> = {
    all: items.length,
    mine: filterItems(items, "mine", "").length,
    locked: filterItems(items, "locked", "").length,
  };

  // Continue reading: the most recent reading product the member still owns and has not finished.
  const cont = progress
    .map((r) => ({ r, item: items.find((p) => p.id === r.product_id && p.owned && isReading(p.type)) }))
    .find((x) => x.item && x.item.chapterCount > 0);

  const sections = [...new Map(shown.map((p) => [p.sectionSlug ?? "", p.sectionName])).entries()];
  const filterHref = (f: Filter) => {
    const params = new URLSearchParams();
    if (f !== "all") params.set("filter", f);
    if (q) params.set("q", q);
    const s = params.toString();
    return s ? `/library?${s}` : "/library";
  };

  return (
    <>
      {sp.welcome === "1" ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="ok">{t("lib_welcome")}</Notice>
        </div>
      ) : null}
      {sp.notice === "password" ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="ok">{t("reset_done")}</Notice>
        </div>
      ) : null}
      <div className="page-head">
        <div>
          <h1>{t("lib_hello", { name: first })}</h1>
          <p>{t("lib_lead")}</p>
        </div>
      </div>

      {cont?.item ? (
        <div className="card continue">
          <div className="thumb" style={{ background: cont.item.fieldColour }}>
            <Art path={cont.item.coverPath} url={covers.get(cont.item.coverPath ?? "")} />
          </div>
          <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
            <h2>{t("continue_read", { pack: cont.item.title })}</h2>
            <div
              className="progress"
              role="progressbar"
              aria-label={t("continue_chapter", { done: cont.r.chapter_position, total: cont.item.chapterCount })}
              aria-valuemin={0}
              aria-valuemax={cont.item.chapterCount}
              aria-valuenow={cont.r.chapter_position}
            >
              <i style={{ width: `${Math.min(100, (cont.r.chapter_position / cont.item.chapterCount) * 100)}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span className="muted tnum progress-meta" style={{ fontSize: 13.5 }}>
                {t("continue_chapter", { done: cont.r.chapter_position, total: cont.item.chapterCount })}
              </span>
              <Link className="btn btn-primary btn-sm" href={`/products/${cont.item.slug}/read/${cont.r.chapter_position}`}>
                {t("read_continue")}
                <ArrowRight className="icon icon-sm" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <nav className="filters scroll" aria-label={t("nav_library")}>
          {FILTERS.map((f) => (
            <Link key={f} className="filter" href={filterHref(f)} aria-current={filter === f ? "page" : undefined}>
              {t(`filter_${f}`)}
              <span className="count">{counts[f]}</span>
            </Link>
          ))}
        </nav>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <BookOpen className="icon" aria-hidden="true" />
          <p>{q ? t("empty_search", { q }) : t("empty_mine")}</p>
        </div>
      ) : (
        sections.map(([slug, name]) => (
          <section key={slug} className="lib-sec" aria-labelledby={`sec-${slug}`}>
            <h2 id={`sec-${slug}`}>{name}</h2>
            <div className="lib-grid">
              {shown
                .filter((p) => (p.sectionSlug ?? "") === slug)
                .map((p) => (
                  <PackCard key={p.id} item={p} coverUrl={covers.get(p.coverPath ?? "")} intlTag={intlTag} />
                ))}
            </div>
          </section>
        ))
      )}

      <p className="lib-verse">
        <q>{t("verse_text")}</q> {t("verse_ref")}
      </p>
    </>
  );
}
