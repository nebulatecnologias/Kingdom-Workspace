# Build phases

Build in phases. Each phase ends with tests passing (unit, DB, E2E), a visual check on desktop and phone, a commit per coherent change, and a deploy the owner can open. When starting from the template most of this already exists: the phases become "adapt, verify, deploy" instead of "build". Keep the order anyway — it matches the dependencies.

For a full worked example (with every decision recorded) read `examples/kingdom-library-plan.md`.

## Phase 0 — Foundation
- Scaffold with `scripts/new_project.py` (or, for a different stack, follow `02-architecture.md` by hand).
- Design system wired in (`src/styles/kingdom-ui.css`, Google Sans via `next/font` with `adjustFontFallback: true`).
- next-intl with EN/PT/ES files and the key-parity test.
- Supabase project; migrations applied; RLS on; seed with demo products.
- Vercel project (root `members/app`), env vars, preview per branch.
- CI: lint, typecheck, unit, build; DB tests; E2E against a local Supabase.
- **Accept when** the app runs locally and on a preview with the shell (sidebar, top bar, phone tab bar) matching the design system.

## Phase 1 — Auth and invites (`04-auth-invites-email.md`)
- Invite link → create account → library; expired/used links recover with "send a new link".
- Sign-in by email link (button press to confirm) and by password; reset password.
- Translated emails; route protection in `proxy.ts` + role check on the server; rate limits.
- **Accept when** a seeded invite leads to an account and the library, the link fails a second time and after expiry, and sign-in works in all three languages.

## Phase 2 — Payment gateway (`05-payments-gateway.md`)
- Signed webhook receiver with idempotency; `order.paid/refunded/disputed/dispute_resolved`, `integration.test`.
- `email_log` retries; daily crons; `simulate-webhook` script; contract tests.
- **Accept when** a simulated `order.paid` creates an invite and email, the same event twice changes nothing, a bad signature is rejected and logged, and a refund removes access.
- Hand the gateway developer `docs/prompt-gateway.md` (the contract) early — this phase can run in parallel with phase 3.

## Phase 3 — Member area (`06-member-area.md`)
- Library by section with owned/free/locked/coming-soon states, filters, search, continue reading.
- Product pages per type; reader with progress and free sample; colouring studio; protected downloads.
- Kits and materials (many files per product, audio player, "Download everything").
- Profile: name, language, password, data export, delete account (privacy law).
- **Accept when** the prototype flow works with real data, downloads fail with 403 without access (also with the direct URL), and Lighthouse mobile ≥ 90 for performance and accessibility.

## Phase 4 — Admin (`07-admin.md`)
- Overview KPIs, invites, members, showcase (drag to order), sections, product editor (details, content, materials, sales), integrations, 2FA, activity log, search.
- **Accept when** the owner can run the business without touching the database and every action shows in the activity log.

## Phase 5 — Checkout from the padlock
- Padlock → `/api/checkout/[id]` → gateway checkout with member details and `return_url` → `/purchase/return` polls until the webhook lands.
- **Accept when** a gateway test-mode payment started from a padlock unlocks the product on the right account, even with a different checkout email. (Turn `GATEWAY_ACCEPT_TEST_EVENTS` on only for that test.)

## Phase 6 — Quality and launch (`08-security-quality.md`, `10-deploy-and-launch.md`)
- Security review (RLS, service role use, CSP, rate limits, upload limits), accessibility AA, E2E on phone and desktop, 3G performance, legal pages, backups decision, monitoring and alerts, support runbook, custom domain, icons and social image.
- Soft launch with a real live-mode purchase, then open.

## Working rhythm that kept this project fast and safe
1. Read the relevant template files and docs before writing code (the stack changes faster than memory).
2. Write the migration + DB test first when data rules change; apply locally (`supabase/tests/run.sh`), then to production only after CI is green.
3. Run `npm run typecheck`, `npx eslint src e2e`, `npx vitest run`, `npm run db:test`, and the E2E suite (lite stack) before every push.
4. Push, wait for CI, then promote the preview to production and verify the live site (`/api/health`, page title, the feature itself).
5. Report to the owner in their language: what changed for them, what was verified, what is theirs to do next.
