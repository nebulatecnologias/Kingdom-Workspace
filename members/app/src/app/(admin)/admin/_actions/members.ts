"use server";

import { revalidatePath } from "next/cache";
import { isLocale } from "@/i18n/config";
import { emailSignInLink, grantManually, removeAccess } from "@/lib/access";
import { adminContext, audit, fail, UUID, type ActionResult } from "@/lib/admin/context";
import { productTitles } from "@/lib/invites";

async function loadMember(id: string) {
  const ctx = await adminContext(`/admin/members/${id}`);
  if (!UUID.test(id)) return { ...ctx, member: null };
  const { data: member } = await ctx.db.from("profiles").select("id, email, full_name, locale, role, status").eq("id", id).maybeSingle();
  return { ...ctx, member };
}

/** Turns one product on or off for a member. Changes apply straight away. */
export async function setAccess(memberId: string, productId: string, on: boolean): Promise<ActionResult> {
  const { profile, member } = await loadMember(memberId);
  if (!member || !UUID.test(productId)) return fail("err_not_found");
  const [title] = await productTitles([productId], "en");
  try {
    if (on) {
      const granted = await grantManually({ email: member.email, userId: member.id, productIds: [productId] });
      if (granted.length) await audit(profile, "admin.access.granted", { type: "profile", id: member.id }, { email: member.email, name: member.full_name, product_id: productId, title });
    } else {
      const n = await removeAccess({ email: member.email, productId, reason: "removed by admin" });
      if (n) await audit(profile, "admin.access.removed", { type: "profile", id: member.id }, { email: member.email, name: member.full_name, product_id: productId, title });
    }
  } catch (e) {
    console.error("setAccess failed", e);
    return fail("err_generic");
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function sendMemberLink(memberId: string): Promise<ActionResult> {
  const { profile, member } = await loadMember(memberId);
  if (!member) return fail("err_not_found");
  if (member.status !== "active") return fail("err_member_inactive");
  const ok = await emailSignInLink({ email: member.email, fullName: member.full_name, locale: isLocale(member.locale) ? member.locale : "en" });
  if (!ok) return fail("err_email_send");
  await audit(profile, "admin.member.link_sent", { type: "profile", id: member.id }, { email: member.email, name: member.full_name });
  return { ok: true };
}

/**
 * Deactivating blocks sign-in (the auth account is banned, so open sessions cannot refresh) and hides the library.
 * Purchases and grants stay, so reactivating brings everything back.
 */
export async function setMemberActive(memberId: string, active: boolean): Promise<ActionResult> {
  const { profile, db, member } = await loadMember(memberId);
  if (!member) return fail("err_not_found");
  if (member.id === profile.id) return fail("err_self");
  const { error: banError } = await db.auth.admin.updateUserById(member.id, { ban_duration: active ? "none" : "876000h" });
  if (banError) {
    console.error("ban update failed", banError.message);
    return fail("err_generic");
  }
  const { error } = await db.from("profiles").update({ status: active ? "active" : "deactivated" }).eq("id", member.id);
  if (error) return fail("err_generic");
  await audit(profile, active ? "admin.member.reactivated" : "admin.member.deactivated", { type: "profile", id: member.id }, { email: member.email, name: member.full_name });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
