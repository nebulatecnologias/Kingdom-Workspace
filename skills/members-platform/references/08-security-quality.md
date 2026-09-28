# Security, quality gates and monitoring

Run these gates before every phase hand-off and before launch. Parts of the UI gates are condensed from two open-source skills used while designing Kingdom Library — **impeccable** (Apache-2.0: audit, harden, polish) and **ui-ux-pro-max** (MIT: prioritised UX rules and pre-delivery checklist). See `NOTICE.md`. If those skills are installed, run them for a deeper pass; this file is the minimum bar.

## 1. Security (blocking)
- **RLS on every table**; content tables readable only with `has_access`; admin reads via `is_admin()` (which requires `aal2` when 2FA is on). The DB tests (`supabase/tests/db_test.sql`) assert what a member, a deactivated member, anon and an admin can see — extend them with every new table.
- **Service role only on the server** (`src/lib/supabase/admin.ts`, `server-only`), only after the session/role check.
- **Security-definer functions**: `set search_path = ''`, explicit `revoke … from public, anon` and grants; admin functions to `service_role` only.
- **CSP with a per-request nonce** in `src/proxy.ts`: `script-src 'self' 'nonce-…' 'strict-dynamic'`, `img-src`/`connect-src`/`media-src` also the Supabase origin, `frame-ancestors 'none'`, `upgrade-insecure-requests` on https. Static headers in `next.config.ts`: HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, COOP. Check a live page shows no CSP violations in the console.
- **Links and tokens**: store hashes only; single use; expiry; opening never consumes.
- **Rate limits** on sign-in, link requests, invite acceptance, alerts.
- **Uploads**: signed one-time URLs, server-side type/size whitelist, bucket MIME + size limits, object existence check before recording.
- **Webhooks**: raw-body HMAC, time window, idempotency, test-mode gate.
- **Secrets**: never in the repo or client bundle; the gateway secret lives in `integration_secrets` with no RLS policy. Shared third-party accounts: dedicated, least-privilege keys.

## 2. UI quality (condensed from impeccable + ui-ux-pro-max)
Score each 0–4; anything below 3 is fixed before hand-off.
1. **Accessibility (critical):** text contrast ≥ 4.5:1 (check the orange CTA: white on the brand orange is below AA at small sizes — the owner may keep it; document the decision), visible focus, labels on every input (including hidden file inputs: `aria-label`), no `aria-hidden` on focusable content (use `inert` for previews), headings in order, links distinguishable (underline in notices), `prefers-reduced-motion` respected. Lighthouse accessibility 100 is achievable — Kingdom Library reached it.
2. **Touch and interaction (critical):** targets ≥ 44×44 px, feedback on every action (toast, pending state), nothing hover-only.
3. **Performance:** CLS < 0.1 (`next/font` with `adjustFontFallback: true` removed a 0.31 CLS), images sized, lazy where below the fold, no layout thrash. Target Lighthouse mobile ≥ 90 on default throttling; check a 3G profile too.
4. **Responsive:** test at 390 px (Pixel 7 project in Playwright) — no horizontal scroll (watch absolutely positioned `.sr` spans escaping tables: give the wrapper `position: relative`; add `min-width: 0` to flex/grid children with long text).
5. **Theming:** colours from tokens only; dark mode works.
6. **Forms and feedback:** visible labels, errors next to the field, values kept after a validation error.
7. **Navigation:** predictable back links, deep links to every entity, bottom tab bar ≤ 5 items on phones.
8. **Hardening (impeccable "harden"):** very long titles and names, empty states, 1000+ rows, network failures, 401/403/404/500 pages, long translations (PT/ES run ~20–30% longer), currency and date formats per locale.
9. **Integrity:** no placeholder copy, no emoji as icons, no invented numbers, one primary action per screen (design system rule).

## 3. Monitoring and alerts
- `GET /api/health` → `{"ok":true}` only if the app **and** the database answer; excluded from the proxy matcher.
- An uptime monitor (Better Stack free: 3-minute checks, email + app push) on `/api/health`. On the Supabase free plan it also keeps the project from pausing after a week of inactivity.
- Admin alert emails, rate-limited to one per kind per hour: gateway event failed, paid order with an unlinked product; plus a daily summary cron when something went wrong in 24 h. The same summary shows on the admin overview.
- Logs: Vercel (server), Supabase (DB/auth), Resend (deliveries).

## 4. Support runbook
Ship `docs/runbook-suporte.md` (scaffolded) adapted to the product: "paid but got nothing", expired links, can't sign in, wrong email, grant/remove access, refunds, kits and materials, alerts, 2FA lost, privacy requests, monitoring, contacts.
