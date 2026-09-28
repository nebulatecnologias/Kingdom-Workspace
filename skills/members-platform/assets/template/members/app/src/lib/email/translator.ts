import { createTranslator } from "use-intl/core";
import en from "../../../messages/en.json";
import pt from "../../../messages/pt.json";
import es from "../../../messages/es.json";
import { intlLocale, type Locale } from "@/i18n/config";

const catalogues = { en, pt, es };

/** Translator for code that runs outside a request's locale (emails are sent in the recipient's language). */
export function translatorFor(locale: Locale) {
  return createTranslator({ locale: intlLocale[locale], messages: catalogues[locale] });
}
