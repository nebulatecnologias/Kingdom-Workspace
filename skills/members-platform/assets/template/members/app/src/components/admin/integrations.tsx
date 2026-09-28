"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Copy, Eye, EyeOff, KeyRound, Zap } from "lucide-react";
import { revealGatewaySecret, saveGatewaySecret, sendTestEvent, type SecretState } from "@/app/(admin)/admin/_actions/integrations";
import { toast } from "./toaster";
import { keepValues } from "./keep-form";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const t = useTranslations();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      aria-label={label ? `${t("copy")}: ${label}` : undefined}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast(t("copied"));
        } catch {
          window.prompt(t("copy"), value);
        }
      }}
    >
      <Copy className="icon icon-sm" aria-hidden="true" />
      {t("copy")}
    </button>
  );
}

/** The stored signing secret: masked, revealed on request, and replaced by pasting the one the gateway shows. */
export function SecretField({ masked, hasSecret, rotatingUntil }: { masked: string | null; hasSecret: boolean; rotatingUntil: string | null }) {
  const t = useTranslations();
  const router = useRouter();
  const [shown, setShown] = useState<string | null>(null);
  const [editing, setEditing] = useState(!hasSecret);
  const [pending, start] = useTransition();
  const [state, action, saving] = useActionState(async (prev: SecretState, fd: FormData) => {
    const r = await saveGatewaySecret(prev, fd);
    if (r.status === "saved") {
      toast(t(hasSecret ? "rotateToast" : "int_secretSaved"));
      setEditing(false);
      setShown(null);
      router.refresh();
    }
    return r;
  }, { status: "idle" } as SecretState);

  return (
    <div className="field">
      <span className="label" id="secret-label">
        {t("int_secret")}
      </span>
      {hasSecret ? (
        <div className="code-field" aria-labelledby="secret-label">
          <span id="secret" style={{ overflowWrap: "anywhere" }}>
            {shown ?? masked}
          </span>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            disabled={pending}
            aria-pressed={!!shown}
            onClick={() =>
              shown
                ? setShown(null)
                : start(async () => {
                    const r = await revealGatewaySecret();
                    if (r.ok) setShown(String(r.data?.secret ?? ""));
                    else toast(t(r.error), "error");
                  })
            }
          >
            {shown ? <EyeOff className="icon icon-sm" aria-hidden="true" /> : <Eye className="icon icon-sm" aria-hidden="true" />}
            {t(shown ? "int_hide" : "int_reveal")}
          </button>
          {!editing ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
              <KeyRound className="icon icon-sm" aria-hidden="true" />
              {t("int_replace")}
            </button>
          ) : null}
        </div>
      ) : null}
      <span className="hint">{hasSecret ? t("int_secretP") : t("int_secretNone")}</span>
      {rotatingUntil ? <span className="hint">{t("int_rotating", { date: rotatingUntil })}</span> : null}
      {editing ? (
        <form onSubmit={keepValues(action)} className="stack" style={{ gap: 8, marginTop: 8 }}>
          <label htmlFor="new-secret" className="label">
            {hasSecret ? t("int_newSecret") : t("int_pasteSecret")}
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              className="input"
              id="new-secret"
              name="secret"
              autoComplete="off"
              spellCheck={false}
              placeholder="whsec_…"
              style={{ flex: "1 1 260px", fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}
              aria-invalid={state.status === "error" || undefined}
              aria-describedby="new-secret-hint"
            />
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {t("save")}
            </button>
            {hasSecret ? (
              <button type="button" className="btn btn-quiet" onClick={() => setEditing(false)}>
                {t("cancel")}
              </button>
            ) : null}
          </div>
          <span className={state.status === "error" ? "error-text" : "hint"} id="new-secret-hint" role={state.status === "error" ? "alert" : undefined}>
            {state.status === "error" ? t(state.message ?? "err_generic") : t("int_newSecretHint")}
          </span>
        </form>
      ) : null}
    </div>
  );
}

export function TestEventButton({ disabled }: { disabled: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-primary"
      disabled={disabled || pending}
      onClick={() =>
        start(async () => {
          const r = await sendTestEvent();
          toast(r.ok ? t("int_testToast") : t(r.error), r.ok ? "ok" : "error");
          router.refresh();
        })
      }
    >
      <Zap className="icon icon-sm" aria-hidden="true" />
      {pending ? t("int_testing") : t("int_test")}
    </button>
  );
}
