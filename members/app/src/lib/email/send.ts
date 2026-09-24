import "server-only";
import type { Locale } from "@/i18n/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RenderedEmail } from "./templates";

export type EmailTemplate = "invite" | "signin" | "reset" | "unlocked" | "alert";

/**
 * Failed emails that are worth sending again, and when. Sign-in and reset links are not retried:
 * they expire in 15 minutes and the person can simply ask again.
 * Invites are retried by issuing a fresh link (the old link is never stored); "unlocked" emails hold no
 * secret, so their content is kept and sent again as is.
 */
export const RETRYABLE: ReadonlySet<EmailTemplate> = new Set(["invite", "unlocked"]);
export const RETRY_DELAYS_MINUTES = [5, 30, 120, 360, 1440];

export function nextAttemptAt(attempt: number, now = Date.now()) {
  const delay = RETRY_DELAYS_MINUTES[attempt - 1];
  return delay === undefined ? null : new Date(now + delay * 60_000).toISOString();
}

/**
 * Without RESEND_API_KEY (local development, CI, previews) emails are not sent: they are stored in
 * email_log with the link so the dev mailbox page and end-to-end tests can open them. With a key,
 * emails go out through Resend and only non-sensitive metadata is logged (never the link).
 */
export function devMailboxEnabled() {
  return !process.env.RESEND_API_KEY && (process.env.NODE_ENV !== "production" || process.env.KM_DEV_MAILBOX === "true");
}

/** Sends one email through the Resend HTTP API. Throws with Resend's message on failure. */
export async function deliverViaResend(apiKey: string, to: string, email: Pick<RenderedEmail, "subject" | "html" | "text">) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "Kingdom Library <hello@example.com>",
      to: [to],
      reply_to: process.env.EMAIL_REPLY_TO || undefined,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!res.ok) throw new Error(body.message ?? `Resend responded ${res.status}`);
  return body.id ?? null;
}

/** What is kept in email_log.payload. Links are kept only in dev-mailbox mode, where nothing is really sent. */
function logPayload(template: EmailTemplate, email: RenderedEmail) {
  return template === "unlocked"
    ? { subject: email.subject, html: email.html, text: email.text }
    : { subject: email.subject };
}

export async function sendEmail(opts: {
  to: string;
  template: EmailTemplate;
  locale: Locale;
  email: RenderedEmail;
  link?: string;
  /** 1 for the first try; the retry job passes the running count so the backoff schedule ends. */
  attempt?: number;
}): Promise<{ ok: boolean }> {
  const admin = createAdminClient();
  const apiKey = process.env.RESEND_API_KEY;
  const attempt = opts.attempt ?? 1;
  const retryAt = RETRYABLE.has(opts.template) ? nextAttemptAt(attempt) : null;

  if (!apiKey && !devMailboxEnabled()) {
    console.error("RESEND_API_KEY is not set: email not sent");
    await admin.from("email_log").insert({
      to_email: opts.to, template: opts.template, locale: opts.locale, status: "failed", attempts: attempt,
      last_error: "RESEND_API_KEY missing", next_attempt_at: retryAt, payload: logPayload(opts.template, opts.email),
    });
    return { ok: false };
  }

  if (!apiKey) {
    const { error } = await admin.from("email_log").insert({
      to_email: opts.to,
      template: opts.template,
      locale: opts.locale,
      status: "sent",
      provider_id: "dev-mailbox",
      attempts: attempt,
      payload: { subject: opts.email.subject, html: opts.email.html, link: opts.link ?? null },
    });
    if (error) console.error("email_log insert failed", error.message);
    if (process.env.NODE_ENV !== "test") console.info(`[dev mailbox] ${opts.template} -> ${opts.to}: ${opts.link ?? ""}`);
    return { ok: !error };
  }

  const { data: row } = await admin
    .from("email_log")
    .insert({ to_email: opts.to, template: opts.template, locale: opts.locale, status: "queued", payload: logPayload(opts.template, opts.email) })
    .select("id")
    .single();

  try {
    const providerId = await deliverViaResend(apiKey, opts.to, opts.email);
    // Once delivered, the content is no longer needed: keep only the subject.
    if (row)
      await admin
        .from("email_log")
        .update({ status: "sent", provider_id: providerId, attempts: attempt, payload: { subject: opts.email.subject } })
        .eq("id", row.id);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("email send failed", message);
    if (row)
      await admin
        .from("email_log")
        .update({ status: "failed", attempts: attempt, last_error: message, next_attempt_at: retryAt })
        .eq("id", row.id);
    return { ok: false };
  }
}
