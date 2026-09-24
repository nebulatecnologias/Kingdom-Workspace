import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/shell/auth-shell";
import { RequestLinkForm } from "@/components/auth/request-link-form";
import { ButtonLink } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("access_title") };
}

export default async function AccessPage() {
  const t = await getTranslations();
  return (
    <AuthShell>
      <div>
        <h1>{t("access_title")}</h1>
        <p className="lead">{t("access_lead")}</p>
      </div>
      <RequestLinkForm />
      <ButtonLink href="/login" variant="ghost" block>
        {t("goSignIn")}
      </ButtonLink>
    </AuthShell>
  );
}
