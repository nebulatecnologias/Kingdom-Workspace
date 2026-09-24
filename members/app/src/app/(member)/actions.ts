"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { status: "idle" | "saved" | "error"; message?: string; field?: "name" | "password" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Remembers the furthest chapter reached. Row-level security only accepts products the member owns. */
export async function saveProgress(productId: string, position: number) {
  if (!UUID.test(productId) || !Number.isInteger(position) || position < 1 || position > 500) return;
  const profile = await requireMember();
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("reading_progress")
    .select("chapter_position")
    .eq("user_id", profile.id)
    .eq("product_id", productId)
    .maybeSingle();
  if (current && current.chapter_position >= position) {
    // Still touch the row so "continue reading" shows the book read most recently.
    await supabase.from("reading_progress").update({ chapter_position: current.chapter_position }).eq("user_id", profile.id).eq("product_id", productId);
    return;
  }
  await supabase.from("reading_progress").upsert({ user_id: profile.id, product_id: productId, chapter_position: position });
}

export async function updateName(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const profile = await requireMember("/profile");
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  if (!name) return { status: "error", field: "name", message: "err_name" };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", profile.id);
  if (error) return { status: "error", message: "err_generic" };
  revalidatePath("/", "layout");
  return { status: "saved" };
}

export async function changePassword(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  await requireMember("/profile");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8 || password.length > 128) return { status: "error", field: "password", message: "err_pw_short" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { status: "error", field: "password", message: error.code === "same_password" ? "err_pw_same" : "err_generic" };
  return { status: "saved" };
}

/**
 * POPIA: deletes the account and the personal data tied to it (profile, library access, reading progress,
 * invites and email history). Orders are kept without the account link, as tax law requires.
 */
export async function deleteAccount() {
  const profile = await requireMember("/profile");
  const admin = createAdminClient();
  await admin.from("invites").delete().eq("email", profile.email);
  await admin.from("email_log").delete().eq("to_email", profile.email);
  await admin.from("entitlements").delete().eq("email", profile.email);
  const { error } = await admin.auth.admin.deleteUser(profile.id);
  if (error) throw new Error(`Account deletion failed: ${error.message}`);
  await admin.from("audit_log").insert({ action: "profile.deleted", target_type: "profile", target_id: profile.id, meta: null, actor_id: null });
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?notice=deleted");
}
