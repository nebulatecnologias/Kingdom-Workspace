import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { signatureHeader } from "../src/lib/gateway/signature";
import { admin, createInvite, resetRateLimits, skipWelcome, uniqueEmail } from "./helpers";

// Must match GATEWAY_WEBHOOK_SECRET and CRON_SECRET in playwright.config.ts.
const SECRET = "whsec_e2e_test_secret";
const CRON = { Authorization: "Bearer e2e-cron-secret" };
const PASSWORD = "Str0ng-pass!23";
const PLAN_ID = "plan_e2e_all_access";
const DAY = 86_400_000;

async function deliver(request: APIRequestContext, type: string, data: object) {
  const body = { id: `evt_e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}`, type, api_version: "2026-09-01", created_at: new Date().toISOString(), livemode: true, data };
  const raw = JSON.stringify(body);
  return request.post("/api/webhooks/gateway", {
    data: raw,
    headers: { "Content-Type": "application/json", "X-Kingdom-Event-Id": body.id, "X-Kingdom-Event-Type": type, "X-Kingdom-Signature": signatureHeader([SECRET], raw) },
  });
}

function subscription(o: { id: string; email: string; member: string; status: string; trialEnd?: Date; periodEnd?: Date; cancelAtPeriodEnd?: boolean; updated: Date; plan?: string }) {
  return {
    subscription: {
      id: o.id,
      plan_id: o.plan ?? PLAN_ID,
      status: o.status,
      trial_end: o.trialEnd?.toISOString() ?? null,
      current_period_end: o.periodEnd?.toISOString() ?? null,
      cancel_at_period_end: o.cancelAtPeriodEnd ?? false,
      updated_at: o.updated.toISOString(),
      manage_url: "https://pay.example.test/manage/sub",
    },
    customer: { email: o.email, name: "Grace Plan" },
    locale: "en",
    metadata: { member_user_id: o.member },
  };
}

async function signIn(page: Page, email: string) {
  await resetRateLimits();
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

const emails = async (to: string, template: string) =>
  (await admin().from("email_log").select("id", { count: "exact", head: true }).eq("to_email", to).eq("template", template)).count ?? 0;

test("the monthly plan: admin set-up, offer, checkout, 30 free days, reminder, and the end", { tag: "@critical" }, async ({ page, browser, request }) => {
  // The admin sets the plan up in Integrations.
  const boss = uniqueEmail("admin");
  const { data: created } = await admin().auth.admin.createUser({ email: boss, password: PASSWORD, email_confirm: true, user_metadata: { full_name: "Plan Admin" } });
  await admin().from("profiles").update({ role: "admin" }).eq("id", created.user!.id);
  const ctx = await browser.newContext();
  const ap = await ctx.newPage();
  await signIn(ap, boss);
  await ap.waitForURL(/\/admin$/);
  await ap.goto("/admin/integrations");
  const form = ap.getByRole("region", { name: "Monthly plan" });
  await form.getByLabel("Gateway plan ID").fill("");
  await form.getByLabel("Offer the plan to members").check();
  await form.getByRole("button", { name: "Save plan" }).click();
  await expect(form.getByText("To offer the plan, fill in the gateway plan ID and the checkout link.")).toBeVisible();
  await form.getByLabel("Price per month (R)").fill("75,00");
  await form.getByLabel("Free days").fill("30");
  await form.getByLabel("Gateway plan ID").fill(PLAN_ID);
  await form.getByLabel("Plan checkout link").fill("https://pay.example.test/plans/all-access");
  await form.getByRole("button", { name: "Save plan" }).click();
  await expect(ap.getByText("Changes saved")).toBeVisible();
  const { data: plan } = await admin().from("plans").select("price_cents, trial_days, gateway_plan_id, active").eq("code", "all_access").single();
  expect(plan).toEqual({ price_cents: 7500, trial_days: 30, gateway_plan_id: PLAN_ID, active: true });
  await ctx.close();

  // A member without the plan sees it offered on a locked product and on the plan page.
  await resetRateLimits();
  const email = uniqueEmail("plan");
  const { url } = createInvite({ email, name: "Grace Plan", products: ["noah"] });
  await page.goto(url);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await skipWelcome(page);
  const { data: member } = await admin().from("profiles").select("id").eq("email", email).single();
  await page.goto("/products/jonah");
  await expect(page.getByRole("link", { name: /Unlock · R 69,00/ })).toBeVisible();
  await page.getByRole("link", { name: "Or get everything with the plan, 30 days free" }).click();
  await page.waitForURL(/\/plan$/);
  await expect(page.getByText("First 30 days free")).toBeVisible();
  await expect(page.getByText("R 75", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start my 30 free days" })).toBeVisible();

  // The button goes to the gateway with the member's details, like a product checkout.
  const go = await page.request.get("/api/checkout/plan", { maxRedirects: 0 });
  expect(go.status()).toBe(307);
  const target = new URL(go.headers()["location"]);
  expect(target.origin + target.pathname).toBe("https://pay.example.test/plans/all-access");
  expect(target.searchParams.get("email")).toBe(email);
  expect(target.searchParams.get("ref")).toBe(member!.id);
  expect(target.searchParams.get("return_url")).toMatch(/\/plan\?status=started$/);

  // Unknown plans are refused, so a wrong mapping never gives access.
  const t0 = Date.now();
  const wrong = await deliver(request, "subscription.created", subscription({ id: `sub_wrong_${t0}`, email, member: member!.id, status: "trialing", trialEnd: new Date(t0 + 30 * DAY), updated: new Date(t0), plan: "plan_unknown" }));
  expect(wrong.status()).toBe(422);

  // The gateway starts the free days: everything opens and the member gets one welcome email.
  const gid = `sub_e2e_${t0}`;
  const started = subscription({ id: gid, email, member: member!.id, status: "trialing", trialEnd: new Date(t0 + 30 * DAY), periodEnd: new Date(t0 + 30 * DAY), updated: new Date(t0) });
  expect((await deliver(request, "subscription.created", started)).status()).toBe(200);
  expect((await deliver(request, "subscription.updated", started)).status()).toBe(200); // the same snapshot again
  expect(await emails(email, "plan_started")).toBe(1);
  await page.goto("/plan?status=started");
  await expect(page.getByRole("heading", { name: "Welcome to the Kingdom Library plan!" })).toBeVisible();
  await expect(page.getByText(/Your free days run until/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Manage or cancel" })).toHaveAttribute("href", "https://pay.example.test/manage/sub");
  await page.goto("/products/jonah");
  await expect(page.getByRole("link", { name: "Colour online" }).first()).toBeVisible();
  const jonah = (await admin().from("products").select("id").eq("slug", "jonah").single()).data!.id;
  expect((await page.request.get(`/api/products/${jonah}/download?page=1`)).status()).toBe(200);

  // Three days before the first charge, one reminder, however often the daily job runs.
  await admin().from("subscriptions").update({ trial_ends_at: new Date(Date.now() + 2 * DAY).toISOString() }).eq("gateway_subscription_id", gid);
  expect((await request.get("/api/cron/email-retry", { headers: CRON })).status()).toBe(200);
  expect((await request.get("/api/cron/email-retry", { headers: CRON })).status()).toBe(200);
  expect(await emails(email, "trial_ending")).toBe(1);

  // A late, older snapshot changes nothing; the end of the plan closes what it opened, not what was bought.
  const stale = subscription({ id: gid, email, member: member!.id, status: "expired", updated: new Date(t0 - 60_000) });
  expect((await deliver(request, "subscription.ended", stale)).status()).toBe(200);
  await page.reload();
  await expect(page.getByRole("link", { name: "Colour online" }).first()).toBeVisible();
  const ended = subscription({ id: gid, email, member: member!.id, status: "expired", updated: new Date(t0 + 60_000) });
  expect((await deliver(request, "subscription.ended", ended)).status()).toBe(200);
  expect((await page.request.get(`/api/products/${jonah}/download?page=1`)).status()).toBe(403);
  await page.goto("/products/noah");
  await expect(page.getByRole("link", { name: "Colour online" }).first()).toBeVisible();
  await page.goto("/plan");
  await expect(page.getByText("Your previous plan has ended. You can start it again below.")).toBeVisible();

  await admin().from("subscriptions").delete().eq("email", email);
  await admin().from("plans").update({ gateway_plan_id: null, checkout_url: null, active: false }).eq("code", "all_access");
});
