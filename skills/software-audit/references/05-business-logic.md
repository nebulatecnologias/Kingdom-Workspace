# 5. Business logic

Logic bugs are invisible to scanners: every request is valid, the result is wrong. Find them by writing down the rules the business depends on and trying to break each one.

## 1. Write the invariants

From the map, the docs and a short talk with the owner, list statements that must always be true. Examples for a platform that sells access:

- A member can open a product only if they have an active entitlement to it.
- An entitlement exists only for a paid order; a refund or chargeback removes it; a won dispute restores it, but never undoes a refund.
- One payment creates exactly one order and one invite, however many times the webhook arrives.
- An invite is used once and expires after N days.
- Prices shown equal prices charged; currency never mixes.
- A deleted account has no personal data left except what the law requires.
- Only admins change products; every admin change is logged.

Each invariant becomes a test idea.

## 2. Draw the state machines

Orders, subscriptions, invites, accounts, content (draft → published → archived). For each: states, the events that move between them, who triggers each event. Then look for:
- transitions the code allows that the business doesn't (refunded → paid by a late `paid` event);
- events arriving **out of order** or **twice** (webhooks retry; users double-click; two tabs);
- states nobody handles (partially refunded, disputed, expired, suspended);
- dead ends (a user stuck in "pending" with no way forward and no alert to the admin).

## 3. Try to break it

In a disposable environment:
- **Repeat** every write: same webhook twice, same form twice fast, same invite link twice, same coupon twice.
- **Reorder:** refund before paid; dispute won after refund; invite accepted after it expired; product unpublished while someone is buying.
- **Race:** two requests at once (Playwright `Promise.all` or two `curl &`) on anything that checks-then-writes: balance, stock, invite redemption, "first purchase" discounts. Look for a unique constraint or a transaction/lock; code-level checks alone race.
- **Change what the client sends:** price, quantity (0, negative, huge, decimal), currency, product id, user id, role, `isAdmin`, status. The server must derive these, not trust them.
- **Boundaries:** empty, very long, unicode, emoji, right-to-left, leading/trailing spaces, email case (`A@x.com` vs `a@x.com`), time-zone edges (midnight UTC vs local, DST), leap day, expiry exactly now.
- **Skip steps:** open step 3's URL without doing step 2; call the server action without the page.
- **Languages:** every language shows the same rules, prices and legal text; emails go in the right language; fallbacks work when a translation is missing.

## 4. Money and entitlement flows

These deserve a line-by-line read:
- Webhooks: signature checked on the **raw** body with a constant-time compare, timestamp tolerance or replay protection, idempotency by event id, test events rejected in production, unknown events ignored safely, failures logged and retryable.
- Amounts in integer minor units; rounding in one place; currency stored with the amount.
- Refunds (full and partial), disputes/chargebacks, subscription renewals and cancellations each have a defined effect on access.
- The admin can see and fix a stuck order without SQL.
- Emails for money events are sent once, to the right person, in their language.

## 5. Background work

Cron jobs and queues: what if it runs twice, runs late, or fails halfway? Is it protected by a secret? Does it log and alert on failure? Are retries bounded?

## Evidence

A logic finding needs the sequence of steps (or requests) and the resulting wrong state (a query result, a screenshot, a failing test). Best: add the failing test to the project's suite and cite it.
