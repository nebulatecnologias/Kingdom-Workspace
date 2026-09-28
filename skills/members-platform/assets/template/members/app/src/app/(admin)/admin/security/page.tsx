import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";
import { TwoStepSettings } from "@/components/admin/two-step";
import { adminContext } from "@/lib/admin/context";
import { verifiedFactorId } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("mfa_title") };
}

export default async function SecurityPage() {
  await adminContext("/admin/security");
  const t = await getTranslations();
  const factorId = await verifiedFactorId();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("mfa_title")}</h1>
          <p>{t("mfa_lead")}</p>
        </div>
      </div>
      <section className="card card-pad stack" style={{ maxWidth: 720 }} aria-labelledby="mfa-card">
        <h2 className="card-title" id="mfa-card">
          <ShieldCheck className="icon" aria-hidden="true" />
          {t("mfa_app")}
        </h2>
        <TwoStepSettings factorId={factorId} />
        <p className="hint">{t("mfa_lostPhone")}</p>
      </section>
    </>
  );
}
