"use server";

import { revalidatePath } from "next/cache";
import { adminContext, audit, fail, UUID, type ActionResult } from "@/lib/admin/context";

/** The authenticator is added or removed in the browser (it needs the admin's own session); this records it. */
export async function recordTwoStep(enabled: boolean): Promise<ActionResult> {
  const { profile } = await adminContext("/admin/security");
  await audit(profile, enabled ? "admin.mfa.enabled" : "admin.mfa.disabled", { type: "profile", id: profile.id }, { email: profile.email, name: profile.fullName });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** For an admin who lost their phone: another admin removes their authenticator so they can sign in and set it up again. */
export async function resetTwoStep(memberId: string): Promise<ActionResult> {
  const { profile, db } = await adminContext(`/admin/members/${memberId}`);
  if (!UUID.test(memberId)) return fail("err_not_found");
  if (memberId === profile.id) return fail("err_self_mfa");
  const { data, error } = await db.auth.admin.mfa.listFactors({ userId: memberId });
  if (error) return fail("err_generic");
  for (const f of data?.factors ?? []) await db.auth.admin.mfa.deleteFactor({ userId: memberId, id: f.id });
  const { data: m } = await db.from("profiles").select("email, full_name").eq("id", memberId).single();
  await audit(profile, "admin.mfa.disabled", { type: "profile", id: memberId }, { email: m?.email, name: m?.full_name, by_admin: true });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
