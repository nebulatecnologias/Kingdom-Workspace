import "server-only";
import type { Locale } from "@/i18n/config";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RenderedEmail } from "./templates";

/**
 * Without RESEND_API_KEY (local development, CI, previews) emails are not sent: they are stored in
 * email_log with the link so the dev mailbox page and end-to-end tests can open them. With a key,
 * emails go out through Resend and only non-sensitive metadata is logged (never the link).
 */
export function devMailboxEnabled() {
  return !process.env.RESEND_API_KEY && (process.env.NODE_ENV !== "production" || process.env.KM_DEV_MAILBOX === "true");
}

export async function sendEmail(opts: {
  to: string;
  template: "invite" | "signin" | "reset" | "unlocked";
  locale: Locale;
  email: RenderedEmail;
  link?: string;
}): Promise<{ ok: boolean }> {
  const admin = createAdminClient();
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey && !devMailboxEnabled()) {
    console.error("RESEND_API_KEY is not set: email not sent");
    await admin.from("email_log").insert({
      to_email: opts.to, template: opts.template, locale: opts.locale, status: "failed",
      last_error: "RESEND_API_KEY missing", payload: { subject: opts.email.subject },
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
      attempts: 1,
      payload: { subject: opts.email.subject, html: opts.email.html, link: opts.link ?? null },
    });
    if (error) console.error("email_log insert failed", error.message);
    if (process.env.NODE_ENV !== "test") console.info(`[dev mailbox] ${opts.template} -> ${opts.to}: ${opts.link ?? ""}`);
    return { ok: !error };
  }

  const { data: row } = await admin
    .from("email_log")
    .insert({ to_email: opts.to, template: opts.template, locale: opts.locale, status: "queued", payload: { subject: opts.email.subject } })
    .select("id")
    .single();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Kingdom Members <hello@example.com>",
        to: [opts.to],
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        subject: opts.email.subject,
        html: opts.email.html,
        text: opts.email.text,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) throw new Error(body.message ?? `Resend responded ${res.status}`);
    if (row) await admin.from("email_log").update({ status: "sent", provider_id: body.id ?? null, attempts: 1 }).eq("id", row.id);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("email send failed", message);
    if (row)
      await admin
        .from("email_log")
        .update({ status: "failed", attempts: 1, last_error: message, next_attempt_at: new Date(Date.now() + 5 * 60_000).toISOString() })
        .eq("id", row.id);
    return { ok: false };
  }
}
