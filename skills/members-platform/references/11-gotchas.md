# Gotchas (each one cost real time on Kingdom Library)

## Next.js 16 / React 19
- Middleware is `src/proxy.ts`. Route prop types (`PageProps`, `RouteContext`) exist only after `next typegen` — `npm run typecheck` runs it.
- React 19 resets a form after a server action returns. Wrap the dispatch (`keepValues()` in `components/admin/keep-form.ts`) so validation errors keep what the user typed.
- The React lint forbids `setState` inside effects and impure calls (`Date.now()`) during render: move time maths into helpers (`lib/admin/time.ts`) and state changes into event/action handlers.
- `server-only` breaks Vitest: alias it to a stub (`tests/server-only-stub.ts` in `vitest.config.ts`).
- `?lang=` switches the whole UI language (email links use it). For "which language version am I editing" in the admin use another param (`?edit=`).
- Metadata files: `favicon.ico` PNG entries must be **RGBA** or Turbopack fails ("The PNG is not in RGBA format").

## i18n
- next-intl rich text: a tag named `<a>` is forbidden by the key test; use `<link>`, `<policy>`, etc.
- Keep EN/PT/ES keys identical (test). Remove unused keys when a feature is replaced.
- Money: `formatZar` pins `en-ZA` so every locale shows "R 149,00" the same way — change it for other currencies.

## Supabase / SQL
- `alter type … add value` works in a migration only if the new value is not used in the same transaction.
- `drop function` before changing a function's return columns (`create or replace` can't change them); re-grant after.
- `create or replace function` keeps existing grants — handy for rule changes.
- A unique constraint on (product, locale, format) is what limited products to "one file per language": model materials as rows with a position, reorder via an RPC.
- MCP `apply_migration` versions: align them with the repo file (see `10-deploy-and-launch.md`).
- A won dispute must not undo a refund recorded earlier — check stored `refunded_cents`, not only the event payload.
- In the auth stub for DB tests, `nullif(claim.sub, '')` or an empty claim picks the wrong user.

## Storage and media
- Supabase free plan: 50 MB per file, 1 GB total, and projects pause after about a week idle.
- Audio in the page needs a long-lived signed URL (hours) and `media-src` in the CSP; `preload="none"` so no URL is signed until play.
- Browsers report `audio/x-m4a` and `application/x-zip-compressed`: normalise by extension before asking for a signed upload.

## Payments
- Keep `GATEWAY_ACCEPT_TEST_EVENTS=false` in production; test-mode events are then recorded and ignored — remember to switch it on for a planned test-mode purchase.
- A paid order for an unlinked gateway product must alert the admin — the buyer paid and got nothing.

## Layout and accessibility
- Visually-hidden spans (`.sr`, `position: absolute`) inside tables caused horizontal scroll on phones: `position: relative` on the scroll wrapper.
- Long text in flex/grid children needs `min-width: 0`.
- Lighthouse flagged: links in notices not underlined, `role="dialog"` on a form, `aria-hidden` on focusable previews (use `inert`), unlabelled file inputs, avatar colours below 4.5:1.
- **Taps felt slow on phones.** Pages are dynamic (the CSP nonce, the session), and Next doesn't prefetch a dynamic route unless it has a `loading.tsx`: the old page stayed on screen for 0.4–0.7 s with no sign the tap worked. Fix: a `loading.tsx` next to each page (not at the route-group level, or the wrong placeholder flashes first) rendering `PageSkeleton`; `touch-action: manipulation` and `:active` states; `getClaims()` instead of `getUser()` in `proxy.ts`; independent reads in `Promise.all`. The first on-screen change after a tap went from 360–690 ms to 55–81 ms.
- **Loading screens make dynamic routes prefetchable, and that has a cost.** In the admin (many links on every screen), every visible link was prefetched again after each save, dozens of server renders that each went through the proxy's session check, and uploads on CI got slow enough to fail tests. Fix: the proxy matcher skips prefetches (`missing: [{ type: "header", key: "next-router-prefetch" }, …]`, as the Next.js CSP guide recommends), every protected page checks the user itself (not only the layout), and admin links use `IntentLink` (prefetch on hover, focus or touch). The member area keeps viewport prefetching: few links, and it is what makes taps instant on phones. An E2E test asserts the admin prefetches nothing just for being on screen.
- Build locally with the env loaded (`set -a; . ./.env.lite; set +a; npm run build`): `NEXT_PUBLIC_*` values are inlined at build time, and without them the browser Supabase client throws.
- Kill an old `next start` before starting a new build (`ps -eo pid,args | awk '/^ *[0-9]+ next-server/ {print $1}'`); a stale server serves pages pointing at CSS that no longer exists.

## Environment (sandboxed agents)
- `pkill -f <pattern>` can kill your own shell: find PIDs via `/proc/*/cmdline` and kill them in a separate command (exit code 144 is the shell noticing, not a failure).
- The sandbox proxy may block `*.vercel.app` and custom domains: verify production with the Vercel MCP `web_fetch_vercel_url`.
- Playwright's expected browser build may differ from the preinstalled one: pass `PLAYWRIGHT_CHROMIUM_PATH` (the config reads it).
- CI: pin `supabase/setup-cli` (`latest` hits the GitHub API rate limit); pull Supabase images from `public.ecr.aws` with retries.
- GitHub Actions minutes are free for public repos only; a private repo runs CI twice per push (push + PR) — trigger on one.

## Working with the owner
- They may share third-party accounts (a Resend domain used by other apps). Use dedicated keys; never change shared settings.
- Every decision you make on their behalf (a default, an extra sentence in a legal page) is stated in the report so they can reverse it.
- Ask before outward-facing or irreversible actions (DNS, repository visibility, deleting data); do internal, reversible work without asking.
