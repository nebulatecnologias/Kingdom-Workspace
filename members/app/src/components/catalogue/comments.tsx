"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deleteMyComment, postComment, type CommentState } from "@/app/(member)/actions";

/** Write a comment. It goes to the moderation queue; the form says so and clears once it is sent. */
export function CommentForm({ productId, slug }: { productId: string; slug: string }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState(postComment, { status: "idle" } as CommentState);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "sent") form.current?.reset();
  }, [state]);
  const error = state.status === "error" ? t(state.message ?? "err_generic") : null;
  return (
    <form ref={form} action={action} className="stack" style={{ gap: 10 }} noValidate>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <div className={error ? "field has-error" : "field"}>
        <label htmlFor="cm-body">{t("cm_label")}</label>
        <textarea
          className="textarea"
          id="cm-body"
          name="body"
          rows={3}
          maxLength={1500}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "cm-error" : "cm-hint"}
        />
        {error ? (
          <span className="error-text" id="cm-error" role="alert">
            {error}
          </span>
        ) : (
          <span className="hint" id="cm-hint">
            {t("cm_hint")}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {t("cm_post")}
        </button>
        {state.status === "sent" ? (
          <span className="pill pill-soft-green" role="status">
            {t("cm_sent")}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function DeleteComment({ id, slug }: { id: string; slug: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="btn btn-quiet btn-sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(t("cm_deleteQ"))) return;
        start(async () => {
          await deleteMyComment(id, slug);
          router.refresh();
        });
      }}
    >
      <Trash2 className="icon icon-sm" aria-hidden="true" />
      {t("cm_delete")}
    </button>
  );
}
