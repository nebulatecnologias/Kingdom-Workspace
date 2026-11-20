"use client";

import { Icon } from "@/components/ui/icon";
import { T } from "@/lib/texts";

export function PrintButton() {
  return (
    <button className="btn btn-primary" type="button" onClick={() => window.print()}>
      <Icon name="printer" size="sm" />
      {T.actions.print}
    </button>
  );
}
