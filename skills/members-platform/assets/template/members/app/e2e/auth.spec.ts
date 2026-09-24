import { expect, test, type Page } from "@playwright/test";
import { admin, createInvite, latestLink, resetRateLimits, uniqueEmail } from "./helpers";

const PASSWORD = "Str0ng-pass!23";

async function acceptInvite(page: Page, url: string, opts: { password?: string } = {}) {
  await resetRateLimits();
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  if (opts.password) await page.getByLabel("Password", { exact: true }).fill(opts.password);
  else await page.getByLabel("Skip the password").check();
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await page.waitForURL(/\/library\?welcome=1$/);
}

test.describe.configure({ mode: "serial" });

const member = { email: uniqueEmail("member"), url: "" };

test("invite → create account → library, with purchases linked", { tag: "@critical" }, async ({ page }) => {
  member.url = createInvite({ email: member.email, name: "Thandi Test", products: ["noah", "money"] }).url;
  await page.goto(member.url);
  await expect(page.locator("#iv-email")).toHaveValue(member.email);
  await expect(page.locator(".bought")).toContainText("Noah’s Ark & the Rainbow");
  await expect(page.locator(".bought")).toContainText("Money God’s Way");
  await acceptInvite(page, member.url, { password: PASSWORD });
  await expect(page.getByRole("heading", { name: "Hello, Thandi" })).toBeVisible();
  await expect(page.getByText("Welcome to Kingdom Library!")).toBeVisible();

  const { data: profile } = await admin().from("profiles").select("id, full_name, terms_accepted_at").eq("email", member.email).single();
  expect(profile?.full_name).toBe("Thandi Test");
  expect(profile?.terms_accepted_at).not.toBeNull();
  const { count } = await admin().from("entitlements").select("id", { count: "exact", head: true }).eq("user_id", profile!.id).is("revoked_at", null);
  expect(count).toBe(2);
});

test("an invite link works only once", async ({ page }) => {
  await page.goto(member.url);
  await expect(page.getByRole("heading", { name: "This link has already been used" })).toBeVisible();
});

test("validation explains what to fix", async ({ page }) => {
  const { url } = createInvite({ email: uniqueEmail("validate") });
  await page.goto(url);
  await page.getByLabel("Your name").fill("");
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await expect(page.getByText("Please tell us your name.")).toBeVisible();
  await expect(page.getByText("Use at least 8 characters")).toBeVisible();
  await expect(page.getByText("Please accept the terms to continue.")).toBeVisible();
});

test("an expired invite offers a fresh link that works", { tag: "@critical" }, async ({ page }) => {
  const email = uniqueEmail("expired");
  const { url } = createInvite({ email, ttlDays: -1 });
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "This link has expired" })).toBeVisible();
  const before = new Date();
  await page.getByRole("button", { name: "Send me a new link" }).click();
  await expect(page.getByText(`If we find a purchase for ${email}`)).toBeVisible();
  const fresh = await latestLink(email, "invite", before);
  expect(fresh).not.toBe(url);
  await acceptInvite(page, fresh);
});

test("password sign-in, wrong password and sign-out", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member.email);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("That email and password don’t match.")).toBeVisible();

  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);
  await page.getByRole("button", { name: "Sign out" }).first().click();
  await page.waitForURL(/\/login$/);
});

test("email-link sign-in needs a button press (mail scanners cannot use it)", { tag: "@critical" }, async ({ page }) => {
  await page.goto("/login");
  const before = new Date();
  await page.getByLabel("Email").fill(member.email);
  await page.getByRole("button", { name: "Send sign-in link" }).click();
  await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
  const link = await latestLink(member.email, "signin", before);

  // A scanner opening the link does not sign anyone in and does not use the token.
  const res = await page.request.get(link);
  expect(res.ok()).toBe(true);
  await page.goto(link);
  await page.getByRole("button", { name: "Sign me in" }).click();
  await page.waitForURL(/\/library$/);
  await expect(page.getByRole("heading", { name: "Hello, Thandi" })).toBeVisible();
});

test("signed-out visitors are sent to sign in; members cannot open admin", async ({ page, browser }) => {
  const anon = await browser.newContext();
  const p = await anon.newPage();
  await p.goto("/library");
  await expect(p).toHaveURL(/\/login\?next=%2Flibrary$/);
  await anon.close();

  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member.email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/library$/);
});

test("forgot password → reset → sign in with the new password", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member.email);
  const before = new Date();
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(page.getByText(`We’ve sent a password reset link to ${member.email}.`)).toBeVisible();
  const link = await latestLink(member.email, "reset", before);
  await page.goto(link);
  await page.getByRole("button", { name: "Choose a new password" }).click();
  await page.waitForURL(/\/auth\/reset$/);
  await page.getByLabel("Password", { exact: true }).fill("An0ther-pass!45");
  await page.getByRole("button", { name: "Save new password" }).click();
  await page.waitForURL(/\/library\?notice=password$/);
  await expect(page.getByText("Your new password is saved.")).toBeVisible();
});

test("a Portuguese invite opens in Portuguese", async ({ page }) => {
  const { url } = createInvite({ email: uniqueEmail("pt"), locale: "pt", name: "Ana Sitoe" });
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Crie a sua conta" })).toBeVisible();
});

test("the terms and privacy pages open from the invite", async ({ page }) => {
  for (const [path, heading] of [["/legal/terms", "Terms of Use"], ["/legal/privacy", "Privacy Policy"]]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(page.getByRole("link", { name: "contact@sheltondouglas.co.za" })).toBeVisible();
  }
});

test("emails never follow the browser's language: without a chosen language they go in English", async ({ browser }) => {
  await resetRateLimits();
  // A buyer with a purchase by email but no account and no invite, on a Portuguese browser.
  const email = uniqueEmail("browser-pt");
  const { data: noah } = await admin().from("products").select("id").eq("slug", "noah").single();
  await admin().from("entitlements").insert({ email, product_id: noah!.id, source: "manual" });
  const context = await browser.newContext({ locale: "pt-PT" });
  const page = await context.newPage();
  await page.goto("/access");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Enviar-me um novo link" }).click();
  await expect(page.getByText(/Se encontrarmos uma compra/)).toBeVisible();
  await expect
    .poll(async () => (await admin().from("email_log").select("locale").eq("to_email", email).eq("template", "invite").maybeSingle()).data?.locale)
    .toBe("en");
  await context.close();
});

test("the refund policy is public and linked from the terms", async ({ page }) => {
  await page.goto("/legal/terms");
  await page.getByRole("link", { name: "Refund Policy" }).click();
  await expect(page).toHaveURL(/\/legal\/refunds$/);
  await expect(page.getByRole("heading", { name: "Refund Policy", level: 1 })).toBeVisible();
  await expect(page.getByText("You may ask for a refund within 7 days of your purchase.")).toBeVisible();
});
