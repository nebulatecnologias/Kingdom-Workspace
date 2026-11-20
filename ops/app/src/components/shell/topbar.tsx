import type { ReactNode } from "react";
import { BackButton } from "@/components/shell/back-button";
import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";

/** Phone top bar (hidden on desktop): back button (to where you came from; `back` is the fallback), centred title, one action. */
export function Topbar({ title, back, actions }: { title: string; back?: string; actions?: ReactNode }) {
  return (
    <header className="topbar">
      {back ? (
        <BackButton className="btn btn-quiet btn-icon" href={back} label={T.actions.back}>
          <Icon name="arrow-left" />
        </BackButton>
      ) : (
        <span className="spacer" />
      )}
      <h1 className="h-title">{title}</h1>
      {actions ?? <span className="spacer" />}
    </header>
  );
}
