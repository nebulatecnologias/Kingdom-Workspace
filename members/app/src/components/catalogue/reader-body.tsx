"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { saveProgress } from "@/app/(member)/actions";

const KEY = "km-reader-size";
const MIN = 15;
const MAX = 22;
const DEFAULT = 17;

// The chosen size lives in localStorage; useSyncExternalStore reads it without a hydration mismatch.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function readSize() {
  try {
    const n = Number(localStorage.getItem(KEY));
    return n >= MIN && n <= MAX ? n : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

/** Font-size controls (remembered on this device) and progress saving for the chapter being read. */
export function ReaderBody({
  productId,
  position,
  track,
  labels,
  header,
  children,
}: {
  productId: string;
  position: number;
  track: boolean;
  labels: { smaller: string; bigger: string };
  header: ReactNode;
  children: ReactNode;
}) {
  const size = useSyncExternalStore(subscribe, readSize, () => DEFAULT);

  useEffect(() => {
    if (track) void saveProgress(productId, position);
  }, [productId, position, track]);

  const change = (d: number) => {
    const next = Math.min(MAX, Math.max(MIN, size + d));
    try {
      localStorage.setItem(KEY, String(next));
    } catch {
      /* storage blocked: the size resets on the next page */
    }
    listeners.forEach((l) => l());
  };

  return (
    <>
      <div className="dialog-head" style={{ alignItems: "flex-start" }}>
        {header}
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" className="icon-btn" onClick={() => change(-1)} aria-label={labels.smaller} disabled={size <= MIN} style={{ fontSize: 13, fontWeight: 500 }}>
            A−
          </button>
          <button type="button" className="icon-btn" onClick={() => change(1)} aria-label={labels.bigger} disabled={size >= MAX} style={{ fontSize: 16, fontWeight: 500 }}>
            A+
          </button>
        </div>
      </div>
      <div style={{ fontSize: size }}>{children}</div>
    </>
  );
}
