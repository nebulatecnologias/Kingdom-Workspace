"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Send, ShieldOff } from "lucide-react";
import { sendMemberLink, setAccess, setMemberActive } from "@/app/(admin)/admin/_actions/members";
import { resetTwoStep } from "@/app/(admin)/admin/_actions/security";
import { toast } from "./toaster";

/** On/off switch for one product in a member's library. */
export function AccessToggle({ memberId, memberName, productId, title, on, describedBy }: { memberId: string; memberName: string; productId: string; title: string; on: boolean; describedBy?: string }) {
  const t = useTranslations();
  const [pending, start] = useTransition();
  const [value, setValue] = useOptimistic(on);
  return (
    <span className="toggle">
      <input
        type="checkbox"
        role="switch"
        checked={value}
        disabled={pending}
        aria-label={title}
        aria-describedby={describedBy}
        onChange={(e) => {
          const next = e.target.checked;
          start(async () => {
            setValue(next);
            const r = await setAccess(memberId, productId, next);
            if (r.ok) toast(t(next ? "toast_granted" : "toast_removed", { pack: title, name: memberName }));
            else toast(t(r.error), "error");
          });
        }}
      />
      <span />
    </span>
  );
}

export function MemberActions({ memberId, name, email, active, self }: { memberId: string; name: string; email: string; active: boolean; self: boolean }) {
  const t = useTranslations();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="actions" style={{ marginTop: 0 }}>
      {active ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await sendMemberLink(memberId);
              toast(r.ok ? t("toast_linkSent", { email }) : t(r.error), r.ok ? "ok" : "error");
            })
          }
        >
          <Send className="icon icon-sm" aria-hidden="true" />
          {t("md_sendLink")}
        </button>
      ) : null}
      {self ? null : confirming ? (
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13.5 }}>{t("md_deactivateQ")}</span>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await setMemberActive(memberId, false);
                setConfirming(false);
                toast(r.ok ? t("toast_deactivated", { name }) : t(r.error), r.ok ? "ok" : "error");
              })
            }
          >
            {t("yes")}
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setConfirming(false)}>
            {t("no")}
          </button>
        </span>
      ) : active ? (
        <button type="button" className="btn btn-danger btn-sm" disabled={pending} onClick={() => setConfirming(true)}>
          {t("md_deactivate")}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await setMemberActive(memberId, true);
              toast(r.ok ? t("toast_reactivated", { name }) : t(r.error), r.ok ? "ok" : "error");
            })
          }
        >
          {t("md_reactivate")}
        </button>
      )}
    </div>
  );
}

/** Removes another admin's authenticator (lost phone), so they can sign in with their password and set it up again. */
export function ResetTwoStep({ memberId, name }: { memberId: string; name: string }) {
  const t = useTranslations();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(t("mfa_resetQ", { name }))) return;
        start(async () => {
          const r = await resetTwoStep(memberId);
          toast(r.ok ? t("mfa_resetDone", { name }) : t(r.error), r.ok ? "ok" : "error");
        });
      }}
    >
      <ShieldOff className="icon icon-sm" aria-hidden="true" />
      {t("mfa_reset")}
    </button>
  );
}
