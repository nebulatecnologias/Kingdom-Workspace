export const locales = ["en", "pt", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "km-locale";

/** BCP 47 tags used for <html lang> and Intl formatting (South African English by default). */
export const intlLocale: Record<Locale, string> = { en: "en-ZA", pt: "pt-PT", es: "es-ES" };

export const localeNames: Record<Locale, string> = { en: "English", pt: "Português", es: "Español" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Maps an Intl tag such as "en-ZA" back to the app locale. */
export function toLocale(tag: string | undefined | null): Locale {
  const base = (tag ?? "").toLowerCase().split("-")[0];
  return isLocale(base) ? base : defaultLocale;
}

/**
 * Picks the interface language: the member's saved preference, then the cookie set by the
 * language switch, then the browser's Accept-Language header, then English.
 */
export function resolveLocale(input: {
  profile?: string | null;
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(input.profile)) return input.profile;
  if (isLocale(input.cookie)) return input.cookie;
  const ranked = (input.acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag, q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
