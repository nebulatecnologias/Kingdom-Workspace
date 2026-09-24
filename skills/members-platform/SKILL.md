---
name: members-platform
description: Build a complete members area / digital library that sells digital products (eBooks, guides, workbooks, colouring packs, audio, courses, kits of mixed files), proven in production as Kingdom Library. Covers invite-only accounts created by purchases, signed payment-gateway webhooks (refunds, disputes), locked products with a padlock checkout, kits, protected downloads, reader, admin with 2FA, EN/PT/ES, privacy tools, security, tests on phone and desktop, and deploy on Vercel + Supabase + Resend with a custom domain. Ships a working template, a scaffold script, the Kingdom UI design system and UI quality gates. Use it whenever someone wants to create, clone, plan, extend or launch a members area, área de membros, biblioteca digital, plataforma de infoprodutos or content library behind a payment, or a system like Kingdom Library, even if they only name the product or gateway (Paystack, Stripe, Hotmart).
---

# Members platform: build a digital library that sells

This skill packages everything learned building **Kingdom Library** (library.kingdomcompny.com): a members area where a purchase on a payment gateway creates an invite, the buyer creates an account, and their products open in a library; an admin runs the business without touching the database. It went through seven phases, a design review, security and accessibility audits, E2E tests on desktop and phone, and a production launch. Don't re-invent any of it: **start from the template, adapt, verify, deploy**.

Talk to the owner in their language (Kingdom's owner writes Portuguese). Keep code, commits and code comments in English.

## What's inside

| Path | Use it for |
|---|---|
| `scripts/new_project.py` | **Start here.** Copies the template into a new repo and swaps brand, domain, sender, support and company details. Then `npm install && npm run typecheck && npm test`. |
| `scripts/make_icons.mjs` | Favicon, app icons and social sharing images from one square logo. |
| `assets/template/` | The production code: `members/app` (Next.js 16), `members/supabase` (migrations, DB tests, Docker-free local stack), CI workflows, `docs/prompt-gateway.md` (brief for the gateway developer), `docs/runbook-suporte.md` (support runbook). |
| `assets/design-system/` | Kingdom UI design system — read `GUIDE.md` (tokens, components, patterns, voice, i18n, Next.js mapping). |
| `references/01-discovery.md` | The 20 decisions to settle with the owner, with the defaults Kingdom chose. |
| `references/02-architecture.md` | Stack, layout, data model, RLS, env vars. |
| `references/03-build-phases.md` | Phases 0–6 with acceptance criteria, and the working rhythm. |
| `references/04…07` | Auth/invites/email · payments gateway · member area (kits, downloads, reader) · admin. |
| `references/08-security-quality.md` | Security review, UI quality gates (from impeccable + ui-ux-pro-max), monitoring. |
| `references/09-testing.md` | Unit, DB, E2E (desktop + phone), running without Docker. |
| `references/10-deploy-and-launch.md` | Supabase, Vercel, domain/DNS, Resend, brand assets, launch checklist. |
| `references/11-gotchas.md` | Every trap already hit, with the fix. Skim it before you start. |
| `references/examples/kingdom-library-plan.md` | A complete real plan with every decision recorded. |

Read only what the current step needs.

## Workflow

### 1. Understand the business (before any code)
Read `references/01-discovery.md` and ask the blocking questions (name, audience/languages, product types, how payment happens, existing accounts, design) in one grouped message with defaults in bold. Write the answers into `docs/plano-desenvolvimento.md` (use the example plan's structure) and keep its "Decisions" section current for the whole project.

If the owner's needs clearly differ from the template (e.g. subscriptions, video streaming, a marketplace with many sellers), say so plainly, explain what the template covers and what would be new work, and plan the new parts as extra phases rather than bending the proven flows.

### 2. Scaffold
```bash
python <skill>/scripts/new_project.py --target <repo> --name "<Product>" --domain <domain> \
  --from-email <sender> --support-email <email> --support-phone "<phone>" \
  --company "<legal name>" --company-reg <number> --company-address "<address>"
cd <repo>/members/app && npm install && npm run typecheck && npx vitest run && npm run db:test
```
Then follow the script's printed checklist (logo and icons, legal texts for the country, currency in `src/lib/format.ts`, demo products in `seed.sql`). Different stack requested? Use the template as the specification and port it — the flows, rules and tests are the valuable part.

### 3. Build and adapt phase by phase
Follow `references/03-build-phases.md`. For each phase: read the matching reference, adapt the template files, extend the tests (DB test for every rule change, E2E for every user flow), run all checks, commit, push, wait for CI, deploy a preview, then promote and verify production. The design must follow `assets/design-system/GUIDE.md`: invent structure for new screens, never a new look.

### 4. Quality gates before each hand-off
Run the checks in `references/08-security-quality.md`: security list, UI gates (accessibility, touch, performance, responsive, hardening), and a visual check with screenshots on desktop and phone. Fix anything below the bar before reporting.

### 5. Deploy and launch
Follow `references/10-deploy-and-launch.md`: migrations (align versions if applied via MCP), env vars, domain (the owner adds one CNAME), sender, icons and social image, uptime monitor, `GATEWAY_ACCEPT_TEST_EVENTS=false`, launch checklist, soft launch with one real purchase.

### 6. Hand over
The owner receives: the production URL, the admin (first admin + 2FA), `docs/runbook-suporte.md` adapted, `docs/prompt-gateway.md` for their gateway developer, the plan with all decisions, and a short list of what is theirs to do (content, gateway, legal, plan upgrades).

## Principles that made Kingdom Library work

- **The gateway sells, the platform grants.** No card data, no checkout inside the app. Signed webhooks, idempotent, one DB transaction per event; a refunded order is never unlocked again.
- **Invite-only accounts tied to purchases.** Links are single-use, stored as hashes, expire, and are never consumed just by opening (mail scanners open links first).
- **Every failure has a recovery.** Expired link → send a new one; unknown product → admin alert; slow webhook → the return page explains there's no need to pay again.
- **Locked content still sells.** Locked products show their outline or "What's included" (never the files) and lead to the padlock checkout.
- **Access is checked with the member's own session, then a short signed URL.** RLS everywhere; the service role only on the server after a check.
- **Language is explicit.** UI in the member's language; emails in the language set for the person, English when unknown — never guessed from the browser.
- **Evidence over claims.** Before saying "done": tests pass, CI is green, the live URL answers, and you looked at the screen. Report what was verified and what is the owner's to do, in their language, without jargon.

## Report style for the owner
Short, in their language, organised as: what changed for them (not how), what was verified, anything decided on their behalf (so they can reverse it), and their next step. Explain technical terms the first time. Ask before outward-facing actions (DNS, repository visibility, anything touching shared accounts); do reversible internal work without asking.
