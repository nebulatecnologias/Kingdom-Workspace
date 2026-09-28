import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, BookOpenCheck, CheckCircle2, Library } from "lucide-react";
import { Art } from "@/components/catalogue/art";
import { PackCard } from "@/components/catalogue/pack-card";
import { BannerCarousel, type HomeBanner } from "@/components/home/banner-carousel";
import { Notice } from "@/components/ui/notice";
import { toLocale } from "@/i18n/config";
import { requireMember } from "@/lib/auth";
import { getLibrary, getProgress, isReading } from "@/lib/catalogue";
import { signedImageUrls } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav_home") };
}

type BannerDbRow = { id: string; title: string; body: string | null; cta_label: string | null; link: string | null; image_path: string | null; image_mobile_path: string | null };

export default async function HomePage({ searchParams }: PageProps<"/home">) {
  const sp = await searchParams;
  const t = await getTranslations();
  const intlTag = await getLocale();
  const locale = toLocale(intlTag);
  const supabase = await createClient();
  // Independent reads run together: every sequential database call adds a round trip to each tap.
  const [profile, items, bannerRes] = await Promise.all([requireMember("/home"), getLibrary(locale), supabase.rpc("home_banners", { p_locale: locale })]);
  const progress = await getProgress(profile.id);
  const bannerRows = (bannerRes.data ?? []) as BannerDbRow[];

  const owned = items.filter((p) => p.visibility === "visible" && p.owned);
  // Reading progress of products the member still owns, most recent first.
  const reading = progress.flatMap((r) => {
    const item = owned.find((p) => p.id === r.product_id && isReading(p.type) && p.chapterCount > 0);
    return item ? [{ item, done: Math.min(r.chapter_position, item.chapterCount) }] : [];
  });
  const inProgress = reading.filter((x) => x.done < x.item.chapterCount);
  const finished = reading.filter((x) => x.done >= x.item.chapterCount);
  const cont = inProgress[0];
  const more = inProgress.slice(1, 5);
  const suggestions = items.filter((p) => p.visibility === "visible" && !p.owned).slice(0, 4);

  const [covers, images] = await Promise.all([
    signedImageUrls([...reading.map((x) => x.item.coverPath), ...suggestions.map((p) => p.coverPath)]),
    signedImageUrls(bannerRows.flatMap((b) => [b.image_path, b.image_mobile_path])),
  ]);
  const banners: HomeBanner[] = bannerRows.map((b) => ({
    id: b.id,
    title: b.title,
    body: b.body,
    ctaLabel: b.cta_label,
    link: b.link,
    imageUrl: images.get(b.image_path ?? ""),
    imageMobileUrl: images.get(b.image_mobile_path ?? ""),
  }));
  const first = (profile.fullName || profile.email).split(" ")[0];
  const bar = (done: number, total: number, label: string) => (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
      <i style={{ width: `${Math.min(100, (done / total) * 100)}%` }} />
    </div>
  );

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
          <p>{t("home_lead")}</p>
        </div>
      </div>

      {!profile.onboardedAt ? (
        <div className="card card-pad home-sec home-start">
          <div>
            <b style={{ fontWeight: 500 }}>{t("home_welcomeQ")}</b>
            <p className="muted" style={{ fontSize: 14, marginTop: 2 }}>
              {t("home_welcomeQP")}
            </p>
          </div>
          <Link className="btn btn-primary btn-sm" href="/welcome">
            {t("home_welcomeQGo")}
            <ArrowRight className="icon icon-sm" aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      <BannerCarousel banners={banners} />

      <section className="home-stats" aria-label={t("home_progress")}>
        <div className="card home-stat">
          <Library className="icon" aria-hidden="true" />
          <b className="tnum">{owned.length}</b>
          <span>{t("home_owned", { n: owned.length })}</span>
        </div>
        <div className="card home-stat">
          <BookOpen className="icon" aria-hidden="true" />
          <b className="tnum">{inProgress.length}</b>
          <span>{t("home_reading", { n: inProgress.length })}</span>
        </div>
        <div className="card home-stat">
          <CheckCircle2 className="icon" aria-hidden="true" />
          <b className="tnum">{finished.length}</b>
          <span>{t("home_finished", { n: finished.length })}</span>
        </div>
      </section>

      {cont ? (
        <div className="card continue">
          <div className="thumb" style={{ background: cont.item.fieldColour }}>
            <Art path={cont.item.coverPath} url={covers.get(cont.item.coverPath ?? "")} />
          </div>
          <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
            <h2>{t("continue_read", { pack: cont.item.title })}</h2>
            {bar(cont.done, cont.item.chapterCount, t("continue_chapter", { done: cont.done, total: cont.item.chapterCount }))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span className="muted tnum progress-meta" style={{ fontSize: 13.5 }}>
                {t("continue_chapter", { done: cont.done, total: cont.item.chapterCount })}
              </span>
              <Link className="btn btn-primary btn-sm" href={`/products/${cont.item.slug}/read/${cont.done}`}>
                {t("read_continue")}
                <ArrowRight className="icon icon-sm" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {more.length ? (
        <section className="lib-sec home-sec" aria-labelledby="home-more">
          <h2 id="home-more">{t("home_alsoReading")}</h2>
          <ul className="card home-list">
            {more.map(({ item, done }) => (
              <li key={item.id}>
                <Link className="home-row" href={`/products/${item.slug}/read/${done}`}>
                  <span className="mini" style={{ background: item.fieldColour }} aria-hidden="true">
                    <Art path={item.coverPath} url={covers.get(item.coverPath ?? "")} />
                  </span>
                  <span className="home-row-body">
                    <b>{item.title}</b>
                    {bar(done, item.chapterCount, t("continue_chapter", { done, total: item.chapterCount }))}
                  </span>
                  <span className="muted tnum" style={{ fontSize: 13 }}>
                    {done}/{item.chapterCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!owned.length ? (
        <div className="card empty home-sec">
          <BookOpenCheck className="icon" aria-hidden="true" />
          <p>{t("home_empty")}</p>
          <Link className="btn btn-primary" href="/library">
            {t("home_openLibrary")}
          </Link>
        </div>
      ) : !cont ? (
        <div className="card card-pad home-sec home-start">
          <p>{t("home_start")}</p>
          <Link className="btn btn-ghost btn-sm" href="/library?filter=mine">
            {t("home_openMine")}
            <ArrowRight className="icon icon-sm" aria-hidden="true" />
          </Link>
        </div>
      ) : null}

      {suggestions.length ? (
        <section className="lib-sec home-sec" aria-labelledby="home-more-packs">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h2 id="home-more-packs">{t("home_discover")}</h2>
            <Link className="btn btn-quiet btn-sm" href="/library?filter=locked">
              {t("home_seeAll")}
            </Link>
          </div>
          <div className="lib-grid home-picks">
            {suggestions.map((p) => (
              <PackCard key={p.id} item={p} coverUrl={covers.get(p.coverPath ?? "")} intlTag={intlTag} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="lib-verse">
        <q>{t("verse_text")}</q> {t("verse_ref")}
      </p>
    </>
  );
}
