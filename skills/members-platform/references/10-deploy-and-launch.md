# Deploy and launch

## Supabase
- Create the project in the region closest to the functions (Kingdom Library: `eu-west-2` London with Vercel `lhr1`).
- Apply migrations in order. Three ways:
  1. **GitHub workflow** `members-supabase-deploy.yml` — needs repo secrets `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` (without them it skips silently: check the run's steps).
  2. `npx supabase link --project-ref <ref> && npx supabase db push`.
  3. **Supabase MCP `apply_migration`**: it records the migration with the current timestamp as its version. Immediately align it: `update supabase_migrations.schema_migrations set version = '<file version>' where name = '<name>'`, so the history matches the repo.
- Auth: disable public sign-up, link expiry 15 min, password ≥ 8, TOTP enrol/verify on (the workflow's PATCH does this).
- First admin: create the account through an invite, then `update public.profiles set role = 'admin' where email = '…'`.
- Order of operations for a breaking migration (e.g. replacing a table the running app reads): push code → wait for green CI → apply the migration → promote the new deploy immediately, and verify.

## Vercel
- Project root `members/app`; env vars from `02-architecture.md` (`NEXT_PUBLIC_*` need a redeploy after changes).
- Previews deploy per push. **Promote to production** by redeploying the verified preview with `target: production` (Vercel MCP `create_deployment` with `deploymentId`), then check `https://<domain>/api/health` and the changed page.
- Crons in `vercel.json` (expire invites 01:00 UTC, email retry + daily health summary 06:30 UTC) with `CRON_SECRET`.

## Custom domain
1. Add the domain to the Vercel project.
2. The owner creates a DNS record at their DNS host (Wix, Cloudflare, registrar): **CNAME `<subdomain>` → `cname.vercel-dns.com`**. It does not touch the root site or email records.
3. Once it resolves (check with a DNS lookup; fetch through the Vercel MCP if the sandbox proxy blocks the domain), set `NEXT_PUBLIC_SITE_URL=https://<domain>` and redeploy. Email links, metadata and the padlock `return_url` follow it.
4. Tell the owner to update the gateway: webhook URL and allowed return URL on the new domain.

## Email (Resend)
Verified domain; sender `Brand <library@brand.com>`; a send-only API key for this app. If the domain serves other apps, never change its settings, keys or webhooks.

## Brand assets
- `node scripts/make_icons.mjs <square-logo.png> members/app/src/app --alt "<Brand>"` writes favicon.ico (RGBA entries), icon.png, apple-icon.png, opengraph/twitter images + alt texts.
- Root layout metadata: `metadataBase` (public domain, fallback `VERCEL_URL`), Open Graph site name/description, `twitter.card: "summary"` for a square logo.
- Replace the crown SVG in `components/ui/logo.tsx` and `public/email/logo.png`.
- Social networks cache previews: Facebook Sharing Debugger → "Scrape again".

## Launch checklist
- [ ] Real products loaded (covers, pages/chapters/materials, gateway ids), demo seed removed or hidden
- [ ] Gateway: webhook + return URL registered; secret pasted in Admin → Integrations; signed test event OK
- [ ] Optional test-mode purchase from a padlock (switch `GATEWAY_ACCEPT_TEST_EVENTS` on, then off)
- [ ] `GATEWAY_ACCEPT_TEST_EVENTS=false` in production, redeployed
- [ ] Legal: terms, privacy, refunds reviewed for the jurisdiction; information officer (POPIA) or DPO (GDPR/LGPD) named
- [ ] Uptime monitor on `/api/health`; alerts reach the owner
- [ ] Backups decision recorded (Supabase Pro/PITR now or after first sales)
- [ ] First admin has 2FA
- [ ] Merge the PR so production follows the default branch
- [ ] Soft launch: one real live-mode purchase, verify invite → account → product → (refund test if wanted)

## After launch
Watch the admin overview "Needs your attention", the uptime monitor and Resend deliveries during the first days. Upgrade the database plan after the first sales. Offer the backlog items from `01-discovery.md` only when the owner asks.
