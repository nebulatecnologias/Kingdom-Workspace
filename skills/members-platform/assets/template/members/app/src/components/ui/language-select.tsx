"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales, localeNames, toLocale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";

export function LanguageSelect({ id = "lang" }: { id?: string }) {
  const t = useTranslations();
  const current = toLocale(useLocale());
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <>
      <label className="sr" htmlFor={id}>
        {t("language")}
      </label>
      <select
        id={id}
        className="select lang-select"
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(async () => {
            await setLocale(next);
            router.refresh();
          });
        }}
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {localeNames[l]}
          </option>
        ))}
      </select>
    </>
  );
}
