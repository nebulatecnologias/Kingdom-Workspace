import { Clock, Link2, Unlink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/button";
import { RequestLinkForm } from "./request-link-form";

/** Expired / already used / no longer valid link, always with a way to get a new one. */
export async function LinkState({ kind, email }: { kind: "expired" | "used" | "invalid"; email?: string }) {
  const t = await getTranslations();
  const copy = {
    expired: { title: t("exp_title"), lead: t("exp_lead"), Icon: Clock, bg: "var(--amber-soft)", fg: "var(--amber-ink)" },
    used: { title: t("used_title"), lead: t("used_lead"), Icon: Link2, bg: "var(--violet-soft)", fg: "var(--violet-ink)" },
    invalid: { title: t("invalid_title"), lead: t("invalid_lead"), Icon: Unlink, bg: "var(--sunken)", fg: "var(--muted)" },
  }[kind];
  return (
    <>
      <span className="state-icon" style={{ background: copy.bg, color: copy.fg }}>
        <copy.Icon className="icon" aria-hidden="true" />
      </span>
      <div>
        <h1>{copy.title}</h1>
        <p className="lead">{copy.lead}</p>
      </div>
      <RequestLinkForm defaultEmail={kind === "expired" ? email : ""} />
      <ButtonLink href="/login" variant="ghost" block>
        {t("goSignIn")}
      </ButtonLink>
    </>
  );
}
