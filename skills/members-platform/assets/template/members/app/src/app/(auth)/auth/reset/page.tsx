import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/shell/auth-shell";
import { ResetForm } from "@/components/auth/reset-form";
import { requireMember } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("reset_title") };
}

export default async function ResetPage() {
  await requireMember("/auth/reset");
  const t = await getTranslations();
  return (
    <AuthShell>
      <div>
        <h1>{t("reset_title")}</h1>
        <p className="lead">{t("reset_lead")}</p>
      </div>
      <ResetForm />
    </AuthShell>
  );
}
