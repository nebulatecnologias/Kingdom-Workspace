"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale, locales as LOCALES, type Locale } from "@/i18n/config";
import { adminContext, audit, fail, UUID, type ActionResult } from "@/lib/admin/context";
import { productTitles } from "@/lib/invites";

const TYPES = ["colouring", "book", "guide", "workbook"] as const;
const VISIBILITY = ["visible", "soon", "hidden"] as const;

export type FormResult = { status: "idle" | "saved" | "error"; fieldErrors?: Record<string, string>; message?: string };

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);

/** "Noah’s Ark & the Rainbow" -> "noahs-ark-the-rainbow". */
export async function slugify(title: string) {
  return (
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[’'"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product"
  );
}

async function uniqueSlug(db: Awaited<ReturnType<typeof adminContext>>["db"], table: "products" | "sections", base: string, exceptId?: string) {
  for (let i = 1; i < 50; i++) {
    const slug = i === 1 ? base : `${base.slice(0, 56)}-${i}`;
    let q = db.from(table).select("id").eq("slug", slug);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
  }
  return `${base.slice(0, 50)}-${Date.now().toString(36)}`;
}

const refresh = () => revalidatePath("/", "layout");

// ---------------------------------------------------------------------------
// Showcase
// ---------------------------------------------------------------------------
export async function reorderProducts(ids: string[]): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/showcase");
  const clean = ids.filter((id) => UUID.test(id)).slice(0, 1000);
  const { error } = await db.rpc("admin_reorder_products", { p_ids: clean });
  if (error) return fail("err_generic");
  await audit(profile, "admin.showcase.reordered", { type: "showcase", id: "products" }, { count: clean.length });
  refresh();
  return { ok: true };
}

export async function setVisibility(id: string, visibility: string): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/showcase");
  if (!UUID.test(id) || !VISIBILITY.includes(visibility as (typeof VISIBILITY)[number])) return fail("err_not_found");
  const { error } = await db.from("products").update({ visibility }).eq("id", id);
  if (error) return fail("err_generic");
  const [title] = await productTitles([id], "en");
  await audit(profile, "admin.showcase.updated", { type: "product", id }, { title, visibility });
  refresh();
  return { ok: true };
}

export async function setSection(id: string, sectionId: string): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/showcase");
  if (!UUID.test(id) || (sectionId && !UUID.test(sectionId))) return fail("err_not_found");
  const { error } = await db.from("products").update({ section_id: sectionId || null }).eq("id", id);
  if (error) return fail("err_generic");
  const [title] = await productTitles([id], "en");
  await audit(profile, "admin.showcase.updated", { type: "product", id }, { title, section_id: sectionId || null });
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sections (names in the three languages; English is required)
// ---------------------------------------------------------------------------
function sectionNames(fd: FormData) {
  const names = Object.fromEntries(LOCALES.map((l) => [l, text(fd, `name_${l}`, 60)])) as Record<Locale, string>;
  return names;
}

export async function saveSection(_prev: FormResult, fd: FormData): Promise<FormResult> {
  const { profile, db } = await adminContext("/admin/showcase");
  const id = String(fd.get("id") ?? "");
  const names = sectionNames(fd);
  if (!names.en) return { status: "error", fieldErrors: { name_en: "err_required" } };
  let sectionId = id;
  if (id) {
    if (!UUID.test(id)) return { status: "error", message: "err_not_found" };
  } else {
    const { data: last } = await db.from("sections").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await db
      .from("sections")
      .insert({ slug: await uniqueSlug(db, "sections", await slugify(names.en)), sort_order: (last?.sort_order ?? 0) + 10 })
      .select("id")
      .single();
    if (error) return { status: "error", message: "err_generic" };
    sectionId = data.id;
  }
  const rows = LOCALES.filter((l) => names[l]).map((locale) => ({ section_id: sectionId, locale, name: names[locale] }));
  const { error } = await db.from("section_translations").upsert(rows, { onConflict: "section_id,locale" });
  if (error) return { status: "error", message: "err_generic" };
  const empty = LOCALES.filter((l) => !names[l]);
  if (empty.length) await db.from("section_translations").delete().eq("section_id", sectionId).in("locale", empty);
  await audit(profile, id ? "admin.section.updated" : "admin.section.created", { type: "section", id: sectionId }, { title: names.en });
  refresh();
  return { status: "saved" };
}

export async function moveSection(id: string, direction: -1 | 1): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/showcase");
  const { data } = await db.from("sections").select("id").order("sort_order").order("slug");
  const ids = (data ?? []).map((s) => s.id);
  const i = ids.indexOf(id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= ids.length) return fail("err_not_found");
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const { error } = await db.rpc("admin_reorder_sections", { p_ids: ids });
  if (error) return fail("err_generic");
  await audit(profile, "admin.section.reordered", { type: "section", id });
  refresh();
  return { ok: true };
}

/** Only empty sections can go, so no product silently loses its place in the library. */
export async function deleteSection(id: string): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/showcase");
  if (!UUID.test(id)) return fail("err_not_found");
  const { count } = await db.from("products").select("id", { count: "exact", head: true }).eq("section_id", id);
  if (count) return fail("err_section_not_empty");
  const { data: name } = await db.from("section_translations").select("name").eq("section_id", id).eq("locale", "en").maybeSingle();
  const { error } = await db.from("sections").delete().eq("id", id);
  if (error) return fail("err_generic");
  await audit(profile, "admin.section.deleted", { type: "section", id }, { title: name?.name ?? "" });
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/** New products start hidden, at the end of the showcase, with an English title. */
export async function createProduct(_prev: FormResult, fd: FormData): Promise<FormResult> {
  const { profile, db } = await adminContext("/admin/products/new");
  const type = String(fd.get("type") ?? "");
  const title = text(fd, "title", 120);
  const sectionId = String(fd.get("section") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!TYPES.includes(type as (typeof TYPES)[number])) fieldErrors.type = "err_required";
  if (!title) fieldErrors.title = "err_required";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };
  const { data: last } = await db.from("products").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const { data, error } = await db
    .from("products")
    .insert({
      slug: await uniqueSlug(db, "products", await slugify(title)),
      type,
      section_id: UUID.test(sectionId) ? sectionId : null,
      visibility: "hidden",
      access: "paid",
      sort_order: (last?.sort_order ?? 0) + 10,
      field_colour: "#fde0c6",
      page_count: 0,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: "err_generic" };
  await db.from("product_translations").insert({ product_id: data.id, locale: "en", title });
  await audit(profile, "admin.product.created", { type: "product", id: data.id }, { title, type });
  refresh();
  redirect(`/admin/products/${data.id}`);
}

const HEX = /^#[0-9a-f]{6}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Details tab: the texts in one language, plus type, section, colour and web address (shared by all languages). */
export async function saveDetails(_prev: FormResult, fd: FormData): Promise<FormResult> {
  const id = String(fd.get("id") ?? "");
  const { profile, db } = await adminContext(`/admin/products/${id}`);
  if (!UUID.test(id)) return { status: "error", message: "err_not_found" };
  const locale = isLocale(fd.get("locale")) ? (fd.get("locale") as Locale) : "en";
  const title = text(fd, "title", 120);
  const description = text(fd, "description", 2000);
  const verse = text(fd, "verse", 300);
  const verseRef = text(fd, "verse_ref", 60);
  const type = String(fd.get("type") ?? "");
  const sectionId = String(fd.get("section") ?? "");
  const colour = String(fd.get("field_colour") ?? "").trim();
  const slug = String(fd.get("slug") ?? "").trim().toLowerCase();

  const fieldErrors: Record<string, string> = {};
  if (locale === "en" && !title) fieldErrors.title = "err_required";
  if (!TYPES.includes(type as (typeof TYPES)[number])) fieldErrors.type = "err_required";
  if (colour && !HEX.test(colour)) fieldErrors.field_colour = "err_colour";
  if (!SLUG.test(slug) || slug.length > 60) fieldErrors.slug = "err_slug";
  else if ((await uniqueSlug(db, "products", slug, id)) !== slug) fieldErrors.slug = "err_slug_taken";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const { error } = await db
    .from("products")
    .update({ type, section_id: UUID.test(sectionId) ? sectionId : null, field_colour: colour || null, slug })
    .eq("id", id);
  if (error) return { status: "error", message: "err_generic" };
  if (title) {
    const { error: trError } = await db
      .from("product_translations")
      .upsert({ product_id: id, locale, title, description, verse: verse || null, verse_ref: verseRef || null }, { onConflict: "product_id,locale" });
    if (trError) return { status: "error", message: "err_generic" };
  } else if (locale !== "en") {
    // An empty translation falls back to English.
    await db.from("product_translations").delete().eq("product_id", id).eq("locale", locale);
  }
  const [en] = await productTitles([id], "en");
  await audit(profile, "admin.product.updated", { type: "product", id }, { title: en, tab: "details", locale });
  refresh();
  return { status: "saved" };
}

/** "149,00", "149.00", "R 149" -> 14900. */
function parsePrice(v: string) {
  const clean = v.replace(/[R\s]/gi, "").replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

/** Sales tab: price, access, gateway product ID, checkout link and visibility. */
export async function saveSales(_prev: FormResult, fd: FormData): Promise<FormResult> {
  const id = String(fd.get("id") ?? "");
  const { profile, db } = await adminContext(`/admin/products/${id}`);
  if (!UUID.test(id)) return { status: "error", message: "err_not_found" };
  const access = fd.get("access") === "free" ? "free" : "paid";
  const visibility = String(fd.get("visibility") ?? "hidden");
  const price = parsePrice(String(fd.get("price") ?? "0") || "0");
  const gatewayId = text(fd, "gateway_product_id", 200);
  const checkout = text(fd, "checkout_url", 500);

  const fieldErrors: Record<string, string> = {};
  if (price === null) fieldErrors.price = "err_price";
  if (!VISIBILITY.includes(visibility as (typeof VISIBILITY)[number])) fieldErrors.visibility = "err_required";
  if (gatewayId && !/^[\w.:-]+$/.test(gatewayId)) fieldErrors.gateway_product_id = "err_gid";
  if (gatewayId) {
    const { data: taken } = await db.from("products").select("id").eq("gateway_product_id", gatewayId).neq("id", id).maybeSingle();
    if (taken) fieldErrors.gateway_product_id = "err_gid_taken";
  }
  if (checkout) {
    try {
      const u = new URL(checkout);
      if (u.protocol !== "https:") fieldErrors.checkout_url = "err_https";
    } catch {
      fieldErrors.checkout_url = "err_https";
    }
  }
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const { error } = await db
    .from("products")
    .update({ access, visibility, price_cents: price ?? 0, gateway_product_id: gatewayId || null, checkout_url: checkout || null })
    .eq("id", id);
  if (error) return { status: "error", message: "err_generic" };
  const [en] = await productTitles([id], "en");
  await audit(profile, "admin.product.updated", { type: "product", id }, { title: en, tab: "sales", access, visibility, price_cents: price, gateway_product_id: gatewayId || null });
  refresh();
  return { status: "saved" };
}

/**
 * Deleting would also remove it from every library that has it, so it is only allowed while nobody has access.
 * Otherwise hide it. Stored files are removed too.
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/products/${id}`);
  if (!UUID.test(id)) return fail("err_not_found");
  const { count } = await db.from("entitlements").select("id", { count: "exact", head: true }).eq("product_id", id).is("revoked_at", null);
  if (count) return fail("err_product_in_use");
  const [title] = await productTitles([id], "en");
  const [{ data: pages }, { data: files }, { data: product }] = await Promise.all([
    db.from("product_pages").select("pdf_path, preview_path, lineart_path").eq("product_id", id),
    db.from("product_files").select("path").eq("product_id", id),
    db.from("products").select("cover_path").eq("id", id).single(),
  ]);
  const stored = [
    product?.cover_path,
    ...(pages ?? []).flatMap((p) => [p.pdf_path, p.preview_path, p.lineart_path]),
    ...(files ?? []).map((f) => f.path),
  ].filter((p): p is string => !!p && !p.startsWith("builtin:"));
  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return fail("err_generic");
  if (stored.length) await db.storage.from("products").remove([...new Set(stored)]);
  await audit(profile, "admin.product.deleted", { type: "product", id }, { title });
  refresh();
  return { ok: true };
}
