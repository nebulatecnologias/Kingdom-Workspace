import Link from "next/link";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconLedger,
  IconRefresh,
  IconScale,
} from "@/components/icons";
import { dictionaries, getDict, languages, CONTACT_HREF, type Lang } from "@/lib/content";

export function generateStaticParams() {
  return languages.flatMap((lang) =>
    dictionaries[lang].pillars.map((p) => ({ lang, pillar: p.slug }))
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; pillar: string }>;
}): Promise<Metadata> {
  const { lang, pillar } = await params;
  const dict = getDict(lang);
  const p = dict.pillars.find((x) => x.slug === pillar);
  if (!p) return {};
  return {
    title: p.name,
    description: p.promise,
  };
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ lang: string; pillar: string }>;
}) {
  const { lang, pillar } = await params;
  const l = lang as Lang;
  const dict = getDict(l);
  const idx = dict.pillars.findIndex((x) => x.slug === pillar);
  const p = dict.pillars[idx];
  const prev = idx > 0 ? dict.pillars[idx - 1] : null;
  const next = idx < dict.pillars.length - 1 ? dict.pillars[idx + 1] : null;
  const t = dict.pillarPage;

  return (
    <>
      {/* ——— Cabeçalho do pilar ——— */}
      <section className="phero">
        <div className="phero__field" aria-hidden />
        <p className="phero__big" aria-hidden>{p.num}</p>
        <div className="container phero__inner">
          <nav className="phero__crumb" aria-label="breadcrumb">
            <Link href={`/${l}/#pilares`}>{t.allPillars}</Link>
            <span aria-hidden>/</span>
            <span>{t.pillarLabel} {p.num}</span>
          </nav>
          <h1 className="phero__title">{p.name}</h1>
          <p className="phero__promise">{p.promise}</p>
          {p.note && (
            <div className="phero__notice">
              <h2>{t.noteLabel}</h2>
              <p>{p.note}</p>
            </div>
          )}
        </div>
      </section>

      {/* ——— Serviços ——— */}
      <section className="services">
        <div className="container">
          {p.services.map((s, i) => (
            <Reveal key={s.num} as="article" className="service" delay={0}>
              <div id={`s-${s.num.replace(".", "-")}`} className="service__anchor" aria-hidden />
              <header className="service__head">
                <p className="service__num" aria-hidden>{s.num}</p>
                <h2 className="service__title">{s.title}</h2>
              </header>

              <div className="service__grid">
                <div className="service__pain">
                  <h3>{t.painLabel}</h3>
                  <p>{s.pain}</p>
                </div>

                <div className="service__deliverables">
                  <h3>{t.deliverablesLabel}</h3>
                  <ul>
                    {s.deliverables.map((d) => (
                      <li key={d}>
                        <span className="service__check" aria-hidden>
                          <IconCheck size={13} />
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>

                  {(s.retainer || s.model || s.boundary) && (
                    <dl className="service__meta">
                      {s.retainer && (
                        <div className="service__metarow">
                          <dt>
                            <IconRefresh size={15} />
                            {t.retainerLabel}
                          </dt>
                          <dd>{s.retainer}</dd>
                        </div>
                      )}
                      {s.model && (
                        <div className="service__metarow">
                          <dt>
                            <IconLedger size={15} />
                            {t.modelLabel}
                          </dt>
                          <dd>{s.model}</dd>
                        </div>
                      )}
                      {s.boundary && (
                        <div className="service__metarow">
                          <dt>
                            <IconScale size={15} />
                            {t.boundaryLabel}
                          </dt>
                          <dd>{s.boundary}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              </div>

              {i < p.services.length - 1 && <hr className="service__rule" />}
            </Reveal>
          ))}

          {p.boundary && (
            <aside className="pillar-boundary">
              <h2>
                <IconScale size={18} />
                {t.boundaryLabel}
              </h2>
              <p>{p.boundary}</p>
            </aside>
          )}
        </div>
      </section>

      {/* ——— Navegação entre pilares ——— */}
      <nav className="pnav" aria-label={t.allPillars}>
        <div className="container pnav__inner">
          {prev ? (
            <Link href={`/${l}/${prev.slug}/`} className="pnav__item pnav__item--prev">
              <span className="pnav__dir">
                <IconArrowLeft size={16} />
                {t.prev}
              </span>
              <span className="pnav__name">{prev.name}</span>
            </Link>
          ) : (
            <span className="pnav__item pnav__item--empty" aria-hidden />
          )}
          {next ? (
            <Link href={`/${l}/${next.slug}/`} className="pnav__item pnav__item--next">
              <span className="pnav__dir">
                {t.next}
                <IconArrowRight size={16} />
              </span>
              <span className="pnav__name">{next.name}</span>
            </Link>
          ) : (
            <span className="pnav__item pnav__item--empty" aria-hidden />
          )}
        </div>
      </nav>

      {/* ——— CTA ——— */}
      <section className="cta">
        <div className="container cta__inner">
          <h2>{dict.cta.heading}</h2>
          <p className="cta__body">{dict.cta.body}</p>
          <a href={CONTACT_HREF} className="btn btn--light btn--lg">{dict.cta.button}</a>
          <p className="cta__note">{dict.cta.note}</p>
        </div>
      </section>
    </>
  );
}
