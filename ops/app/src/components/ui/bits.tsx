import clsx from "clsx";
import type { ReactNode } from "react";
import { initials } from "@/lib/format";
import type { Stage } from "@/lib/types";
import { Icon } from "./icon";

export function Avatar({ name, className }: { name?: string | null; className?: string }) {
  if (!name) return null;
  return (
    <span className={clsx("avatar", className)} title={name}>
      {initials(name)}
    </span>
  );
}

export function Pill({ stage, changed }: { stage: Pick<Stage, "tone" | "name">; changed?: boolean }) {
  return (
    <span className={clsx("pill", stage.tone, changed && "is-changed")}>
      <span className={clsx("dot", stage.tone)} />
      {stage.name}
    </span>
  );
}

export function Empty({ icon, title, hint, children }: { icon: string; title: string; hint?: ReactNode; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="ico">
        <Icon name={icon} />
      </div>
      <h3 className="h-title">{title}</h3>
      {hint ? <p>{hint}</p> : null}
      {children}
    </div>
  );
}

export function PageHead({ title, sub, actions, desktopOnly }: { title: string; sub?: ReactNode; actions?: ReactNode; desktopOnly?: boolean }) {
  return (
    <div className={clsx("page-head", desktopOnly && "only-desktop")}>
      <div>
        {sub ? <div className="caption">{sub}</div> : null}
        <h1 className="h-display">{title}</h1>
      </div>
      <div className="page-actions">{actions}</div>
    </div>
  );
}
