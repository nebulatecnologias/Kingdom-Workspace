import { expect, test } from "@playwright/test";
import { admin, createInvite, resetRateLimits, uniqueEmail } from "./helpers";

const PASSWORD = "Str0ng-pass!23";
const CRON = { Authorization: "Bearer e2e-cron-secret" };

async function productId(slug: string) {
  const { data } = await admin().from("products").select("id").eq("slug", slug).single();
  return data!.id as string;
}

test.describe.configure({ mode: "serial" });

test("welcome questions, monthly picks, one-click stop, and the admin's customer history", { tag: "@critical" }, async ({ page, browser, request }) => {
  await resetRateLimits();
  const email = uniqueEmail("welcome");
  const { url } = createInvite({ email, name: "Naomi Welcome", products: ["money"] });
  await page.goto(url);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();

  // One question at a time.
  await page.waitForURL(/\/welcome\?next=/);
  await expect(page.getByRole("heading", { name: "What would you like to find here?" })).toBeVisible();
  await page.getByLabel("eBooks and devotionals").check();
  await page.getByLabel("Video courses").check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByRole("heading", { name: /most challenged/ })).toBeFocused();
  await page.getByLabel(/^Peace & Rest/).check();
  await page.getByLabel(/^Money & Stewardship/).check();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByLabel("Yes, please").check();
  // The monthly areas start as the challenges; the member narrows them down.
  const areas = page.getByRole("group", { name: "Areas for your monthly picks" });
  await expect(areas.getByLabel("Peace & Rest")).toBeChecked();
  await expect(areas.getByLabel("Money & Stewardship")).toBeChecked();
  await areas.getByLabel("Money & Stewardship").uncheck();
  await areas.getByLabel("Peace & Rest").uncheck();
  await page.getByRole("button", { name: "Finish" }).click();
  await expect(page.getByText("Choose at least one area, or answer No, thanks.")).toBeVisible();
  await expect(page.getByLabel("Video courses")).toBeChecked({ checked: true }); // answers kept after an error
  await areas.getByLabel("Peace & Rest").check();
  await page.getByRole("button", { name: "Finish" }).click();
  await page.waitForURL(/\/home\?welcome=1$/);
  await expect(page.getByText("Help us get to know you")).toHaveCount(0);

  const { data: member } = await admin().from("profiles").select("id, onboarded_at").eq("email", email).single();
  expect(member!.onboarded_at).not.toBeNull();
  const { data: answers } = await admin().from("onboarding_responses").select("content_types, challenges, curation_opt_in, curation_spheres").eq("user_id", member!.id);
  expect(answers).toEqual([{ content_types: ["books", "courses"], challenges: ["peace_rest", "money_stewardship"], curation_opt_in: true, curation_spheres: ["peace_rest"] }]);

  await page.goto("/profile");
  await expect(page.getByText("You get an email each month with resources for Peace & Rest.")).toBeVisible();

  // The daily job sends the picks once per month, from the month after subscribing.
  const [money, jonah] = [await productId("money"), await productId("jonah")];
  await admin().from("products").update({ spheres: ["peace_rest"] }).in("id", [money, jonah]);
  const due = await request.get("/api/cron/email-retry", { headers: CRON });
  expect(due.status()).toBe(200);
  let mails = await admin().from("email_log").select("payload").eq("to_email", email).eq("template", "curation");
  expect(mails.data).toHaveLength(0); // subscribed this month: the first picks come next month
  await admin().from("curation_subscriptions").update({ subscribed_at: new Date(Date.now() - 40 * 86400_000).toISOString() }).eq("user_id", member!.id);
  expect((await request.get("/api/cron/email-retry", { headers: CRON })).status()).toBe(200);
  expect((await request.get("/api/cron/email-retry", { headers: CRON })).status()).toBe(200);
  mails = await admin().from("email_log").select("payload").eq("to_email", email).eq("template", "curation");
  expect(mails.data, "one email a month, however often the job runs").toHaveLength(1);
  const mail = mails.data![0].payload as { subject: string; html: string; link: string };
  expect(mail.subject).toMatch(/^Your picks for /);
  // What they don't have yet comes first; what they own is marked.
  expect(mail.html.indexOf("Jonah and the Big Fish")).toBeGreaterThan(-1);
  expect(mail.html.indexOf("Jonah and the Big Fish")).toBeLessThan(mail.html.indexOf("Money God’s Way"));
  expect(mail.html).toContain("Already in your library");
  expect(mail.link).toMatch(/\/unsubscribe\?t=[0-9a-f-]{36}$/);
  expect((await request.get("/api/cron/email-retry")).status(), "the job needs the cron secret").toBe(401);

  // The stop link asks before stopping (mail scanners open links).
  const visitor = await browser.newContext();
  const vp = await visitor.newPage();
  await vp.goto(new URL(mail.link).pathname + new URL(mail.link).search);
  await vp.getByRole("button", { name: "Stop the monthly email" }).click();
  await expect(vp.getByText("Done: you won't get the monthly picks email any more.")).toBeVisible();
  await visitor.close();
  const { data: sub } = await admin().from("curation_subscriptions").select("unsubscribed_at").eq("user_id", member!.id).single();
  expect(sub!.unsubscribed_at).not.toBeNull();
  await admin().from("products").update({ spheres: [] }).in("id", [money, jonah]);

  // Only administrators see the answers.
  await page.goto("/profile");
  await expect(page.getByText(/You don't get the monthly picks email/)).toBeVisible();
  const boss = uniqueEmail("admin");
  const { data: created } = await admin().auth.admin.createUser({ email: boss, password: PASSWORD, email_confirm: true, user_metadata: { full_name: "History Admin" } });
  await admin().from("profiles").update({ role: "admin" }).eq("id", created.user!.id);
  const ctx = await browser.newContext();
  const ap = await ctx.newPage();
  await resetRateLimits();
  await ap.goto("/login");
  await ap.getByRole("button", { name: "Use password" }).click();
  await ap.getByLabel("Email").fill(boss);
  await ap.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await ap.getByRole("button", { name: "Sign in", exact: true }).click();
  await ap.waitForURL(/\/admin$/);
  await ap.goto(`/admin/members/${member!.id}`);
  const history = ap.getByRole("region", { name: "Customer history" });
  await expect(history).toContainText("eBooks and devotionals, Video courses");
  await expect(history).toContainText("Peace & Rest, Money & Stewardship");
  await expect(history).toContainText("Yes: Peace & Rest");
  await expect(history).toContainText(/Stopped on/);
  await expect(history).toContainText("2 picks sent");
  await ctx.close();
});

test("members who skip are not asked again, and Home offers the questions until they answer", async ({ page }) => {
  await resetRateLimits();
  const email = uniqueEmail("skip");
  const { url } = createInvite({ email, name: "Sipho Skip", products: ["noah"] });
  await page.goto(url);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await page.getByRole("button", { name: "Not now, take me to my library" }).click();
  await page.waitForURL(/\/home\?welcome=1$/);
  await page.getByRole("link", { name: "Start" }).click();
  await page.waitForURL(/\/welcome$/);
  await page.getByRole("button", { name: "Not now, take me to my library" }).click();
  await page.waitForURL(/\/home$/);
  await expect(page.getByText("Help us get to know you")).toBeVisible(); // still offered, never forced
  const { data: member } = await admin().from("profiles").select("id").eq("email", email).single();
  const { data: answers } = await admin().from("onboarding_responses").select("skipped").eq("user_id", member!.id);
  expect(answers).toEqual([{ skipped: true }]);
});
