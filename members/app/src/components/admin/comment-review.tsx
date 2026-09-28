"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Trash2, X } from "lucide-react";
import { deleteComment, reviewComment } from "@/app/(admin)/admin/_actions/comments";
import { toast } from "./toaster";

export function CommentReview({ id, status, who }: { id: string; status: "pending" | "approved" | "rejected"; who: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await fn();
      toast(r.ok ? done : t(r.error ?? "err_generic"), r.ok ? "ok" : "error");
      router.refresh();
    });
  return (
    <div className="asset-btns" style={{ marginLeft: 0 }}>
      {status !== "approved" ? (
        <button type="button" className="btn btn-primary btn-sm" disabled={pending} aria-label={`${t("cmad_approve")}: ${who}`} onClick={() => run(() => reviewComment(id, "approved"), t("cmad_approved_done"))}>
          <Check className="icon icon-sm" aria-hidden="true" />
          {t("cmad_approve")}
        </button>
      ) : null}
      {status !== "rejected" ? (
        <button type="button" className="btn btn-ghost btn-sm" disabled={pending} aria-label={`${t("cmad_reject")}: ${who}`} onClick={() => run(() => reviewComment(id, "rejected"), t("cmad_rejected_done"))}>
          <X className="icon icon-sm" aria-hidden="true" />
          {t(status === "approved" ? "cmad_hide" : "cmad_reject")}
        </button>
      ) : null}
      <button
        type="button"
        className="btn btn-danger btn-sm"
        disabled={pending}
        aria-label={`${t("delete")}: ${who}`}
        onClick={() => {
          if (window.confirm(t("cmad_deleteQ"))) run(() => deleteComment(id), t("cmad_deleted"));
        }}
      >
        <Trash2 className="icon icon-sm" aria-hidden="true" />
      </button>
    </div>
  );
}
