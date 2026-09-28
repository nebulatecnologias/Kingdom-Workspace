"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live hh:mm:ss until the invite expires. Starts after hydration so server and client markup match. */
export function Countdown({ until, label }: { until: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  const left = now === null ? null : Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000));
  // Over a day away: days, hours and minutes. The last day: hours, minutes and seconds.
  const parts =
    left === null ? ["--", "--", "--"]
    : left >= 86_400 ? [`${Math.floor(left / 86_400)}d`, pad(Math.floor((left % 86_400) / 3600)), pad(Math.floor((left % 3600) / 60))]
    : [pad(Math.floor(left / 3600)), pad(Math.floor((left % 3600) / 60)), pad(left % 60)];
  return (
    <div className="clock" role="timer" aria-label={label}>
      {parts[0]}
      <span>:</span>
      {parts[1]}
      <span>:</span>
      {parts[2]}
    </div>
  );
}
