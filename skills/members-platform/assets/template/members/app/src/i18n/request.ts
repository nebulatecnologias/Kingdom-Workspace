import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { intlLocale, LOCALE_COOKIE, resolveLocale } from "./config";

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveLocale({
    cookie: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  return {
    locale: intlLocale[locale],
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "Africa/Johannesburg",
  };
});
