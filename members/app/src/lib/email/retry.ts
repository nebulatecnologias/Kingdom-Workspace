import "server-only";
import { isLocale } from "@/i18n/config";
import { issueInvite } from "@/lib/invites";
import { createAdminClient } from "@/lib/supabase/admin";
import { deliverViaResend, nextAttemptAt } from "./send";

/**
 * Sends again the emails that failed and are due (email_log.next_attempt_at <= now).
 * Runs from the daily maintenance cron and after each gateway webhook, so retries happen soon when there is traffic.
 */
export async function retryFailedEmails(limit = 20) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { tried: 0, sent: 0 };

  const admin = createAdminClient();
  const { data: due } = await admin
    .from("email_log")
    .select("id, to_email, template, attempts, payload")
    .eq("status", "failed")
    .not("next_attempt_at", "is", null)
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at")
    .limit(limit);

  let tried = 0;
  let sent = 0;
  for (const row of due ?? []) {
    // Claim the row first, so two overlapping runs never send the same email twice.
    const { data: claimed } = await admin
      .from("email_log")
      .update({ next_attempt_at: null })
      .eq("id", row.id)
      .not("next_attempt_at", "is", null)
      .select("id");
    if (!claimed?.length) continue;
    tried++;
    const attempt = row.attempts + 1;

    if (row.template === "unlocked") {
      const payload = row.payload as { subject?: string; html?: string; text?: string } | null;
      if (!payload?.subject || !payload.html || !payload.text) {
        await admin.from("email_log").update({ last_error: "content missing: not retried" }).eq("id", row.id);
        continue;
      }
      try {
        const providerId = await deliverViaResend(apiKey, row.to_email, { subject: payload.subject, html: payload.html, text: payload.text });
        await admin
          .from("email_log")
          .update({ status: "sent", provider_id: providerId, attempts: attempt, last_error: null, payload: { subject: payload.subject } })
          .eq("id", row.id);
        sent++;
      } catch (e) {
        await admin
          .from("email_log")
          .update({ attempts: attempt, last_error: e instanceof Error ? e.message : String(e), next_attempt_at: nextAttemptAt(attempt) })
          .eq("id", row.id);
      }
      continue;
    }

    if (row.template === "invite") {
      // The old link was never stored: issue a fresh one (same products) and log it as a new email.
      const { data: invite } = await admin
        .from("invites")
        .select("locale")
        .eq("email", row.to_email)
        .in("status", ["sent", "opened", "expired"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!invite) {
        await admin.from("email_log").update({ last_error: "invite no longer pending: not retried" }).eq("id", row.id);
        continue;
      }
      const { emailed } = await issueInvite({
        email: row.to_email,
        locale: isLocale(invite.locale) ? invite.locale : "en",
        productIds: [],
        source: "gateway",
        emailAttempt: attempt,
      });
      await admin.from("email_log").update({ last_error: `retried as a new email (attempt ${attempt})` }).eq("id", row.id);
      if (emailed) sent++;
    }
  }
  return { tried, sent };
}
