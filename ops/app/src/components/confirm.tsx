"use client";

import clsx from "clsx";
import { useEffect, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";

/** A small confirmation sheet (dialog on desktop) for actions that remove things. */
export function ConfirmSheet({ title, children, confirmLabel, pending, error, onConfirm, onClose }: { title: string; children?: ReactNode; confirmLabel: string; pending?: boolean; error?: string | null; onConfirm: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h2 className="h-title" id="confirm-title">{title}</h2>
          <button className="btn btn-quiet btn-icon" type="button" onClick={onClose} aria-label="Fechar">
            <Icon name="x" />
          </button>
        </div>
        {children ? <div className="caption" style={{ fontSize: 14 }}>{children}</div> : null}
        {error ? <p className="form-error" role="alert" style={{ margin: "8px 0 0" }}>{error}</p> : null}
        <div className="form-foot" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" type="button" onClick={onClose}>{T.actions.cancel}</button>
          <button className={clsx("btn btn-primary", pending && "is-loading")} type="button" disabled={pending} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
