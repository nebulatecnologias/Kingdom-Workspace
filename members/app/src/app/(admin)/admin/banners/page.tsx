import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { GalleryHorizontal } from "lucide-react";
import { BannerActions, BannerForm, type BannerRow } from "@/components/admin/banners";
import { Notice } from "@/components/ui/notice";
import { toLocale } from "@/i18n/config";
import { adminContext, UUID } from "@/lib/admin/context";
import { adminProducts } from "@/lib/admin/queries";
import { shortDate } from "@/lib/admin/time";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("bn_titlePage") };
}

type Row = {
  id: string; title: string; body: string | null; cta_label: string | null; link: string | null; locale: BannerRow["locale"];
  audience: BannerRow["audience"]; product_id: string | null; starts_at: string | null; ends_at: string | null; active: boolean;
  sort_order: number; image_path: string | null; image_mobile_path: string | null;
};

/** Where a banner stands right now, for the pill in the list. */
function status(r: Row): BannerRow["status"] {
  const now = Date.now();
  if (!r.active) return "off";
  if (r.ends_at && Date.parse(r.ends_at) <= now) return "ended";
  if (r.starts_at && Date.parse(r.starts_at) > now) return "scheduled";
  return "live";
}

const PILL: Record<BannerRow["status"], string> = { live: "pill-soft-green", scheduled: "pill-blue", ended: "pill-grey", off: "pill-grey" };

export default async function BannersPage({ searchParams }: PageProps<"/admin/banners">) {
  const sp = await searchParams;
  const { db } = await adminContext("/admin/banners");
  const t = await getTranslations();
  const intlTag = await getLocale();
  const [{ data }, products] = await Promise.all([
    db.from("banners").select("id, title, body, cta_label, link, locale, audience, product_id, starts_at, ends_at, active, sort_order, image_path, image_mobile_path").order("sort_order").order("created_at", { ascending: false }),
    adminProducts(db, toLocale(intlTag)),
  ]);
  const rows = (data ?? []) as Row[];
  const images = await signedImageUrls(rows.flatMap((r) => [r.image_path, r.image_mobile_path]));
  const banners: BannerRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    ctaLabel: r.cta_label,
    link: r.link,
    locale: r.locale,
    audience: r.audience,
    productId: r.product_id,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    active: r.active,
    sortOrder: r.sort_order,
    imagePath: r.image_path,
    imageMobilePath: r.image_mobile_path,
    imageUrl: images.get(r.image_path ?? ""),
    imageMobileUrl: images.get(r.image_mobile_path ?? ""),
    status: status(r),
  }));
  const editId = typeof sp.edit === "string" && UUID.test(sp.edit) ? sp.edit : null;
  const editing = editId ? banners.find((b) => b.id === editId) : undefined;
  const productName = new Map(products.map((p) => [p.id, p.title]));
  const localeName: Record<string, string> = { en: "English", pt: "Português", es: "Español" };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("bn_titlePage")}</h1>
          <p>{t("bn_lead")}</p>
        </div>
      </div>
      {typeof sp.saved === "string" ? (
        <div style={{ marginBottom: 18 }}>
          <Notice tone="ok">{t("bn_created")}</Notice>
        </div>
      ) : null}
      <div className="bn-layout">
        <section className="card" aria-labelledby="bn-list">
          <div className="card-head">
            <h2 className="card-title" id="bn-list">
              {t("bn_list")}
            </h2>
          </div>
          {banners.length ? (
            <ul className="bn-list">
              {banners.map((b) => (
                <li key={b.id} className="bn-row">
                  <span className="bn-thumb" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element -- a short-lived signed URL from private storage */}
                    {b.imageUrl ? <img src={b.imageUrl} alt="" /> : <GalleryHorizontal className="icon" />}
                  </span>
                  <div className="bn-info">
                    <b>{b.title}</b>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {[
                        b.locale ? localeName[b.locale] : t("bn_allLocales"),
                        b.audience === "not_owner" ? t("bn_hiddenFrom", { product: productName.get(b.productId ?? "") ?? "—" }) : t("bn_audienceAll"),
                        b.startsAt || b.endsAt ? `${b.startsAt ? shortDate(b.startsAt, intlTag) : "…"} – ${b.endsAt ? shortDate(b.endsAt, intlTag) : "…"}` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                    <span>
                      <span className={`pill ${PILL[b.status]}`}>{t(`bn_status_${b.status}`)}</span>
                    </span>
                  </div>
                  <BannerActions id={b.id} title={b.title} active={b.active} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <GalleryHorizontal className="icon" aria-hidden="true" />
              <p>{t("bn_empty")}</p>
            </div>
          )}
        </section>
        <section className="card card-pad" aria-labelledby="bn-form">
          <h2 className="card-title" id="bn-form" style={{ marginBottom: 14 }}>
            {editing ? t("bn_editTitle") : t("bn_new")}
          </h2>
          {/* A new key remounts the form, so switching from one banner to another starts from its own values. */}
          <BannerForm key={editing?.id ?? "new"} banner={editing} products={products.map((p) => ({ id: p.id, title: p.title }))} />
        </section>
      </div>
    </>
  );
}
