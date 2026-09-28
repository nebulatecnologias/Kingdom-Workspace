"use server";

import { revalidatePath } from "next/cache";
import { adminContext, audit, fail, UUID, type ActionResult } from "@/lib/admin/context";

const PRODUCT = "product:products(slug, translations:product_translations(locale, title))";

/** The commented product's slug and English title (for the activity feed). */
function productOf(row: unknown) {
  const p = (row as { product: { slug: string; translations: { locale: string; title: string }[] } | null }).product;
  return { slug: p?.slug, title: p?.translations.find((x) => x.locale === "en")?.title ?? p?.translations[0]?.title ?? "" };
}

/** Approve (public to members) or reject (stays hidden) a comment. */
export async function reviewComment(id: string, decision: "approved" | "rejected"): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/comments");
  if (!UUID.test(id) || (decision !== "approved" && decision !== "rejected")) return fail("err_not_found");
  const { data, error } = await db
    .from("product_comments")
    .update({ status: decision, reviewed_at: new Date().toISOString(), reviewed_by: profile.id })
    .eq("id", id)
    .select(PRODUCT)
    .maybeSingle();
  if (error || !data) return fail(error ? "err_generic" : "err_not_found");
  const { slug, title } = productOf(data);
  await audit(profile, decision === "approved" ? "admin.comment.approved" : "admin.comment.rejected", { type: "comment", id }, { title });
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteComment(id: string): Promise<ActionResult> {
  const { profile, db } = await adminContext("/admin/comments");
  if (!UUID.test(id)) return fail("err_not_found");
  const { data, error } = await db.from("product_comments").delete().eq("id", id).select(PRODUCT).maybeSingle();
  if (error || !data) return fail(error ? "err_generic" : "err_not_found");
  const { slug, title } = productOf(data);
  await audit(profile, "admin.comment.deleted", { type: "comment", id }, { title });
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/admin", "layout");
  return { ok: true };
}
