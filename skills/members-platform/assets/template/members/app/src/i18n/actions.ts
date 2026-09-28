"use server";

import { cookies } from "next/headers";
import { hasSupabase } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { isLocale, LOCALE_COOKIE } from "./config";

/**
 * Stores the chosen interface language for one year. For a signed-in member it is also saved on the
 * profile, which decides the language of every email we send them.
 */
export async function setLocale(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  if (!hasSupabase()) return;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) await supabase.from("profiles").update({ locale }).eq("id", data.user.id);
}
