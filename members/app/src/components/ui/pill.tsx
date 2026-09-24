import clsx from "clsx";
import type { ReactNode } from "react";

export type PillTone = "green" | "soft-green" | "red" | "soft-red" | "orange" | "blue" | "grey" | "violet" | "amber";

/** Status pill. Solid green/red for owned/urgent, soft tones for lifecycle states. */
export function Pill({ tone = "grey", dot, children }: { tone?: PillTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={clsx("pill", `pill-${tone}`)}>
      {dot ? <span className="dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
