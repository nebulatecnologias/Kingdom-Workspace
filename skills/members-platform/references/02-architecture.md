# Architecture

## Stack

| Layer | Choice | Notes |
|---|---|---|
| App | Next.js 16 App Router + TypeScript | `src/proxy.ts` is the middleware (renamed in 16). Route types come from `next typegen` (`PageProps<"/path">`, `RouteContext<…>`). Read `node_modules/next/dist/docs/` before using an API you remember from older versions — `AGENTS.md` in the app says the same. |
| Style | Tailwind v4 + the Kingdom UI stylesheet | `src/styles/kingdom-ui.css` holds tokens and component classes; app-specific rules go in `@layer components` in `globals.css` |
| i18n | next-intl 4, no locale prefix in URLs | Locale = profile → `km-locale` cookie → Accept-Language → en. Typed message keys; a test fails if EN/PT/ES keys differ |
| Data | Supabase Postgres, RLS on every table | Versioned SQL migrations; writes go through server actions with the service role |
| Auth | Supabase Auth (password + email link), TOTP for admins | Links are generated server-side (`admin.generateLink`) and emailed by the app, never by Supabase |
| Files | Supabase Storage, private bucket `products` | Downloads: check access with the member's session, then a short signed URL |
| Email | Resend, templates in `src/lib/email/templates.ts` | Rendered with `use-intl/core` in the recipient's language; failures go to `email_log` and are retried |
| Hosting | Vercel (functions near the database region) | Vercel Cron for daily jobs (`vercel.json`) |
| Monitoring | `/api/health` + an uptime monitor (Better Stack) + admin alert emails | See `08-security-quality.md` |

## Repository layout (as scaffolded)

```
members/
  app/                 Next.js app
    src/app/(member)   library, product pages, reader, colouring, profile, help, purchase return
    src/app/(admin)    overview, invites, members, showcase, product editor, integrations, security, activity, search
    src/app/(auth)     login, invite, confirm link, reset, verify (2FA), request new link
    src/app/api        webhooks/gateway, checkout/[productId], products/[id]/download, purchase/status, cron/*, health, me/export
    src/app/legal      terms, privacy, refunds (content in src/content/legal.ts)
    src/lib            auth, access, invites, gateway/*, email/*, admin/*, catalogue, media, rate-limit, alerts, health, format
    src/components     shell (AppShell, AuthShell), ui, admin, catalogue, purchase, auth
    messages/          en.json, pt.json, es.json
    e2e/ tests/        Playwright and Vitest
    scripts/           create-invite.ts, simulate-webhook.ts
  supabase/
    migrations/        schema, grants, RLS, gateway, member area, admin, storage limits, materials, refund rule
    tests/             run.sh + db_test.sql (security and behaviour tests on plain Postgres)
    lite/              Postgres + GoTrue + PostgREST without Docker, for sandboxes
    seed.sql           demo products used by the tests
.github/workflows/     members.yml (CI), members-supabase-deploy.yml (optional migration deploy)
docs/                  prompt-gateway.md (contract for the gateway dev), runbook-suporte.md
```

## Data model

| Table | Purpose |
|---|---|
| `profiles` | One per auth user (trigger `handle_new_user`): name, email, locale, role member/admin, status active/deactivated, terms accepted, last seen |
| `sections` + `section_translations` | Showcase sections, named per language |
| `products` + `product_translations` | Type (`colouring`/`book`/`guide`/`workbook`/`kit`), section, `gateway_product_id` (unique), price, access paid/free, visibility visible/soon/hidden, order, cover, field colour |
| `product_pages` | Printable pages (colouring, workbooks), per language or shared |
| `product_chapters` | Reader chapters per language, Markdown source + sanitised HTML, sample flag |
| `product_assets` | **Materials**: any number of files per product (pdf, epub, image, audio, zip), title, order, language or all, size, audio duration. Owning the product opens all of them |
| `entitlements` | Access to a product, by email first (linked to the account later), source order/manual/free, revoked with a reason |
| `invites` | Token hash only, products, status sent/opened/accepted/expired/revoked, expiry |
| `orders` | Mirror of gateway orders with status paid/refunded/partially_refunded/disputed/dispute_lost |
| `webhook_events` | Idempotency and delivery log |
| `email_log` | Every email, with retry schedule |
| `integration_secrets` | Gateway signing secret with a 24 h grace for the previous one — no RLS policy, so never readable through the API |
| `rate_limits` | Buckets for sign-in, links, invites, alerts |
| `reading_progress` | Continue reading |
| `audit_log` | Every admin action and gateway event |

Key SQL functions (all `security definer`, `search_path = ''`, grants explicit): `has_access`, `is_admin` (requires `aal2` once the admin has 2FA), `consume_invite` (atomic), `link_entitlements`, `gateway_apply_event` (the whole order state machine in one transaction), `claim_webhook_event`, `library_items`, `product_outline`, `product_contents` (lists a locked product's materials without paths), `admin_*` (service role only), `hit_rate_limit`, `expire_invites`.

## Access rules (RLS) in one paragraph

Members read their own profile, entitlements, orders and progress; listed products (not hidden) and their translations; content tables (pages, chapters, assets) only with `has_access(product_id)` — except sample chapters. Outlines and "What's included" lists come from security-definer functions that return titles and sizes but never file paths. Admin reads go through `is_admin()`. Every write that matters (grants, invites, orders, uploads) runs in server actions with the service role after `requireAdmin` / session checks, and is written to `audit_log`.

## Environment variables

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key), `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `INVITE_TTL_DAYS`, `SUPPORT_EMAIL`, `SUPPORT_WHATSAPP`, `CRON_SECRET`, `GATEWAY_WEBHOOK_SECRET` (seed; the admin can paste a new one), `GATEWAY_ACCEPT_TEST_EVENTS`, `DISPUTE_SUSPENDS_ACCESS`, `KM_DEV_MAILBOX` (dev: store emails in `email_log` and show them at `/dev/mailbox`). `NEXT_PUBLIC_*` values are baked in at build time: after changing one on Vercel, redeploy.
