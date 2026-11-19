import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke test against a running app (BASE_URL, default a local `npm run start` on :3000) and a real Supabase
 * project. Needs a team account: E2E_EMAIL and E2E_PASSWORD. It creates a meeting and its minutes, then
 * cleans nothing up: point it at a test account and remove the "E2E" cards afterwards.
 */
const launchOptions = process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {};
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", trace: "off", screenshot: "only-on-failure" },
  projects: [
    { name: "phone-390", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 }, launchOptions } },
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions } },
  ],
});
