"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { resetPassword, type FormState } from "@/app/(auth)/actions";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResetForm() {
  const t = useTranslations();
  const [state, action] = useActionState<FormState, FormData>(resetPassword, { status: "idle" });
  return (
    <form className="stack" action={action} noValidate>
      <Field id="rs-pw" label={t("password")} error={state.fieldErrors?.password ? t(state.fieldErrors.password) : undefined}>
        <PasswordInput id="rs-pw" autoComplete="new-password" meter invalid={!!state.fieldErrors?.password} />
      </Field>
      {state.message ? <Notice tone="warn">{t(state.message)}</Notice> : null}
      <SubmitButton>{t("reset_button")}</SubmitButton>
    </form>
  );
}
