---
name: software-audit
description: End-to-end audit of an existing web application or SaaS, covering frontend, backend, database, design, UX, accessibility, business logic, access control and security, with evidence and a prioritised report. Ships scripts that map any repo, crawl the running app on desktop and phone with screenshots and axe checks, test who can open what for each role (IDOR, admin, RLS), check security headers and cookies, and sign in with test accounts. Use it whenever someone asks to audit, review, evaluate, test, find bugs or flaws in, or check the quality or security of an app, site, system, platform or members area they already have, including "avalia o meu software", "encontra falhas", "revisão de UX", "teste de acessos", "pentest leve", "está pronto para lançar?", a pre-launch check or a due diligence of a codebase, even if they only name one area such as design or permissions.
---

# Software audit: find what is wrong before users do

An audit answers one question for the owner: **what should I fix, in what order, and why?** It is only worth something when every finding is real (reproduced, with evidence), placed in context (who is hurt, how often, how badly) and actionable (where, and what to change). A long list of generic advice is not an audit.

This skill was built and tested on a production members platform (Kingdom Library). On its first run the tooling found a real bug the code review had missed: pressing Enter on the login page sent a password-reset email instead of signing in, because the first submit button in the form was "Forgot password?". That is the kind of finding to hunt for: things that only show up when the app is **used**, not just read.

Talk to the owner in their language. Write findings plainly, with the user impact first and the technical cause second.

## What's inside

| Path | Use it for |
|---|---|
| `scripts/map_repo.py` | First look at any repo: stack, pages, API routes, server actions, auth files, migrations and RLS, env vars, tests, CI, and review hotspots (raw HTML, eval, service-role keys, hard-coded secrets, string-built SQL). Python 3, no dependencies. |
| `scripts/crawl_screens.mjs` | Walks the running app by GET links only, desktop and phone. Screenshots, console and page errors, failed requests, CSP violations, horizontal overflow, missing alt and labels, unnamed controls, small touch targets, axe-core WCAG A/AA. Needs `playwright` (and optionally `axe-core`). |
| `scripts/save_login.mjs` | Signs in once with a **test** account (credentials from env vars) and saves the session for the crawler and the access matrix. Presses Enter like a person, which is how it caught the bug above. |
| `scripts/access_matrix.mjs` | Runs the same requests as each role (visitor, member, another member, admin…) and compares with what should happen. Catches IDOR, missing admin checks and leaky endpoints. Template in `assets/access-matrix.example.json`. |
| `scripts/check_headers.py` | Security headers, cookie flags, HTTPS redirect, CORS preflight, version leaks. Read-only, one request per URL. `--headers-file` when a sandbox can't reach the site. |
| `assets/report-template.md` | The report layout the owner receives. |
| `references/01-scope-and-safety.md` | **Read first.** Authorisation, environments, test accounts, what never to do. |
| `references/02-map-the-system.md` | Turning the repo map into a list of flows, roles, data and trust boundaries. |
| `references/03-ux-and-design.md` | Journeys, states, forms, copy, consistency, visual quality, phone. |
| `references/04-accessibility-performance.md` | WCAG checks that matter most, keyboard and screen reader passes, speed. |
| `references/05-business-logic.md` | Invariants, state machines, money and entitlement flows, webhooks, races, time, languages. |
| `references/06-access-control.md` | Authentication, sessions, authorisation per role, IDOR, RLS (Supabase/Postgres), server actions, admin. |
| `references/07-security.md` | OWASP Top 10 as code patterns to grep and requests to try, plus dependencies and uploads. |
| `references/08-operations.md` | Errors, logs, monitoring, backups, migrations, email, secrets, privacy. |
| `references/09-report.md` | Severity scale, finding format, prioritising, verifying fixes. |

## Workflow

Work through the phases in order. Small apps take an hour or two; don't skip phases, shrink them.

### 0. Scope and permission
Read `references/01-scope-and-safety.md`. Confirm with the owner: what is in scope (repo, URLs, environments), that they own it or are authorised to test it, which environment you may write to (never production data), and which test accounts to use (create them if needed: one per role, plus a **second member** for cross-account checks). If only production exists, stay read-only there: GET requests, your own test accounts, no load, no destructive actions.

### 1. Map
Run `python scripts/map_repo.py <repo> --json audit/map.json > audit/map.md`, then read the entry points it lists. Produce the inventory described in `references/02-map-the-system.md`: roles, key journeys, data that matters (personal, money, entitlement), external services, trust boundaries. Everything later hangs off this list; an audit without it checks what's easy instead of what's important.

### 2. Run the app and collect evidence
Prefer a local or staging copy with seed data. Then:
1. `save_login.mjs` once per role → `auth-<role>.json`.
2. `crawl_screens.mjs` as visitor and as each role (`--storage auth-member.json --label member`) → screenshots and `report.md`.
3. Fill `access-matrix.json` from the map (every admin page and API route, every URL with an id in it) and run `access_matrix.mjs`. Any "expected deny, got allow" is a candidate critical finding.
4. `check_headers.py` on the HTML pages and API routes, locally and on the real domain.
5. The project's own checks: typecheck, lint, unit and E2E tests, `npm audit --omit=dev` (or the ecosystem's equivalent), database advisors if the platform has them (e.g. Supabase `get_advisors` for security and performance).

The scripts run from a folder where `playwright` resolves (the audited app often has it). Set `PLAYWRIGHT_CHROMIUM_PATH` if the browser build differs.

### 3. Review each area
Walk the journeys yourself, with the screenshots and code side by side, one lens at a time, using the matching reference: UX and design (03), accessibility and performance (04), business logic (05), access control (06), security (07), operations (08). Each reference lists what to look at, how to test it, and the usual failures. Look at the phone screenshots as carefully as the desktop ones; most users are on phones.

Scripts find candidates. Your judgement finds the important things: a flow that confuses, a rule that can be bypassed, a state the code never expected.

### 4. Verify every finding
Before writing a finding down, reproduce it: a request and its response, a screenshot, a test that fails, or the exact lines plus the input that reaches them. Drop anything you can't back up, or label it clearly as "to confirm" with what would confirm it. Check it isn't already handled elsewhere (middleware, a database policy, a wrapper). False alarms cost the owner time and trust in the rest of the report.

### 5. Report
Use `assets/report-template.md` and the severity scale in `references/09-report.md`. Lead with a short summary the owner can act on (top 3–5 fixes), then findings ordered by severity, each with impact, evidence, location and fix. Include what is **good** too, so they know what to keep. Deliver it as a file or page the owner can share.

### 6. Fix and re-test (when asked)
If the owner wants fixes: one finding per commit, a test that fails before and passes after, run the project's checks, then re-run the script that found it. Report what was fixed, what was verified and what is left. Don't change behaviour the owner may rely on without asking.

## Principles
- **Evidence over opinion.** "Button looks small" is an opinion; "the avatar link is 36×36 px on Pixel 7, under the 44 px minimum (screenshot)" is a finding.
- **Use the app, don't just read it.** Keyboard only, phone width, slow network, second account, expired session, double click, back button, other language.
- **Severity comes from impact × likelihood**, not from how clever the bug is.
- **Stay safe.** No load or DoS tests, no real customers' data, no destructive requests outside a disposable environment, no exploits beyond the minimum that proves the issue. Secrets you come across go in the report as "exposed at X", never copied in full.
- **Be specific to this app.** Generic checklists are for you; the report contains only what applies here.
