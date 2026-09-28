# 6. Access control

Broken access control is the most common serious flaw in web apps (OWASP #1). The question for every door from the map: **who is calling, and are they allowed to do this to this object?**

## Authentication

- Sign-in: generic error for unknown email vs wrong password (no account enumeration), rate limited per IP and per account, lockout or delay after failures, Enter submits sign-in (not a secondary action).
- Sign-up: only the intended people can create accounts (invite-only apps: the invite token is single-use, long, random, expires; the email on the account matches the invite, or the rule is deliberate).
- Password reset and magic links: single use, short expiry, don't reveal whether the email exists, rate limited, links bound to the right site URL (not a host header the attacker controls).
- Passwords: minimum length ≥ 8 (12 better), breached-password check if available, stored by the auth provider or with a slow hash.
- MFA for admins. Re-authentication for sensitive changes (email, password, MFA off, delete account).
- Sessions: `HttpOnly`, `Secure`, `SameSite` cookies; rotated at login; invalidated at logout and password change; reasonable lifetime; no tokens in URLs or `localStorage` if avoidable.
- OAuth/SSO: `state` checked, redirect URIs exact, email verified before linking accounts.

## Authorisation

Check it on the **server**, at every door, every time. Hidden buttons and client-side route guards are UX, not security.

### Build the matrix
List every page and API route (from `map.json`: `pages`, `api_routes`, `server_actions`) and every role. Mark expected allow/deny. Include:
- every admin page and admin API;
- every URL or request with an id (`/orders/123`, `?asset=…`, `{ productId }` in a body);
- downloads and signed-URL generators;
- exports, account deletion, profile updates;
- cron and internal endpoints (should deny everyone without the secret).

Put it in `access-matrix.json` (start from `assets/access-matrix.example.json`), save sessions with `save_login.mjs`, and run:

```
node scripts/access_matrix.mjs audit/access-matrix.json --out audit/access
```

A redirect counts as "allow" only when it stays inside the requested path; being sent to sign-in or to another area counts as "deny". Read the report's redirect targets to confirm. Exit code 2 means some "deny" was actually allowed. Investigate each one by hand.

For server actions and POST endpoints, add checks with `method` and `body` in a disposable environment only, using objects you created for the test.

### IDOR (another user's object)
Sign in as member A, capture a request that carries an id of A's object, replay it as member B (or change the id to B's). Every read, update, delete and download. Also ids in: query strings, JSON bodies, hidden inputs, file paths, signed-URL requests, websocket messages. Sequential or guessable ids make this worse but random ids are not protection.

### Mass assignment
Send extra fields in updates: `role`, `is_admin`, `user_id`, `status`, `price`, `email_verified`. The server should accept an allow-list of fields.

### Vertical escalation
Member calling admin actions directly (server action ids can be called from outside the page; API routes can be called with curl). Admin checks should live in the action/route, not only in the layout.

## Database-level (Postgres / Supabase)

When the browser talks to the database directly (Supabase, Firebase, Hasura), the database policies **are** the access control:
- RLS enabled on every table in exposed schemas (the mapper lists tables without it; Supabase advisors flag them too).
- Policies scoped by `auth.uid()` / tenant, for each of select, insert, update, delete. `using (true)` on anything personal is a finding. `with check` on insert/update so users can't write rows for others.
- `security definer` functions: check the caller inside, set `search_path`, and revoke `execute` from `anon`/`public` when not meant to be public.
- Views bypass RLS unless `security_invoker`; flag views over personal data.
- Storage buckets: private for paid or personal files; access through short-lived signed URLs generated after an entitlement check.
- Service-role / admin keys only on the server, never in client bundles (`NEXT_PUBLIC_*`, `VITE_*`) and never in the repo.
- Try it: with the public anon key and a member's JWT, query tables directly through the REST endpoint (`/rest/v1/<table>?select=*`) and call RPCs. Anything you shouldn't see is a finding.

## Multi-tenant apps
Every query filtered by tenant; tenant taken from the session, not the request; caches keyed by tenant; background jobs carry tenant context.

## Evidence
Request (method, path, role), response status and a redacted excerpt proving the access, plus the code location missing the check.
