"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isLocale, type Locale } from "@/i18n/config";
import { emailUnlocked, grantManually } from "@/lib/access";
import { adminContext, audit, fail, UUID, type ActionResult } from "@/lib/admin/context";
import { issueInvite, productTitles } from "@/lib/invites";

export type NewInviteState = {
  status: "idle" | "error" | "sent" | "granted";
  fieldErrors?: Partial<Record<"email" | "products", string>>;
  message?: string;
  email?: string;
};

const EXPIRY_DAYS = [3, 7, 14];

/**
 * Sends an invite by hand. When the person already has an account there is nothing to create:
 * the products go straight into their library and they get the "new in your library" email.
 */
export async function createInvite(_prev: NewInviteState, formData: FormData): Promise<NewInviteState> {
  const { profile, db } = await adminContext("/admin/invites");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const locale: Locale = isLocale(formData.get("locale")) ? (formData.get("locale") as Locale) : "en";
  const days = Number(formData.get("days"));
  const productIds = [...new Set(formData.getAll("products").map(String).filter((id) => UUID.test(id)))];

  const fieldErrors: NewInviteState["fieldErrors"] = {};
  if (!z.email().max(254).safeParse(email).success) fieldErrors.email = "err_email";
  if (!productIds.length) fieldErrors.products = "err_products";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const { data: known } = await db.from("products").select("id").in("id", productIds);
  const valid = (known ?? []).map((p) => p.id);
  if (!valid.length) return { status: "error", fieldErrors: { products: "err_products" } };
  const titles = await productTitles(valid, "en");

  try {
    const { data: member } = await db.from("profiles").select("id, full_name, locale, status").eq("email", email).maybeSingle();
    if (member) {
      const granted = await grantManually({ email, userId: member.id, productIds: valid });
      if (granted.length && member.status === "active") {
        await emailUnlocked({ email, fullName: member.full_name, locale: isLocale(member.locale) ? member.locale : "en", productIds: granted });
      }
      for (const id of granted) {
        const [title] = await productTitles([id], "en");
        await audit(profile, "admin.access.granted", { type: "profile", id: member.id }, { email, name: member.full_name, product_id: id, title });
      }
      revalidatePath("/admin", "layout");
      return { status: "granted", email };
    }

    const r = await issueInvite({
      email,
      fullName: name || undefined,
      locale,
      productIds: valid,
      source: "manual",
      createdBy: profile.id,
      expiresInDays: EXPIRY_DAYS.includes(days) ? days : undefined,
    });
    await audit(profile, "admin.invite.sent", { type: "invite", id: r.inviteId }, { email, name, title: titles.join(", "), emailed: r.emailed });
    revalidatePath("/admin", "layout");
    return r.emailed ? { status: "sent", email } : { status: "error", message: "err_email_send" };
  } catch (e) {
    console.error("createInvite failed", e);
    return { status: "error", message: "err_generic" };
  }
}

async function loadInvite(id: string) {
  const ctx = await adminContext("/admin/invites");
  if (!UUID.test(id)) return { ...ctx, invite: null };
  const { data: invite } = await ctx.db
    .from("invites")
    .select("id, email, full_name, locale, status, source, product_ids")
    .eq("id", id)
    .maybeSingle();
  return { ...ctx, invite };
}

/** Emails a fresh link (the old one stops working). Revoked and expired invites come back to life. */
export async function resendInvite(id: string): Promise<ActionResult> {
  const { profile, db, invite } = await loadInvite(id);
  if (!invite) return fail("err_not_found");
  if (invite.status === "accepted") return fail("err_invite_used");
  try {
    // A revoked invite is brought back (rather than a second one created) so the list keeps one row per person.
    if (invite.status === "revoked") await db.from("invites").update({ status: "expired", revoked_at: null }).eq("id", invite.id);
    const r = await issueInvite({
      email: invite.email,
      fullName: invite.full_name || undefined,
      locale: isLocale(invite.locale) ? invite.locale : "en",
      productIds: invite.product_ids ?? [],
      source: invite.source,
      createdBy: profile.id,
    });
    await audit(profile, "admin.invite.resent", { type: "invite", id: r.inviteId }, { email: invite.email, name: invite.full_name, emailed: r.emailed });
    revalidatePath("/admin", "layout");
    return r.emailed ? { ok: true } : fail("err_email_send");
  } catch (e) {
    console.error("resendInvite failed", e);
    return fail("err_generic");
  }
}

/** A new link to copy and share by hand (e.g. WhatsApp). The emailed link stops working. */
export async function inviteLink(id: string): Promise<ActionResult> {
  const { profile, invite } = await loadInvite(id);
  if (!invite) return fail("err_not_found");
  if (invite.status === "accepted") return fail("err_invite_used");
  if (invite.status === "revoked") return fail("err_invite_revoked");
  try {
    const r = await issueInvite({
      email: invite.email,
      fullName: invite.full_name || undefined,
      locale: isLocale(invite.locale) ? invite.locale : "en",
      productIds: invite.product_ids ?? [],
      source: invite.source,
      notify: false,
    });
    await audit(profile, "admin.invite.link_copied", { type: "invite", id: r.inviteId }, { email: invite.email, name: invite.full_name });
    revalidatePath("/admin", "layout");
    return { ok: true, data: { url: r.url } };
  } catch (e) {
    console.error("inviteLink failed", e);
    return fail("err_generic");
  }
}

/**
 * The link stops working. Products given by hand with this invite are taken back while no account uses them;
 * purchases are never touched (the buyer paid, and can still ask for a new link).
 */
export async function revokeInvite(id: string): Promise<ActionResult> {
  const { profile, db, invite } = await loadInvite(id);
  if (!invite) return fail("err_not_found");
  if (invite.status === "accepted") return fail("err_invite_used");
  const { error } = await db.from("invites").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("id", invite.id);
  if (error) return fail("err_generic");
  let removed = 0;
  if (invite.source === "manual" && invite.product_ids?.length) {
    const { data } = await db
      .from("entitlements")
      .update({ revoked_at: new Date().toISOString(), revoked_reason: "invite revoked" })
      .eq("email", invite.email)
      .eq("source", "manual")
      .is("user_id", null)
      .is("revoked_at", null)
      .in("product_id", invite.product_ids)
      .select("id");
    removed = (data ?? []).length;
  }
  await audit(profile, "admin.invite.revoked", { type: "invite", id: invite.id }, { email: invite.email, name: invite.full_name, removed });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
