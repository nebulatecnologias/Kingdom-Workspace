"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { keepValues } from "./keep-form";

/**
 * Side panel dialog. Focus moves into it, Escape and the backdrop close it, and focus stays inside while open.
 * `as="form"` makes the panel itself the form, as in the design.
 */
export function Drawer({
  title,
  lead,
  onClose,
  children,
  formAction,
}: {
  title: ReactNode;
  lead?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  formAction?: (formData: FormData) => void;
}) {
  const t = useTranslations();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panel.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.querySelector<HTMLElement>("input, select, textarea, button:not([data-close])")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !el) return;
      const items = [...el.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]), select, textarea")];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  const head = (
    <div className="dialog-head" style={{ margin: 0 }}>
      <div>
        <h2 id="drawer-title">{title}</h2>
        {lead ? (
          <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>
            {lead}
          </p>
        ) : null}
      </div>
      <button type="button" className="icon-btn" data-close aria-label={t("close")} onClick={onClose}>
        <X className="icon" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <div className="scrim drawer-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        {head}
        {formAction ? (
          // display: contents keeps the drawer's column layout for the form's fields.
          <form onSubmit={keepValues(formAction)} noValidate style={{ display: "contents" }}>
            {children}
          </form>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
