"use client";

import clsx from "clsx";
import { useState, type ReactNode } from "react";

export type TabSpec = { key: string; label: ReactNode; panel: ReactNode };

/** Details / Ata / History: all three come with the page, so switching is instant (#25). */
export function CardTabs({ tabs, initial }: { tabs: TabSpec[]; initial: string }) {
  const [active, setActive] = useState(tabs.some((t) => t.key === initial) ? initial : tabs[0].key);
  const choose = (key: string) => {
    setActive(key);
    // Keep the address in step (so a reload or a shared link opens the same tab) without a server round trip.
    const url = new URL(window.location.href);
    if (key === tabs[0].key) url.searchParams.delete("tab");
    else url.searchParams.set("tab", key);
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
  };
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Separadores">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={active === t.key}
            aria-controls={`panel-${t.key}`}
            className={clsx(active === t.key && "is-active")}
            onClick={() => choose(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} role="tabpanel" id={`panel-${t.key}`} aria-labelledby={`tab-${t.key}`} hidden={active !== t.key}>
          {t.panel}
        </div>
      ))}
    </>
  );
}
