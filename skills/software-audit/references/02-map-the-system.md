# 2. Map the system

You can't judge what you haven't mapped. The map decides where to look hardest: places where money, personal data or permissions change hands.

## Run the mapper

```
python scripts/map_repo.py <repo> --json audit/map.json > audit/map.md
```

It lists candidates by file pattern and keyword. Open what it lists. It does **not** know about auth done in a wrapper, a middleware, a database policy or a framework convention; you find that by reading.

Then read, in this order:
1. README, docs, `.env.example`: what the app claims to do, how it's deployed, which services it uses.
2. The request entry: middleware / proxy, the root layout, the router. Where does auth happen, which paths are public?
3. The data model: migrations or schema. Tables, ownership columns (`user_id`, `org_id`), row-level security, functions that bypass it (`security definer`, service-role clients).
4. Every server entry point: API routes, server actions, webhooks, cron jobs, background workers. Each is a door.
5. The UI routes: every screen a user can reach.

## Build the inventory

Put this at the start of your notes (and a short version in the report):

**Roles.** Visitor, member (and member states: invited, active, suspended, deleted), admin (and admin levels), service accounts, webhooks from third parties, cron.

**Journeys.** The 5–15 things people come to do, end to end. For a members platform: buy → receive invite → create account → open library → read/download → manage profile → recover password → get refunded. For an admin: create product → publish → see sales → help a member → export data.

**Assets that matter.** Personal data (email, name, address, payment details, IPs), money (orders, refunds, balances, prices), entitlements (who owns what), secrets (keys, tokens), content that is sold.

**Doors.** For each server entry point: who may call it, what it reads and writes, how it checks the caller. A table works:

| Door | Caller | Check | Reads / writes | Notes |
|---|---|---|---|---|
| `POST /api/webhooks/gateway` | gateway | HMAC signature | orders, invites | replay? idempotent? |
| `saveProduct` (server action) | admin | `requireAdmin()` | products | validated with zod |
| `GET /api/products/[id]/download` | member | owns product (RPC) | storage signed URL | 60 s URL |

**External services.** Payments, email, storage, auth provider, analytics, monitoring. For each: which keys, which side (browser/server), what happens when it's down or slow.

**Trust boundaries.** Browser ↔ server, server ↔ database (with or without RLS), server ↔ third parties, webhook sender ↔ app. Anything that crosses a boundary must be validated on the receiving side.

## Hotspots from the mapper

The "review hotspots" section flags raw HTML rendering, `eval`, service-role usage, possible hard-coded secrets, string-built SQL and open CORS. Each is a place to read, not a finding. Service-role usage in particular is normal on the server; the question is whether the code checks the caller before using it.

## Unknown stacks

The mapper recognises common JS/TS and Python frameworks by dependency name and route patterns. For others, find the router and the ORM/database layer by hand: grep for route declarations, `SELECT`, the auth library's name. The inventory above is the same whatever the stack.
