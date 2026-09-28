import "server-only";
import { isLocale } from "@/i18n/config";
import { renderCurationEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { siteUrl } from "@/lib/request";
import { isSphere } from "@/lib/spheres";
import { createAdminClient } from "@/lib/supabase/admin";

/** First day of the month of `now`, in UTC ("2026-10-01"). */
export function monthOf(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

type Sub = { user_id: string; spheres: string[]; token: string; profile: { email: string; full_name: string; locale: string; status: string } | null };

/**
 * Monthly picks. Runs every day with the daily job; each subscriber gets one email per calendar month,
 * starting the month after they subscribed. A run sends at most `limit` emails; the rest follow the next day.
 */
export async function sendMonthlyCuration(limit = 50, now = new Date()) {
  const admin = createAdminClient();
  const month = monthOf(now);
  const monthIso = month.toISOString();
  const { data, error } = await admin
    .from("curation_subscriptions")
    .select("user_id, spheres, token, profile:profiles(email, full_name, locale, status)")
    .is("unsubscribed_at", null)
    .lt("subscribed_at", monthIso)
    .or(`last_sent_at.is.null,last_sent_at.lt.${monthIso}`)
    .limit(limit);
  if (error) {
    console.error("curation: listing subscribers failed", error.message);
    return { curated: 0, curationFailed: 0 };
  }
  let curated = 0;
  let curationFailed = 0;
  for (const sub of (data ?? []) as unknown as Sub[]) {
    const profile = sub.profile;
    const record = async (status: "sent" | "failed" | "empty", productIds: string[] = []) => {
      await admin.from("curation_sends").upsert({ user_id: sub.user_id, month: monthIso.slice(0, 10), product_ids: productIds, status }, { onConflict: "user_id,month" });
      // A failure is tried again tomorrow; a sent or empty month is done.
      if (status !== "failed") await admin.from("curation_subscriptions").update({ last_sent_at: now.toISOString() }).eq("user_id", sub.user_id);
    };
    if (!profile || profile.status !== "active") {
      await record("empty");
      continue;
    }
    const locale = isLocale(profile.locale) ? profile.locale : "en";
    const { data: picks } = await admin.rpc("curation_picks", { p_user_id: sub.user_id, p_limit: 4 });
    const rows = (picks ?? []) as { product_id: string; slug: string; owned: boolean }[];
    if (!rows.length) {
      await record("empty");
      continue;
    }
    const ids = rows.map((r) => r.product_id);
    const { data: texts } = await admin.from("product_translations").select("product_id, locale, title").in("product_id", ids).in("locale", [locale, "en"]);
    const title = (id: string) =>
      (texts ?? []).find((x) => x.product_id === id && x.locale === locale)?.title ?? (texts ?? []).find((x) => x.product_id === id)?.title ?? "";
    const email = renderCurationEmail({
      locale,
      siteUrl: siteUrl(),
      name: (profile.full_name || "").split(" ")[0],
      month,
      spheres: sub.spheres.filter(isSphere),
      items: rows.map((r) => ({ title: title(r.product_id), slug: r.slug, owned: r.owned })),
      unsubscribeUrl: `${siteUrl()}/unsubscribe?t=${sub.token}`,
    });
    const sent = await sendEmail({
      to: profile.email,
      template: "curation",
      locale,
      email,
      link: `${siteUrl()}/unsubscribe?t=${sub.token}`,
      headers: {
        "List-Unsubscribe": `<${siteUrl()}/api/unsubscribe?t=${sub.token}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    await record(sent.ok ? "sent" : "failed", ids);
    if (sent.ok) curated++;
    else curationFailed++;
  }
  return { curated, curationFailed };
}

/** Stops the monthly email for the holder of this unsubscribe token. True when the token was valid. */
export async function unsubscribeByToken(token: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return false;
  const admin = createAdminClient();
  const { data } = await admin.from("curation_subscriptions").select("user_id, unsubscribed_at").eq("token", token).maybeSingle();
  if (!data) return false;
  if (!data.unsubscribed_at) await admin.from("curation_subscriptions").update({ unsubscribed_at: new Date().toISOString() }).eq("user_id", data.user_id);
  return true;
}
