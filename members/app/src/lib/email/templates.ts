import { intlLocale, type Locale } from "@/i18n/config";
import { formatZar } from "@/lib/format";
import { translatorFor } from "./translator";

export type RenderedEmail = { subject: string; preview: string; html: string; text: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Shared email layout. Emails are always light and use inline styles and literal colours
 * (email clients ignore CSS variables and most <style> rules).
 */
function layout(opts: {
  locale: Locale;
  siteUrl: string;
  preview: string;
  heading: string;
  greeting: string;
  body: string[];
  extraHtml?: string;
  cta: { label: string; url: string };
  smallPrint: string;
}): string {
  const t = translatorFor(opts.locale);
  const p = (text: string) => `<p style="margin:0 0 16px">${esc(text)}</p>`;
  return `<!doctype html><html lang="${intlLocale[opts.locale]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:#f3f1ee">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ee;padding:28px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #ebe6e0;border-radius:18px;overflow:hidden;font-family:'Google Sans','Product Sans','Segoe UI',Roboto,Arial,sans-serif;color:#3b3732">
<tr><td style="background:#f2570f;background-image:linear-gradient(160deg,#ff8a45,#ee5410);padding:22px 30px">
  <img src="${opts.siteUrl}/email/logo.png" width="34" height="34" alt="" style="vertical-align:middle;border:0;border-radius:8px">
  <span style="vertical-align:middle;margin-left:10px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em">Kingdom Members</span>
</td></tr>
<tr><td style="padding:30px;font-size:15.5px;line-height:1.6">
  <h1 style="margin:0 0 16px;font-size:25px;line-height:1.2;color:#1c1a17;font-weight:500;letter-spacing:-0.02em">${esc(opts.heading)}</h1>
  ${p(opts.greeting)}
  ${opts.body.map(p).join("")}
  ${opts.extraHtml ?? ""}
  <p style="margin:8px 0 20px"><a href="${esc(opts.cta.url)}" style="display:inline-block;background:#f2570f;background-image:linear-gradient(180deg,#ff7f37,#f2570f);color:#ffffff;text-decoration:none;font-weight:500;padding:14px 26px;border-radius:999px">${esc(opts.cta.label)}</a></p>
  ${opts.smallPrint ? `<p style="margin:0 0 16px;font-size:13px;color:#6f6962">${esc(opts.smallPrint)}</p>` : ""}
  <p style="margin:0 0 16px;font-size:12.5px;color:#6f6962">${esc(t("mail_link_fallback"))}<br><a href="${esc(opts.cta.url)}" style="color:#b8400a;word-break:break-all">${esc(opts.cta.url)}</a></p>
  <p style="margin:0 0 16px;padding-top:16px;border-top:1px solid #efe9e2;font-size:14.5px;color:#6f6962">${esc(t("mail_verse"))}</p>
  <p style="margin:0">${esc(t("mail_signoff"))}<br>${esc(t("mail_team"))}</p>
  <p style="margin:12px 0 0;font-size:13px;color:#6f6962">${esc(t("mail_help"))}</p>
</td></tr>
<tr><td style="background:#faf8f5;padding:18px 30px;font-size:12px;line-height:1.6;color:#6f6962">${esc(t("mail_footer"))}</td></tr>
</table></td></tr></table></body></html>`;
}

function textVersion(parts: (string | undefined)[]) {
  return parts.filter(Boolean).join("\n\n");
}

export function renderInviteEmail(opts: {
  locale: Locale;
  siteUrl: string;
  name: string;
  url: string;
  expiresAt: Date;
  productTitles: string[];
}): RenderedEmail {
  const t = translatorFor(opts.locale);
  const date = new Intl.DateTimeFormat(intlLocale[opts.locale], { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg" }).format(opts.expiresAt);
  const greeting = t("mail_hi", { name: opts.name || "" }).replace(/\s+,/, ",");
  const list = opts.productTitles.length
    ? `<p style="margin:0 0 6px;font-size:13px;color:#6f6962">${esc(t("mail_youGot"))}</p><ul style="margin:0 0 16px;padding-left:20px">${opts.productTitles.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
    : "";
  const small = t("mail_invite_expiry", { date });
  return {
    subject: t("mail_subject_invite"),
    preview: t("mail_preview_invite"),
    html: layout({
      locale: opts.locale,
      siteUrl: opts.siteUrl,
      preview: t("mail_preview_invite"),
      heading: t("inv_art_title"),
      greeting,
      body: [t("mail_invite_p1"), t("mail_invite_p2")],
      extraHtml: list,
      cta: { label: t("mail_invite_cta"), url: opts.url },
      smallPrint: small,
    }),
    text: textVersion([greeting, t("mail_invite_p1"), opts.productTitles.map((x) => "- " + x).join("\n"), t("mail_invite_p2"), `${t("mail_invite_cta")}: ${opts.url}`, small]),
  };
}

export function renderSignInEmail(opts: { locale: Locale; siteUrl: string; name: string; url: string }): RenderedEmail {
  const t = translatorFor(opts.locale);
  const greeting = t("mail_hi", { name: opts.name || "" }).replace(/\s+,/, ",");
  return {
    subject: t("mail_subject_link"),
    preview: t("mail_preview_link"),
    html: layout({
      locale: opts.locale,
      siteUrl: opts.siteUrl,
      preview: t("mail_preview_link"),
      heading: t("mail_link_title"),
      greeting,
      body: [t("mail_link_p")],
      cta: { label: t("mail_link_cta"), url: opts.url },
      smallPrint: t("mail_link_note"),
    }),
    text: textVersion([greeting, t("mail_link_p"), `${t("mail_link_cta")}: ${opts.url}`, t("mail_link_note")]),
  };
}

export function renderResetEmail(opts: { locale: Locale; siteUrl: string; name: string; url: string }): RenderedEmail {
  const t = translatorFor(opts.locale);
  const greeting = t("mail_hi", { name: opts.name || "" }).replace(/\s+,/, ",");
  return {
    subject: t("mail_subject_reset"),
    preview: t("mail_preview_reset"),
    html: layout({
      locale: opts.locale,
      siteUrl: opts.siteUrl,
      preview: t("mail_preview_reset"),
      heading: t("mail_reset_title"),
      greeting,
      body: [t("mail_reset_p")],
      cta: { label: t("mail_reset_cta"), url: opts.url },
      smallPrint: t("mail_reset_note"),
    }),
    text: textVersion([greeting, t("mail_reset_p"), `${t("mail_reset_cta")}: ${opts.url}`, t("mail_reset_note")]),
  };
}

/** "New in your library": sent when a purchase unlocks products on an account that already exists. */
export function renderUnlockedEmail(opts: {
  locale: Locale;
  siteUrl: string;
  name: string;
  productTitles: string[];
  orderRef?: string | null;
  amountCents?: number | null;
}): RenderedEmail {
  const t = translatorFor(opts.locale);
  const pack = new Intl.ListFormat(intlLocale[opts.locale], { style: "long", type: "conjunction" }).format(opts.productTitles);
  const greeting = t("mail_hi", { name: opts.name || "" }).replace(/\s+,/, ",");
  const url = `${opts.siteUrl}/library?lang=${opts.locale}`;
  const order = opts.orderRef
    ? t("mail_order", { ref: opts.orderRef, amount: formatZar(opts.amountCents ?? 0, intlLocale[opts.locale]) })
    : "";
  return {
    subject: t("mail_subject_unlocked", { pack }),
    preview: t("mail_preview_unlocked"),
    html: layout({
      locale: opts.locale,
      siteUrl: opts.siteUrl,
      preview: t("mail_preview_unlocked"),
      heading: t("mail_unlocked_title", { pack }),
      greeting,
      body: [t("mail_unlocked_p", { pack })],
      cta: { label: t("mail_unlocked_cta"), url },
      smallPrint: order,
    }),
    text: textVersion([greeting, t("mail_unlocked_p", { pack }), `${t("mail_unlocked_cta")}: ${url}`, order]),
  };
}

const ALERT_LINES = {
  webhook_errors: "mail_alert_webhook_errors",
  webhook_error_event: "mail_alert_webhook_error_event",
  bad_signatures: "mail_alert_bad_signatures",
  emails_given_up: "mail_alert_emails_given_up",
  unknown_products: "mail_alert_unknown_products",
} as const;

/**
 * Alert for administrators. `details` are "code:value" lines (e.g. "webhook_errors:3"), written out in the
 * admin's language here so the email stays readable without knowing the codes.
 */
export function renderAlertEmail(opts: { locale: Locale; siteUrl: string; kind: "webhook_error" | "unknown_product" | "daily"; name: string; details: string[] }): RenderedEmail {
  const t = translatorFor(opts.locale);
  const heading = t(`mail_alert_title_${opts.kind}`);
  const lines = opts.details.flatMap((d) => {
    const i = d.indexOf(":");
    const code = (i < 0 ? d : d.slice(0, i)) as keyof typeof ALERT_LINES;
    const value = i < 0 ? "" : d.slice(i + 1);
    return ALERT_LINES[code] ? [t(ALERT_LINES[code], { n: value, ids: value, id: value })] : [];
  });
  const url = `${opts.siteUrl}/admin/${opts.kind === "daily" ? "" : "integrations"}`.replace(/\/$/, "");
  const greeting = t("mail_hi", { name: opts.name || "" }).replace(/\s+,/, ",");
  return {
    subject: `[Kingdom Members] ${heading}`,
    preview: lines[0] ?? heading,
    html: layout({
      locale: opts.locale,
      siteUrl: opts.siteUrl,
      preview: lines[0] ?? heading,
      heading,
      greeting,
      body: [t("mail_alert_intro"), ...lines],
      cta: { label: t("mail_alert_cta"), url },
      smallPrint: t("mail_alert_small"),
    }),
    text: textVersion([greeting, t("mail_alert_intro"), ...lines, `${t("mail_alert_cta")}: ${url}`]),
  };
}
