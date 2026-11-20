"use client";

import { useEffect, useState } from "react";
import { addDays, dayKey, fmtDayShort, relFromNow } from "@/lib/format";
import { T } from "@/lib/texts";

/** "em 25 min" / "a decorrer" / "Amanhã", refreshed every 30 s and when the tab comes back (#20). */
export function Countdown({ start, end, initialNow }: { start: string; end: string | null; initialNow: number }) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 30_000);
    const onVis = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  const n = new Date(now);
  const s = new Date(start).getTime();
  const e = new Date(end ?? start).getTime();
  const today = dayKey(n);
  const k = dayKey(start);
  const text = s <= now && e > now ? T.next.now : k === today ? relFromNow(start, n) : k === addDays(today, 1) ? T.next.tomorrow : fmtDayShort(k);
  return <>{text}</>;
}
