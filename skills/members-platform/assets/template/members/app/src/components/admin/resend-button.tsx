"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { resendInvite } from "@/app/(admin)/admin/_actions/invites";
import { toast } from "./toaster";

export function ResendButton({ id, email }: { id: string; email: string }) {
  const t = useTranslations();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await resendInvite(id);
          toast(r.ok ? t("toast_resent", { email }) : t(r.error), r.ok ? "ok" : "error");
        })
      }
    >
      <RefreshCw className="icon icon-sm" aria-hidden="true" />
      {t("cd_resend")}
    </button>
  );
}
