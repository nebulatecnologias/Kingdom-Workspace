import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/shell/auth-shell";
import { Notice } from "@/components/ui/notice";
import { confirmUnsubscribe } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("unsub_title"), robots: { index: false } };
}

/**
 * The "stop" link in the monthly email. Opening it does not unsubscribe (link scanners open every link);
 * the button does. No sign-in needed: the token in the link is the key.
 */
export default async function UnsubscribePage({ searchParams }: PageProps<"/unsubscribe">) {
  const sp = await searchParams;
  const t = await getTranslations();
  const token = typeof sp.t === "string" ? sp.t.slice(0, 64) : "";
  return (
    <AuthShell>
      <div>
        <h1>{t("unsub_title")}</h1>
        {sp.done ? null : <p className="lead">{t("unsub_lead")}</p>}
      </div>
      {sp.done ? (
        <Notice tone="ok">{t("unsub_done")}</Notice>
      ) : sp.invalid || !token ? (
        <Notice tone="warn">{t("unsub_invalid")}</Notice>
      ) : (
        <form action={confirmUnsubscribe}>
          <input type="hidden" name="t" value={token} />
          <button type="submit" className="btn btn-primary btn-block">
            {t("unsub_confirm")}
          </button>
        </form>
      )}
      <p className="hint">
        {t.rich("unsub_profile", { link: (c) => <Link href="/profile">{c}</Link> })}
      </p>
    </AuthShell>
  );
}
