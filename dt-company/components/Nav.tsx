"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { alternateSlug, getDict, isLang, type Lang, CONTACT_HREF } from "@/lib/content";

export default function Nav({ lang }: { lang: Lang }) {
  const dict = getDict(lang);
  const pathname = usePathname() ?? `/${lang}/`;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("nav-open", open);
    return () => document.documentElement.classList.remove("nav-open");
  }, [open]);

  const other: Lang = lang === "pt" ? "en" : "pt";

  function altPath(): string {
    const segments = pathname.split("/").filter(Boolean);
    // segments: [lang] or [lang, pillarSlug]
    if (segments.length >= 2 && isLang(segments[0])) {
      const mapped = alternateSlug(segments[1], lang, other);
      if (mapped) return `/${other}/${mapped}/`;
    }
    return `/${other}/`;
  }

  const home = `/${lang}/`;

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}>
      <div className="nav__inner">
        <Link href={home} className="nav__brand" aria-label="DT Company — Business Advisory & Development">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-white.png" alt="" width={618} height={272} className="nav__logo" />
          <span className="nav__brandtext">
            <strong>DT Company</strong>
            <span>Business Advisory &amp; Development</span>
          </span>
        </Link>

        <nav className="nav__links" aria-label="Principal">
          <Link href={`${home}#pilares`}>{dict.nav.pillars}</Link>
          <Link href={`${home}#abordagem`}>{dict.nav.approach}</Link>
          <Link href={`${home}#contactos`}>{dict.nav.contact}</Link>
        </nav>

        <div className="nav__actions">
          <Link href={altPath()} className="nav__lang" rel="alternate" hrefLang={other} aria-label={other === "en" ? "Switch to English" : "Mudar para português"}>
            <span className={lang === "pt" ? "is-current" : ""}>PT</span>
            <span aria-hidden>·</span>
            <span className={lang === "en" ? "is-current" : ""}>EN</span>
          </Link>
          <a href={CONTACT_HREF} className="btn btn--light btn--sm nav__cta">
            {dict.nav.cta}
          </a>
          <button
            type="button"
            className="nav__burger"
            aria-label={dict.nav.menuLabel}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="nav__sheet" hidden={!open}>
        <Link href={`${home}#pilares`}>{dict.nav.pillars}</Link>
        <Link href={`${home}#abordagem`}>{dict.nav.approach}</Link>
        <Link href={`${home}#contactos`}>{dict.nav.contact}</Link>
        <a href={CONTACT_HREF} className="btn btn--light">{dict.nav.cta}</a>
      </div>
    </header>
  );
}
