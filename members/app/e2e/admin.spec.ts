import { createHmac } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { admin, createInvite, latestLink, resetRateLimits, uniqueEmail } from "./helpers";

const PASSWORD = "Adm1n-pass!23";

/** A fresh administrator account (created with the service role, as an owner would in Supabase). */
async function createAdmin(name = "Kingdom Admin") {
  const email = uniqueEmail("admin");
  const { data, error } = await admin().auth.admin.createUser({ email, password: PASSWORD, email_confirm: true, user_metadata: { full_name: name } });
  if (error) throw error;
  await admin().from("profiles").update({ role: "admin" }).eq("id", data.user.id);
  return { email, id: data.user.id };
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await resetRateLimits();
  await page.goto("/login");
  await page.getByRole("button", { name: "Use password" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

async function productId(slug: string) {
  const { data } = await admin().from("products").select("id").eq("slug", slug).single();
  return data!.id as string;
}

async function lastAudit(action: string) {
  const { data } = await admin().from("audit_log").select("action, actor_id, target_id, meta").eq("action", action).order("id", { ascending: false }).limit(1);
  return data?.[0];
}

/** RFC 6238 code (30 s, 6 digits, SHA-1) from a base32 secret, as an authenticator app computes it. */
function totp(secret: string, at = Date.now()) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secret.replace(/=+$/, "").toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const h = createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

test.describe.configure({ mode: "serial" });

let boss = { email: "", id: "" };

test.beforeAll(async () => {
  boss = await createAdmin("Naledi Admin");
});

test("members cannot reach admin pages or admin actions' data", async ({ page }) => {
  await resetRateLimits();
  const email = uniqueEmail("plain");
  const { url } = createInvite({ email, name: "Plain Member", products: ["noah"] });
  await page.goto(url);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await page.waitForURL(/\/library\?welcome=1$/);
  for (const path of ["/admin/invites", "/admin/members", "/admin/showcase", "/admin/integrations", "/admin/activity"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/library$/);
  }
});

test("overview, then a manual invite: send, copy a new link, revoke and resend", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Pending invites")).toBeVisible();

  const email = uniqueEmail("manual");
  await page.getByRole("link", { name: "New invite" }).first().click();
  const drawer = page.getByRole("dialog", { name: "New invite" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Send invite" }).click();
  await expect(drawer.getByText("Enter a valid email address, like name@example.co.za.")).toBeVisible();
  await expect(drawer.getByText("Choose at least one product.")).toBeVisible();
  await drawer.getByLabel("Email").fill(email);
  await drawer.getByLabel("Name").fill("Zanele Khumalo");
  await drawer.getByLabel("Link expires after").selectOption("3");
  await drawer.getByRole("checkbox", { name: /Jonah and the Big Fish/ }).check();
  await drawer.getByRole("button", { name: "Send invite" }).click();
  await expect(page.getByText(`Invite sent to ${email}`)).toBeVisible();
  await expect(drawer).toBeHidden();

  const { data: invite } = await admin().from("invites").select("id, status, source, expires_at, created_by").eq("email", email).single();
  expect(invite!.source).toBe("manual");
  expect(invite!.created_by).toBe(boss.id);
  expect(new Date(invite!.expires_at).getTime() - Date.now()).toBeLessThan(3 * 86_400_000 + 60_000);
  const firstLink = await latestLink(email, "invite");
  const { count: grants } = await admin().from("entitlements").select("id", { count: "exact", head: true }).eq("email", email).is("revoked_at", null);
  expect(grants).toBe(1);
  expect((await lastAudit("admin.invite.sent"))?.actor_id).toBe(boss.id);

  const row = page.getByRole("row", { name: new RegExp(email.replace(/[.+]/g, "\\$&")) });
  await row.getByRole("button", { name: `Copy link: ${email}` }).click();
  await expect(page.getByText("Invite link copied")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("/invite/");
  expect(copied).not.toBe(firstLink);

  await row.getByRole("button", { name: `Revoke: ${email}` }).click();
  await row.getByRole("button", { name: "Yes" }).click();
  await expect(page.getByText("Invite revoked. The link no longer works.")).toBeVisible();
  await expect(row.getByText("Revoked")).toBeVisible();
  const { count: afterRevoke } = await admin().from("entitlements").select("id", { count: "exact", head: true }).eq("email", email).is("revoked_at", null);
  expect(afterRevoke).toBe(0);

  const anon = await page.context().browser()!.newContext();
  const p2 = await anon.newPage();
  await p2.goto(copied);
  await expect(p2.getByRole("button", { name: "Create account and open my library" })).toHaveCount(0);
  await anon.close();

  await row.getByRole("button", { name: `Resend: ${email}` }).click();
  await expect(page.getByText(`Invite resent to ${email}`)).toBeVisible();
  await expect(row.getByText("Sent", { exact: true })).toBeVisible();
  const { count: regranted } = await admin().from("entitlements").select("id", { count: "exact", head: true }).eq("email", email).is("revoked_at", null);
  expect(regranted).toBe(1);

  await page.goto("/admin/invites?status=revoked");
  await expect(page.getByRole("row", { name: new RegExp(email.replace(/[.+]/g, "\\$&")) })).toHaveCount(0);
});

test("inviting someone who already has an account puts the product straight in their library", async ({ page }) => {
  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  const { data: member } = await admin().from("profiles").select("id, email").eq("role", "member").order("created_at", { ascending: false }).limit(1).single();
  const sermon = await productId("sermon");
  await admin().from("entitlements").update({ revoked_at: new Date().toISOString() }).eq("email", member!.email).eq("product_id", sermon).is("revoked_at", null);

  await page.goto("/admin/invites?new=1");
  const drawer = page.getByRole("dialog", { name: "New invite" });
  await drawer.getByLabel("Email").fill(member!.email);
  await drawer.getByRole("checkbox", { name: /Build a Sermon/ }).check();
  await drawer.getByRole("button", { name: "Send invite" }).click();
  await expect(page.getByText(`${member!.email} already has an account`)).toBeVisible();
  const { data: grant } = await admin().from("entitlements").select("user_id, source").eq("email", member!.email).eq("product_id", sermon).is("revoked_at", null).single();
  expect(grant!.user_id).toBe(member!.id);
  expect(grant!.source).toBe("manual");
});

test("members: search, give and remove a product, sign-in link, deactivate and reactivate", async ({ page, browser }) => {
  await resetRateLimits();
  const email = uniqueEmail("managed");
  const { url } = createInvite({ email, name: "Bongani Managed", products: ["noah"] });
  const m = await browser.newContext();
  const mp = await m.newPage();
  await mp.goto(url);
  await mp.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await mp.locator('input[name="terms"]').check();
  await mp.getByRole("button", { name: "Create account and open my library" }).click();
  await mp.waitForURL(/\/library\?welcome=1$/);

  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  await page.goto(`/admin/members?q=${encodeURIComponent("Bongani")}`);
  await page.getByRole("link", { name: "Bongani Managed" }).first().click();
  await expect(page.getByRole("heading", { name: "Bongani Managed" })).toBeVisible();

  const jonah = await productId("jonah");
  await page.getByRole("switch", { name: "Jonah and the Big Fish" }).check();
  await expect(page.getByText("Jonah and the Big Fish granted to Bongani Managed")).toBeVisible();
  await expect.poll(async () => (await admin().from("entitlements").select("id").eq("email", email).eq("product_id", jonah).is("revoked_at", null)).data?.length).toBe(1);
  await mp.goto("/products/jonah");
  await expect(mp.getByRole("link", { name: "Colour online" }).first()).toBeVisible();

  await page.getByRole("switch", { name: "Noah’s Ark & the Rainbow" }).uncheck();
  await expect(page.getByText("Noah’s Ark & the Rainbow removed from Bongani Managed")).toBeVisible();
  await expect.poll(async () => (await admin().from("entitlements").select("id").eq("email", email).eq("product_id", await productId("noah")).is("revoked_at", null)).data?.length).toBe(0);

  const before = new Date();
  await page.getByRole("button", { name: "Send sign-in link" }).click();
  await expect(page.getByText(`Sign-in link sent to ${email}`)).toBeVisible();
  expect(await latestLink(email, "signin", before)).toContain("/auth/confirm");

  await page.getByRole("button", { name: "Deactivate account" }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  await expect(page.getByText("Bongani Managed can no longer sign in")).toBeVisible();
  await mp.goto("/library");
  await expect(mp).toHaveURL(/\/login/);
  await m.close();
  const other = await browser.newContext();
  const op = await other.newPage();
  await signIn(op, email);
  await expect(op.getByText("That email and password don’t match.", { exact: false })).toBeVisible();
  await other.close();

  await page.getByRole("button", { name: "Reactivate account" }).click();
  await expect(page.getByText("Bongani Managed can sign in again")).toBeVisible();
  const again = await browser.newContext();
  const ap = await again.newPage();
  await signIn(ap, email);
  await ap.waitForURL(/\/library$/);
  await again.close();

  await page.goto("/admin/activity");
  await expect(page.getByText(/reactivated/).first()).toBeVisible();
  const { data: actions } = await admin().from("audit_log").select("action").eq("target_id", (await admin().from("profiles").select("id").eq("email", email).single()).data!.id);
  expect(actions!.map((a) => a.action)).toEqual(expect.arrayContaining(["admin.access.granted", "admin.access.removed", "admin.member.link_sent", "admin.member.deactivated", "admin.member.reactivated"]));
});

test("changing a member's email moves their access and links purchases waiting under the new email", async ({ page, browser }) => {
  await resetRateLimits();
  const oldEmail = uniqueEmail("typo");
  const newEmail = uniqueEmail("fixed");
  const { url } = createInvite({ email: oldEmail, name: "Typo Person", products: ["noah"] });
  const m = await browser.newContext();
  const mp = await m.newPage();
  await mp.goto(url);
  await mp.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await mp.locator('input[name="terms"]').check();
  await mp.getByRole("button", { name: "Create account and open my library" }).click();
  await mp.waitForURL(/\/library\?welcome=1$/);
  await m.close();
  const { data: person } = await admin().from("profiles").select("id").eq("email", oldEmail).single();
  // A purchase made with the right email before the fix, waiting for an account.
  await admin().from("entitlements").insert({ email: newEmail, product_id: await productId("jonah"), source: "order" });

  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  await page.goto(`/admin/members/${person!.id}`);
  await page.getByRole("button", { name: "Change email" }).click();
  await page.getByLabel("New email").fill(boss.email);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Another account already uses this email.")).toBeVisible();
  await page.getByLabel("New email").fill(newEmail);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Email changed")).toBeVisible();

  const { data: grants } = await admin().from("entitlements").select("email, product_id").eq("user_id", person!.id).is("revoked_at", null);
  expect(grants!.map((g) => g.email)).toEqual([newEmail, newEmail]);
  const other = await browser.newContext();
  const op = await other.newPage();
  await signIn(op, newEmail);
  await op.waitForURL(/\/library$/);
  await op.goto("/products/jonah");
  await expect(op.getByRole("link", { name: "Colour online" }).first()).toBeVisible();
  await other.close();
  expect((await lastAudit("admin.member.email_changed"))?.meta).toMatchObject({ email: newEmail, previous: oldEmail });
});

test("showcase: keyboard reordering, visibility, and sections in three languages", async ({ page }) => {
  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/showcase");
  const handles = page.getByRole("button", { name: /^Drag to reorder, or use the arrow keys: / });
  const firstName = (await handles.first().getAttribute("aria-label"))!.split(": ")[1];
  await handles.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByText("Showcase order saved")).toBeVisible();
  const { data: order } = await admin().from("products").select("slug, sort_order, product_translations(locale, title)").order("sort_order");
  const titles = order!.map((p) => (p.product_translations as { locale: string; title: string }[]).find((x) => x.locale === "en")?.title);
  expect(titles[1]).toBe(firstName);
  await page.keyboard.press("ArrowUp");
  await expect(page.getByText("Showcase order saved").last()).toBeVisible();

  const daniel = page.getByRole("group", { name: "Visibility: Daniel and the Lions" });
  await daniel.getByRole("button", { name: "Hidden" }).click();
  await expect.poll(async () => (await admin().from("products").select("visibility").eq("slug", "daniel").single()).data?.visibility).toBe("hidden");
  await daniel.getByRole("button", { name: "Coming soon" }).click();
  await expect.poll(async () => (await admin().from("products").select("visibility").eq("slug", "daniel").single()).data?.visibility).toBe("soon");

  const youth = `Youth ${Date.now().toString(36)}`;
  await page.getByRole("button", { name: "Add section" }).click();
  await page.getByLabel("Name · EN").fill(youth);
  await page.getByLabel("Name · PT (optional)").fill("Jovens");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("button", { name: `Rename: ${youth}` })).toBeVisible();
  const { data: sec } = await admin().from("sections").select("id, slug, section_translations!inner(locale, name)").eq("section_translations.name", youth).single();
  const { data: names } = await admin().from("section_translations").select("locale").eq("section_id", sec!.id);
  expect(names!.map((x) => x.locale).sort()).toEqual(["en", "pt"]);

  await page.getByRole("button", { name: `Rename: ${youth}` }).click();
  await page.getByLabel("Name · ES (optional)").fill("Jóvenes");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect.poll(async () => (await admin().from("section_translations").select("name").eq("section_id", sec!.id).eq("locale", "es").maybeSingle()).data?.name).toBe("Jóvenes");

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: `Delete: ${youth}` }).click();
  await expect(page.getByText("Section deleted")).toBeVisible();
  expect((await admin().from("sections").select("id").eq("id", sec!.id)).data).toHaveLength(0);
  expect((await lastAudit("admin.section.deleted"))?.meta).toMatchObject({ title: youth });
});

test("product editor: create, translate, write chapters, set the sale, see it in the library, delete", async ({ page, browser }) => {
  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/products/new");
  const title = `Faith at Work ${Date.now().toString(36)}`;
  await page.getByRole("radio", { name: /eBook/ }).check();
  await page.getByLabel("Title (English)").fill(title);
  await page.getByRole("button", { name: "Create and continue" }).click();
  await page.waitForURL(/\/admin\/products\/[0-9a-f-]{36}$/);
  const id = page.url().split("/").pop()!;
  const { data: created } = await admin().from("products").select("slug, visibility, type").eq("id", id).single();
  expect(created).toMatchObject({ visibility: "hidden", type: "book" });
  expect(created!.slug).toBe(title.toLowerCase().replace(/ /g, "-"));

  await page.getByLabel("Description").fill("Honouring God from Monday to Friday.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved").last()).toBeVisible();
  await page.getByRole("link", { name: /^PT/ }).click();
  await page.getByLabel("Title (optional)").fill("Fé no Trabalho E2E");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved").last()).toBeVisible();
  await expect.poll(async () => (await admin().from("product_translations").select("title").eq("product_id", id).eq("locale", "pt").maybeSingle()).data?.title).toBe("Fé no Trabalho E2E");

  await page.goto(`/admin/products/${id}?tab=content`);
  await page.getByRole("button", { name: "Add chapter" }).click();
  await page.getByLabel("Title of chapter 1").fill("Called to work");
  await page.getByLabel("Text", { exact: true }).fill("## Monday\n\nWork is **worship**.\n\n<script>alert(1)</script>");
  await page.getByRole("checkbox", { name: "Free sample" }).first().check();
  await page.getByRole("button", { name: "Add chapter" }).click();
  await page.getByLabel("Title of chapter 2").fill("Rest");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved").last()).toBeVisible();
  await expect.poll(async () => (await admin().from("product_chapters").select("position").eq("product_id", id).eq("locale", "en")).data?.length).toBe(2);
  const { data: ch1 } = await admin().from("product_chapters").select("body_html, is_sample, minutes").eq("product_id", id).eq("locale", "en").eq("position", 1).single();
  expect(ch1!.body_html).toContain("<h2>Monday</h2>");
  expect(ch1!.body_html).toContain("<strong>worship</strong>");
  expect(ch1!.body_html).not.toContain("<script");
  expect(ch1!.is_sample).toBe(true);

  await page.goto(`/admin/products/${id}?tab=sales`);
  await page.getByLabel("Price (ZAR)").fill("59,50");
  await page.getByLabel("Gateway product ID").fill("prod_noah_ark");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Another product already has this gateway ID.")).toBeVisible();
  const gid = `prod_${created!.slug.replace(/-/g, "_")}`;
  await page.getByLabel("Gateway product ID").fill(gid);
  await page.getByLabel("Checkout link").fill("http://pay.example.com");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Enter a full link starting with https://")).toBeVisible();
  await page.getByLabel("Checkout link").fill("https://pay.example.com/c/faith");
  await page.getByRole("group", { name: "Visibility" }).getByRole("button", { name: "Visible" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved").last()).toBeVisible();
  const { data: sale } = await admin().from("products").select("price_cents, gateway_product_id, visibility, checkout_url").eq("id", id).single();
  expect(sale).toMatchObject({ price_cents: 5950, gateway_product_id: gid, visibility: "visible", checkout_url: "https://pay.example.com/c/faith" });

  // A member sees it locked, with the free sample.
  await resetRateLimits();
  const email = uniqueEmail("reader");
  const { url } = createInvite({ email, name: "Reader Test", products: ["noah"] });
  const m = await browser.newContext();
  const mp = await m.newPage();
  await mp.goto(url);
  await mp.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await mp.locator('input[name="terms"]').check();
  await mp.getByRole("button", { name: "Create account and open my library" }).click();
  await mp.waitForURL(/\/library\?welcome=1$/);
  await expect(mp.getByRole("link", { name: `${title}: Locked` })).toContainText("R 59,50");
  await mp.goto(`/products/${created!.slug}/read/1`);
  await expect(mp.getByRole("heading", { name: "Monday" })).toBeVisible();
  await m.close();

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete product" }).click();
  await page.waitForURL(/\/admin\/showcase$/);
  expect((await admin().from("products").select("id").eq("id", id)).data).toHaveLength(0);
  expect((await lastAudit("admin.product.deleted"))?.meta).toMatchObject({ title });
});

test("uploads go straight to storage: cover, colouring pages with previews, and materials", async ({ page }) => {
  const probe = await admin().storage.listBuckets();
  test.skip(Boolean(probe.error) && !process.env.E2E_REQUIRE_STORAGE, "Supabase Storage is not running");

  // Browser errors (a failed upload logs one) go to the test output, to diagnose failures on CI.
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") console.log(`[browser ${m.type()}] ${m.text()}`);
  });
  page.on("requestfailed", (r) => console.log(`[request failed] ${r.method()} ${r.url()} ${r.failure()?.errorText}`));
  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/products/new");
  await page.getByLabel("Title (English)").fill("Upload Pack E2E");
  await page.getByRole("button", { name: "Create and continue" }).click();
  await page.waitForURL(/\/admin\/products\/[0-9a-f-]{36}$/);
  const id = page.url().split("/").pop()!;

  // A tiny valid PNG (1x1, white).
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "base64");
  await page.locator("#ed-cover-file").setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: png });
  await expect.poll(async () => (await admin().from("products").select("cover_path").eq("id", id).single()).data?.cover_path ?? "").toMatch(new RegExp(`^${id}/cover/`));

  await page.goto(`/admin/products/${id}?tab=content`);
  await page.locator("#ed-pages-file").setInputFiles([
    { name: "noah-page-one.png", mimeType: "image/png", buffer: png },
    { name: "noah-page-two.png", mimeType: "image/png", buffer: png },
  ]);
  await expect(page.locator(".toasts")).toContainText("2 pages added", { timeout: 15_000 });
  const { data: pages } = await admin().from("product_pages").select("locale, position, title, lineart_path, preview_path").eq("product_id", id).order("position");
  expect(pages).toHaveLength(6); // two pages x three languages
  expect(pages![0].title).toBe("Noah page one");
  expect(pages![0].preview_path).toMatch(new RegExp(`^${id}/previews/`));

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete: Page 1" }).click();
  await expect.poll(async () => (await admin().from("product_pages").select("id").eq("product_id", id)).data?.length).toBe(3);

  // Materials: several files of different kinds at once; the browser's "audio/x-m4a" is normalised.
  await page.goto(`/admin/products/${id}?tab=materials`);
  const pdf = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
  await page.locator("#ed-assets-file").setInputFiles([
    { name: "family-guide.pdf", mimeType: "application/pdf", buffer: pdf },
    { name: "worship-song.m4a", mimeType: "audio/x-m4a", buffer: Buffer.from("not really audio") },
    { name: "everything.zip", mimeType: "application/x-zip-compressed", buffer: Buffer.from("PK\u0003\u0004") },
  ]);
  // Reading the notices area (not one text) means a failure shows what the page actually said.
  const started = Date.now();
  await expect(page.locator(".toasts")).toContainText("3 materials added", { timeout: 15_000 });
  console.log(`materials upload took ${Date.now() - started} ms`);
  const { data: assets } = await admin().from("product_assets").select("id, kind, title, locale, size_bytes").eq("product_id", id).order("position");
  expect(assets!.map((a) => a.kind)).toEqual(["pdf", "audio", "zip"]);
  expect(assets![0]).toMatchObject({ title: "Family guide", locale: null, size_bytes: pdf.length });

  await page.getByLabel("Title: Audio 2").fill("Worship songs");
  await page.getByLabel("Language: Family guide").selectOption("pt");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect.poll(async () => (await admin().from("product_assets").select("title").eq("id", assets![1].id).single()).data?.title).toBe("Worship songs");
  expect((await admin().from("product_assets").select("locale").eq("id", assets![0].id).single()).data?.locale).toBe("pt");

  await page.getByRole("button", { name: "Move up: Worship songs" }).click();
  await expect.poll(async () => (await admin().from("product_assets").select("kind").eq("product_id", id).order("position")).data?.map((a) => a.kind)).toEqual(["audio", "pdf", "zip"]);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete: Everything", exact: true }).click();
  await expect.poll(async () => (await admin().from("product_assets").select("id").eq("product_id", id)).data?.length).toBe(2);

  await page.goto(`/admin/products/${id}?tab=sales`);
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete product" }).click();
  await page.waitForURL(/\/admin\/showcase$/);
  const { data: left } = await admin().storage.from("products").list(`${id}/pages`);
  expect(left ?? []).toHaveLength(0);
  const { data: leftAssets } = await admin().storage.from("products").list(`${id}/assets`);
  expect(leftAssets ?? []).toHaveLength(0);
});

test("integrations: save the gateway secret, send a test event, see it in deliveries", async ({ page }) => {
  await signIn(page, boss.email);
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/integrations");
  await expect(page.getByText("http://localhost:3000/api/webhooks/gateway")).toBeVisible();

  await page.getByRole("button", { name: "Replace" }).click();
  await page.getByLabel("New secret").fill("short");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Paste the full secret (at least 16 characters, no spaces).")).toBeVisible();
  await page.getByLabel("New secret").fill("whsec_admin_rotated_secret_123456");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("New secret saved. The old one keeps working for 24 hours.")).toBeVisible();
  const { data: stored } = await admin().from("integration_secrets").select("secret_current, secret_previous, previous_valid_until").eq("name", "gateway").single();
  expect(stored!.secret_current).toBe("whsec_admin_rotated_secret_123456");
  expect(stored!.secret_previous).toBe("whsec_e2e_test_secret");

  await page.getByRole("button", { name: "Reveal" }).click();
  await expect(page.getByText("whsec_admin_rotated_secret_123456")).toBeVisible();
  expect((await lastAudit("admin.integration.secret_revealed"))?.actor_id).toBe(boss.id);

  await page.getByRole("button", { name: "Send test event" }).click();
  await expect(page.getByText("Test event received and verified")).toBeVisible();
  await expect(page.getByRole("row", { name: /integration\.test/ }).first()).toContainText("Test OK");
  await expect(page.getByText("Send a test event")).toBeVisible();

  // Leave the env secret as the only one for the other suites.
  await admin().from("integration_secrets").delete().eq("name", "gateway");
});

test("two-step verification: turn on, sign in with a code, and another admin can reset it", async ({ page, browser }) => {
  const second = await createAdmin("Second Admin");
  await signIn(page, second.email);
  await page.waitForURL(/\/admin$/);
  await page.getByRole("link", { name: "Turn it on" }).click();
  await page.getByRole("button", { name: "Turn on" }).click();
  const key = (await page.locator("code.chip-code").textContent())!.trim();
  await page.getByLabel("6-digit code").fill("000000");
  await page.getByRole("button", { name: "Confirm and turn on" }).click();
  await expect(page.getByText("That code didn’t work.", { exact: false })).toBeVisible();
  await page.getByLabel("6-digit code").fill(totp(key));
  await page.getByRole("button", { name: "Confirm and turn on" }).click();
  await expect(page.getByText("On. Signing in to the admin area asks for a code")).toBeVisible();

  // A new sign-in stops at the code step, and the API gives an unverified session no admin rows.
  const fresh = await browser.newContext();
  const fp = await fresh.newPage();
  await signIn(fp, second.email);
  await fp.waitForURL(/\/auth\/verify\?next=%2Fadmin$/);
  await fp.goto("/admin/members");
  await expect(fp).toHaveURL(/\/auth\/verify\?next=%2Fadmin%2Fmembers$/);
  await fp.getByLabel("6-digit code").fill(totp(key));
  await fp.getByRole("button", { name: "Continue" }).click();
  await fp.waitForURL(/\/admin\/members$/);
  await fresh.close();

  // Another admin can reset it (lost phone).
  const boss2 = await browser.newContext();
  const bp = await boss2.newPage();
  await signIn(bp, boss.email);
  await bp.waitForURL(/\/admin$/);
  await bp.goto(`/admin/members/${second.id}`);
  bp.once("dialog", (d) => d.accept());
  await bp.getByRole("button", { name: "Reset two-step verification" }).click();
  await expect(bp.getByText("Second Admin can set up two-step verification again")).toBeVisible();
  await boss2.close();
  const { data: factors } = await admin().auth.admin.mfa.listFactors({ userId: second.id });
  expect(factors?.factors ?? []).toHaveLength(0);
});
