import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/(auth)/actions";
import { VerifyCode } from "@/components/admin/two-step";
import { AuthShell } from "@/components/shell/auth-shell";
import { needsSecondFactor, requireMember } from "@/lib/auth";
import { safeNext } from "@/lib/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("mfa_verifyTitle") };
}

/** Second sign-in step for admins who turned on an authenticator app. */
export default async function VerifyPage({ searchParams }: PageProps<"/auth/verify">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null, "/admin");
  await requireMember(`/auth/verify?next=${encodeURIComponent(next)}`);
  if (!(await needsSecondFactor())) redirect(next);
  const t = await getTranslations();
  return (
    <AuthShell>
      <div>
        <h1>{t("mfa_verifyTitle")}</h1>
        <p className="lead">{t("mfa_verifyLead")}</p>
      </div>
      <VerifyCode next={next} />
      <form action={signOut}>
        <button type="submit" className="btn btn-quiet btn-block">
          {t("signOut")}
        </button>
      </form>
    </AuthShell>
  );
}
