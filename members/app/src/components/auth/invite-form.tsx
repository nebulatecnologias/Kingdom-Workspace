"use client";

import { useActionState, useState } from "react";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { acceptInvite, type FormState } from "@/app/(auth)/actions";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";

export function InviteForm({ token, email, defaultName, expiresLabel }: {
  token: string;
  email: string;
  defaultName: string;
  expiresLabel: string;
}) {
  const t = useTranslations();
  const [state, action] = useActionState<FormState, FormData>(acceptInvite.bind(null, token), { status: "idle" });
  const [noPassword, setNoPassword] = useState(false);
  const fe = state.fieldErrors ?? {};
  return (
    <form className="stack" action={action} noValidate>
      <Field id="iv-email" label={t("email")} hint={t("inv_emailHint")}>
        <input className="input" id="iv-email" value={email} readOnly />
      </Field>
      <Field id="iv-name" label={t("fullName")} error={fe.name ? t(fe.name) : undefined}>
        <input className="input" id="iv-name" name="name" defaultValue={defaultName} placeholder={t("fullNamePh")} autoComplete="name" aria-invalid={!!fe.name || undefined} />
      </Field>
      <div style={{ opacity: noPassword ? 0.45 : 1 }}>
        <Field id="iv-pw" label={t("password")} error={fe.password && !noPassword ? t(fe.password) : undefined}>
          <PasswordInput id="iv-pw" autoComplete="new-password" meter disabled={noPassword} invalid={!!fe.password && !noPassword} />
        </Field>
      </div>
      <label className="check">
        <input type="checkbox" name="nopw" checked={noPassword} onChange={(e) => setNoPassword(e.target.checked)} />
        {t("inv_noPw")}
      </label>
      <div className={fe.terms ? "field has-error" : undefined}>
        <label className="check">
          <input type="checkbox" name="terms" aria-invalid={!!fe.terms || undefined} />
          <span>
            {t.rich("inv_terms", {
              terms: (c) => <a href="/legal/terms" target="_blank" rel="noopener">{c}</a>,
              privacy: (c) => <a href="/legal/privacy" target="_blank" rel="noopener">{c}</a>,
            })}
          </span>
        </label>
        {fe.terms ? <span className="error-text" role="alert">{t(fe.terms)}</span> : null}
      </div>
      {state.message ? <Notice tone="warn">{t(state.message)}</Notice> : null}
      <SubmitButton pendingLabel={t("inv_creating")}>{t("inv_submit")}</SubmitButton>
      <p className="hint" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
        <Clock className="icon icon-sm" aria-hidden="true" />
        {expiresLabel}
      </p>
    </form>
  );
}
