import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/shell/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { Notice } from "@/components/ui/notice";
import { getProfile } from "@/lib/auth";
import { homeFor, safeNext } from "@/lib/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("login_title") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  // Without an explicit destination, sign-in sends admins to the admin area and members to their library.
  const next = one(sp.next) ? safeNext(one(sp.next)) : "";
  const profile = await getProfile();
  if (profile?.status === "active") redirect(next || homeFor(profile.role));
  const t = await getTranslations();
  return (
    <AuthShell>
      {one(sp.error) === "link" ? <Notice tone="warn">{t("err_link")}</Notice> : null}
      {one(sp.notice) === "account_exists" ? <Notice tone="info">{t("account_exists")}</Notice> : null}
      {one(sp.notice) === "deleted" ? <Notice tone="ok">{t("account_deleted")}</Notice> : null}
      <LoginForm next={next} defaultEmail={one(sp.email) ?? ""} />
      <div className="or" />
      <p style={{ textAlign: "center", fontSize: 14 }} className="muted">
        {t("login_noAccount")} <Link href="/access">{t("login_getLink")}</Link>
      </p>
    </AuthShell>
  );
}
