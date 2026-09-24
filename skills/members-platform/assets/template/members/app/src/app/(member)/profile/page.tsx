import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Check, Globe, KeyRound, ShieldCheck } from "lucide-react";
import { LanguageChoice, NameForm, PasswordForm, PrivacyActions } from "@/components/profile/profile-forms";
import { requireMember } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("prof_title") };
}

export default async function ProfilePage() {
  const profile = await requireMember("/profile");
  const t = await getTranslations();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("prof_title")}</h1>
          <p>{t("prof_lead")}</p>
        </div>
      </div>
      <div className="stack" style={{ maxWidth: 760 }}>
        <section className="card card-pad stack" aria-labelledby="pf-details">
          <h2 className="card-title" id="pf-details">
            {t("prof_details")}
          </h2>
          <NameForm name={profile.fullName} email={profile.email} />
        </section>

        <section className="card card-pad stack" aria-labelledby="pf-lang">
          <div>
            <h2 className="card-title" id="pf-lang">
              <Globe className="icon" aria-hidden="true" />
              {t("prof_lang")}
            </h2>
            <p className="muted" style={{ marginTop: 4 }}>
              {t("prof_langLead")}
            </p>
          </div>
          <LanguageChoice current={profile.locale} />
        </section>

        <section className="card card-pad stack" aria-labelledby="pf-signin">
          <h2 className="card-title" id="pf-signin">
            <KeyRound className="icon" aria-hidden="true" />
            {t("prof_signin")}
          </h2>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
            <div>
              <b style={{ fontWeight: 500 }}>{t("prof_link")}</b>
              <p className="muted" style={{ fontSize: 14 }}>
                {t("prof_linkP")}
              </p>
            </div>
            <span className="pill pill-soft-green">
              <Check className="icon icon-sm" aria-hidden="true" />
              {t("active")}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <b style={{ fontWeight: 500 }}>{t("prof_pw")}</b>
              <p className="muted" style={{ fontSize: 14 }}>
                {t("prof_pwP")}
              </p>
            </div>
            <PasswordForm />
          </div>
        </section>

        <section className="card card-pad stack" aria-labelledby="pf-privacy">
          <div>
            <h2 className="card-title" id="pf-privacy">
              <ShieldCheck className="icon" aria-hidden="true" />
              {t("prof_privacy")}
            </h2>
            <p className="muted" style={{ marginTop: 4, maxWidth: "60ch" }}>
              {t("prof_privacyP")}
            </p>
          </div>
          <PrivacyActions />
        </section>
      </div>
    </>
  );
}
