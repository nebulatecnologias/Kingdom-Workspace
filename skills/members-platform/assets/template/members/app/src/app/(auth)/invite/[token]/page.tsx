import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { AuthShell } from "@/components/shell/auth-shell";
import { InviteForm } from "@/components/auth/invite-form";
import { LinkState } from "@/components/auth/link-state";
import { findInvite, markInviteOpened } from "@/lib/invites";
import { createAdminClient } from "@/lib/supabase/admin";
import { toLocale } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("inv_title"), referrer: "no-referrer" };
}

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  const t = await getTranslations();
  const found = await findInvite(token);

  if (found.state !== "valid" || !found.invite) {
    return (
      <AuthShell>
        <LinkState kind={found.state === "valid" ? "invalid" : found.state} email={found.invite?.email} />
      </AuthShell>
    );
  }

  const invite = found.invite;
  await markInviteOpened(invite.id);
  const intl = await getLocale();
  const locale = toLocale(intl);
  const { data: titles } = await createAdminClient()
    .from("product_translations")
    .select("product_id, locale, title")
    .in("product_id", invite.productIds.length ? invite.productIds : ["00000000-0000-0000-0000-000000000000"])
    .in("locale", [locale, "en"]);
  const productTitles = invite.productIds
    .map((id) => titles?.find((r) => r.product_id === id && r.locale === locale)?.title ?? titles?.find((r) => r.product_id === id)?.title)
    .filter(Boolean);
  const expires = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" }).format(new Date(invite.expiresAt));

  return (
    <AuthShell>
      <div>
        <h1>{t("inv_title")}</h1>
        <p className="lead">{t("inv_lead")}</p>
      </div>
      {productTitles.length ? (
        <div className="bought">
          <b style={{ display: "block", fontWeight: 500, fontSize: 14.5 }}>{productTitles.join(" + ")}</b>
        </div>
      ) : null}
      <InviteForm token={token} email={invite.email} defaultName={invite.fullName} expiresLabel={t("inv_expires", { date: expires })} />
    </AuthShell>
  );
}
