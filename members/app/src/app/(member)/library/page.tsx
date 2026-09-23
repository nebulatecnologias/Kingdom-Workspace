import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { requireMember } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav_library") };
}

// Phase 1: greeting and welcome. The catalogue, sections and product cards arrive in Phase 3.
export default async function LibraryPage({ searchParams }: PageProps<"/library">) {
  const profile = await requireMember();
  const sp = await searchParams;
  const t = await getTranslations();
  const first = (profile.fullName || profile.email).split(" ")[0];
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
