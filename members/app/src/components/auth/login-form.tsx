"use client";

import { useActionState, useEffect, useState } from "react";
import { Info, Mail, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { forgotPassword, requestLink, signInWithPassword, type FormState } from "@/app/(auth)/actions";
import { toLocale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";

const idle: FormState = { status: "idle" };

function ResendButton({ onResend }: { onResend: () => void }) {
  const t = useTranslations();
  const [seconds, setSeconds] = useState(30);
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);
  return (
    <Button type="submit" variant="ghost" disabled={seconds > 0} onClick={() => { onResend(); setSeconds(30); }}>
      {seconds > 0 ? t("sent_resendIn", { s: seconds }) : t("sent_resend")}
    </Button>
  );
}

export function LoginForm({ next, defaultEmail = "" }: { next: string; defaultEmail?: string }) {
  const t = useTranslations();
  const locale = toLocale(useLocale());
  const [mode, setMode] = useState<"link" | "pw">("link");
  const [email, setEmail] = useState(defaultEmail);
  const [linkState, linkAction] = useActionState(requestLink, idle);
  const [pwState, pwAction] = useActionState(signInWithPassword, idle);
  const [resetState, resetAction] = useActionState(forgotPassword, idle);
  const [dismissedSent, setDismissedSent] = useState(false);

  if (linkState.status === "sent" && !dismissedSent) {
    return (
      <div className="stack">
        <span className="state-icon" style={{ background: "var(--orange-soft)", color: "var(--orange-ink)" }}>
          <Mail className="icon" aria-hidden="true" />
        </span>
        <div>
          <h1>{t("sent_title")}</h1>
          <p className="lead">{t("sent_lead", { email: linkState.email ?? email })}</p>
        </div>
        <form action={linkAction} className="actions" style={{ justifyContent: "space-between" }}>
          <input type="hidden" name="email" value={linkState.email ?? email} />
          <input type="hidden" name="locale" value={locale} />
          <ResendButton onResend={() => {}} />
          <Button type="button" variant="quiet" onClick={() => setDismissedSent(true)}>
            {t("sent_other")}
          </Button>
        </form>
      </div>
    );
  }

  const state = mode === "link" ? linkState : pwState;
  const emailError = state.fieldErrors?.email ?? (resetState.fieldErrors?.email as string | undefined);
  return (
    <div className="stack">
      <div>
        <h1>{t("login_title")}</h1>
        <p className="lead">{t("login_lead")}</p>
      </div>
      <div className="seg" role="group" style={{ width: "100%" }}>
        {(["link", "pw"] as const).map((m) => (
          <button key={m} type="button" style={{ flex: 1 }} aria-pressed={mode === m} onClick={() => { setMode(m); setDismissedSent(false); }}>
            {t(m === "link" ? "login_modeLink" : "login_modePw")}
          </button>
        ))}
      </div>
      <form className="stack" action={mode === "link" ? linkAction : pwAction} noValidate>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next} />
        <Field id="lg-email" label={t("email")} error={emailError ? t(emailError) : undefined}>
          <input className="input" id="lg-email" name="email" type="email" autoComplete="email" placeholder={t("emailPh")} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        {mode === "pw" ? (
          <div className="field">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <label htmlFor="lg-pw">{t("password")}</label>
              <button type="submit" formAction={resetAction} formNoValidate className="btn-link" style={{ fontSize: 13.5 }}>
                {t("login_forgot")}
              </button>
            </div>
            <PasswordInput id="lg-pw" autoComplete="current-password" />
          </div>
        ) : (
          <p className="hint" style={{ display: "flex", gap: 8 }}>
            <Info className="icon icon-sm" aria-hidden="true" />
            {t("login_linkHint")}
          </p>
        )}
        {resetState.status === "reset_sent" && mode === "pw" ? <Notice tone="ok">{t("login_reset", { email: resetState.email ?? email })}</Notice> : null}
        {state.message ? <Notice tone="warn">{t(state.message)}</Notice> : null}
        {resetState.message && mode === "pw" ? <Notice tone="warn">{t(resetState.message)}</Notice> : null}
        <SubmitButton>
          {mode === "pw" ? (
            t("login_signIn")
          ) : (
            <>
              <Send className="icon icon-sm" aria-hidden="true" />
              {t("login_sendLink")}
            </>
          )}
        </SubmitButton>
      </form>
    </div>
  );
}
