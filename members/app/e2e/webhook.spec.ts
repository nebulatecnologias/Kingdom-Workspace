import { expect, test, type APIRequestContext } from "@playwright/test";
import { signatureHeader } from "../src/lib/gateway/signature";
import { admin, latestLink, resetRateLimits, uniqueEmail } from "./helpers";

// Must match GATEWAY_WEBHOOK_SECRET in playwright.config.ts.
const SECRET = "whsec_e2e_test_secret";

type EventOpts = { type?: string; id?: string; email: string; order: string; products?: string[]; extra?: Record<string, unknown>; member?: string };

function event(o: EventOpts) {
  return {
    id: o.id ?? `evt_e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    type: o.type ?? "order.paid",
    api_version: "2026-09-01",
    created_at: new Date().toISOString(),
    livemode: true,
    data: {
      order: { id: o.order, reference: `KG-${o.order}`, status: "paid", amount: 8900, currency: "ZAR", refunded_amount: 0, ...(o.extra?.order as object) },
      customer: { email: o.email, name: "Lerato Dube", phone: null },
      locale: "en",
      items: (o.products ?? []).map((product_id) => ({ product_id, quantity: 1, unit_amount: 8900 })),
      metadata: { member_user_id: o.member ?? null, source: "checkout" },
      ...Object.fromEntries(Object.entries(o.extra ?? {}).filter(([k]) => k !== "order")),
    },
  };
}

async function deliver(request: APIRequestContext, body: object, opts: { secret?: string; timestamp?: number } = {}) {
  const raw = JSON.stringify(body);
  return request.post("/api/webhooks/gateway", {
    data: raw,
    headers: {
      "Content-Type": "application/json",
      "X-Kingdom-Event-Id": (body as { id: string }).id,
      "X-Kingdom-Event-Type": (body as { type: string }).type,
      "X-Kingdom-Signature": signatureHeader([opts.secret ?? SECRET], raw, opts.timestamp),
    },
  });
}

async function activeEntitlements(email: string) {
  const { count } = await admin().from("entitlements").select("id", { count: "exact", head: true }).eq("email", email).is("revoked_at", null);
  return count ?? 0;
}

async function emailCount(to: string, template: string) {
  const { count } = await admin().from("email_log").select("id", { count: "exact", head: true }).eq("to_email", to).eq("template", template);
  return count ?? 0;
}

test.describe.configure({ mode: "serial" });

const buyer = { email: uniqueEmail("buyer"), order: `ord_e2e_${Date.now()}` };
const paid = event({ email: buyer.email, order: buyer.order, products: ["prod_noah_ark", "prod_money_gods_way"] });

test("order.paid for a new buyer grants access and emails an invite", async ({ request, page }) => {
  const res = await deliver(request, paid);
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ received: true, result: "processed" });
  expect(await activeEntitlements(buyer.email)).toBe(2);

  await resetRateLimits();
  const link = await latestLink(buyer.email, "invite");
  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.locator(".bought")).toContainText("Noah’s Ark & the Rainbow");
  await page.getByLabel("Skip the password").check();
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await page.waitForURL(/\/library\?welcome=1$/);

  const { data: profile } = await admin().from("profiles").select("id").eq("email", buyer.email).single();
  const { count } = await admin().from("entitlements").select("id", { count: "exact", head: true }).eq("user_id", profile!.id).is("revoked_at", null);
  expect(count).toBe(2);
});

test("the same event delivered twice changes nothing", async ({ request }) => {
  const res = await deliver(request, paid);
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ duplicate: true });
  expect(await activeEntitlements(buyer.email)).toBe(2);
  expect(await emailCount(buyer.email, "invite")).toBe(1);
  const { count } = await admin().from("orders").select("id", { count: "exact", head: true }).eq("gateway_order_id", buyer.order);
  expect(count).toBe(1);
});

test("a bad or stale signature is rejected and logged", async ({ request }) => {
  const forged = event({ email: uniqueEmail("forged"), order: `ord_forged_${Date.now()}`, products: ["prod_jonah"] });
  const bad = await deliver(request, forged, { secret: "not-the-secret" });
  expect(bad.status()).toBe(401);
  const stale = await deliver(request, forged, { timestamp: Math.floor(Date.now() / 1000) - 600 });
  expect(stale.status()).toBe(401);

  const { data } = await admin().from("webhook_events").select("error, signature_ok, payload").eq("signature_ok", false).order("received_at", { ascending: false }).limit(2);
  expect(data?.map((r) => r.error).sort()).toEqual(["signature mismatch", "signature stale"]);
  expect((data?.[0]?.payload as { header_event_id?: string }).header_event_id).toBe(forged.id);
  const { count } = await admin().from("orders").select("id", { count: "exact", head: true }).eq("gateway_order_id", forged.data.order.id);
  expect(count).toBe(0);
});

test("a padlock purchase unlocks the member's account and sends the unlocked email", async ({ request }) => {
  const { data: profile } = await admin().from("profiles").select("id, email").eq("email", buyer.email).single();
  const res = await deliver(request, event({ email: uniqueEmail("checkout-alias"), order: `ord_pad_${Date.now()}`, products: ["prod_jonah"], member: profile!.id }));
  expect(res.status()).toBe(200);
  expect(await activeEntitlements(buyer.email)).toBe(3);
  expect(await emailCount(buyer.email, "unlocked")).toBe(1);
});

test("a full refund removes access from that order only", async ({ request }) => {
  const res = await deliver(request, event({
    type: "order.refunded",
    email: buyer.email,
    order: buyer.order,
    extra: { order: { refunded_amount: 8900, full_refund: true } },
  }));
  expect(res.status()).toBe(200);
  expect(await activeEntitlements(buyer.email)).toBe(1); // only the padlock purchase remains
  const { data } = await admin().from("orders").select("status").eq("gateway_order_id", buyer.order).single();
  expect(data?.status).toBe("refunded");
});

test("integration.test and malformed events", async ({ request }) => {
  const ping = await deliver(request, { id: `evt_ping_${Date.now()}`, type: "integration.test", livemode: true, data: { message: "hi" } });
  expect(ping.status()).toBe(200);
  const noOutcome = await deliver(request, event({ type: "order.dispute_resolved", email: buyer.email, order: buyer.order }));
  expect(noOutcome.status()).toBe(422);
});
