import "server-only";
import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Catalogue reads for the member area. Everything goes through the member's own session, so row-level
 * security decides what they may see: content (chapters, pages, files) only with access, outlines for everyone.
 */

export type ProductType = "colouring" | "book" | "guide" | "workbook";

export type LibraryItem = {
  id: string;
  slug: string;
  type: ProductType;
  access: "paid" | "free";
  visibility: "visible" | "soon";
  sectionSlug: string | null;
  sectionName: string;
  title: string;
  coverPath: string | null;
  fieldColour: string;
  pageCount: number;
  chapterCount: number;
  priceCents: number;
  owned: boolean;
};

export type OutlineRow = {
  kind: "chapter" | "page";
  position: number;
  title: string;
  minutes: number | null;
  isSample: boolean;
  previewPath: string | null;
  lineartPath: string | null;
};

export const isReading = (type: ProductType) => type !== "colouring";

type LibraryRow = {
  id: string; slug: string; type: ProductType; access: "paid" | "free"; visibility: "visible" | "soon";
  section_slug: string | null; section_name: string; title: string; cover_path: string | null;
  field_colour: string | null; page_count: number | null; chapter_count: number; price_cents: number; owned: boolean;
};

export const getLibrary = cache(async (locale: Locale): Promise<LibraryItem[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("library_items", { p_locale: locale });
  if (error) throw new Error(`library_items: ${error.message}`);
  return ((data ?? []) as LibraryRow[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    type: r.type,
    access: r.access,
    visibility: r.visibility,
    sectionSlug: r.section_slug,
    sectionName: r.section_name,
    title: r.title,
    coverPath: r.cover_path,
    fieldColour: r.field_colour ?? "#f3eee8",
    pageCount: r.page_count ?? 0,
    chapterCount: r.chapter_count,
    priceCents: r.price_cents,
    owned: r.owned,
  }));
});

export type ProductDetail = LibraryItem & {
  description: string;
  verse: string | null;
  verseRef: string | null;
  freeSample: boolean;
  outline: OutlineRow[];
  files: { format: "pdf" | "epub"; sizeBytes: number | null }[];
};

export const getProduct = cache(async (slug: string, locale: Locale): Promise<ProductDetail | null> => {
  const item = (await getLibrary(locale)).find((p) => p.slug === slug);
  if (!item) return null;
  const supabase = await createClient();
  const [{ data: tr }, { data: product }, { data: outline }, { data: files }] = await Promise.all([
    supabase.from("product_translations").select("locale, description, verse, verse_ref").eq("product_id", item.id).in("locale", [locale, "en"]),
    supabase.from("products").select("free_sample").eq("id", item.id).single(),
    supabase.rpc("product_outline", { p_product_id: item.id, p_locale: locale }),
    // Files are readable only with access (RLS), so a locked product simply has none here.
    supabase.from("product_files").select("locale, format, size_bytes").eq("product_id", item.id).in("locale", [locale, "en"]),
  ]);
  const text = (tr ?? []).find((r) => r.locale === locale) ?? (tr ?? []).find((r) => r.locale === "en");
  const byFormat = new Map<string, { format: "pdf" | "epub"; sizeBytes: number | null }>();
  for (const f of (files ?? []).sort((a) => (a.locale === locale ? -1 : 1))) {
    if (!byFormat.has(f.format)) byFormat.set(f.format, { format: f.format, sizeBytes: f.size_bytes });
  }
  return {
    ...item,
    description: text?.description ?? "",
    verse: text?.verse ?? null,
    verseRef: text?.verse_ref ?? null,
    freeSample: product?.free_sample ?? false,
    outline: ((outline ?? []) as { kind: "chapter" | "page"; position: number; title: string; minutes: number | null; is_sample: boolean; preview_path: string | null; lineart_path: string | null }[]).map((o) => ({
      kind: o.kind,
      position: o.position,
      title: o.title,
      minutes: o.minutes,
      isSample: o.is_sample,
      previewPath: o.preview_path,
      lineartPath: o.lineart_path,
    })),
    files: [...byFormat.values()],
  };
});

/** A chapter the member may read: every chapter with access, only the free sample without. Null otherwise. */
export async function getChapter(productId: string, position: number, locale: Locale) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_chapters")
    .select("locale, position, title, body_html, minutes, is_sample")
    .eq("product_id", productId)
    .eq("position", position)
    .in("locale", [locale, "en"]);
  return (data ?? []).find((c) => c.locale === locale) ?? (data ?? []).find((c) => c.locale === "en") ?? null;
}

/** Furthest chapter reached per product, for "continue reading" and the contents list. */
export const getProgress = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_progress")
    .select("product_id, chapter_position, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return data ?? [];
});

export function formatBytes(bytes: number | null | undefined, intlTag: string) {
  if (!bytes) return null;
  const mb = bytes / (1024 * 1024);
  return `${new Intl.NumberFormat(intlTag, { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(mb)} MB`;
}
