"use client";

import { useActionState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { createInvite, type NewInviteState } from "@/app/(admin)/admin/_actions/invites";
import { Art } from "@/components/catalogue/art";
import { Notice } from "@/components/ui/notice";
import { Drawer } from "./drawer";
import { toast } from "./toaster";

export type InviteProduct = { id: string; title: string; coverPath: string | null; coverUrl?: string; fieldColour: string; visibility: string };

const idle: NewInviteState = { status: "idle" };

export function NewInviteDrawer({ products, closeHref, defaultLocale }: { products: InviteProduct[]; closeHref: string; defaultLocale: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [state, action, pending] = useActionState(createInvite, idle);
  const close = useCallback(() => router.push(closeHref, { scroll: false }), [router, closeHref]);

  useEffect(() => {
    if (state.status === "sent") toast(t("toast_sent", { email: state.email ?? "" }));
    if (state.status === "granted") toast(t("toast_grantedMember", { email: state.email ?? "" }));
    if (state.status === "sent" || state.status === "granted") close();
  }, [state, t, close]);

  const err = state.fieldErrors ?? {};
  return (
    <Drawer title={t("ni_title")} lead={t("ni_lead")} onClose={close} formAction={action}>
      <div className={err.email ? "field has-error" : "field"}>
        <label htmlFor="ni-email">{t("email")}</label>
        <input className="input" id="ni-email" name="email" type="email" placeholder={t("emailPh")} autoComplete="off" required aria-invalid={!!err.email || undefined} aria-describedby={err.email ? "ni-email-error" : undefined} />
        {err.email ? (
          <span className="error-text" id="ni-email-error" role="alert">
            {t(err.email)}
          </span>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor="ni-name">{t("ni_name")}</label>
        <input className="input" id="ni-name" name="name" placeholder={t("fullNamePh")} autoComplete="off" />
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="ni-lang">{t("language")}</label>
          <select className="select" id="ni-lang" name="locale" defaultValue={defaultLocale}>
            {(["en", "pt", "es"] as const).map((l) => (
              <option key={l} value={l}>
                {t(`lang_${l}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="ni-exp">{t("ni_expiry")}</label>
          <select className="select" id="ni-exp" name="days" defaultValue="7">
            {[3, 7, 14].map((n) => (
              <option key={n} value={n}>
                {t("days", { n })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className={err.products ? "field has-error" : "field"} style={{ border: 0, padding: 0, margin: 0 }} aria-describedby={err.products ? "ni-products-error" : undefined}>
        <legend className="label" style={{ marginBottom: 8 }}>
          {t("ni_packs")}
        </legend>
        {products.length ? (
          <div className="stack" style={{ gap: 8 }}>
            {products.map((p) => (
              <label key={p.id} className="bought" style={{ cursor: "pointer" }}>
                <input type="checkbox" name="products" value={p.id} style={{ width: 18, height: 18, accentColor: "var(--orange-500)" }} />
                <span className="mini" style={{ width: 40, height: 40, background: p.fieldColour }} aria-hidden="true">
                  <Art path={p.coverPath} url={p.coverUrl} />
                </span>
                <span style={{ fontWeight: 500, fontSize: 14.5, flex: 1, minWidth: 0 }}>{p.title}</span>
                {p.visibility !== "visible" ? <span className="pill pill-grey">{t(`vis_${p.visibility}`)}</span> : null}
              </label>
            ))}
          </div>
        ) : (
          <p className="hint">{t("ni_noProducts")}</p>
        )}
        {err.products ? (
          <span className="error-text" id="ni-products-error" role="alert">
            {t(err.products)}
          </span>
        ) : null}
      </fieldset>
      <p className="hint">{t("ni_existingNote")}</p>
      {state.status === "error" && state.message ? <Notice tone="warn">{t(state.message)}</Notice> : null}
      <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
        <button type="button" className="btn btn-ghost" onClick={close}>
          {t("cancel")}
        </button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={pending}>
          <Send className="icon icon-sm" aria-hidden="true" />
          {pending ? t("ni_sending") : t("ni_send")}
        </button>
      </div>
    </Drawer>
  );
}
