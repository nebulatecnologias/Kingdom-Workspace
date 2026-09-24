# Admin

Only `role = admin` profiles (active). Every server action starts with `adminContext()` (requireAdmin, then a service-role client) and ends with `audit()`; `describeActivity` turns audit rows into the feed. Admin SQL functions are granted to the service role only.

| Page | What the owner does there |
|---|---|
| **Overview** `/admin` | KPIs (members, pending invites, unlocks and sales this month, 5-week bars), next invite to expire with a countdown and Resend, invites waiting, activity feed, "Needs your attention" (webhook errors, bad signatures, emails given up, unknown gateway products), 2FA nudge |
| **Invites** | Filter by status, search, new invite (email, name, language — English by default, 3/7/14 days, products), resend (revives revoked), copy a fresh link (old one stops working), revoke (removes manual grants nobody used; never touches purchases). Inviting an existing account puts the products straight into the library |
| **Members** | Search; per member: product switches, orders, send sign-in link, change email (account and access move), deactivate/reactivate, reset another admin's 2FA |
| **Showcase** | Drag (or arrow keys) to order products, section and visibility per product, sections in EN/PT/ES, phone preview of the library |
| **Product editor** | Tabs: **Details** (type, section, title/description/verse per language, slug, colour, cover), **Content** (colouring pages with browser-made previews, or Markdown chapters with free sample; not for kits), **Materials** (multi-file upload, title, order, language per material, audio length read in the browser), **Sales** (price, paid/free, gateway product id, checkout link, visibility, delete while unused). Live card preview "owned / locked" |
| **Integrations** | Webhook URL, signing secret (paste; previous valid 24 h; "Show" is audited), signed test event, product mapping, unknown products seen in payments, recent deliveries |
| **Two-step verification** | TOTP enrolment; once on, `/admin` needs the code and the DB requires `aal2` |
| **Activity** and top-bar **search** | Audit feed; search across members, invites and orders |

## Upload pipeline
Browser asks a server action for a one-time signed upload URL (`startUpload`, which whitelists content types and size per kind), uploads straight to the private bucket (large files never pass through the app server), then a second action verifies the object exists under that product's folder before recording it. The bucket itself enforces MIME types and 50 MB. Normalise content types on the client by extension (`audio/x-m4a` → `audio/mp4`, `application/x-zip-compressed` → `application/zip`).

## Forms in React 19
Use `useActionState` with the `keepValues()` helper (dispatch inside `startTransition` on submit) so a validation error does not reset the form. Keep one `PRODUCT_FORM` per tab: the header "Save changes" submits it.
