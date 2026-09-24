import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { GripVertical, Lock, Plus, Store } from "lucide-react";
import { SectionsPanel, ShowcaseList } from "@/components/admin/showcase";
import { Art } from "@/components/catalogue/art";
import { toLocale } from "@/i18n/config";
import { adminContext } from "@/lib/admin/context";
import { adminProducts, adminSections } from "@/lib/admin/queries";
import { formatZar } from "@/lib/format";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("sc_title") };
}

export default async function ShowcasePage() {
  const { db } = await adminContext("/admin/showcase");
  const t = await getTranslations();
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  const [products, sections] = await Promise.all([adminProducts(db, locale), adminSections(db, locale)]);
  const covers = await signedImageUrls(products.map((p) => p.coverPath));

  // The phone preview follows the library: sections in order, then products in showcase order; hidden ones left out.
  const listed = products.filter((p) => p.visibility !== "hidden");
  const groups = [
    ...sections.map((s) => ({ key: s.id, name: s.name, items: listed.filter((p) => p.sectionId === s.id) })),
    { key: "none", name: t("sc_noSection"), items: listed.filter((p) => !p.sectionId || !sections.some((s) => s.id === p.sectionId)) },
  ].filter((g) => g.items.length);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("sc_title")}</h1>
          <p>{t("sc_lead")}</p>
        </div>
        <Link className="btn btn-primary" href="/admin/products/new">
          <Plus className="icon" aria-hidden="true" />
          {t("newPack")}
        </Link>
      </div>
      <div className="showcase">
        <section className="card" style={{ overflow: "hidden" }} aria-label={t("sc_title")}>
          <div className="toolbar">
            <span className="muted" style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
              <GripVertical className="icon icon-sm" aria-hidden="true" />
              {t("sc_drag")}
            </span>
          </div>
          {products.length ? (
            <ShowcaseList
              sections={sections.map((s) => ({ id: s.id, name: s.name }))}
              rows={products.map((p) => ({
                id: p.id,
                title: p.title,
                meta: [t(`type_${p.type}`), p.access === "free" ? t("free") : formatZar(p.priceCents, intlTag), p.gatewayProductId ?? t("sc_noGid")].join(" · "),
                coverPath: p.coverPath,
                coverUrl: covers.get(p.coverPath ?? ""),
                fieldColour: p.fieldColour,
                sectionId: p.sectionId,
                visibility: p.visibility,
              }))}
            />
          ) : (
            <div className="empty">
              <Store className="icon" aria-hidden="true" />
              <p>{t("sc_empty")}</p>
            </div>
          )}
        </section>
        <aside className="stack">
          <SectionsPanel sections={sections.map((s) => ({ id: s.id, name: s.name, names: s.names, items: products.filter((p) => p.sectionId === s.id).length }))} />
          <div>
            <h2 style={{ fontSize: 17 }}>{t("sc_preview")}</h2>
            <p className="muted" style={{ fontSize: 13.5, margin: "4px 0 12px" }}>
              {t("sc_previewP2")}
            </p>
            <div className="preview-phone" aria-hidden="true">
              <div className="preview-screen">
                {groups.map((g) => (
                  <div key={g.key}>
                    <p className="preview-sec">{g.name}</p>
                    <div className="preview-grid">
                      {g.items.map((p) => {
                        const own = p.access === "free";
                        return (
                          <div className="p" key={p.id} style={p.visibility === "soon" ? { opacity: 0.55 } : undefined}>
                            <div className="c" style={{ background: p.fieldColour }}>
                              <Art path={p.coverPath} url={covers.get(p.coverPath ?? "")} mode={own ? "color" : "line"} />
                            </div>
                            {!own && p.visibility === "visible" ? (
                              <span className="lk">
                                <Lock className="icon" />
                              </span>
                            ) : null}
                            <small>{p.title}</small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
