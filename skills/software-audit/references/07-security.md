# 7. Security

The OWASP Top 10 as things to grep for and requests to try. Access control has its own reference (06); this covers the rest. If a dedicated security-review skill or tool is available, run it too and merge its verified results.

## Injection
- **SQL/NoSQL:** grep for string-built queries (`query(\`…${`, `raw(`, `execute("… " +`, `$where`, `.find(req.body)`). Parameterised queries and ORMs are fine; raw fragments with user input are not. Also `order by` / column names taken from input.
- **Command:** `exec`, `spawn` with `shell: true`, `child_process`, `os.system`, `subprocess(..., shell=True)` with user input.
- **Template/HTML:** `dangerouslySetInnerHTML`, `v-html`, `innerHTML =`, `|safe`, `{!! !!}`. Is the content sanitised (DOMPurify, a strict markdown renderer) and where does it come from? Admin-authored HTML still matters if admins can be phished or if many people are admins.
- **Headers / email:** user input in email headers or redirect `Location`.

## XSS and client-side
- Reflected input in pages (search terms, error messages, `?next=`).
- `href`/`src` from user input: block `javascript:` URLs.
- CSP present and strict for HTML (nonces or hashes, no `unsafe-inline` scripts, `frame-ancestors`). `check_headers.py` reports it.
- Secrets or personal data in client bundles, source maps in production, `localStorage`.

## CSRF and request forgery
- Cookie-based sessions: state-changing requests need `SameSite=Lax/Strict` cookies plus an origin check or CSRF token. Framework server actions often check origin; custom API routes may not.
- GET requests must never change state (logout via GET is minor; delete via GET is not).
- **Open redirects:** `?next=`, `?returnTo=`, `?redirect=` should accept only relative paths on the same site (reject `//evil.com`, `/\evil.com`, `https:`).
- **SSRF:** any server fetch of a user-supplied URL (webhooks config, image import, link preview). Block internal addresses and metadata endpoints.

## Files
- Uploads: type checked by content, not just extension; size limit; stored outside the web root or in private storage; served with `Content-Disposition` and the right type; images re-encoded if shown; SVG treated as code.
- Downloads: path built from ids, never from a user-supplied path (`../`); entitlement checked before issuing the URL; signed URLs short-lived.
- Zip handling: zip-slip on extract.

## Secrets and configuration
- Hard-coded keys (the mapper flags patterns), `.env` committed, keys in CI logs, keys in client env prefixes.
- Git history: `git log -p -S "sk_live"` (or the provider's prefix) to check for keys committed then removed. They are still exposed and must be rotated.
- Debug modes, verbose errors with stack traces, admin consoles or API docs exposed in production, default credentials.
- Headers and cookies: run `check_headers.py` on HTML pages and APIs of the real domain.

## Dependencies
- `npm audit --omit=dev` / `pnpm audit` / `pip-audit` / `bundle audit`. Report only vulnerabilities reachable in production, with the fix version.
- Unmaintained or abandoned critical packages; lockfile committed; CI installs from the lockfile.

## Abuse and rate limits
Sign-in, sign-up, password reset, magic links, invite resend, contact forms, any endpoint that sends email or SMS or costs money: rate limited per IP and per target. Check the limit exists in code and that it's keyed on something the attacker can't rotate trivially. Don't test by flooding; read the code and send at most a handful of requests.

## Logging and privacy in security terms
No passwords, tokens, full card numbers or reset links in logs. Security events (sign-in failures, admin actions, permission denials) logged with who/when/what.

## Webhooks and integrations
Signature over the raw body, constant-time compare, secret per environment, replay window, idempotency. Outgoing webhooks signed. Third-party scripts loaded from trusted origins with the CSP allowing only them.

## Severity for security
Use impact × likelihood (see 09). Remotely exploitable without an account and exposing other users' data or money = critical. Needs an admin account or an unlikely precondition = lower. Missing hardening headers alone are usually low or medium.
