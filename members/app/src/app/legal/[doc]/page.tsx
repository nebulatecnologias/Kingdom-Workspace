import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Brand } from "@/components/ui/brand";
import { LanguageSelect } from "@/components/ui/language-select";
import { Notice } from "@/components/ui/notice";
import { COMPANY, LEGAL_DOCS, type LegalBlock, type LegalSlug } from "@/content/legal";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((doc) => ({ doc }));
}

function getDoc(slug: string) {
  return Object.hasOwn(LEGAL_DOCS, slug) ? LEGAL_DOCS[slug as LegalSlug] : null;
}

export async function generateMetadata({ params }: PageProps<"/legal/[doc]">): Promise<Metadata> {
  const doc = getDoc((await params).doc);
  return { title: doc?.title };
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <p>{block}</p>;
  if ("link" in block) {
    return (
      <p>
        {block.before}
        <Link href={`/legal/${block.link.doc}`}>{block.link.label}</Link>
        {block.after}
      </p>
    );
  }
  if ("list" in block) {
    return (
      <ul style={{ display: "grid", gap: 6, paddingLeft: 22, listStyle: "disc" }}>
        {block.list.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }
  return (
    <address style={{ fontStyle: "normal" }}>
      {COMPANY.name}
      <br />
      {COMPANY.address}
      <br />
      Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      <br />
      WhatsApp/Phone: <a href={COMPANY.whatsapp}>{COMPANY.phone}</a>
    </address>
  );
}

export default async function LegalPage({ params }: PageProps<"/legal/[doc]">) {
  const doc = getDoc((await params).doc);
  if (!doc) notFound();
  const t = await getTranslations();
  const locale = await getLocale();
  return (
    <div className="main" style={{ maxWidth: 820, margin: "0 auto" }}>
      {/* Not .topbar: that one is hidden on phones, where the member area shows its own bar. */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
        <Brand href="/library" />
        <LanguageSelect />
      </header>
      {locale.startsWith("en") ? null : <div style={{ marginBottom: 16 }}><Notice>{t("legal_en_only")}</Notice></div>}
      <article className="card card-pad" lang="en-ZA">
        <div className="page-head" style={{ marginBottom: 12 }}>
          <div>
            <h1>{doc.title}</h1>
            <p>Last updated: {doc.updated}</p>
          </div>
        </div>
        <div className="reader" style={{ margin: 0 }}>
          {doc.intro.map((p) => <p key={p}>{p}</p>)}
          {doc.sections.map((s) => (
            <section key={s.heading} style={{ display: "grid", gap: "0.75em" }}>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--ink)", marginTop: 8 }}>{s.heading}</h2>
              {s.blocks.map((b, i) => <Block key={i} block={b} />)}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
