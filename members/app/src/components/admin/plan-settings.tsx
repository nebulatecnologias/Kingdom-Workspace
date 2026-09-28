"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { savePlan } from "@/app/(admin)/admin/_actions/plan";
import type { FormResult } from "@/app/(admin)/admin/_actions/catalogue";
import { keepValues } from "./keep-form";
import { toast } from "./toaster";

export function PlanSettings(props: { priceCents: number; trialDays: number; gatewayPlanId: string | null; checkoutUrl: string | null; active: boolean }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState(savePlan, { status: "idle" } as FormResult);
  const err = state.fieldErrors ?? {};
  useEffect(() => {
    if (state.status === "saved") toast(t("saved"));
    if (state.status === "error" && state.message) toast(t(state.message), "error");
  }, [state, t]);
  const f = (name: string) => ({ "aria-invalid": err[name] ? true : undefined, "aria-describedby": err[name] ? `pl-${name}-error` : `pl-${name}-hint` });
  const hint = (name: string, key: string) =>
    err[name] ? (
      <span className="error-text" id={`pl-${name}-error`} role="alert">
        {t(err[name])}
      </span>
    ) : (
      <span className="hint" id={`pl-${name}-hint`}>
        {t(key)}
      </span>
    );
  return (
    <form onSubmit={keepValues(action)} className="stack" noValidate>
      <div className="grid-2">
        <div className={err.price ? "field has-error" : "field"}>
          <label htmlFor="pl-price">{t("pl_price")}</label>
          <input className="input tnum" id="pl-price" name="price" inputMode="decimal" defaultValue={(props.priceCents / 100).toFixed(2).replace(".", ",")} {...f("price")} />
          {hint("price", "pl_priceHint")}
        </div>
        <div className={err.trial_days ? "field has-error" : "field"}>
          <label htmlFor="pl-trial_days">{t("pl_trial")}</label>
          <input className="input tnum" id="pl-trial_days" name="trial_days" type="number" min={0} max={90} defaultValue={props.trialDays} {...f("trial_days")} />
          {hint("trial_days", "pl_trialHint")}
        </div>
      </div>
      <div className={err.gateway_plan_id ? "field has-error" : "field"}>
        <label htmlFor="pl-gateway_plan_id">{t("pl_gid")}</label>
        <input className="input" id="pl-gateway_plan_id" name="gateway_plan_id" defaultValue={props.gatewayPlanId ?? ""} placeholder="plan_…" style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace" }} {...f("gateway_plan_id")} />
        {hint("gateway_plan_id", "pl_gidHint")}
      </div>
      <div className={err.checkout_url ? "field has-error" : "field"}>
        <label htmlFor="pl-checkout_url">{t("pl_checkout")}</label>
        <input className="input" id="pl-checkout_url" name="checkout_url" type="url" defaultValue={props.checkoutUrl ?? ""} placeholder="https://" {...f("checkout_url")} />
        {hint("checkout_url", "pl_checkoutHint")}
      </div>
      <label className="check">
        <input type="checkbox" name="active" defaultChecked={props.active} />
        {t("pl_active")}
      </label>
      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {t("pl_save")}
        </button>
      </div>
    </form>
  );
}
