"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { changePassword, deleteAccount, updateName, type ProfileState } from "@/app/(member)/actions";
import { setLocale } from "@/i18n/actions";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import type { Locale } from "@/i18n/config";

const idle: ProfileState = { status: "idle" };

export function NameForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState(updateName, idle);
  return (
    <form className="stack" action={action}>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div className={state.field === "name" ? "field has-error" : "field"}>
          <label htmlFor="pf-name">{t("fullName")}</label>
          <input className="input" id="pf-name" name="name" defaultValue={name} autoComplete="name" aria-invalid={state.field === "name" || undefined} />
          {state.field === "name" && state.message ? <span className="error-text" role="alert">{t(state.message)}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="pf-email">{t("email")}</label>
          <input className="input" id="pf-email" value={email} readOnly aria-describedby="pf-email-hint" />
          <span className="hint" id="pf-email-hint">
            {t("prof_emailNote")}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {t("save")}
        </button>
        {state.status === "saved" ? (
          <span className="pill pill-soft-green" role="status">
            {t("saved")}
          </span>
        ) : null}
        {state.status === "error" && !state.field ? <Notice tone="warn">{t(state.message ?? "err_generic")}</Notice> : null}
      </div>
    </form>
  );
}

export function LanguageChoice({ current }: { current: Locale }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(current);
  return (
    <div className="seg" role="group" aria-label={t("language")}>
      {(["en", "pt", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={value === l}
          disabled={pending}
          onClick={() => {
            setValue(l);
            start(async () => {
              await setLocale(l);
              router.refresh();
            });
          }}
        >
          {t(`lang_${l}`)}
        </button>
      ))}
    </div>
  );
}

export function PasswordForm() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(changePassword, idle);
  if (!open && state.status !== "saved") {
    return (
      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpen(true)}>
        {t("prof_changePw")}
      </button>
    );
  }
  if (state.status === "saved") {
    return (
      <span className="pill pill-soft-green" role="status">
        {t("prof_pwSaved")}
      </span>
    );
  }
  return (
    <form className="stack" action={action} style={{ flexBasis: "100%", maxWidth: 420, gap: 12 }}>
      <div className={state.field === "password" ? "field has-error" : "field"}>
        <label htmlFor="pf-pw">{t("prof_pwNew")}</label>
        <PasswordInput id="pf-pw" autoComplete="new-password" meter invalid={state.field === "password"} />
        {state.field === "password" && state.message ? (
          <span className="error-text" id="pf-pw-error" role="alert">
            {t(state.message)}
          </span>
        ) : null}
      </div>
      <div className="actions">
        <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>
          {t("save")}
        </button>
        <button className="btn btn-quiet btn-sm" type="button" onClick={() => setOpen(false)}>
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

export function PrivacyActions() {
  const t = useTranslations();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  if (confirming) {
    return (
      <div className="notice notice-warn" role="alert">
        <AlertTriangle className="icon" aria-hidden="true" />
        <div style={{ display: "grid", gap: 12 }}>
          <span>{t("prof_deleteConfirm")}</span>
          <div className="actions">
            <button className="btn btn-danger btn-sm" type="button" disabled={pending} onClick={() => start(() => deleteAccount())}>
              {t("prof_deleteYes")}
            </button>
            <button className="btn btn-quiet btn-sm" type="button" onClick={() => setConfirming(false)} disabled={pending}>
              {t("cancel")}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="actions">
      <a className="btn btn-ghost btn-sm" href="/api/me/export" download>
        <Download className="icon icon-sm" aria-hidden="true" />
        {t("prof_export")}
      </a>
      <button className="btn btn-danger btn-sm" type="button" onClick={() => setConfirming(true)}>
        <Trash2 className="icon icon-sm" aria-hidden="true" />
        {t("prof_delete")}
      </button>
    </div>
  );
}
