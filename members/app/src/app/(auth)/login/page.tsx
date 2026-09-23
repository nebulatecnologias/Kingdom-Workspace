import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/shell/auth-shell";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("login_title") };
}

// Phase 0: layout only. Email-link and password sign-in arrive in Phase 1.
export default async function LoginPage() {
  const t = await getTranslations();
  return (
    <AuthShell>
      <div>
        <h1>{t("login_title")}</h1>
        <p className="lead">{t("login_lead")}</p>
      </div>
      <ButtonLink href="/library" variant="ghost" block>
        {t("pack_backLib")}
      </ButtonLink>
    </AuthShell>
  );
}
