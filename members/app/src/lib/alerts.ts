import "server-only";
import { isLocale, type Locale } from "@/i18n/config";
import { renderAlertEmail } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { hasIssues, healthIssues, type HealthIssues } from "@/lib/health";
import { allow } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/request";
import { createAdminClient } from "@/lib/supabase/admin";

export type AlertKind = "webhook_error" | "unknown_product" | "daily";

/**
 * Emails every active administrator about something that needs a person. At most one email per kind
 * per hour (the daily summary once a day), so a burst of failures never floods their inbox.
 */
export async function alertAdmins(kind: AlertKind, details: string[]) {
  try {
    if (!(await allow(kind === "daily" ? "alertDaily" : "alert", kind))) return false;
    const db = createAdminClient();
    const { data: admins } = await db.from("profiles").select("email, full_name, locale").eq("role", "admin").eq("status", "active");
    for (const a of admins ?? []) {
      const locale: Locale = isLocale(a.locale) ? a.locale : "en";
      await sendEmail({
        to: a.email,
        template: "alert",
        locale,
        email: renderAlertEmail({ locale, siteUrl: siteUrl(), kind, name: (a.full_name || "").split(" ")[0], details }),
      });
    }
    return true;
  } catch (e) {
    console.error("alertAdmins failed", kind, e);
    return false;
  }
}

/** The lines of the daily summary, in plain words (also used on the admin overview). */
export function describeIssues(h: HealthIssues) {
  const lines: string[] = [];
  if (h.webhookErrors) lines.push(`webhook_errors:${h.webhookErrors}`);
  if (h.badSignatures) lines.push(`bad_signatures:${h.badSignatures}`);
  if (h.emailsGivenUp) lines.push(`emails_given_up:${h.emailsGivenUp}`);
  if (h.unknownProducts.length) lines.push(`unknown_products:${h.unknownProducts.join(", ")}`);
  return lines;
}

/** Daily check (from the maintenance cron): emails the admins a summary when something went wrong in the last day. */
export async function dailyHealthCheck() {
  const h = await healthIssues(createAdminClient(), 24);
  if (!hasIssues(h)) return { issues: h, alerted: false };
  return { issues: h, alerted: await alertAdmins("daily", describeIssues(h)) };
}
