import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen, Check, ChevronLeft, ChevronRight, Download, Eye, FileArchive, FileText, Headphones, Image as ImageIcon, Lock, Palette } from "lucide-react";
import { Art } from "@/components/catalogue/art";
import { Notice } from "@/components/ui/notice";
import { toLocale } from "@/i18n/config";
import { requireMember } from "@/lib/auth";
import { formatBytes, formatDuration, getProduct, getProgress, isReading, type Asset, type ProductDetail } from "@/lib/catalogue";
import { countLabel, priceLabel } from "@/lib/catalogue-labels";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug, toLocale(await getLocale()));
  return { title: p?.title };
}

type T = Awaited<ReturnType<typeof getTranslations>>;

const ASSET_ICON = { pdf: FileText, epub: BookOpen, image: ImageIcon, audio: Headphones, zip: FileArchive } as const;

function facts(t: T, p: ProductDetail) {
  if (p.type === "kit") {
    const docs = p.assets.filter((a) => a.kind === "pdf" || a.kind === "epub").length;
    const images = p.assets.filter((a) => a.kind === "image").length;
    const audio = p.assets.filter((a) => a.kind === "audio");
    const seconds = audio.reduce((sum, a) => sum + (a.durationSeconds ?? 0), 0);
    return [
      t("n_items", { n: p.assets.filter((a) => a.kind !== "zip").length }),
      ...(docs ? [t("n_docs", { n: docs })] : []),
      ...(images ? [t("n_images", { n: images })] : []),
      ...(audio.length ? [[t("n_audio", { n: audio.length }), formatDuration(seconds)].filter(Boolean).join(" · ")] : []),
      t("fact_lang"),
    ];
  }
  if (p.type === "colouring") return [t("n_pages", { n: p.pageCount }), t("fact_a4"), t("fact_ages"), t("fact_lang")];
  const f = [countLabel(t, p)];
  if (p.type === "book") f.push(t("fact_formats"), t("fact_devices"));
  if (p.type === "guide") f.push(t("n_pages", { n: p.pageCount }), t("fact_templates"));
  if (p.type === "workbook") f.push(t("fact_a4"), t("fact_worksheets"));
  f.push(t("fact_lang"));
  return f;
}

export default async function ProductPage({ params, searchParams }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  const t = await getTranslations();
  // Independent reads run together: every sequential database call adds a round trip to each tap.
  const [profile, p] = await Promise.all([requireMember(`/products/${slug}`), getProduct(slug, locale)]);
  if (!p) notFound();

  const own = p.owned;
  const reading = isReading(p.type);
  const pages = p.outline.filter((o) => o.kind === "page");
  const chapters = p.outline.filter((o) => o.kind === "chapter");
  const [urls, rows] = await Promise.all([
    signedImageUrls([p.coverPath, ...pages.map((o) => o.previewPath)]),
    reading ? getProgress(profile.id) : Promise.resolve([]),
  ]);
  const progress = rows.find((r) => r.product_id === p.id)?.chapter_position ?? 0;
  // The hero offers the main downloads; every other material is listed below it.
  const pdf = p.type === "kit" ? undefined : p.assets.find((a) => a.kind === "pdf");
  const epub = reading ? p.assets.find((a) => a.kind === "epub") : undefined;
  const zip = p.assets.find((a) => a.kind === "zip");
  const inHero = new Set([pdf?.id, reading ? epub?.id : undefined, zip?.id].filter(Boolean));
  const listed = p.assets.filter((a) => !inHero.has(a.id));
  const download = (q: string) => `/api/products/${p.id}/download?${q}`;
  const assetName = (a: Asset) => a.title || t(`kind_${a.kind}`);
  const unlock = `/api/checkout/${p.id}`;
  const soon = p.visibility === "soon";

  const statusPill = own ? (
    <span className="pill pill-green">
      <span className="dot" />
      {p.access === "free" ? t("free") : t("unlocked")}
    </span>
  ) : soon ? (
    <span className="pill pill-grey">{t("soon")}</span>
  ) : (
    <span className="pill pill-orange">
      <Lock className="icon icon-sm" aria-hidden="true" />
      {t("locked")}
    </span>
  );

  const unlockButton = soon ? null : (
    <>
      <a className="btn btn-primary btn-lg" href={unlock}>
        <Lock className="icon" aria-hidden="true" />
        {t("unlockFor", { price: priceLabel(p.priceCents, intlTag) })}
      </a>
    </>
  );

  return (
    <>
      <Link className="back" href="/library">
        <ChevronLeft className="icon icon-sm" aria-hidden="true" />
        {t("pack_backLib")}
      </Link>
      {sp.unlocked === "1" && own ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="ok">{t("pr_unlocked_notice", { title: p.title })}</Notice>
        </div>
      ) : null}
      {sp.checkout === "unavailable" ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="info">{t("checkout_unavailable")}</Notice>
        </div>
      ) : null}

      <section className="pack-hero">
        <div className="cover-lg" style={{ background: p.fieldColour }}>
          <Art path={p.coverPath} url={urls.get(p.coverPath ?? "")} mode={own ? "color" : "line"} alt="" />
        </div>
        <div>
          <div className="filters">
            {statusPill}
            {reading || p.type === "kit" ? <span className="pill pill-grey">{t(`type_${p.type}`)}</span> : null}
          </div>
          <h1 style={{ marginTop: 14 }}>{p.title}</h1>
          {p.description ? <p className="desc">{p.description}</p> : null}
          {p.verse ? (
            <p className="muted" style={{ marginTop: 12 }}>
              “{p.verse}”{p.verseRef ? ` · ${p.verseRef}` : ""}
            </p>
          ) : null}
          <div className="facts">
            {facts(t, p).map((f) => (
              <span key={f} className="pill pill-grey">
                {f}
              </span>
            ))}
          </div>
          <div className="actions">
            {own && reading ? (
              <>
                {chapters.length ? (
                  <Link className="btn btn-primary btn-lg" href={`/products/${p.slug}/read/${Math.max(1, progress)}`}>
                    <BookOpen className="icon" aria-hidden="true" />
                    {t(progress ? "read_continue" : "read_online")}
                  </Link>
                ) : null}
                {pdf ? (
                  <a className="btn btn-ghost btn-lg" href={download(`asset=${pdf.id}`)}>
                    <Download className="icon" aria-hidden="true" />
                    {t("dl_pdf")}
                  </a>
                ) : null}
                {epub ? (
                  <a className="btn btn-quiet btn-lg" href={download(`asset=${epub.id}`)}>
                    <Download className="icon" aria-hidden="true" />
                    {t("dl_epub")}
                  </a>
                ) : null}
              </>
            ) : null}
            {own && !reading && pdf ? (
              <>
                <a className="btn btn-primary btn-lg" href={download(`asset=${pdf.id}`)}>
                  <Download className="icon" aria-hidden="true" />
                  {t("pack_download")}
                </a>
                {formatBytes(pdf.sizeBytes, intlTag) ? (
                  <span className="muted" style={{ alignSelf: "center", fontSize: 13.5 }}>
                    {t("pack_file", { size: formatBytes(pdf.sizeBytes, intlTag)! })}
                  </span>
                ) : null}
              </>
            ) : null}
            {own && zip ? (
              <>
                <a className={p.type === "kit" ? "btn btn-primary btn-lg" : "btn btn-quiet btn-lg"} href={download(`asset=${zip.id}`)}>
                  <Download className="icon" aria-hidden="true" />
                  {t("dl_all")}
                </a>
                {p.type === "kit" && formatBytes(zip.sizeBytes, intlTag) ? (
                  <span className="muted" style={{ alignSelf: "center", fontSize: 13.5 }}>
                    {t("zip_file", { size: formatBytes(zip.sizeBytes, intlTag)! })}
                  </span>
                ) : null}
              </>
            ) : null}
            {!own ? (
              <>
                {unlockButton}
                {reading && p.freeSample && chapters.some((c) => c.isSample) ? (
                  <Link className="btn btn-ghost btn-lg" href={`/products/${p.slug}/read/${chapters.find((c) => c.isSample)!.position}`}>
                    {t("read_sample")}
                  </Link>
                ) : null}
                {soon ? null : (
                  <p className="muted" style={{ flexBasis: "100%", fontSize: 14 }}>
                    {t("pack_lockedLead")}
                  </p>
                )}
              </>
            ) : null}
          </div>
        </div>
      </section>

      {listed.length ? (
        <>
          <div className="page-head" style={{ marginBottom: 16 }} id="materials">
            <h2 style={{ fontSize: 21 }}>{t(p.type !== "kit" ? "m_extra" : own ? "m_inKit" : "m_included")}</h2>
          </div>
          <ul className="card toc" style={{ marginBottom: 28 }}>
            {listed.map((a) => {
              const Icon = ASSET_ICON[a.kind];
              const name = assetName(a);
              const meta = [t(`kind_${a.kind}`), formatDuration(a.durationSeconds), formatBytes(a.sizeBytes, intlTag)].filter(Boolean).join(" · ");
              const head = (
                <>
                  <span className="toc-n" aria-hidden="true">
                    <Icon className="icon icon-sm" />
                  </span>
                  <span className="toc-t">
                    <b>{name}</b>
                    <span className="muted tnum">{meta}</span>
                  </span>
                </>
              );
              if (!own) {
                const lock = (
                  <>
                    {head}
                    <span className="toc-go">
                      <Lock className="icon icon-sm" aria-label={t("locked")} />
                    </span>
                  </>
                );
                return <li key={a.id}>{soon ? <div className="toc-row">{lock}</div> : <a className="toc-row" href={unlock}>{lock}</a>}</li>;
              }
              return (
                <li key={a.id} className="toc-row asset">
                  {head}
                  <span className="asset-acts">
                    {a.kind === "image" ? (
                      <a className="btn btn-ghost btn-sm" href={download(`asset=${a.id}&view=1`)} target="_blank" rel="noopener" aria-label={`${t("m_view")}: ${name}`}>
                        <Eye className="icon icon-sm" aria-hidden="true" />
                        {t("m_view")}
                      </a>
                    ) : null}
                    <a className="btn btn-quiet btn-sm" href={download(`asset=${a.id}`)} aria-label={`${t("pack_dl")}: ${name}`}>
                      <Download className="icon icon-sm" aria-hidden="true" />
                      {t("pack_dl")}
                    </a>
                  </span>
                  {a.kind === "audio" ? (
                    // preload="none": the signed link is only made when the member presses play.
                    <audio className="asset-audio" controls preload="none" src={download(`asset=${a.id}&view=1`)} aria-label={`${t("m_listen")}: ${name}`} />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      {reading && chapters.length ? (
        <>
          <div className="page-head" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 21 }}>{t("contents")}</h2>
          </div>
          <ol className="card toc">
            {chapters.map((c) => {
              const open = own || (p.freeSample && c.isSample);
              const status = own ? (
                c.position < progress ? (
                  <span className="pill pill-soft-green">
                    <Check className="icon icon-sm" aria-hidden="true" />
                    {t("st_done")}
                  </span>
                ) : c.position === progress ? (
                  <span className="pill pill-orange">{t("st_reading")}</span>
                ) : null
              ) : p.freeSample && c.isSample ? (
                <span className="pill pill-violet">{t("sample_badge")}</span>
              ) : null;
              const inner = (
                <>
                  <span className="toc-n tnum">{c.position}</span>
                  <span className="toc-t">
                    <b>{c.title}</b>
                    {c.minutes ? <span className="muted tnum">{t("min_read", { n: c.minutes })}</span> : null}
                  </span>
                  {status}
                  <span className="toc-go">
                    {open ? <ChevronRight className="icon icon-sm" aria-hidden="true" /> : <Lock className="icon icon-sm" aria-label={t("locked")} />}
                  </span>
                </>
              );
              return (
                <li key={c.position}>
                  {open ? (
                    <Link className="toc-row" href={`/products/${p.slug}/read/${c.position}`}>
                      {inner}
                    </Link>
                  ) : soon ? (
                    <div className="toc-row">{inner}</div>
                  ) : (
                    <a className="toc-row" href={unlock}>
                      {inner}
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      ) : null}

      {!reading && pages.length ? (
        <>
          <div className="page-head" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 21 }}>{t("pack_pagesTitle")}</h2>
          </div>
          <div className="pages-grid">
            {pages.map((pg) => (
              <div key={pg.position} className="card page-card">
                <div className="sheet">
                  <Art path={pg.lineartPath ?? pg.previewPath} url={urls.get(pg.previewPath ?? "")} mode="line" alt="" />
                  <span className="num tnum">
                    {pg.position}/{Math.max(p.pageCount, pages.length)}
                  </span>
                  {own ? null : (
                    <span className="pack-lock" style={{ width: 32, height: 32 }}>
                      <Lock className="icon icon-sm" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 500, padding: "0 4px" }}>{pg.title}</h3>
                {own ? (
                  <div className="row">
                    {pg.lineartPath ? (
                      <Link className="btn btn-ghost btn-sm" href={`/products/${p.slug}/colour/${pg.position}`}>
                        <Palette className="icon icon-sm" aria-hidden="true" />
                        {t("pack_colour")}
                      </Link>
                    ) : null}
                    <a className="btn btn-quiet btn-sm" href={download(`page=${pg.position}`)} aria-label={`${t("pack_dl")}: ${pg.title}`}>
                      <Download className="icon icon-sm" aria-hidden="true" />
                      {t("pack_dl")}
                    </a>
                  </div>
                ) : null}
              </div>
            ))}
            {p.pageCount > pages.length ? (
              <div className="more-sheet">
                <div>
                  <b className="tnum">+{p.pageCount - pages.length}</b>
                  {t("pack_more")}
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
