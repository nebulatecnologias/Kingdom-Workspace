import type { ReactNode } from "react";
import { Check, CircleAlert, Info } from "lucide-react";

const ICONS = { ok: Check, warn: CircleAlert, info: Info };

export function Notice({ tone = "info", children }: { tone?: "ok" | "warn" | "info"; children: ReactNode }) {
  const Icon = ICONS[tone];
  return (
    <div className={`notice notice-${tone}`} role={tone === "warn" ? "alert" : "status"}>
      <Icon className="icon" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
