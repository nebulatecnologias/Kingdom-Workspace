import { expect, test, type Page } from "@playwright/test";
import { signatureHeader } from "../src/lib/gateway/signature";
import { admin, createInvite, resetRateLimits, uniqueEmail } from "./helpers";

// Must match GATEWAY_WEBHOOK_SECRET in playwright.config.ts.
const SECRET = "whsec_e2e_test_secret";
const PASSWORD = "Str0ng-pass!23";

async function join(page: Page) {
  await resetRateLimits();
  const email = uniqueEmail("padlock");
  const { url } = createInvite({ email, name: "Naledi Buyer", products: ["noah"] });
  await page.goto(url);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await page.waitForURL(/\/library\?welcome=1$/);
  const { data } = await admin().from("profiles").select("id").eq("email", email).single();
  return { email, id: data!.id as string };
}

async function productId(slug: string) {
  const { data } = await admin().from("products").select("id").eq("slug", slug).single();
  return data!.id as string;
}

test("after the checkout, the return page waits for the payment and opens the product; a refund takes it back", { tag: "@critical" }, async ({ page, request }) => {
  const member = await join(page);
  const jonah = await productId("jonah");

  await page.goto(`/purchase/return?product=${jonah}`);
  await expect(page.getByRole("heading", { name: "Confirming your payment…" })).toBeVisible();

  // The gateway confirms the padlock purchase (paid with another email at checkout).
  const body = JSON.stringify({
    id: `evt_e2e_return_${Date.now()}`,
    type: "order.paid",
    api_version: "2026-09-01",
    created_at: new Date().toISOString(),
    livemode: true,
    data: {
      order: { id: `ord_return_${Date.now()}`, reference: "KG-RETURN", status: "paid", amount: 6900, currency: "ZAR", refunded_amount: 0 },
      customer: { email: uniqueEmail("other-card"), name: "Naledi Buyer" },
      locale: "en",
      items: [{ product_id: "prod_jonah", quantity: 1, unit_amount: 6900 }],
      metadata: { member_user_id: member.id, source: "checkout" },
    },
  });
  const res = await request.post("/api/webhooks/gateway", {
    data: body,
    headers: { "Content-Type": "application/json", "X-Kingdom-Signature": signatureHeader([SECRET], body) },
  });
  expect(res.status()).toBe(200);

  await page.waitForURL(/\/products\/jonah\?unlocked=1$/, { timeout: 15_000 });
  await expect(page.getByText("Thank you! Jonah and the Big Fish is unlocked and in your library.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Colour online" }).first()).toBeVisible();

  // Coming back to the return page later goes straight to the product.
  await page.goto(`/purchase/return?product=${jonah}`);
  await expect(page).toHaveURL(/\/products\/jonah\?unlocked=1$/);

  // A full refund takes it away again.
  const refund = JSON.stringify({
    id: `evt_e2e_refund_${Date.now()}`,
    type: "order.refunded",
    api_version: "2026-09-01",
    created_at: new Date().toISOString(),
    livemode: true,
    data: { ...JSON.parse(body).data, full_refund: true, refunded_amount: 6900 },
  });
  const refunded = await request.post("/api/webhooks/gateway", {
    data: refund,
    headers: { "Content-Type": "application/json", "X-Kingdom-Signature": signatureHeader([SECRET], refund) },
  });
  expect(refunded.status()).toBe(200);
  await page.goto("/products/jonah");
  await expect(page.getByRole("link", { name: /Unlock · R 69,00/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Colour online" })).toHaveCount(0);
});

test("a cancelled checkout offers to try again, and the status API answers only for the member", async ({ page, browser }) => {
  await join(page);
  const sermon = await productId("sermon");
  await page.goto(`/purchase/return?product=${sermon}&status=cancelled`);
  await expect(page.getByRole("heading", { name: "Payment not completed" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Try again" })).toHaveAttribute("href", `/api/checkout/${sermon}`);

  const status = await page.request.get(`/api/purchase/status?product=${sermon}`);
  expect(await status.json()).toEqual({ owned: false });

  const visitor = await browser.newContext();
  expect((await visitor.request.get(`http://localhost:3000/api/purchase/status?product=${sermon}`)).status()).toBe(401);
  const p = await visitor.newPage();
  await p.goto(`/purchase/return?product=${sermon}`);
  await expect(p).toHaveURL(/\/login\?next=/);
  await visitor.close();
});
