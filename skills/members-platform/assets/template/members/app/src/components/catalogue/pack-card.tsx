import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Lock } from "lucide-react";
import type { LibraryItem } from "@/lib/catalogue";
import { countLabel, priceLabel } from "@/lib/catalogue-labels";
import { Art } from "./art";

/** Library card: owned (colour cover, green pill), locked (desaturated, padlock, price) or coming soon (grey). */
export async function PackCard({ item, coverUrl, intlTag }: { item: LibraryItem; coverUrl?: string; intlTag: string }) {
  const t = await getTranslations();
  const soon = item.visibility === "soon";
  const own = item.owned;
  const cls = soon ? "pack is-soon" : own ? "pack" : "pack is-locked";
  const cover = (
    <div className="pack-cover" style={{ background: item.fieldColour }}>
      <Art path={item.coverPath} url={coverUrl} mode={own ? "color" : "line"} />
      {!own && !soon ? (
        <span className="pack-lock">
          <Lock className="icon" aria-hidden="true" />
        </span>
      ) : null}
    </div>
  );
  const foot = soon ? (
    <span className="pill pill-grey">{t("soon")}</span>
  ) : own ? (
    <span className="pill pill-green">
      <span className="dot" />
      {item.access === "free" ? t("free") : t("unlocked")}
    </span>
  ) : (
    <span className="pill pill-orange">
      <Lock className="icon icon-sm" aria-hidden="true" />
      {priceLabel(item.priceCents, intlTag)}
    </span>
  );
  const body = (
    <div className="pack-body">
      <h3>{item.title}</h3>
      <div className="pack-foot">
        <span className="pack-meta">
          {t(`type_${item.type}`)} · {countLabel(t, item)}
        </span>
        {foot}
      </div>
    </div>
  );
  if (soon) {
    return (
      <div className={cls} aria-disabled="true">
        {cover}
        {body}
      </div>
    );
  }
  return (
    <Link className={cls} href={`/products/${item.slug}`} aria-label={own ? item.title : `${item.title}: ${t("locked")}`}>
      {cover}
      {body}
    </Link>
  );
}
