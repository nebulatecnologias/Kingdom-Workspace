// Sign in once with a TEST account and save the session, for crawl_screens.mjs and access_matrix.mjs.
//
//   AUDIT_EMAIL=member@test.com AUDIT_PASSWORD=… node save_login.mjs --url http://localhost:3000/login \
//       --out auth-member.json [--before "Use password"] [--wait "/library|/admin"]
//
// Finds the email and password fields and the submit button on its own; override with
// --email-selector, --password-selector, --submit-selector. --before clicks a button by its visible
// text first (e.g. a tab that switches from "email link" to "password"). Credentials come from env
// vars so they don't end up in shell history or the report. Never use a real customer's account.
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
const { chromium } = require("playwright");
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 ? process.argv[i + 1] : d;
};
const url = arg("url");
const out = arg("out", "auth.json");
const { AUDIT_EMAIL: email, AUDIT_PASSWORD: password } = process.env;
if (!url || !email || !password) {
  console.error("Set AUDIT_EMAIL and AUDIT_PASSWORD, and pass --url <login page> --out <file>.");
  process.exit(1);
}
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
const page = await browser.newPage();
await page.goto(url);
const before = arg("before");
if (before) await page.getByRole("button", { name: before }).click();
await page.locator(arg("email-selector", 'input[type="email"], input[name="email"], input[autocomplete="email"]')).first().fill(email);
const passwordField = page.locator(arg("password-selector", 'input[type="password"]')).first();
await passwordField.fill(password);
const submit = arg("submit-selector");
// Enter in the password field submits the form like a person would, whatever other buttons the form has.
if (submit) await page.locator(submit).first().click();
else await passwordField.press("Enter");
const wait = arg("wait");
if (wait) await page.waitForURL(new RegExp(wait), { timeout: 20000 });
else await page.waitForLoadState("networkidle");
await page.context().storageState({ path: out });
console.log(`Signed in as ${email} → ${page.url()} · session saved to ${out}`);
await browser.close();
