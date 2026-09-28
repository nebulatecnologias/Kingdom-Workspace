"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { adminContext, audit, fail, UUID, type ActionResult } from "@/lib/admin/context";
import type { FormResult } from "./catalogue";

/**
 * Home banners. Images go straight from the admin's browser to the private "products" bucket under
 * banners/, with a one-time signed upload URL, like product covers.
 */

const BUCKET = "products";
const IMAGE = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" } as const;
const MAX_IMAGE = 5 * 1024 * 1024;

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);
const refresh = () => {
  revalidatePath("/home");
  revalidatePath("/admin/banners");
};

export async function startBannerUpload(contentType: string, size: number): Promise<ActionResult> {
  const { db } = await adminContext("/admin/banners");
  const ext = (IMAGE as Record<string, string>)[contentType];
  if (!ext) return fail("err_image_type");
  if (!Number.isFinite(size) || size <= 0 || size > MAX_IMAGE) return fail("err_file_size");
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(`banners/${randomUUID()}.${ext}`);
  if (error || !data) {
    console.error("banner createSignedUploadUrl failed", error?.message);
    return fail("err_upload");
  }
  return { ok: true, data: { path: data.path, token: data.token } };
}

/** A path the admin sends back must be an image that was really uploaded under banners/. */
async function bannerImageExists(db: Awaited<ReturnType<typeof adminContext>>["db"], path: string) {
  if (!/^banners\/[0-9a-f-]{36}\.(png|jpg|webp)$/.test(path)) return false;
  const { data } = await db.storage.from(BUCKET).list("banners", { search: path.slice("banners/".length), limit: 1 });
  return (data ?? []).some((o) => `banners/${o.name}` === path);
}

/** "2026-10-01T09:00" typed in the admin's browser, with that browser's UTC offset in minutes. */
function parseLocalDate(value: string, offsetMinutes: number): string | null | undefined {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return undefined;
  const utc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) + offsetMinutes * 60_000;
  return Number.isFinite(utc) ? new Date(utc).toISOString() : undefined;
}

/** Links go to a page of this site ("/library") or to an https address. */
function validLink(link: string) {
  if (!link) return true;
  if (/^\/($|[^/\\])/.test(link)) return true;
  try {
    return new URL(link).protocol === "https:";
  } catch {
    return false;
  }
}

export async function saveBanner(_prev: FormResult, fd: FormData): Promise<FormResult> {
  const { profile, db } = await adminContext("/admin/banners");
  const id = String(fd.get("id") ?? "");
  if (id && !UUID.test(id)) return { status: "error", message: "err_not_found" };

  const title = text(fd, "title", 120);
  const body = text(fd, "body", 280);
  const ctaLabel = text(fd, "cta_label", 40);
  const link = text(fd, "link", 500);
  const locale = String(fd.get("locale") ?? "");
  const audience = fd.get("audience") === "not_owner" ? "not_owner" : "all";
  const productId = String(fd.get("product_id") ?? "");
  const offset = Number(fd.get("tz") ?? 0);
  const startsAt = parseLocalDate(text(fd, "starts_at", 20), Number.isFinite(offset) ? offset : 0);
  const endsAt = parseLocalDate(text(fd, "ends_at", 20), Number.isFinite(offset) ? offset : 0);
  const sortOrder = Math.max(0, Math.min(999, Math.round(Number(fd.get("sort_order") ?? 0)) || 0));
  const imagePath = text(fd, "image_path", 200);
  const imageMobilePath = text(fd, "image_mobile_path", 200);

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "err_required";
  if (!validLink(link)) fieldErrors.link = "err_bannerLink";
  if (ctaLabel && !link) fieldErrors.link = "err_required";
  if (locale && !isLocale(locale)) fieldErrors.locale = "err_required";
  if (audience === "not_owner" && !UUID.test(productId)) fieldErrors.product_id = "err_required";
  if (startsAt === undefined) fieldErrors.starts_at = "err_date";
  if (endsAt === undefined) fieldErrors.ends_at = "err_date";
  if (startsAt && endsAt && endsAt <= startsAt) fieldErrors.ends_at = "err_date_order";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const { data: current } = id ? await db.from("banners").select("image_path, image_mobile_path").eq("id", id).maybeSingle() : { data: null };
  if (id && !current) return { status: "error", message: "err_not_found" };
  for (const [key, path] of [
    ["image_path", imagePath],
    ["image_mobile_path", imageMobilePath],
  ] as const) {
    const unchanged = current && current[key] === path;
    if (path && !unchanged && !(await bannerImageExists(db, path))) return { status: "error", fieldErrors: { [key]: "err_upload" } };
  }

  const row = {
    title,
    body: body || null,
    cta_label: ctaLabel || null,
    link: link || null,
    locale: locale || null,
    audience,
    product_id: audience === "not_owner" ? productId : null,
    starts_at: startsAt ?? null,
    ends_at: endsAt ?? null,
    active: fd.get("active") === "on",
    sort_order: sortOrder,
    image_path: imagePath || null,
    image_mobile_path: imageMobilePath || null,
    updated_at: new Date().toISOString(),
  };
  const saved = id ? await db.from("banners").update(row).eq("id", id).select("id").single() : await db.from("banners").insert(row).select("id").single();
  if (saved.error || !saved.data) {
    console.error("saveBanner failed", saved.error?.message);
    return { status: "error", message: "err_generic" };
  }
  // Images replaced or removed are deleted from storage.
  const orphans = [current?.image_path, current?.image_mobile_path].filter((p): p is string => !!p && p !== imagePath && p !== imageMobilePath);
  if (orphans.length) await db.storage.from(BUCKET).remove(orphans);

  await audit(profile, id ? "admin.banner.updated" : "admin.banner.created", { type: "banner", id: saved.data.id }, { title, active: row.active });
  refresh();
  if (!id) redirect(`/admin/banners?saved=${saved.data.id}`);
  return { status: "saved" };
}

export async function setBannerActive(id: string, active: boolean): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/banners");
  if (!UUID.test(id)) return fail("err_not_found");
  const { error } = await db.from("banners").update({ active, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail("err_generic");
  await audit(profile, active ? "admin.banner.activated" : "admin.banner.deactivated", { type: "banner", id });
  refresh();
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/banners");
  if (!UUID.test(id)) return fail("err_not_found");
  const { data: banner } = await db.from("banners").select("title, image_path, image_mobile_path").eq("id", id).maybeSingle();
  if (!banner) return fail("err_not_found");
  const { error } = await db.from("banners").delete().eq("id", id);
  if (error) return fail("err_generic");
  const files = [banner.image_path, banner.image_mobile_path].filter((p): p is string => !!p);
  if (files.length) await db.storage.from(BUCKET).remove(files);
  await audit(profile, "admin.banner.deleted", { type: "banner", id }, { title: banner.title });
  refresh();
  return { ok: true };
}
