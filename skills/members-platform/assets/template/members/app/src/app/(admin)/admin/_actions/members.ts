"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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

export type EmailChangeState = { status: "idle" | "saved" | "error"; message?: string };

/**
 * Corrects a member's email (e.g. a typo at checkout). The sign-in email, the profile and the member's
 * access move to the new address; purchases already waiting under the new address are linked too.
 */
export async function changeMemberEmail(_prev: EmailChangeState, fd: FormData): Promise<EmailChangeState> {
  const memberId = String(fd.get("id") ?? "");
  const { profile, db, member } = await loadMember(memberId);
  if (!member) return { status: "error", message: "err_not_found" };
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!z.email().max(254).safeParse(email).success) return { status: "error", message: "err_email" };
  if (email === member.email) return { status: "saved" };
  const { data: taken } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
  if (taken) return { status: "error", message: "err_email_taken" };

  const { error: authError } = await db.auth.admin.updateUserById(member.id, { email, email_confirm: true });
  if (authError) {
    console.error("email change failed", authError.message);
    return { status: "error", message: authError.code === "email_exists" ? "err_email_taken" : "err_generic" };
  }
  await db.from("profiles").update({ email }).eq("id", member.id);

  // Access follows the account. Grants already waiting under the new email for the same products are
  // retired first (one active grant per email and product), then the rest are linked to the account.
  const { data: mine } = await db.from("entitlements").select("product_id").eq("user_id", member.id).is("revoked_at", null);
  const owned = (mine ?? []).map((e) => e.product_id);
  if (owned.length) {
    await db
      .from("entitlements")
      .update({ revoked_at: new Date().toISOString(), revoked_reason: "merged into account after email change" })
      .eq("email", email)
      .is("user_id", null)
      .is("revoked_at", null)
      .in("product_id", owned);
  }
  await db.from("entitlements").update({ email }).eq("user_id", member.id);
  await db.rpc("link_entitlements", { p_user_id: member.id, p_email: email });

  await audit(profile, "admin.member.email_changed", { type: "profile", id: member.id }, { email, name: member.full_name, previous: member.email });
  revalidatePath("/admin", "layout");
  return { status: "saved" };
}
