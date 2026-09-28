/** Date helpers for the admin tables, shared by server and client components. */

const DAY = 86_400_000;

/** "12 Sep" in the viewer's language. */
export function shortDate(iso: string | Date, intlTag: string) {
  return new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "short", timeZone: "Africa/Johannesburg" }).format(new Date(iso));
}

/** "14:05" or "12 Sep, 14:05" when not today. */
export function timeOrDate(iso: string, intlTag: string, now = new Date()) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat(intlTag, {
    ...(sameDay ? {} : { day: "numeric", month: "short" }),
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Johannesburg",
  }).format(d);
}

/** "today", "yesterday", "3 days ago", "2 months ago". */
export function relativeDays(iso: string | null, intlTag: string, now = new Date()) {
  if (!iso) return null;
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);
  const rtf = new Intl.RelativeTimeFormat(intlTag, { numeric: "auto" });
  if (days < 30) return rtf.format(-Math.max(0, days), "day");
  if (days < 365) return rtf.format(-Math.floor(days / 30), "month");
  return rtf.format(-Math.floor(days / 365), "year");
}

/** Time left as "5 days" (two days or more) or "7 h 05 min". Days come from the caller's translations. */
export function timeLeft(iso: string, daysLabel: (n: number) => string, now = new Date()) {
  const ms = new Date(iso).getTime() - now.getTime();
  const hours = Math.max(0, ms / 3_600_000);
  if (hours >= 48) return daysLabel(Math.round(hours / 24));
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;
}

/** True when the date is less than a day away (shown in red). */
export function withinADay(iso: string, now = new Date()) {
  return new Date(iso).getTime() - now.getTime() < 86_400_000;
}

/** Whole days since the date. */
export function daysSince(iso: string, now = new Date()) {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000;
}
