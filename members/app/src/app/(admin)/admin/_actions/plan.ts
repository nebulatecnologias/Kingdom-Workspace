"use server";

import { revalidatePath } from "next/cache";
import { adminContext, audit } from "@/lib/admin/context";
import { PLAN_CODE } from "@/lib/plan";
import type { FormResult } from "./catalogue";

const text = (fd: FormData, key: string, max: number) => String(fd.get(key) ?? "").trim().slice(0, max);

/** "75", "75,00", "R 75" -> 7500. */
function parsePrice(v: string) {
  const clean = v.replace(/[R\s]/gi, "").replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * 100);
}

/** The monthly plan: price shown to members, free days, the gateway's plan ID and checkout link, on/off. */
export async function savePlan(_prev: FormResult, fd: FormData): Promise<FormResult> {
  const { profile, db } = await adminContext("/admin/integrations");
  const price = parsePrice(text(fd, "price", 20) || "0");
  const trial = Number(text(fd, "trial_days", 3));
  const gatewayId = text(fd, "gateway_plan_id", 200);
  const checkout = text(fd, "checkout_url", 500);
  const active = fd.get("active") === "on";

  const fieldErrors: Record<string, string> = {};
  if (price === null || price <= 0) fieldErrors.price = "err_price";
  if (!Number.isInteger(trial) || trial < 0 || trial > 90) fieldErrors.trial_days = "err_trial_days";
  if (gatewayId && !/^[\w.:-]+$/.test(gatewayId)) fieldErrors.gateway_plan_id = "err_gid";
  if (checkout) {
    try {
      if (new URL(checkout).protocol !== "https:") fieldErrors.checkout_url = "err_https";
    } catch {
      fieldErrors.checkout_url = "err_https";
    }
  }
  if (active && (!gatewayId || !checkout)) fieldErrors[!gatewayId ? "gateway_plan_id" : "checkout_url"] = "err_plan_needs";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  const { error } = await db
    .from("plans")
    .update({ price_cents: price, trial_days: trial, gateway_plan_id: gatewayId || null, checkout_url: checkout || null, active, updated_at: new Date().toISOString() })
    .eq("code", PLAN_CODE);
  if (error) return error.code === "23505" ? { status: "error", fieldErrors: { gateway_plan_id: "err_gid_taken" } } : { status: "error", message: "err_generic" };
  await audit(profile, "admin.plan.updated", { type: "plan", id: PLAN_CODE }, { price_cents: price, trial_days: trial, gateway_plan_id: gatewayId || null, active });
  revalidatePath("/admin/integrations");
  revalidatePath("/plan");
  return { status: "saved" };
}
