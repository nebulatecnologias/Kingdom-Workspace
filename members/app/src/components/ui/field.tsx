import clsx from "clsx";
import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

/** Label + control + hint/error, matching the design system's .field. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={clsx("field", error && "has-error")}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <span className="error-text" id={`${id}-error`} role="alert">
          <CircleAlert className="icon icon-sm" aria-hidden="true" />
          {error}
        </span>
      ) : hint ? (
        <span className="hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
