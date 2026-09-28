"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Copy, RefreshCw, X } from "lucide-react";
import { inviteLink, resendInvite, revokeInvite } from "@/app/(admin)/admin/_actions/invites";
import type { InviteStatus } from "@/lib/admin/queries";
import { toast } from "./toaster";

/** Resend / copy link / revoke for one invite row. Revoking asks first, inline. */
export function InviteActions({ id, status, email }: { id: string; status: InviteStatus; email: string }) {
  const t = useTranslations();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const live = status === "sent" || status === "opened";

  const run = (fn: () => Promise<{ ok: boolean; error?: string; data?: Record<string, unknown> }>, done: (data?: Record<string, unknown>) => void | Promise<void>) =>
    start(async () => {
      const r = await fn();
      if (r.ok) await done("data" in r ? r.data : undefined);
      else toast(t(r.error ?? "err_generic"), "error");
    });

  if (status === "accepted") return null;
  if (confirming) {
    return (
      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
        <span style={{ fontSize: 13 }}>{t("revokeQ")}</span>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          disabled={pending}
          onClick={() => run(() => revokeInvite(id), () => { setConfirming(false); toast(t("toast_revoked")); })}
        >
          {t("yes")}
        </button>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => setConfirming(false)}>
          {t("no")}
        </button>
      </span>
    );
  }
  return (
    <div className="row-actions">
      <button
        type="button"
        className="icon-btn"
        disabled={pending}
        title={t("act_resend")}
        aria-label={`${t("act_resend")}: ${email}`}
        onClick={() => run(() => resendInvite(id), () => toast(t("toast_resent", { email })))}
      >
        <RefreshCw className="icon icon-sm" aria-hidden="true" />
      </button>
      {live ? (
        <>
          <button
            type="button"
            className="icon-btn"
            disabled={pending}
            title={t("act_copy")}
            aria-label={`${t("act_copy")}: ${email}`}
            onClick={() =>
              run(() => inviteLink(id), async (data) => {
                const url = String(data?.url ?? "");
                try {
                  await navigator.clipboard.writeText(url);
                  toast(t("toast_copied"));
                } catch {
                  window.prompt(t("act_copy"), url);
                }
              })
            }
          >
            <Copy className="icon icon-sm" aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" disabled={pending} title={t("act_revoke")} aria-label={`${t("act_revoke")}: ${email}`} onClick={() => setConfirming(true)}>
            <X className="icon icon-sm" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}
