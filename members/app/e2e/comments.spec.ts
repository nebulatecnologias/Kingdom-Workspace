import { expect, test, type Page } from "@playwright/test";
import { admin, createInvite, resetRateLimits, skipWelcome, uniqueEmail } from "./helpers";

const PASSWORD = "Str0ng-pass!23";

async function join(page: Page, products: string[], name: string) {
  await resetRateLimits();
  const email = uniqueEmail("comment");
  const { url } = createInvite({ email, name, products });
  await page.goto(url);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.locator('input[name="terms"]').check();
  await page.getByRole("button", { name: "Create account and open my library" }).click();
  await skipWelcome(page);
  return email;
}

test("comments: only owners write, an admin approves, then every member sees them", async ({ page, browser }) => {
  const text = `Our kids loved the rainbow page ${Date.now().toString(36)}`;
  await join(page, ["noah"], "Ayanda Owner");
  await page.goto("/products/noah");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("Write your comment first.")).toBeVisible();
  await page.getByLabel("Share how this resource helped you").fill(text);
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("Thank you! Your comment will appear once it is approved.")).toBeVisible();
  const mine = page.locator(".comment", { hasText: text });
  await expect(mine).toContainText("Waiting for approval");
  await expect(mine).toContainText("Ayanda O.");

  // Someone without the product cannot write and does not see comments still waiting.
  const other = await browser.newContext();
  const op = await other.newPage();
  await join(op, ["money"], "Bheki Other");
  await op.goto("/products/noah");
  await expect(op.getByText("Only members who have this product can comment.")).toBeVisible();
  await expect(op.getByRole("button", { name: "Post comment" })).toHaveCount(0);
  await expect(op.getByText(text)).toHaveCount(0);

  // The admin approves it from the queue.
  const boss = uniqueEmail("admin");
  const { data: created } = await admin().auth.admin.createUser({ email: boss, password: PASSWORD, email_confirm: true, user_metadata: { full_name: "Comments Admin" } });
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
  await expect(ap.getByText(/waiting for approval/)).toBeVisible();
  await ap.getByRole("link", { name: "Review" }).click();
  await ap.waitForURL(/\/admin\/comments$/);
  const row = ap.locator(".cmad-row", { hasText: text });
  await expect(row).toContainText("Ayanda Owner");
  await expect(row).toContainText("Noah’s Ark & the Rainbow");
  await row.getByRole("button", { name: "Approve: Ayanda Owner" }).click();
  await expect(ap.getByText("Comment published")).toBeVisible();
  await expect(row).toHaveCount(0);
  await ctx.close();

  await op.reload();
  const shown = op.locator(".comment", { hasText: text });
  await expect(shown).toContainText("Ayanda O.");
  await expect(shown).not.toContainText("Waiting for approval");
  await expect(shown.getByRole("button", { name: "Delete" })).toHaveCount(0); // only the author can delete
  await other.close();

  // The author can take it back.
  await page.reload();
  page.once("dialog", (d) => d.accept());
  await page.locator(".comment", { hasText: text }).getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(text)).toHaveCount(0);
});
