import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { Studio } from "@/components/catalogue/studio";
import { toLocale } from "@/i18n/config";
import { artSvg, isBuiltinArt } from "@/lib/art";
import { requireMember } from "@/lib/auth";
import { getProduct } from "@/lib/catalogue";
import { signedImageUrls } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/products/[slug]/colour/[page]">): Promise<Metadata> {
  const { slug, page } = await params;
  const t = await getTranslations();
  const p = await getProduct(slug, toLocale(await getLocale()));
  const row = p?.outline.find((o) => o.kind === "page" && o.position === Number(page));
  return { title: row ? `${t("studio_title")} · ${row.title}` : t("studio_title") };
}

export default async function ColourPage({ params }: PageProps<"/products/[slug]/colour/[page]">) {
  const { slug, page } = await params;
  const profile = await requireMember(`/products/${slug}/colour/${page}`);
  const t = await getTranslations();
  const p = await getProduct(slug, toLocale(await getLocale()));
  const position = Number(page);
  if (!p || !Number.isInteger(position)) notFound();
  if (!p.owned) redirect(`/products/${p.slug}`);
  const row = p.outline.find((o) => o.kind === "page" && o.position === position);
  if (!row?.lineartPath) notFound();

  const builtin = isBuiltinArt(row.lineartPath);
  const imageUrl = builtin ? undefined : (await signedImageUrls([row.lineartPath], 3600)).get(row.lineartPath);

  return (
    <>
      <Link className="back" href={`/products/${p.slug}`}>
        <ChevronLeft className="icon icon-sm" aria-hidden="true" />
        {p.title}
      </Link>
      <section className="card card-pad" style={{ maxWidth: 1040 }}>
        <div className="dialog-head">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>
              {t("studio_title")} · {row.title}
            </h1>
            <p className="muted" style={{ marginTop: 4 }}>
              {t("studio_lead")}
            </p>
          </div>
        </div>
        <Studio
          svg={builtin ? artSvg(row.lineartPath.slice(8), "line", "colour-svg") : undefined}
          imageUrl={imageUrl}
          storageKey={`km-colour:${profile.id}:${p.id}:${position}`}
          fileName={`${p.slug}-${position}.png`}
          doneHref={`/products/${p.slug}`}
          labels={{
            crayon: t.raw("crayon") as string,
            eraser: t("eraser"),
            reset: t("studio_reset"),
            download: t("pack_dl"),
            done: t("studio_done"),
            palette: t("studio_title"),
          }}
        />
      </section>
    </>
  );
}
