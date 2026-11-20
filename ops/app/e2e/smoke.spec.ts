import { expect, test } from "@playwright/test";

const email = process.env.E2E_EMAIL ?? "";
const password = process.env.E2E_PASSWORD ?? "";

test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD");

test("sign in, book a meeting, move it, write its minutes", async ({ page }, info) => {
  const title = `E2E ${info.project.name} ${Date.now()}`;
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await Promise.all([page.waitForURL((u) => u.pathname === "/"), page.locator("form.card button[type=submit]").first().click()]);

  // Book a meeting that took place yesterday early in the morning (a meeting is concluded only after it starts).
  const day = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  await page.goto(`/cards/new?pipeline=reunioes&date=${day}`);
  await page.fill("#f-title", title);
  await page.fill("#f-time", "06:00");
  await page.fill("#f-contact_name", "Cliente E2E");
  await page.fill("#f-company_name", "Empresa E2E");
  await page.locator("form.form button[type=submit]").click();
  // A clash with another meeting asks for confirmation first.
  const confirm = page.locator(".form-warnings button");
  await Promise.race([page.waitForURL(/\/cards\/[0-9a-f-]{36}/), confirm.waitFor()]);
  if (await confirm.isVisible()) await confirm.click();
  await page.waitForURL(/\/cards\/[0-9a-f-]{36}/);
  await expect(page.locator(".page-head .pill")).toHaveText("Agendado");
  const cardUrl = page.url().split("?")[0];

  // It is on the agenda that day.
  await page.goto(`/agenda?date=${day}`);
  await expect(page.locator(".meeting-card", { hasText: title })).toBeVisible();

  // Move it to Concluída through the sheet; reload keeps it; history shows it.
  await page.goto(cardUrl);
  await page.getByRole("button", { name: "Mover para" }).click();
  await page.locator(".stepper button", { hasText: "Concluída" }).click();
  await page.locator(".sheet").getByRole("button", { name: "Confirmar" }).click();
  await expect(page.locator(".overlay")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".page-head .pill")).toHaveText("Concluída");
  await page.goto(`${cardUrl}?tab=history`);
  await expect(page.locator("#panel-history .activity-item .what").first()).toContainText("Concluída");

  // Write the minutes from the card and mark them final.
  await page.goto(`${cardUrl}?tab=ata`);
  await page.getByRole("link", { name: "Criar ata" }).click();
  await page.fill('input[aria-label="Tópico 1"]', "Ponto único");
  await page.fill('input[aria-label="Decisão"]', "Seguir em frente.");
  await page.locator("#m-ab").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Marcar como final" }).click();
  await page.waitForURL(/\/atas\/[0-9a-f-]+$/);
  await expect(page.locator(".minutes-doc h1")).toHaveText(title);
  await expect(page.locator(".minutes-doc .pill")).toHaveText("Final");
  await page.screenshot({ path: `test-results/minutes-${info.project.name}.png`, fullPage: true });

  // Archive the meeting: it leaves the agenda.
  await page.goto(cardUrl);
  await page.getByRole("button", { name: "Arquivar" }).click();
  await page.locator(".sheet").getByRole("button", { name: "Arquivar" }).click();
  await page.waitForURL(/\/agenda/);
  await page.goto(`/agenda?date=${day}`);
  await expect(page.locator(".meeting-card", { hasText: title })).toHaveCount(0);
});
