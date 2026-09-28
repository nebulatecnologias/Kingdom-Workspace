import type { Metadata } from "next";
import { IntentLink as Link } from "@/components/shell/intent-link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Check, ChevronLeft, ExternalLink } from "lucide-react";
import {
  ChaptersEditor,
  CoverUpload,
  DeleteProduct,
  DetailsForm,
  MaterialsEditor,
  PagesEditor,
  PRODUCT_FORM,
  SalesForm,
} from "@/components/admin/product-editor";
import { PackCard } from "@/components/catalogue/pack-card";
import { isLocale, toLocale, type Locale } from "@/i18n/config";
import { adminContext, UUID } from "@/lib/admin/context";
import { adminSections } from "@/lib/admin/queries";
import { formatBytes, formatDuration, isReading, type ProductType } from "@/lib/catalogue";
import { countLabel } from "@/lib/catalogue-labels";
import { formatZar } from "@/lib/format";
import { htmlToMarkdown } from "@/lib/markdown";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("r_admin_pack") };
}

const TABS = ["details", "content", "materials", "sales"] as const;
type Tab = (typeof TABS)[number];

export default async function ProductEditorPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const { db } = await adminContext(`/admin/products/${id}`);
  if (!UUID.test(id)) notFound();
  const sp = await searchParams;
  const t = await getTranslations();
  const intlTag = await getLocale();
  const uiLocale = toLocale(intlTag);
  // "?lang=" would switch the whole interface (email links use it), so the version being edited is "?edit=".
  const lang: Locale = isLocale(sp.edit) ? sp.edit : "en";
  const previewOwned = sp.preview !== "locked";

  const { data: p } = await db.from("products").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();
  const type = p.type as ProductType;
  const reading = isReading(type);
  // A kit is its materials: no pages or chapters of its own.
  const tabs = TABS.filter((v) => !(type === "kit" && v === "content"));
  const tab: Tab = tabs.includes(sp.tab as Tab) ? (sp.tab as Tab) : "details";

  const [{ data: translations }, sections, { data: pageRows }, { data: chapterRows }, { data: assetRows }, { count: holders }] = await Promise.all([
    db.from("product_translations").select("locale, title, description, verse, verse_ref").eq("product_id", id),
    adminSections(db, uiLocale),
    db.from("product_pages").select("locale, position, title, preview_path, lineart_path").eq("product_id", id).order("position"),
    db.from("product_chapters").select("locale, position, title, body_md, body_html, minutes, is_sample").eq("product_id", id).order("position"),
    db.from("product_assets").select("id, locale, title, kind, size_bytes, duration_seconds").eq("product_id", id).order("position").order("created_at"),
    db.from("entitlements").select("id", { count: "exact", head: true }).eq("product_id", id).is("revoked_at", null),
  ]);

  const tr = (l: Locale) => (translations ?? []).find((r) => r.locale === l);
  const title = tr(uiLocale)?.title ?? tr("en")?.title ?? p.slug;
  const text = tr(lang);

  // Pages share files across languages; titles are per language (English, then any, as the fallback).
  const positions = [...new Set((pageRows ?? []).map((r) => r.position))].sort((a, b) => a - b);
  const pages = positions.map((pos) => {
    const rows = (pageRows ?? []).filter((r) => r.position === pos);
    const row = rows.find((r) => r.locale === lang) ?? rows.find((r) => r.locale === null) ?? rows.find((r) => r.locale === "en") ?? rows[0];
    return { position: pos, title: row.title, previewPath: row.preview_path, lineartPath: row.lineart_path };
  });
  const langChapters = (chapterRows ?? []).filter((c) => c.locale === lang);
  const enChapters = (chapterRows ?? []).filter((c) => c.locale === "en");
  const chapterSource = langChapters.length ? langChapters : enChapters;
  const chapters = chapterSource.map((c) => ({ title: c.title, body: c.body_md ?? htmlToMarkdown(c.body_html), sample: c.is_sample, minutes: langChapters.length ? c.minutes : null }));
  const assets = (assetRows ?? []).map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    locale: a.locale,
    size: formatBytes(a.size_bytes, intlTag),
    duration: formatDuration(a.duration_seconds),
  }));
  // Members see materials without a language plus those in theirs; the card counts the English view.
  const assetCount = assets.filter((a) => a.kind !== "zip" && (a.locale === null || a.locale === "en")).length;

  const urls = await signedImageUrls([p.cover_path, ...pages.map((x) => x.previewPath)]);
  const sectionName = sections.find((s) => s.id === p.section_id)?.name ?? t("sc_noSection");
  const chapterCount = enChapters.length;

  const href = (q: { tab?: Tab; lang?: Locale; preview?: string }) => {
    const u = new URLSearchParams();
    const nextTab = q.tab ?? tab;
    const nextLang = q.lang ?? lang;
    const nextPreview = q.preview ?? (previewOwned ? "owned" : "locked");
    if (nextTab !== "details") u.set("tab", nextTab);
    if (nextLang !== "en") u.set("edit", nextLang);
    if (nextPreview !== "owned") u.set("preview", nextPreview);
    const s = u.toString();
    return s ? `/admin/products/${id}?${s}` : `/admin/products/${id}`;
  };

  const langSwitch = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <nav className="seg" aria-label={t("language")}>
        {(["en", "pt", "es"] as const).map((l) => (
          <Link key={l} href={href({ lang: l })} aria-current={lang === l ? "true" : undefined} lang={l}>
            {l.toUpperCase()}
            <span className="sr"> {t(`lang_${l}`)}</span>
          </Link>
        ))}
      </nav>
      <span className="hint">{t("ed_translating", { lang: new Intl.DisplayNames(intlTag, { type: "language" }).of(lang) ?? lang })}</span>
    </div>
  );

  return (
    <>
      <Link className="back" href="/admin/showcase">
        <ChevronLeft className="icon icon-sm" aria-hidden="true" />
        {t("sc_title")}
      </Link>
      <div className="page-head">
        <div style={{ minWidth: 0 }}>
          <h1>{title}</h1>
          <p className="tnum">
            {p.gateway_product_id ?? t("sc_noGid")} · {t(`vis_${p.visibility}`)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {p.visibility !== "hidden" ? (
            <Link className="btn btn-ghost" href={`/products/${p.slug}`} target="_blank">
              <ExternalLink className="icon icon-sm" aria-hidden="true" />
              {t("ed_view")}
            </Link>
          ) : null}
          <button className="btn btn-primary" type="submit" form={PRODUCT_FORM}>
            <Check className="icon" aria-hidden="true" />
            {t("ed_save")}
          </button>
        </div>
      </div>

      <div className="editor">
        <section className="card card-pad">
          <nav className="tabs" aria-label={t("r_admin_pack")}>
            {tabs.map((v) => (
              <Link key={v} href={href({ tab: v })} aria-current={tab === v ? "page" : undefined}>
                {t(v === "details" ? "ed_details" : v === "content" ? "ed_pages" : v === "materials" ? "ed_materials" : "ed_sales")}
              </Link>
            ))}
          </nav>
          <div className="stack">
            {tab === "details" ? (
              <>
                {langSwitch}
                <DetailsForm
                  key={lang}
                  id={id}
                  locale={lang}
                  type={p.type}
                  sectionId={p.section_id}
                  sections={sections.map((s) => ({ id: s.id, name: s.name }))}
                  slug={p.slug}
                  fieldColour={p.field_colour ?? "#fde0c6"}
                  text={{ title: text?.title ?? "", description: text?.description ?? "", verse: text?.verse ?? "", verseRef: text?.verse_ref ?? "" }}
                />
                <CoverUpload productId={id} coverPath={p.cover_path} coverUrl={urls.get(p.cover_path ?? "")} fieldColour={p.field_colour ?? "#fde0c6"} />
              </>
            ) : null}
            {tab === "content" ? (
              <>
                {langSwitch}
                {reading ? (
                  <ChaptersEditor
                    key={`ch-${lang}`}
                    productId={id}
                    locale={lang}
                    chapters={chapters}
                    pageCount={p.page_count ?? 0}
                    type={p.type}
                    fallback={lang !== "en" && !langChapters.length && enChapters.length > 0}
                  />
                ) : (
                  <PagesEditor key={`pg-${lang}`} productId={id} locale={lang} pageCount={p.page_count ?? 0} pages={pages.map((x) => ({ ...x, previewUrl: urls.get(x.previewPath ?? "") }))} />
                )}
              </>
            ) : null}
            {tab === "materials" ? <MaterialsEditor productId={id} assets={assets} /> : null}
            {tab === "sales" ? (
              <SalesForm
                id={id}
                priceCents={p.price_cents}
                access={p.access}
                gatewayProductId={p.gateway_product_id}
                checkoutUrl={p.checkout_url}
                visibility={p.visibility}
                intlTag={intlTag}
              />
            ) : null}
          </div>
        </section>

        <aside className="stack">
          <div className="card card-pad stack">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 16 }}>{t("ed_preview")}</h2>
              <nav className="seg seg-sm" aria-label={t("ed_preview")}>
                <Link href={href({ preview: "owned" })} aria-current={previewOwned ? "true" : undefined}>
                  {t("ed_asOwner")}
                </Link>
                <Link href={href({ preview: "locked" })} aria-current={!previewOwned ? "true" : undefined}>
                  {t("ed_asLocked")}
                </Link>
              </nav>
            </div>
            {/* A picture of the library card: inert, so its link can't be focused or clicked. */}
            <div inert>
              <PackCard
                intlTag={intlTag}
                coverUrl={urls.get(p.cover_path ?? "")}
                item={{
                  id,
                  slug: p.slug,
                  type,
                  access: p.access,
                  visibility: p.visibility === "soon" ? "soon" : "visible",
                  sectionSlug: null,
                  sectionName,
                  title,
                  coverPath: p.cover_path,
                  fieldColour: p.field_colour ?? "#f3eee8",
                  pageCount: p.page_count ?? 0,
                  chapterCount,
                  assetCount,
                  priceCents: p.price_cents,
                  owned: previewOwned || p.access === "free",
                }}
              />
            </div>
          </div>
          <div className="card card-pad">
            <dl className="kv" style={{ margin: 0 }}>
              <div>
                <dt>{t("ed_type")}</dt>
                <dd>{t(`type_${type}`)}</dd>
              </div>
              <div>
                <dt>{t("ed_pages")}</dt>
                <dd className="tnum">{countLabel(t, { type, pageCount: p.page_count ?? 0, chapterCount, assetCount })}</dd>
              </div>
              <div>
                <dt>{t("ed_section")}</dt>
                <dd>{sectionName}</dd>
              </div>
              <div>
                <dt>{t("ed_price")}</dt>
                <dd className="tnum">{p.access === "free" ? t("free") : formatZar(p.price_cents, intlTag)}</dd>
              </div>
              <div>
                <dt>{t("ed_visibility")}</dt>
                <dd>{t(`vis_${p.visibility}`)}</dd>
              </div>
              <div>
                <dt>{t("ed_holders")}</dt>
                <dd className="tnum">{holders ?? 0}</dd>
              </div>
            </dl>
          </div>
          {tab === "sales" ? <DeleteProduct id={id} title={title} inUse={(holders ?? 0) > 0} /> : null}
        </aside>
      </div>
    </>
  );
}
