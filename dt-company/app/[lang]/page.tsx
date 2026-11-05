import Link from "next/link";
import DossierCard from "@/components/DossierCard";
import Reveal from "@/components/Reveal";
import { IconArrowRight } from "@/components/icons";
import { getDict, languages, CONTACT_HREF, type Lang } from "@/lib/content";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = getDict(lang);
  const l = lang as Lang;

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="hero">
        <div className="hero__field" aria-hidden />
        <div className="container hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">{dict.hero.h1}</h1>
            <p className="hero__sub">{dict.hero.sub}</p>
            <div className="hero__actions">
              <a href={CONTACT_HREF} className="btn btn--light">{dict.hero.ctaPrimary}</a>
              <a href="#pilares" className="btn btn--ghost">
                {dict.hero.ctaSecondary}
                <IconArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="hero__visual">
            <DossierCard dossier={dict.hero.dossier} />
          </div>
        </div>
        <div className="container hero__facts">
          {dict.hero.facts.map((f) => (
            <div className="hero__fact" key={f.label}>
              <strong>{f.value}</strong>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Pilares ——— */}
      <section className="pillars" id="pilares">
        <div className="container">
          <Reveal>
            <h2 className="section__title">{dict.pillarsSection.heading}</h2>
            <p className="section__intro">{dict.pillarsSection.intro}</p>
          </Reveal>

          <div className="pillars__list">
            {dict.pillars.map((pillar, i) => (
              <Reveal key={pillar.slug} as="article" className="pillar" delay={i * 60}>
                <div className="pillar__head">
                  <p className="pillar__num" aria-hidden>{pillar.num}</p>
                  <div>
                    <h3 className="pillar__name">
                      <Link href={`/${l}/${pillar.slug}/`}>{pillar.name}</Link>
                    </h3>
                    <p className="pillar__promise">{pillar.promise}</p>
                    <Link href={`/${l}/${pillar.slug}/`} className="pillar__link">
                      {dict.pillarsSection.viewPillar}
                      <IconArrowRight size={16} />
                    </Link>
                  </div>
                </div>
                <ul className="pillar__services">
                  {pillar.services.map((s) => (
                    <li key={s.num}>
                      <Link href={`/${l}/${pillar.slug}/#s-${s.num.replace(".", "-")}`} className="service-row">
                        <span className="service-row__num">{s.num}</span>
                        <span className="service-row__body">
                          <span className="service-row__title">{s.title}</span>
                          <span className="service-row__pain">{s.pain}</span>
                        </span>
                        <span className="service-row__arrow" aria-hidden>
                          <IconArrowRight size={16} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Abordagem ——— */}
      <section className="approach" id="abordagem">
        <div className="container">
          <Reveal>
            <h2 className="section__title">{dict.approach.heading}</h2>
            <p className="section__intro">{dict.approach.intro}</p>
          </Reveal>
          <ol className="approach__steps">
            {dict.approach.steps.map((step, i) => (
              <Reveal key={step.title} as="li" delay={i * 90} className="approach__step">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Fronteiras ——— */}
      <section className="boundaries">
        <div className="container">
          <Reveal>
            <h2 className="section__title">{dict.boundaries.heading}</h2>
            <p className="section__intro section__intro--onnavy">{dict.boundaries.intro}</p>
          </Reveal>
          <ul className="boundaries__list">
            {dict.boundaries.partners.map((p, i) => (
              <Reveal key={p.role} as="li" delay={i * 90} className="boundaries__row">
                <h3>{p.role}</h3>
                <p>{p.scope}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— CTA final ——— */}
      <section className="cta">
        <div className="container cta__inner">
          <Reveal>
            <h2>{dict.cta.heading}</h2>
            <p className="cta__body">{dict.cta.body}</p>
            <a href={CONTACT_HREF} className="btn btn--light btn--lg">{dict.cta.button}</a>
            <p className="cta__note">{dict.cta.note}</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
