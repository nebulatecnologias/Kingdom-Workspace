"use client";

import { useActionState } from "react";
import { Mail, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { requestLink, type FormState } from "@/app/(auth)/actions";
import { toLocale } from "@/i18n/config";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { SubmitButton } from "@/components/ui/submit-button";

/** "Send me a new link": same neutral reply whether or not the email is a customer. */
export function RequestLinkForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const t = useTranslations();
  const locale = toLocale(useLocale());
  const [state, action] = useActionState<FormState, FormData>(requestLink, { status: "idle" });
  if (state.status === "sent") {
    return (
      <div className="notice notice-ok" role="status">
        <Mail className="icon" aria-hidden="true" />
        <span>{t("access_sent", { email: state.email ?? "" })}</span>
      </div>
    );
  }
  return (
    <form className="stack" action={action} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <Field id="acc-email" label={t("email")} error={state.fieldErrors?.email ? t(state.fieldErrors.email) : undefined}>
        <input className="input" id="acc-email" name="email" type="email" autoComplete="email" placeholder={t("emailPh")} defaultValue={defaultEmail} />
      </Field>
      {state.message ? <Notice tone="warn">{t(state.message)}</Notice> : null}
      <SubmitButton>
        <Send className="icon icon-sm" aria-hidden="true" />
        {t("sendNewLink")}
      </SubmitButton>
    </form>
  );
}
