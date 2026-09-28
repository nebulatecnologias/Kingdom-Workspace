"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type HomeBanner = {
  id: string;
  title: string;
  body: string | null;
  ctaLabel: string | null;
  link: string | null;
  imageUrl?: string;
  imageMobileUrl?: string;
};

const INTERVAL = 7000;

function Slide({ b }: { b: HomeBanner }) {
  const wide = b.imageUrl ?? b.imageMobileUrl;
  const inner = wide ? (
    <>
      <picture>
        {b.imageMobileUrl && b.imageUrl ? <source media="(max-width: 640px)" srcSet={b.imageMobileUrl} /> : null}
        {/* The title is the image's text alternative: the admin writes it to say what the banner says. */}
        <img src={wide} alt={b.title} className="banner-img" />
      </picture>
      {b.body || b.ctaLabel ? (
        <span className="banner-caption">
          {b.body ? <span>{b.body}</span> : null}
          {b.ctaLabel && b.link ? (
            <span className="btn btn-primary btn-sm">
              {b.ctaLabel}
              <ArrowRight className="icon icon-sm" aria-hidden="true" />
            </span>
          ) : null}
        </span>
      ) : null}
    </>
  ) : (
    <span className="banner-text">
      <b>{b.title}</b>
      {b.body ? <span>{b.body}</span> : null}
      {b.ctaLabel && b.link ? (
        <span className="btn btn-sm banner-cta">
          {b.ctaLabel}
          <ArrowRight className="icon icon-sm" aria-hidden="true" />
        </span>
      ) : null}
    </span>
  );
  if (!b.link) return <div className="banner">{inner}</div>;
  // Pages of this site open in place; other https addresses open in a new tab.
  return b.link.startsWith("/") ? (
    <Link className="banner" href={b.link}>
      {inner}
    </Link>
  ) : (
    <a className="banner" href={b.link} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}

/** Panoramic offers on Home. Several banners rotate every 7 seconds, unless the member paused them, prefers less motion, or is pointing at or focused inside it. */
export function BannerCarousel({ banners }: { banners: HomeBanner[] }) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const [calm, setCalm] = useState(true);
  const many = banners.length > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCalm(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const playing = many && !paused && !calm;
  useEffect(() => {
    if (!playing || hold) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % banners.length), INTERVAL);
    return () => window.clearTimeout(id);
  }, [playing, hold, index, banners.length]);

  if (!banners.length) return null;
  const go = (d: number) => setIndex((i) => (i + d + banners.length) % banners.length);

  return (
    <section
      className="banners"
      aria-roledescription={many ? t("home_carousel") : undefined}
      aria-label={t("home_offers")}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false);
      }}
    >
      {/* Only a slide the member moves to is announced, never one the timer brings in. */}
      <div aria-live={playing ? "off" : "polite"}>
        {banners.map((b, i) => (
          <div
            key={b.id}
            role={many ? "group" : undefined}
            aria-roledescription={many ? t("home_slide") : undefined}
            aria-label={many ? t("home_slideOf", { n: i + 1, total: banners.length }) : undefined}
            hidden={i !== index}
          >
            <Slide b={b} />
          </div>
        ))}
      </div>
      {many ? (
        <div className="banner-controls">
          {calm ? null : (
            <button type="button" className="icon-btn" onClick={() => setPaused((p) => !p)} aria-label={paused ? t("home_play") : t("home_pause")}>
              {paused ? <Play className="icon icon-sm" aria-hidden="true" /> : <Pause className="icon icon-sm" aria-hidden="true" />}
            </button>
          )}
          <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label={t("home_prev")}>
            <ChevronLeft className="icon icon-sm" aria-hidden="true" />
          </button>
          <span className="banner-dots" aria-hidden="true">
            {banners.map((b, i) => (
              <i key={b.id} className={i === index ? "on" : undefined} />
            ))}
          </span>
          <button type="button" className="icon-btn" onClick={() => go(1)} aria-label={t("home_next")}>
            <ChevronRight className="icon icon-sm" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
