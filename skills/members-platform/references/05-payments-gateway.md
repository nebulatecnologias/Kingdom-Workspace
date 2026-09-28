# Payments: the gateway contract

The platform never takes money. A payment gateway (the owner's own service, Paystack/Stripe underneath, or a checkout like Hotmart) sells the product and tells the platform through **signed webhooks**. The platform grants or removes access. Keep it that way: it means the platform never touches card data and a checkout can be swapped without touching the members area.

Give the gateway developer `docs/prompt-gateway.md` from the scaffold: it is a complete brief (outgoing webhooks tab, event envelope, signature, retries, contract with the members area). Adapt the provider section (it is written for Paystack in South Africa).

## Receiver: `POST /api/webhooks/gateway`
- Read the **raw body**, verify `X-Kingdom-Signature: t=<unix>,v1=<hex>` = HMAC-SHA256 of `"<t>.<body>"`, 5-minute tolerance, current or previous secret (24 h grace after rotation). Code: `src/lib/gateway/signature.ts`. Rename the header prefix in both the receiver and the brief if you rebrand.
- Parse with zod (`src/lib/gateway/events.ts`), claim the event id (`claim_webhook_event`) — a duplicate returns 200 `duplicate`.
- Apply the event in **one transaction** (`gateway_apply_event`), then send emails after the response work is recorded; failures are retried later, never returned as 5xx for email problems.
- Test-mode events (`livemode: false`) are recorded and ignored unless `GATEWAY_ACCEPT_TEST_EVENTS=true`. Keep it `false` in production; switch it on only for a planned test and off again.
- Paid orders with an unknown `product_id` are recorded and trigger an admin alert (the buyer paid for something not linked — fix the product's gateway id and grant manually).

## Order state machine (`gateway_apply_event`)
| Event | Effect |
|---|---|
| `order.paid` | Grants each mapped product. Padlock purchases (`metadata.member_user_id`) go to that member even if the checkout email differs. Refunded or lost orders are never unlocked by a late `order.paid` |
| `order.refunded` | **Any refund, full or partial, revokes that order's access** (owner decision in Kingdom Library; make it configurable if the owner wants partial refunds to keep access) |
| `order.disputed` | Suspends access (`DISPUTE_SUSPENDS_ACCESS=true`), or keeps it until lost |
| `order.dispute_resolved` | `won` restores what the dispute suspended (never what a refund removed); `lost` revokes for good |
| `integration.test` | Acknowledged in any mode |

Terminal states are never undone. Everything is written to `orders`, `webhook_events` and `audit_log`. The DB tests cover every row of this table — add a test with every rule change.

## Padlock checkout
- Locked product → `/api/checkout/[productId]` → the product's `checkout_url` with `email`, `name`, `locale`, `ref=<user id>` and `return_url=<site>/purchase/return?product=<id>`.
- `/purchase/return` polls `/api/purchase/status` every 2 s for 60 s and opens the product with a thank-you notice when the webhook arrives; `?status=cancelled|failed` shows "Payment not completed / Try again". The redirect itself never unlocks anything.
- The gateway must allow the return URL and register the webhook URL on the production domain.

## Tools
- `npm run webhook:simulate -- --type paid --email a@b.com --products prod_x --locale pt` (signs with `GATEWAY_WEBHOOK_SECRET`; `--url` to target production).
- Admin → Integrations: paste/rotate the secret, send a signed `integration.test` to itself, see product mapping, unknown products and recent deliveries.
