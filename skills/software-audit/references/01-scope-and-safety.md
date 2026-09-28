# 1. Scope and safety

Testing someone's software is only legitimate with their permission and inside agreed limits. It also has to be safe: an audit that sends 400 password-reset emails to real customers, or deletes a production record, has done more harm than the bugs it found.

## Confirm before touching anything

Ask the owner (skip what the conversation already answered):

1. **What's in scope?** Repos, URLs, environments, third-party services, mobile apps. Anything you may *not* touch (a shared email domain, a payment account, another app on the same database).
2. **Authorisation.** They own it or have the owner's permission to test. For a third party's product, stop unless there is written permission (a bug bounty's scope counts).
3. **Where can you write?** Local copy, staging, preview deployments. Production: read-only unless they say otherwise, and even then only with test accounts and test data.
4. **Test accounts.** One per role (visitor needs none, member, admin, any other role), plus a **second member** to test that one member can't reach another's data. Never use a real customer's account or password. If you create accounts, note them so they can be removed afterwards.
5. **Goal and depth.** Pre-launch check, UX review, security review, due diligence? What matters most to them? A time box.
6. **Delivery.** Language, format (file, shared page, issues in the tracker), whether you should also fix things.

Write the answers at the top of the report under "Scope".

## Environments

| Environment | What you may do |
|---|---|
| Local copy with seed data | Everything: writes, deletes, webhooks, races, uploads, full E2E. Best place for business logic and access tests. |
| Staging / preview | Same, with the owner's agreement. Check it doesn't send real emails or charge real cards (test keys). |
| Production | GET requests, your own test accounts, header checks, crawl with modest limits (`--max 40`), reading logs and advisors if you have access. No writes to other people's data, no bulk sign-up, no password-reset floods, no load. |

If the app sends email, check where it goes before any flow that triggers one (a dev mailbox, a test inbox, a sink). If it takes payments, use the gateway's test mode and test events.

## Never

- Load, stress or denial-of-service tests, brute-force, credential stuffing.
- Exploit beyond the minimum that proves the issue (show you can read one other record; don't dump the table).
- Keep or copy personal data or secrets you run into. Record the location and type ("service-role key in `src/lib/x.ts:12`"), never the value.
- Change DNS, email domain settings, payment settings, or shared infrastructure.
- Disable security features to "see what happens" on a shared environment.
- Push fixes, open PRs or post publicly unless the owner asked.

## Secrets for the scripts

`save_login.mjs` reads `AUDIT_EMAIL` and `AUDIT_PASSWORD` from the environment so they don't end up in shell history or in the report. Keep saved sessions (`auth-*.json`) in a scratch folder outside the repo and delete them at the end. They are live sessions.

## When you find something serious

A critical issue in production (data of other users readable, admin reachable without login, a secret exposed publicly) goes to the owner **immediately**, in a short message with the fix, before the rest of the report. Don't publish it anywhere else.
