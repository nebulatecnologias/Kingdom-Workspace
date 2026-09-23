import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mail, MessageCircle } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("nav_help") };
}

export default async function HelpPage() {
  const t = await getTranslations();
  const whatsapp = process.env.SUPPORT_WHATSAPP;
  const email = process.env.SUPPORT_EMAIL;
  const whatsappDigits = whatsapp?.replace(/\D/g, "");
  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("help_title")}</h1>
          <p>{t("help_lead")}</p>
        </div>
      </div>
      <div className="stack" style={{ maxWidth: 560 }}>
        <div className="bought">
          <span className="mini" style={{ background: "var(--green-soft)", color: "var(--green-ink)" }}>
            <MessageCircle className="icon" aria-hidden="true" />
          </span>
          <div>
            <span className="hint">{t("help_whatsapp")}</span>
            <b style={{ display: "block", fontWeight: 500 }}>
              {whatsappDigits ? <a href={`https://wa.me/${whatsappDigits}`}>{whatsapp}</a> : t("help_placeholder")}
            </b>
          </div>
        </div>
        <div className="bought">
          <span className="mini" style={{ background: "var(--orange-soft)", color: "var(--orange-ink)" }}>
            <Mail className="icon" aria-hidden="true" />
          </span>
          <div>
            <span className="hint">{t("help_email")}</span>
            <b style={{ display: "block", fontWeight: 500 }}>
              {email ? <a href={`mailto:${email}`}>{email}</a> : t("help_placeholder")}
            </b>
          </div>
        </div>
      </div>
    </>
  );
}
