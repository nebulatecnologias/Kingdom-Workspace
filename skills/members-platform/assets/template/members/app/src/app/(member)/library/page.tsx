import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { PackCard } from "@/components/catalogue/pack-card";
import { toLocale } from "@/i18n/config";
import { requireMember } from "@/lib/auth";
import { getLibrary, type LibraryItem } from "@/lib/catalogue";
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
  const sp = await searchParams;
  const t = await getTranslations();
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  // Independent reads run together: every sequential database call adds a round trip to each tap.
  const [, items] = await Promise.all([requireMember(), getLibrary(locale)]);
  const filter: Filter = FILTERS.includes(sp.filter as Filter) ? (sp.filter as Filter) : "all";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";

  const covers = await signedImageUrls(items.map((p) => p.coverPath));
  const shown = filterItems(items, filter, q);

  const counts: Record<Filter, number> = {
    all: items.length,
    mine: filterItems(items, "mine", "").length,
    locked: filterItems(items, "locked", "").length,
  };

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
      <div className="page-head">
        <div>
          <h1>{t("nav_library")}</h1>
          <p>{t("lib_lead")}</p>
        </div>
      </div>

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
