"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { createProduct, type FormResult } from "@/app/(admin)/admin/_actions/catalogue";
import { Notice } from "@/components/ui/notice";
import { keepValues } from "./keep-form";

export function NewProductForm({ sections }: { sections: { id: string; name: string }[] }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState(createProduct, { status: "idle" } as FormResult);
  const err = state.fieldErrors ?? {};
  return (
    <form onSubmit={keepValues(action)} className="stack" noValidate>
      <fieldset className={err.type ? "field has-error" : "field"} style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ marginBottom: 8 }}>
          {t("ed_type")}
        </legend>
        <div className="grid-2">
          {(["colouring", "book", "guide", "workbook"] as const).map((ty, i) => (
            <label key={ty} className="bought" style={{ cursor: "pointer" }}>
              <input type="radio" name="type" value={ty} defaultChecked={i === 0} style={{ width: 18, height: 18, accentColor: "var(--orange-500)" }} />
              <span>
                <b style={{ fontWeight: 500, display: "block" }}>{t(`type_${ty}`)}</b>
                <span className="hint">{t(`np_${ty}`)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={err.title ? "field has-error" : "field"}>
        <label htmlFor="np-title">{t("np_title")}</label>
        <input className="input" id="np-title" name="title" maxLength={120} required aria-invalid={!!err.title || undefined} aria-describedby={err.title ? "np-title-error" : "np-title-hint"} />
        {err.title ? (
          <span className="error-text" id="np-title-error" role="alert">
            {t(err.title)}
          </span>
        ) : (
          <span className="hint" id="np-title-hint">
            {t("np_titleHint")}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="np-sec">{t("ed_section")}</label>
        <select className="select" id="np-sec" name="section" defaultValue={sections[0]?.id ?? ""}>
          <option value="">{t("sc_noSection")}</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {state.status === "error" && state.message ? <Notice tone="warn">{t(state.message)}</Notice> : null}
      <p className="hint">{t("np_hiddenNote")}</p>
      <div>
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {t("np_create")}
          <ArrowRight className="icon icon-sm" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
