import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a real local Supabase (`supabase start`) and a production build.
 * CI sets NEXT_PUBLIC_SUPABASE_URL / keys from `supabase status`; see .github/workflows/members.yml.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { KM_DEV_MAILBOX: "true", PORT: "3000", GATEWAY_WEBHOOK_SECRET: "whsec_e2e_test_secret", GATEWAY_ACCEPT_TEST_EVENTS: "true" },
  },
});
