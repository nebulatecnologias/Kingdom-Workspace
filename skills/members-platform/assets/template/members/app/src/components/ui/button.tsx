import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

type Common = { variant?: Variant; size?: Size; block?: boolean; children: ReactNode };

function classes({ variant = "ghost", size = "md", block }: Omit<Common, "children">, extra?: string) {
  return clsx("btn", `btn-${variant}`, size !== "md" && `btn-${size}`, block && "btn-block", extra);
}

/** Pill button. Use `variant="primary"` for the single main action of a view. */
export function Button({
  variant,
  size,
  block,
  loading,
  loadingLabel,
  className,
  children,
  ...rest
}: Common & ComponentProps<"button"> & { loading?: boolean; loadingLabel?: string }) {
  return (
    <button
      {...rest}
      className={classes({ variant, size, block }, clsx(loading && "is-loading", className))}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <>
          <span className="spin" aria-hidden="true" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={classes({ variant, size, block }, className)}>
      {children}
    </Link>
  );
}
