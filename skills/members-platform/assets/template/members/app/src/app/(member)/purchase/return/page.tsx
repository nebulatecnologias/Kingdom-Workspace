import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CircleX } from "lucide-react";
import { UnlockWaiter } from "@/components/purchase/unlock-waiter";
import { COMPANY } from "@/content/legal";
import { toLocale } from "@/i18n/config";
import { requireMember } from "@/lib/auth";
import { getLibrary } from "@/lib/catalogue";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("pr_waiting_title") };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_PAID = ["cancelled", "canceled", "failed", "abandoned"];

/**
 * Where the gateway sends the member back after the checkout started by a padlock (plan 3.4).
 * The payment is confirmed only by the gateway's webhook; this page waits for it and then opens the product.
 * If the gateway says the payment did not go through (?status=cancelled|failed), it offers to try again.
 */
export default async function PurchaseReturnPage({ searchParams }: PageProps<"/purchase/return">) {
  const sp = await searchParams;
  const productId = typeof sp.product === "string" && UUID.test(sp.product) ? sp.product : null;
  await requireMember(productId ? `/purchase/return?product=${productId}` : "/library");
  if (!productId) redirect("/library");

  const t = await getTranslations();
  const item = (await getLibrary(toLocale(await getLocale()))).find((p) => p.id === productId);
  if (!item) redirect("/library");
  if (item.owned) redirect(`/products/${item.slug}?unlocked=1`);

  const status = typeof sp.status === "string" ? sp.status.toLowerCase() : "";
  const card = (children: React.ReactNode) => (
    <section className="card card-pad" style={{ maxWidth: 520, margin: "32px auto 0", padding: "36px 28px" }}>
      {children}
    </section>
  );

  if (NOT_PAID.includes(status)) {
    return card(
      <div className="stack" style={{ gap: 18, justifyItems: "center", textAlign: "center" }}>
        <span className="state-icon" style={{ background: "var(--red-soft)", color: "var(--red-ink)" }}>
          <CircleX className="icon" aria-hidden="true" />
        </span>
        <div className="stack" style={{ gap: 8 }}>
          <h1 style={{ fontSize: 26 }}>{t("pr_cancel_title")}</h1>
          <p className="muted">{t("pr_cancel_lead", { title: item.title })}</p>
        </div>
        <div className="actions" style={{ justifyContent: "center", marginTop: 0 }}>
          <a className="btn btn-primary" href={`/api/checkout/${item.id}`}>
            {t("pr_try_again")}
          </a>
          <Link className="btn btn-ghost" href={`/products/${item.slug}`}>
            {t("pr_back_product")}
          </Link>
        </div>
      </div>,
    );
  }

  return card(<UnlockWaiter productId={item.id} slug={item.slug} title={item.title} supportEmail={process.env.SUPPORT_EMAIL || COMPANY.email} />);
}
