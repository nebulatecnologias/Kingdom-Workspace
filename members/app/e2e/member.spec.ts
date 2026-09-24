import { expect, test, type Page } from "@playwright/test";
import { admin, createInvite, resetRateLimits, uniqueEmail } from "./helpers";

const PASSWORD = "Str0ng-pass!23";
const BASE = "http://localhost:3000";

async function join(page: Page, products: string[], name = "Lerato Dube") {
  await resetRateLimits();
  const email = uniqueEmail("member");
  const { url } = createInvite({ email, name, products });
  await page.goto(url);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await page.waitForURL(/\/library\?welcome=1$/);
  return email;
}

async function productId(slug: string) {
  const { data } = await admin().from("products").select("id").eq("slug", slug).single();
  return data!.id as string;
}

test.describe.configure({ mode: "serial" });

let member = "";

test("the library shows owned, free, locked and coming-soon products by section", async ({ page }) => {
  member = await join(page, ["noah", "money"]);
  await expect(page.getByRole("heading", { name: "For children" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Noah’s Ark & the Rainbow", exact: true })).toContainText("Unlocked");
  await expect(page.getByRole("link", { name: "Memory Verse Cards", exact: true })).toContainText("Free");
  await expect(page.getByRole("link", { name: "Jonah and the Big Fish: Locked" })).toContainText("R 69,00");
  await expect(page.locator(".pack.is-soon")).toContainText("Coming soon");
  await expect(page.getByText("The Easter Story")).toHaveCount(0); // hidden products never show

  await page.getByRole("link", { name: /My library/ }).click();
  await expect(page.locator(".lib-grid .pack")).toHaveCount(3);
  await page.goto("/library?q=jonah");
  await expect(page.locator(".lib-grid .pack")).toHaveCount(1);
  await expect(page.locator("#top-search")).toHaveValue("jonah");
});

test("reading saves progress and the library offers to continue", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);

  await page.goto("/products/money");
  await page.getByRole("link", { name: "Read online" }).click();
  await expect(page.getByRole("heading", { name: "Whose money is it?" })).toBeVisible();
  await page.getByRole("link", { name: "Next chapter" }).click();
  await expect(page.getByRole("heading", { name: "Contentment in a world of more" })).toBeVisible();
  const { data: me } = await admin().from("profiles").select("id").eq("email", member).single();
  await expect.poll(async () => {
    const { data } = await admin().from("reading_progress").select("chapter_position").eq("user_id", me!.id).eq("product_id", await productId("money"));
    return data?.[0]?.chapter_position ?? 0;
  }).toBe(2);

  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Keep reading Money God’s Way" })).toBeVisible();
  await expect(page.getByText("Chapter 2 of 9")).toBeVisible();
});

test("a locked guide offers its free sample and stops at chapter 2", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);

  await page.goto("/products/sermon");
  await expect(page.getByRole("link", { name: /Unlock · R 149,00/ })).toBeVisible();
  await page.getByRole("link", { name: "Read a free sample" }).click();
  await expect(page.getByRole("heading", { name: "Pray and choose the passage" })).toBeVisible();
  await expect(page.locator("article.reader p").first()).toBeVisible();

  await page.goto("/products/sermon/read/2");
  await expect(page.getByText("You’ve reached the end of the free sample.")).toBeVisible();
  await expect(page.locator("article.reader")).toHaveCount(0);
});

test("colouring online is for owners and remembers the colours", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);

  await page.goto("/products/noah");
  await page.getByRole("link", { name: "Colour online" }).first().click();
  await expect(page.getByRole("heading", { name: /Colour it in/ })).toBeVisible();
  await page.getByRole("button", { name: "Colour 4" }).click();
  const region = page.locator("#colour-svg .r").first();
  await region.click({ force: true });
  await expect(region).toHaveAttribute("fill", "#6cc56a");
  await page.reload();
  await expect(page.locator("#colour-svg .r").first()).toHaveAttribute("fill", "#6cc56a");

  await page.goto("/products/jonah/colour/1");
  await expect(page).toHaveURL(/\/products\/jonah$/);
});

test("downloads need access, even with the direct URL", async ({ page, request, browser }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);

  const noah = await productId("noah");
  const jonah = await productId("jonah");
  const owned = await page.request.get(`/api/products/${noah}/download?page=1`);
  expect(owned.status()).toBe(200);
  expect(owned.headers()["content-disposition"]).toContain("attachment");
  expect(await owned.text()).toContain("<svg");

  expect((await page.request.get(`/api/products/${jonah}/download?page=1`)).status()).toBe(403);
  expect((await page.request.get(`/api/products/${jonah}/download?format=pdf`)).status()).toBe(403);

  const visitor = await browser.newContext();
  expect((await visitor.request.get(`${BASE}/api/products/${noah}/download?page=1`)).status()).toBe(401);
  await visitor.close();
  void request;
});

test("stored files are served through short-lived signed links", async ({ page }) => {
  // Needs Supabase Storage (CI runs it). The lightweight local stack has no storage, so it is skipped there.
  const probe = await admin().storage.listBuckets();
  test.skip(Boolean(probe.error) && !process.env.E2E_REQUIRE_STORAGE, "Supabase Storage is not running");

  const money = await productId("money");
  const path = `e2e/${money}/money-en.pdf`;
  const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
  const up = await admin().storage.from("products").upload(path, pdf, { contentType: "application/pdf", upsert: true });
  expect(up.error).toBeNull();
  await admin().from("product_files").upsert({ product_id: money, locale: "en", format: "pdf", path, size_bytes: pdf.length }, { onConflict: "product_id,locale,format" });

  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);

  const res = await page.request.get(`/api/products/${money}/download?format=pdf`, { maxRedirects: 0 });
  expect(res.status()).toBe(302);
  const location = res.headers()["location"];
  expect(location).toContain("/storage/v1/object/sign/products/");
  const file = await page.request.get(location);
  expect(file.status()).toBe(200);
  expect((await file.body()).subarray(0, 5).toString()).toBe("%PDF-");
});

test("the padlock goes to the product's checkout with the member's details", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(member);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/\/library$/);

  const jonah = await productId("jonah");
  await admin().from("products").update({ checkout_url: null }).eq("id", jonah);
  await page.goto("/products/jonah");
  await page.getByRole("link", { name: /Unlock · R 69,00/ }).click();
  await expect(page).toHaveURL(/\/products\/jonah\?checkout=unavailable$/);
  await expect(page.getByText("Online checkout for this product isn’t open yet.")).toBeVisible();

  await admin().from("products").update({ checkout_url: "https://pay.example.com/c/jonah" }).eq("id", jonah);
  const res = await page.request.get(`/api/checkout/${jonah}`, { maxRedirects: 0 });
  expect([302, 303, 307]).toContain(res.status());
  const target = new URL(res.headers()["location"]);
  expect(target.origin + target.pathname).toBe("https://pay.example.com/c/jonah");
  expect(target.searchParams.get("email")).toBe(member);
  const { data: profile } = await admin().from("profiles").select("id").eq("email", member).single();
  expect(target.searchParams.get("ref")).toBe(profile!.id);
  expect(target.searchParams.get("return_url")).toContain(`/purchase/return?product=${jonah}`);
  await admin().from("products").update({ checkout_url: null }).eq("id", jonah);
});

test("profile: name, language, password, data export and account deletion", async ({ page }) => {
  const email = await join(page, ["jonah"], "Sipho Test");
  await page.goto("/profile");

  await page.getByLabel("Your name").fill("Sipho Nkosi");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect(page.locator(".user-chip")).toContainText("Sipho Nkosi");

  await page.getByRole("button", { name: "Change password" }).click();
  await page.getByLabel("New password").fill("An0ther-pass!45");
  await page.getByRole("button", { name: "Save", exact: true }).last().click();
  await expect(page.getByText("Your new password is saved.")).toBeVisible();

  const exported = await page.request.get("/api/me/export");
  expect(exported.status()).toBe(200);
  const data = await exported.json();
  expect(data.profile.email).toBe(email);
  expect(data.library.length).toBe(1);

  await page.getByRole("button", { name: "Português" }).click();
  await expect(page.getByRole("heading", { name: "Perfil", exact: true })).toBeVisible();
  const { data: p } = await admin().from("profiles").select("id, locale").eq("email", email).single();
  expect(p?.locale).toBe("pt");

  await page.getByRole("button", { name: "Apagar a minha conta" }).click();
  await page.getByRole("button", { name: "Sim, apagar" }).click();
  await page.waitForURL(/\/login\?notice=deleted$/);
  const { count: profiles } = await admin().from("profiles").select("id", { count: "exact", head: true }).eq("email", email);
  expect(profiles).toBe(0);
  const { count: grants } = await admin().from("entitlements").select("id", { count: "exact", head: true }).eq("email", email);
  expect(grants).toBe(0);
  const { data: user } = await admin().auth.admin.getUserById(p!.id);
  expect(user.user).toBeNull();
});
