import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav_library") };
}

// Phase 0: layout only. The catalogue, sections and product cards arrive in Phase 3.
export default async function LibraryPage() {
  const t = await getTranslations();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav_library")}</h1>
          <p>{t("lib_lead")}</p>
        </div>
      </div>
      <section className="card">
        <div className="empty">
          <BookOpen className="icon" aria-hidden="true" />
          <p>{t("empty_mine")}</p>
        </div>
      </section>
      <p className="lib-verse">
        <q>{t("verse_text")}</q> {t("verse_ref")}
      </p>
    </>
  );
}
