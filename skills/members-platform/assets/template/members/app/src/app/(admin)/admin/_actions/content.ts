"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { adminContext, audit, fail, UUID, type ActionResult } from "@/lib/admin/context";
import { productTitles } from "@/lib/invites";
import { markdownToHtml, readingMinutes } from "@/lib/markdown";
import { sanitizeChapter } from "@/lib/sanitize";

/**
 * Product content. Files go straight from the admin's browser to the private "products" bucket with a
 * one-time signed upload URL (large PDFs never pass through the app server); the app then checks the
 * object exists and records it.
 */

const MB = 1024 * 1024;
const IMAGE = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" } as const;
const KINDS = {
  cover: { types: IMAGE, max: 5 * MB, dir: "cover" },
  page: { types: IMAGE, max: 20 * MB, dir: "pages" },
  preview: { types: IMAGE, max: 2 * MB, dir: "previews" },
  asset: {
    types: {
      "application/pdf": "pdf",
      "application/epub+zip": "epub",
      ...IMAGE,
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "application/zip": "zip",
    },
    max: 50 * MB,
    dir: "assets",
  },
} as const;
export type UploadKind = keyof typeof KINDS;

/** What each stored extension is, for the materials list. */
const ASSET_KIND: Record<string, "pdf" | "epub" | "image" | "audio" | "zip"> = {
  pdf: "pdf",
  epub: "epub",
  png: "image",
  jpg: "image",
  webp: "image",
  mp3: "audio",
  m4a: "audio",
  zip: "zip",
};

const BUCKET = "products";
const refresh = () => revalidatePath("/", "layout");

async function titleOf(id: string) {
  return (await productTitles([id], "en"))[0] ?? "";
}

export async function startUpload(productId: string, kind: UploadKind, contentType: string, size: number): Promise<ActionResult> {
  const { db } = await adminContext(`/admin/products/${productId}`);
  const spec = KINDS[kind];
  if (!UUID.test(productId) || !spec) return fail("err_not_found");
  const ext = (spec.types as Record<string, string>)[contentType];
  if (!ext) return fail(kind === "asset" ? "err_file_type" : "err_image_type");
  if (!Number.isFinite(size) || size <= 0 || size > spec.max) return fail("err_file_size");
  const path = `${productId}/${spec.dir}/${randomUUID()}.${ext}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    console.error("createSignedUploadUrl failed", error?.message);
    return fail("err_upload");
  }
  return { ok: true, data: { path: data.path, token: data.token } };
}

/** The object must exist under this product's folder; returns its size in bytes. */
async function storedSize(db: Awaited<ReturnType<typeof adminContext>>["db"], productId: string, path: string, dir: string) {
  if (!path.startsWith(`${productId}/${dir}/`) || path.includes("..")) return null;
  const folder = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(path.lastIndexOf("/") + 1);
  const { data } = await db.storage.from(BUCKET).list(folder, { search: name, limit: 1 });
  const hit = (data ?? []).find((o) => o.name === name);
  if (!hit) return null;
  return Number((hit.metadata as { size?: number } | null)?.size ?? 0);
}

async function removeStored(db: Awaited<ReturnType<typeof adminContext>>["db"], paths: (string | null | undefined)[]) {
  const list = [...new Set(paths.filter((p): p is string => !!p && !p.startsWith("builtin:")))];
  if (list.length) await db.storage.from(BUCKET).remove(list);
}

// ---------------------------------------------------------------------------
// Cover
// ---------------------------------------------------------------------------
export async function setCover(productId: string, path: string): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId)) return fail("err_not_found");
  if ((await storedSize(db, productId, path, "cover")) === null) return fail("err_upload");
  const { data: before } = await db.from("products").select("cover_path").eq("id", productId).single();
  const { error } = await db.from("products").update({ cover_path: path }).eq("id", productId);
  if (error) return fail("err_generic");
  if (before?.cover_path !== path) await removeStored(db, [before?.cover_path]);
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "cover" });
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Printable pages (colouring packs, workbooks): one row per language, sharing the same files.
// ---------------------------------------------------------------------------
const newPages = z.array(z.object({ path: z.string().max(300), previewPath: z.string().max(300).nullable(), title: z.string().max(120) })).min(1).max(100);

export async function addPages(productId: string, pages: z.infer<typeof newPages>): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  const parsed = newPages.safeParse(pages);
  if (!UUID.test(productId) || !parsed.success) return fail("err_not_found");
  for (const p of parsed.data) {
    if ((await storedSize(db, productId, p.path, "pages")) === null) return fail("err_upload");
    if (p.previewPath && (await storedSize(db, productId, p.previewPath, "previews")) === null) return fail("err_upload");
  }
  const { data: last } = await db.from("product_pages").select("position").eq("product_id", productId).order("position", { ascending: false }).limit(1).maybeSingle();
  let position = last?.position ?? 0;
  const rows = parsed.data.flatMap((p) => {
    position += 1;
    return locales.map((locale) => ({ product_id: productId, locale, position, title: p.title, lineart_path: p.path, preview_path: p.previewPath }));
  });
  const { error } = await db.from("product_pages").insert(rows);
  if (error) {
    console.error("addPages failed", error.message);
    return fail("err_generic");
  }
  // The pack shows at least as many pages as there are.
  const { data: product } = await db.from("products").select("page_count").eq("id", productId).single();
  if ((product?.page_count ?? 0) < position) await db.from("products").update({ page_count: position }).eq("id", productId);
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "pages added", count: parsed.data.length });
  refresh();
  return { ok: true };
}

export async function movePage(productId: string, from: number, to: number): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId) || !Number.isInteger(from) || !Number.isInteger(to)) return fail("err_not_found");
  const { error } = await db.rpc("admin_move_page", { p_product: productId, p_from: from, p_to: to });
  if (error) return fail("err_generic");
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "page moved", from, to });
  refresh();
  return { ok: true };
}

export async function deletePage(productId: string, position: number): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId) || !Number.isInteger(position)) return fail("err_not_found");
  const { data: rows } = await db.from("product_pages").select("pdf_path, preview_path, lineart_path").eq("product_id", productId).eq("position", position);
  const { error } = await db.rpc("admin_delete_page", { p_product: productId, p_position: position });
  if (error) return fail("err_generic");
  const paths = (rows ?? []).flatMap((r) => [r.pdf_path, r.preview_path, r.lineart_path]);
  // Keep files another page still points to.
  const { data: still } = await db.from("product_pages").select("pdf_path, preview_path, lineart_path").eq("product_id", productId);
  const used = new Set((still ?? []).flatMap((r) => [r.pdf_path, r.preview_path, r.lineart_path]));
  await removeStored(db, paths.filter((p) => !used.has(p)));
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "page deleted", position });
  refresh();
  return { ok: true };
}

export type ContentResult = { status: "idle" | "saved" | "error"; message?: string };

/** Content tab of a colouring pack or workbook: page titles in one language and the page count shown to members. */
export async function savePages(_prev: ContentResult, fd: FormData): Promise<ContentResult> {
  const productId = String(fd.get("id") ?? "");
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId)) return { status: "error", message: "err_not_found" };
  const locale: Locale = isLocale(fd.get("locale")) ? (fd.get("locale") as Locale) : "en";
  const count = Number(fd.get("page_count"));
  const updates: { position: number; title: string }[] = [];
  for (const [k, v] of fd.entries()) {
    const m = /^page_(\d+)$/.exec(k);
    if (m) updates.push({ position: Number(m[1]), title: String(v).trim().slice(0, 120) });
  }
  for (const u of updates) {
    await db.from("product_pages").update({ title: u.title }).eq("product_id", productId).eq("position", u.position).eq("locale", locale);
  }
  if (Number.isInteger(count) && count >= 0 && count <= 10000) await db.from("products").update({ page_count: Math.max(count, updates.length) }).eq("id", productId);
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "page titles", locale });
  refresh();
  return { status: "saved" };
}

// ---------------------------------------------------------------------------
// Materials: any number of files per product (PDF, EPUB, images, audio, a ZIP of everything).
// Owning the product opens all of them. locale null = the same file for every language.
// ---------------------------------------------------------------------------
const assetLocale = z.enum(["all", ...locales]).transform((l) => (l === "all" ? null : l));
const newAssets = z
  .array(
    z.object({
      path: z.string().max(300),
      title: z.string().trim().max(150),
      durationSeconds: z.number().int().min(0).max(24 * 3600).nullable(),
    }),
  )
  .min(1)
  .max(50);

export async function addAssets(productId: string, locale: string, items: z.infer<typeof newAssets>): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  const parsed = newAssets.safeParse(items);
  const lang = assetLocale.safeParse(locale);
  if (!UUID.test(productId) || !parsed.success || !lang.success) return fail("err_not_found");
  const { data: last } = await db.from("product_assets").select("position").eq("product_id", productId).order("position", { ascending: false }).limit(1).maybeSingle();
  let position = last?.position ?? 0;
  const rows = [];
  for (const a of parsed.data) {
    const kind = ASSET_KIND[a.path.slice(a.path.lastIndexOf(".") + 1)];
    const size = kind ? await storedSize(db, productId, a.path, "assets") : null;
    if (!kind || size === null) return fail("err_upload");
    position += 1;
    rows.push({
      product_id: productId,
      locale: lang.data,
      position,
      title: a.title,
      kind,
      path: a.path,
      size_bytes: size || null,
      duration_seconds: kind === "audio" && a.durationSeconds !== null ? Math.round(a.durationSeconds) : null,
    });
  }
  const { error } = await db.from("product_assets").insert(rows);
  if (error) {
    console.error("addAssets failed", error.message);
    return fail("err_generic");
  }
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "materials added", count: rows.length });
  refresh();
  return { ok: true };
}

/** Materials tab: titles and languages, saved together. */
export async function saveAssets(_prev: ContentResult, fd: FormData): Promise<ContentResult> {
  const productId = String(fd.get("id") ?? "");
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId)) return { status: "error", message: "err_not_found" };
  const updates = new Map<string, { title?: string; locale?: Locale | null }>();
  for (const [k, v] of fd.entries()) {
    const m = /^(title|locale)_([0-9a-f-]{36})$/.exec(k);
    if (!m || !UUID.test(m[2])) continue;
    const row = updates.get(m[2]) ?? {};
    if (m[1] === "title") row.title = String(v).trim().slice(0, 150);
    else {
      const l = assetLocale.safeParse(String(v));
      if (l.success) row.locale = l.data;
    }
    updates.set(m[2], row);
  }
  for (const [assetId, row] of updates) {
    const { error } = await db.from("product_assets").update(row).eq("id", assetId).eq("product_id", productId);
    if (error) return { status: "error", message: "err_generic" };
  }
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "materials", count: updates.size });
  refresh();
  return { status: "saved" };
}

export async function reorderAssets(productId: string, ids: string[]): Promise<ActionResult> {
  const { db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId) || !Array.isArray(ids) || ids.length > 500 || !ids.every((i) => UUID.test(i))) return fail("err_not_found");
  const { error } = await db.rpc("admin_reorder_assets", { p_product: productId, p_ids: ids });
  if (error) return fail("err_generic");
  refresh();
  return { ok: true };
}

export async function deleteAsset(productId: string, assetId: string): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId) || !UUID.test(assetId)) return fail("err_not_found");
  const { data } = await db.from("product_assets").delete().eq("id", assetId).eq("product_id", productId).select("path, title, kind");
  const gone = data?.[0];
  if (!gone) return fail("err_not_found");
  const { count } = await db.from("product_assets").select("id", { count: "exact", head: true }).eq("path", gone.path);
  if (!count) await removeStored(db, [gone.path]);
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "material removed", material: gone.title || gone.kind });
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Chapters (eBooks, guides, workbooks): saved as a whole list for one language
// ---------------------------------------------------------------------------
const chapterList = z
  .array(z.object({ title: z.string().trim().min(1).max(150), body: z.string().max(100_000), sample: z.boolean() }))
  .max(200);

export async function saveChapters(_prev: ContentResult, fd: FormData): Promise<ContentResult> {
  const productId = String(fd.get("id") ?? "");
  const { profile, db } = await adminContext(`/admin/products/${productId}`);
  if (!UUID.test(productId)) return { status: "error", message: "err_not_found" };
  const locale: Locale = isLocale(fd.get("locale")) ? (fd.get("locale") as Locale) : "en";
  let raw: unknown;
  try {
    raw = JSON.parse(String(fd.get("chapters") ?? "[]"));
  } catch {
    return { status: "error", message: "err_generic" };
  }
  const parsed = chapterList.safeParse(raw);
  if (!parsed.success) return { status: "error", message: "err_chapter_title" };
  const count = Number(fd.get("page_count"));

  const rows = parsed.data.map((c, i) => ({
    product_id: productId,
    locale,
    position: i + 1,
    title: c.title,
    body_md: c.body,
    body_html: sanitizeChapter(markdownToHtml(c.body)),
    minutes: readingMinutes(c.body),
    is_sample: c.sample,
  }));
  if (rows.length) {
    const { error } = await db.from("product_chapters").upsert(rows, { onConflict: "product_id,locale,position" });
    if (error) {
      console.error("saveChapters failed", error.message);
      return { status: "error", message: "err_generic" };
    }
  }
  await db.from("product_chapters").delete().eq("product_id", productId).eq("locale", locale).gt("position", rows.length);
  // Marking any chapter (in any language) as a sample is what opens the free sample.
  const { count: samples } = await db.from("product_chapters").select("id", { count: "exact", head: true }).eq("product_id", productId).eq("is_sample", true);
  await db
    .from("products")
    .update({
      free_sample: (samples ?? 0) > 0,
      ...(Number.isInteger(count) && count >= 0 && count <= 10000 ? { page_count: count } : {}),
    })
    .eq("id", productId);
  await audit(profile, "admin.product.content", { type: "product", id: productId }, { title: await titleOf(productId), change: "chapters", locale, count: rows.length });
  refresh();
  return { status: "saved" };
}
