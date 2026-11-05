import Link from "next/link";
import { getDict, type Lang, CONTACT_HREF } from "@/lib/content";

export default function Footer({ lang }: { lang: Lang }) {
  const dict = getDict(lang);
  const other: Lang = lang === "pt" ? "en" : "pt";
  const otherDict = getDict(other);
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contactos">
      <div className="container footer__grid">
        <div className="footer__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-navy.png" alt="DT Company" width={618} height={272} className="footer__logo" />
          <p className="footer__tagline">{dict.footer.tagline}</p>
          <a href={CONTACT_HREF} className="btn btn--primary btn--sm">{dict.nav.cta}</a>
          <p className="footer__provisional">{dict.footer.provisional}</p>
        </div>

        <nav className="footer__col" aria-label={dict.footer.pillarsHeading}>
          <h2>{dict.footer.pillarsHeading}</h2>
          <ul>
            {dict.pillars.map((p) => (
              <li key={p.slug}>
                <Link href={`/${lang}/${p.slug}/`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer__col" aria-label={dict.footer.companyHeading}>
          <h2>{dict.footer.companyHeading}</h2>
          <ul>
            <li><Link href={`/${lang}/#abordagem`}>{dict.footer.approach}</Link></li>
            <li><Link href={`/${lang}/#pilares`}>{dict.nav.pillars}</Link></li>
            <li><a href={CONTACT_HREF}>{dict.footer.contact}</a></li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label={dict.footer.languageHeading}>
          <h2>{dict.footer.languageHeading}</h2>
          <ul>
            <li><span aria-current="true">{dict.langName}</span></li>
            <li><Link href={`/${other}/`} rel="alternate" hrefLang={other}>{otherDict.langName}</Link></li>
          </ul>
        </nav>
      </div>

      <div className="container footer__legal">
        <p>© {year} {dict.footer.legal}</p>
      </div>
    </footer>
  );
}
