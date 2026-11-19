import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";

/** Phone top bar (hidden on desktop): back button, centred title, one action. */
export function Topbar({ title, back, actions }: { title: string; back?: string; actions?: ReactNode }) {
  return (
    <header className="topbar">
      {back ? (
        <Link className="btn btn-quiet btn-icon" href={back} aria-label={T.actions.back}>
          <Icon name="arrow-left" />
        </Link>
      ) : (
        <span className="spacer" />
      )}
      <h1 className="h-title">{title}</h1>
      {actions ?? <span className="spacer" />}
    </header>
  );
}
