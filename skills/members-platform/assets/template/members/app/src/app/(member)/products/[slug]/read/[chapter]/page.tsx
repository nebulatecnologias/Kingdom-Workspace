import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { ReaderBody } from "@/components/catalogue/reader-body";
import { toLocale } from "@/i18n/config";
import { requireMember } from "@/lib/auth";
import { getChapter, getProduct, isReading } from "@/lib/catalogue";
import { priceLabel } from "@/lib/catalogue-labels";
import { sanitizeChapter } from "@/lib/sanitize";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/read/[chapter]">): Promise<Metadata> {
  const { slug, chapter } = await params;
  const p = await getProduct(slug, toLocale(await getLocale()));
  const row = p?.outline.find((o) => o.kind === "chapter" && o.position === Number(chapter));
  return { title: row ? `${row.title} · ${p!.title}` : p?.title };
}

export default async function ReaderPage({ params }: PageProps<"/products/[slug]/read/[chapter]">) {
  const { slug, chapter } = await params;
  await requireMember(`/products/${slug}/read/${chapter}`);
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  const t = await getTranslations();
  const p = await getProduct(slug, locale);
  const position = Number(chapter);
  if (!p || !isReading(p.type) || !Number.isInteger(position)) notFound();
  const chapters = p.outline.filter((o) => o.kind === "chapter");
  const row = chapters.find((c) => c.position === position);
  if (!row) notFound();

  const canRead = p.owned || (p.freeSample && row.isSample);
  const content = canRead ? await getChapter(p.id, position, locale) : null;
  const prev = chapters.find((c) => c.position === position - 1);
  const next = chapters.find((c) => c.position === position + 1);
  const nextOpen = next && (p.owned || (p.freeSample && next.isSample));

  return (
    <>
      <Link className="back" href={`/products/${p.slug}`}>
        <ChevronLeft className="icon icon-sm" aria-hidden="true" />
        {p.title}
      </Link>
      <section className="card card-pad reader-dlg" style={{ maxWidth: 820, margin: "0 auto" }}>
        <ReaderBody
          productId={p.id}
          position={position}
          track={p.owned && Boolean(content)}
          labels={{ smaller: t("reader_smaller"), bigger: t("reader_bigger") }}
          header={
            <div style={{ minWidth: 0 }}>
              <p className="muted" style={{ fontSize: 13.5 }}>
                {p.title} · {t("chapter", { n: position })}
              </p>
              <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em" }}>{row.title}</h1>
            </div>
          }
        >
          {content ? (
            <article className="reader" lang={content.locale === locale ? undefined : "en-ZA"} dangerouslySetInnerHTML={{ __html: sanitizeChapter(content.body_html) }} />
          ) : (
            <div className="notice notice-info" style={{ margin: "8px 0 16px" }}>
              <Lock className="icon" aria-hidden="true" />
              <div style={{ display: "grid", gap: 12 }}>
                <span>{t("reader_locked")}</span>
                {p.visibility === "visible" ? (
                  <div>
                    <a className="btn btn-primary btn-sm" href={`/api/checkout/${p.id}`}>
                      {t("unlockFor", { price: priceLabel(p.priceCents, intlTag) })}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </ReaderBody>
        <nav className="reader-nav" aria-label={t("contents")}>
          {prev ? (
            <Link className="btn btn-ghost" href={`/products/${p.slug}/read/${prev.position}`}>
              <ChevronLeft className="icon icon-sm" aria-hidden="true" />
              {t("reader_prev")}
            </Link>
          ) : (
            <span className="btn btn-ghost" aria-disabled="true" style={{ opacity: 0.45 }}>
              <ChevronLeft className="icon icon-sm" aria-hidden="true" />
              {t("reader_prev")}
            </span>
          )}
          <span className="muted tnum" style={{ fontSize: 13.5 }}>
            {position} / {chapters.length}
          </span>
          {nextOpen ? (
            <Link className="btn btn-primary" href={`/products/${p.slug}/read/${next.position}`}>
              {t("reader_next")}
              <ChevronRight className="icon icon-sm" aria-hidden="true" />
            </Link>
          ) : next && p.visibility === "visible" ? (
            // When this chapter is itself locked, the notice's unlock button is the one primary action.
            <a className={content ? "btn btn-primary" : "btn btn-ghost"} href={`/api/checkout/${p.id}`}>
              <Lock className="icon icon-sm" aria-hidden="true" />
              {t("reader_next")}
            </a>
          ) : (
            <span className="btn btn-primary" aria-disabled="true" style={{ opacity: 0.45 }}>
              {t("reader_next")}
              <ChevronRight className="icon icon-sm" aria-hidden="true" />
            </span>
          )}
        </nav>
      </section>
    </>
  );
}
