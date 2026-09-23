import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LogIn } from "lucide-react";
import { AuthShell } from "@/components/shell/auth-shell";
import { SubmitButton } from "@/components/ui/submit-button";
import { ButtonLink } from "@/components/ui/button";
import { confirmLink } from "../../actions";
import { safeNext } from "@/lib/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("confirm_title"), referrer: "no-referrer" };
}

/**
 * Landing page for emailed sign-in and reset links. Opening it does nothing on its own:
 * mail scanners that pre-open links cannot use the one-time token, only the button can.
 */
export default async function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const t = await getTranslations();
  const tokenHash = one(sp.token_hash);
  const type = one(sp.type) === "recovery" ? "recovery" : "email";
  return (
    <AuthShell>
      <span className="state-icon" style={{ background: "var(--orange-soft)", color: "var(--orange-ink)" }}>
        <LogIn className="icon" aria-hidden="true" />
      </span>
      <div>
        <h1>{type === "recovery" ? t("reset_title") : t("confirm_title")}</h1>
        <p className="lead">{t("confirm_lead")}</p>
      </div>
      {tokenHash ? (
        <form action={confirmLink} className="stack">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={safeNext(one(sp.next))} />
          <SubmitButton>{type === "recovery" ? t("mail_reset_cta") : t("confirm_button")}</SubmitButton>
        </form>
      ) : (
        <ButtonLink href="/login" variant="ghost" block>
          {t("back_to_login")}
        </ButtonLink>
      )}
    </AuthShell>
  );
}
