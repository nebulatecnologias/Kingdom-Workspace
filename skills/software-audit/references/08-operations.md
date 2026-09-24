# 8. Operations

An app that works today can still fail its owner: nobody notices when it breaks, a migration wipes data, the email stops arriving, the backup doesn't restore. Check the running side.

## Errors and monitoring
- Uptime monitor on the site and a health endpoint that checks the database (and says nothing sensitive).
- Error tracking or at least searchable logs for server errors; someone gets alerted.
- User-facing errors are friendly; server logs have enough context (request id, user id, route) without secrets or personal data beyond what's needed.
- Failures of background work (email sends, webhooks, cron) are recorded and retried or surfaced to the admin.

## Data safety
- Backups: enabled, frequency and retention known, **restore tested** at least once. Point-in-time recovery for anything with money.
- Migrations: in version control, applied in order, reversible or with a plan; destructive migrations (drop, rename) migrate data first. The deployed database matches the migrations folder (compare the migrations table with the files).
- Deletes: soft-delete or confirmation where losing data would hurt; cascades understood.

## Deploy and configuration
- CI runs typecheck, lint, tests on every change; production deploys only from the main branch or a promoted preview.
- Environment variables documented (`.env.example`), set per environment, no test keys in production and no production keys in previews. Flags like "accept test events" off in production.
- Preview deployments protected if they hold real data.
- Domain: HTTPS everywhere, redirect from HTTP and from `www`/apex as intended, certificates auto-renewing.
- Rollback path known (previous deployment, database restore).

## Email
- Sending domain authenticated (SPF, DKIM, DMARC). Sender name and reply-to right; links point to the production domain.
- Transactional emails tested in each language; plain-text part; unsubscribe where required (marketing).
- A dev/test environment can't send to real customers.
- Bounces and complaints monitored.

## Privacy and compliance
- Privacy policy and terms exist, match reality (what's collected, processors, retention, contact), and are linked where data is collected.
- Users can see, export and delete their data, or ask for it; deletion really removes or anonymises.
- Cookie banner only if non-essential cookies are used; analytics configured accordingly.
- Data processors listed; data location known. Local laws apply (GDPR in the EU, POPIA in South Africa, LGPD in Brazil…): note gaps, and recommend a legal review rather than giving legal advice.

## Support readiness
The owner can answer "I paid and have no access", "I didn't get the email", "refund me", "delete my account" from the admin, without SQL, and there's a written runbook for it.

## Costs and limits
Free-tier limits of the database, storage, email and hosting against expected usage (storage for audio/video grows fast; email daily caps). Note what happens when a limit is hit (pauses, hard errors).
