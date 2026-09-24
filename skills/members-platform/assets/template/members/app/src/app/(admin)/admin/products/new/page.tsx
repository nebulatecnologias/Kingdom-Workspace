import type { Metadata } from "next";
import { IntentLink as Link } from "@/components/shell/intent-link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { NewProductForm } from "@/components/admin/new-product";
import { toLocale } from "@/i18n/config";
import { adminContext } from "@/lib/admin/context";
import { adminSections } from "@/lib/admin/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("newPack") };
}

export default async function NewProductPage() {
  const { db } = await adminContext("/admin/products/new");
  const t = await getTranslations();
  const sections = await adminSections(db, toLocale(await getLocale()));
  return (
    <>
      <Link className="back" href="/admin/showcase">
        <ChevronLeft className="icon icon-sm" aria-hidden="true" />
        {t("sc_title")}
      </Link>
      <div className="page-head">
        <div>
          <h1>{t("newPack")}</h1>
          <p>{t("np_lead")}</p>
        </div>
      </div>
      <section className="card card-pad" style={{ maxWidth: 640 }}>
        <NewProductForm sections={sections.map((s) => ({ id: s.id, name: s.name }))} />
      </section>
    </>
  );
}
