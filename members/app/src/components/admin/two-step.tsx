"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { recordTwoStep } from "@/app/(admin)/admin/_actions/security";
import { Notice } from "@/components/ui/notice";
import { createClient } from "@/lib/supabase/client";
import { toast } from "./toaster";

type Enrolment = { id: string; qr: string; secret: string };

/** Turn two-step verification (an authenticator app, TOTP) on or off for the signed-in admin. */
export function TwoStepSettings({ factorId }: { factorId: string | null }) {
  const t = useTranslations();
  const router = useRouter();
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const begin = () =>
    start(async () => {
      setError(null);
      const supabase = createClient();
      // Unfinished set-ups would clash with a new one.
      const { data: list } = await supabase.auth.mfa.listFactors();
      for (const f of list?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data, error: e } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Kingdom Members ${new Date().toISOString().slice(0, 10)}` });
      if (e || !data) return setError("err_generic");
      setEnrolment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    });

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrolment) return;
    start(async () => {
      const { error: e2 } = await createClient().auth.mfa.challengeAndVerify({ factorId: enrolment.id, code: code.replace(/\s/g, "") });
      if (e2) return setError("err_mfa_code");
      await recordTwoStep(true);
      toast(t("mfa_enabled"));
      setEnrolment(null);
      router.refresh();
    });
  };

  const disable = () => {
    if (!factorId || !window.confirm(t("mfa_disableQ"))) return;
    start(async () => {
      const { error: e } = await createClient().auth.mfa.unenroll({ factorId });
      if (e) return toast(t("err_generic"), "error");
      await recordTwoStep(false);
      toast(t("mfa_disabled"));
      router.refresh();
    });
  };

  if (factorId) {
    return (
      <div className="stack">
        <Notice tone="ok">{t("mfa_isOn")}</Notice>
        <div>
          <button type="button" className="btn btn-danger btn-sm" disabled={pending} onClick={disable}>
            <ShieldOff className="icon icon-sm" aria-hidden="true" />
            {t("mfa_disable")}
          </button>
        </div>
      </div>
    );
  }

  if (!enrolment) {
    return (
      <div className="stack">
        <p className="muted">{t("mfa_offLead")}</p>
        {error ? <Notice tone="warn">{t(error)}</Notice> : null}
        <div>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={begin}>
            <ShieldCheck className="icon icon-sm" aria-hidden="true" />
            {t("mfa_enable")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={confirm}>
      <ol className="stack" style={{ paddingLeft: 20, margin: 0, gap: 6 }}>
        <li>{t("mfa_step1")}</li>
        <li>{t("mfa_step2")}</li>
        <li>{t("mfa_step3")}</li>
      </ol>
      <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the QR code is a data URL from the auth server */}
        <img src={enrolment.qr} alt={t("mfa_qrAlt")} width={180} height={180} style={{ background: "#fff", borderRadius: 12, padding: 8, border: "1px solid var(--line)" }} />
        <div className="field" style={{ minWidth: 0, flex: "1 1 220px" }}>
          <span className="label">{t("mfa_manual")}</span>
          <code className="chip-code" style={{ overflowWrap: "anywhere", padding: "8px 10px" }}>
            {enrolment.secret}
          </code>
        </div>
      </div>
      <div className={error ? "field has-error" : "field"} style={{ maxWidth: 260 }}>
        <label htmlFor="mfa-code">{t("mfa_code")}</label>
        <input
          className="input tnum"
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "mfa-code-error" : undefined}
          autoFocus
        />
        {error ? (
          <span className="error-text" id="mfa-code-error" role="alert">
            {t(error)}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="btn btn-primary" disabled={pending || code.replace(/\s/g, "").length !== 6}>
          {t("mfa_confirm")}
        </button>
        <button type="button" className="btn btn-quiet" onClick={() => setEnrolment(null)}>
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

/** Sign-in step for admins with an authenticator: asks for the 6-digit code, then continues. */
export function VerifyCode({ next }: { next: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          setError(null);
          const supabase = createClient();
          const { data } = await supabase.auth.mfa.listFactors();
          const factor = data?.totp?.[0];
          if (!factor) return router.replace(next);
          const { error: e2 } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code: code.replace(/\s/g, "") });
          if (e2) return setError("err_mfa_code");
          router.replace(next);
          router.refresh();
        });
      }}
    >
      <div className={error ? "field has-error" : "field"}>
        <label htmlFor="verify-code">{t("mfa_code")}</label>
        <input
          className="input tnum"
          id="verify-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          maxLength={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "verify-code-error" : undefined}
          autoFocus
        />
        {error ? (
          <span className="error-text" id="verify-code-error" role="alert">
            {t(error)}
          </span>
        ) : null}
      </div>
      <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={pending || code.replace(/\s/g, "").length !== 6}>
        {pending ? t("mfa_checking") : t("mfa_continue")}
      </button>
    </form>
  );
}
