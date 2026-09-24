# Testing

Four layers, all in CI (`.github/workflows/members.yml`), all runnable locally.

| Layer | Command (from `members/app`) | What it covers |
|---|---|---|
| Unit (Vitest) | `npx vitest run` | Signature verify (valid, invalid, stale, previous secret), tokens, locale resolution, ZAR/date formats, Markdown, email templates, **translation key parity** (and a forbidden `<a>` rich-text tag) |
| Database | `npm run db:test` (throwaway Postgres 15+) | Schema + seed + `db_test.sql`: RLS per role, `consume_invite`, `link_entitlements`, the whole order state machine, admin functions and grants, `aal2`, materials and "What's included" |
| E2E (Playwright) | `npm run build && npm run e2e` | Desktop project + `mobile` (Pixel 7) running the `@critical` flows: invite → account → library, expired invite recovery, email-link sign-in, padlock → return page → unlock → refund, kit purchase → all materials → refund closes all |
| Static | `npm run lint`, `npm run typecheck` (`next typegen && tsc`) | Types for route params come from typegen |

## Running E2E without Docker (sandboxes, Claude Code on the web)
```bash
bash members/supabase/lite/start.sh   # Postgres + GoTrue + PostgREST on http://127.0.0.1:54321, writes app/.env.lite
cd members/app
set -a; . ./.env.lite; set +a
export PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium   # if the installed Playwright browser build differs
npm run build && npx playwright test
```
- The lite stack has no Storage: upload/download tests skip locally and run in CI (`E2E_REQUIRE_STORAGE=1`).
- The lite stack can die when the sandbox restarts: if tests fail with `fetch failed`, check `curl http://127.0.0.1:54321/rest/v1/` and re-run `start.sh`.
- The proxy of the lite stack answers CORS so browser-side Supabase calls (MFA) work.

## Writing tests that stay green
- Unique data per test (`uniqueEmail()`, timestamps in slugs); clean up in `finally`.
- Use roles and labels (`getByRole`, `getByLabel`) — they double as an accessibility check. Remember derived titles (an uploaded `everything.zip` is titled "Everything").
- Toast texts come from `messages/en.json` ("Changes saved", not "Saved").
- Every product rule change gets a DB test first; every user-visible flow change gets or updates an E2E.
- CI pins tool versions (`supabase/setup-cli` version) — "latest" hits GitHub API rate limits.

## Visual check
Before hand-off, screenshot key pages on desktop (1280) and phone (Pixel 7) with a small Playwright script against the local build (sign in as a created member/admin, visit the pages, `fullPage: true`) and look at them. Fixed bottom bars overlap full-page shots — that is expected.
