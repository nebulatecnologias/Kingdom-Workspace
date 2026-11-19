// Dates are stored as timestamptz and always shown in Africa/Maputo (UTC+2, no DST). Pure helpers: "now"
// is passed in, so render code stays pure and tests are deterministic.
export const TZ = "Africa/Maputo";
const OFFSET = "+02:00";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** YYYY-MM-DD of an instant in Maputo. */
export const dayKey = (iso: string | Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
export const addDays = (key: string, n: number) => {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const mondayOf = (key: string) => {
  const d = new Date(key + "T00:00:00Z");
  return addDays(key, -((d.getUTCDay() + 6) % 7));
};
export const isDayKey = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

export const fmtTime = (iso: string) => new Intl.DateTimeFormat("pt-PT", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
export const fmtDay = (key: string, opts: Intl.DateTimeFormatOptions) =>
  cap(new Intl.DateTimeFormat("pt-PT", { timeZone: "UTC", ...opts }).format(new Date(key + "T00:00:00Z")));
export const fmtDayLong = (key: string) => fmtDay(key, { weekday: "long", day: "numeric", month: "long" });
export const fmtDayShort = (key: string) => fmtDay(key, { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
export const fmtDate = (iso: string) => fmtDay(dayKey(iso), { day: "numeric", month: "short" }).replace(/\./g, "");
export const fmtDateFull = (key: string) => fmtDay(key, { day: "numeric", month: "long", year: "numeric" });
export const fmtDateTime = (iso: string) => `${fmtDayShort(dayKey(iso))} · ${fmtTime(iso)}`;
export const fmtMonth = (key: string) => fmtDay(key, { month: "long", year: "numeric" });
export const fmtWeekday = (key: string) => fmtDay(key, { weekday: "short" }).replace(".", "").slice(0, 3);
export const fmtMoney = (cents: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "MZN", maximumFractionDigits: 0 }).format(cents / 100);
export const fmtDuration = (m: number) => (m < 60 ? `${m} min` : m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)} h ${m % 60}`);
export const minutesDiff = (a: string | Date, b: string | Date) => Math.round((new Date(a).getTime() - new Date(b).getTime()) / 60000);
export const relFromNow = (iso: string, now: Date) => {
  const m = minutesDiff(iso, now);
  return m < 0 ? `há ${fmtDuration(-m)}` : `em ${fmtDuration(m)}`;
};
export const hourOf = (iso: string | Date) =>
  Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(new Date(iso)));
export const periodOf = (iso: string): "morning" | "afternoon" | "evening" => {
  const h = hourOf(iso);
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
};
export const greeting = (now: Date) => {
  const h = hourOf(now);
  return h < 12 ? "Bom dia" : h < 19 ? "Boa tarde" : "Boa noite";
};
export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
export const firstName = (name: string) => name.split(" ")[0];

/** "HH:MM" of an instant in Maputo, for <input type="time">. */
export const localTime = (iso: string) => fmtTime(iso);
/** Maputo wall-clock date + time -> ISO instant. */
export const toIso = (date: string, time?: string | null) => new Date(`${date}T${time || "00:00"}:00${OFFSET}`).toISOString();
