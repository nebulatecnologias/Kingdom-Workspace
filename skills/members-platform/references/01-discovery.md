# Discovery: what to ask before building

A members platform is 80% decisions and 20% code, because the code already exists in `assets/template/`. Settle these with the owner early, write each answer into the plan's "Decisions" section (see `examples/kingdom-library-plan.md`, section 8), and mark each one **Resolved** with the date of the conversation. Ask in the owner's language, in plain words, and offer the default so they can just say "yes".

Group the questions. Don't fire twenty at once: ask the blocking ones (1–6) before starting, and the rest when the phase that needs them begins.

## Blocking (before phase 0)

| # | Question | Default (what Kingdom Library chose) | Why it matters |
|---|---|---|---|
| 1 | Product name, shown to members and in emails | "Kingdom Library" | Goes into the UI, email subjects, legal pages, page titles. `scripts/new_project.py --name` |
| 2 | Audience, country and languages | South Africa; EN (en-ZA) default + PT + ES | Drives currency (`lib/format.ts`), date formats, legal regime (POPIA vs LGPD vs GDPR), and the translation files |
| 3 | What kinds of products | Colouring packs, eBooks, guides, workbooks, **kits** (many files: PDF, images, audio, ZIP) | Picks which product types and pages you keep. Kits cover audio and bundles without new types |
| 4 | How people pay and where the payment system lives | The owner's own gateway (Paystack underneath) sending signed webhooks | The platform never takes payments: it reacts to `order.paid` etc. See `05-payments-gateway.md` |
| 5 | Hosting accounts the owner already has | Vercel (team), Supabase (project), Resend (verified domain shared with other apps) | You deploy into their accounts. Never change settings shared with other apps (e.g. a Resend domain): use a dedicated send-only key |
| 6 | Design | The Kingdom UI design system (bundled in `assets/design-system/`) | Reuse it unless the owner has another brand; then keep the component set and swap tokens |

## Before launch (ask when the phase starts)

| # | Question | Default | Where it lands |
|---|---|---|---|
| 7 | Production domain and email sender | `library.<brand>.com`, `Brand Library <library@brand.com>` | Vercel domain + DNS CNAME, `NEXT_PUBLIC_SITE_URL`, `EMAIL_FROM`. See `10-deploy-and-launch.md` |
| 8 | Refunds: does a partial refund remove access? | **Any refund removes access** | `gateway_apply_event` (migration `20261001090000_refunds_revoke.sql`) |
| 9 | Disputes: suspend at once, or only when lost? | Suspend at once, restore if won | `DISPUTE_SUSPENDS_ACCESS=true` |
| 10 | Invite validity | 7 days | `INVITE_TTL_DAYS` |
| 11 | Who sends the payment receipt | The gateway | The platform only sends the invite or "new in your library" |
| 12 | Refund policy text | Refund within 7 days of payment, requested by email | `/legal/refunds` in `src/content/legal.ts` |
| 13 | Support contacts | WhatsApp number + support email | `SUPPORT_WHATSAPP`, `SUPPORT_EMAIL`, legal `COMPANY` |
| 14 | Company details for legal pages | Registered company name, number, address | `src/content/legal.ts` (`COMPANY`) |
| 15 | Email language when nothing is known | **English** — never guess from the browser | Rule documented in the template README ("Idioma dos emails") |
| 16 | Button contrast: brand orange or darker AA variant | Keep the brand orange | Design tokens (`--cta-aa` exists if they change their mind) |
| 17 | Admins: how many, 2FA? | Several; TOTP optional but recommended | `/admin/security` |
| 18 | Logo for favicon and social sharing | Square 1080 px logo | `scripts/make_icons.mjs` |
| 19 | Paid plans (Supabase Pro for PITR backups) | After the first sales | Until then an uptime monitor keeps the free project from pausing |
| 20 | Repository visibility | Public for now (free unlimited CI) | If private: run CI once per push to save Actions minutes |

## After launch (backlog to offer, not to build unprompted)

Watermarking PDFs with the buyer's email, an installable PWA with offline downloads, video lessons, reading plans, WhatsApp notifications, email-marketing sync, analytics of views/unlocks, coupons, monthly subscription.

## How to ask

- One message, grouped by topic, each question with the default in bold, so a busy owner can answer "all defaults except 8".
- When the owner answers, confirm back in one line per decision and record it in the plan doc in the same commit as the code that implements it.
- If an answer changes code already in production (e.g. the refund rule), ship it as a migration with a DB test, apply it, and say so.
