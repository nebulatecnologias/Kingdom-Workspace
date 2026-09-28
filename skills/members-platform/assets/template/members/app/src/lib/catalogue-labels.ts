import { formatZar } from "@/lib/format";
import type { ProductType } from "@/lib/catalogue";

type T = (key: string, values?: Record<string, string | number>) => string;

/** "12 pages", "9 chapters", "7 steps" or "12 items" (a kit), as on the prototype's cards. */
export function countLabel(t: T, p: { type: ProductType; pageCount: number; chapterCount: number; assetCount?: number }) {
  if (p.type === "kit") return t("n_items", { n: p.assetCount ?? 0 });
  if (p.type === "book") return t("n_chapters", { n: p.chapterCount });
  if (p.type === "guide") return t("n_steps", { n: p.chapterCount });
  return t("n_pages", { n: p.pageCount });
}

/** Price as the design system shows it everywhere: "R 89,00" (formatted on the server, so identical for everyone). */
export function priceLabel(cents: number, intlTag: string) {
  return formatZar(cents, intlTag);
}
