# Accounts, invites and email

There is no public sign-up. Accounts are born from invites, and invites are born from purchases (or from an admin). This keeps the member list clean and ties every account to a purchase.

## Purchase → invite → account
1. The gateway sends `order.paid`. `gateway_apply_event` records the order and grants entitlements **by email** (and to the member's account if `metadata.member_user_id` or the email matches a profile).
2. No account yet → `issueInvite` (`src/lib/invites.ts`) creates an invite: random token, only its SHA-256 stored, products listed, expiry `INVITE_TTL_DAYS`, email in the checkout language. Account exists → "new in your library" email instead.
3. `/invite/[token]` shows the form. **Opening the link does not consume it**: mail scanners open links before people do. The server action consumes it (`consume_invite`, atomic `FOR UPDATE`), creates the user with `email_confirm: true`, links entitlements, signs in, and lands on `/library?welcome=1`.
4. Expired or used links show a page with "send me a new link" — every failure has a recovery.

## Signing in
- **Email link:** `requestLink` always answers the same message (never reveals whether an account exists). The emailed link opens `/auth/confirm`, which needs a **button press** before `verifyOtp` — again because scanners follow links.
- **Password:** `signInWithPassword`; "forgot password" uses `generateLink('recovery')` and our own translated email.
- **Request a new link** (`/access`, public): buyers without an account get a fresh invite (old one revoked); members get a sign-in link. Same answer either way.
- Rate limits (`hit_rate_limit`) on sign-in, link requests and invite acceptance, stored in the database.
- Admins with TOTP go through `/auth/verify`; `is_admin()` only counts `aal2` sessions.

## Email rules
- Sender is the product (`Brand Library <library@brand.com>`), on a domain verified in Resend. If the domain is shared with other apps, create a **send-only key** for this app and never change the domain's settings.
- **Language:** the one set for the person — checkout `locale` from the gateway event, the invite's language, or the profile. Someone with none gets the language they picked (selector or a `?lang=` link from our emails, kept in the cookie); otherwise **English**. Never the browser's language. Manual invites default to English.
- Templates are plain HTML strings (`src/lib/email/templates.ts`), translated with `use-intl/core`, logo from `public/email/logo.png`.
- Every send is written to `email_log`; failures retry with backoff (daily cron and after each webhook). Email never makes a webhook fail.
- Dev: without `RESEND_API_KEY` or with `KM_DEV_MAILBOX=true`, emails are stored and shown at `/dev/mailbox`.

## Tests that protect this
E2E: invite → account → library (critical, also on phone), link works once, expired invite recovers, email-link needs a button, forgot/reset, Portuguese invite opens in Portuguese, a Portuguese browser without a chosen language gets an English invite. DB: `consume_invite` states, profile trigger, `link_entitlements`.
