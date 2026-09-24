// Crawl a running web app like a user would and collect evidence for the audit.
//
//   node crawl_screens.mjs --url http://localhost:3000 --out audit/screens [--max 40]
//        [--storage auth-member.json] [--label member] [--exclude "logout|sign-out|delete"]
//
// Run it from a folder where `playwright` (and optionally `axe-core`) is installed — the audited app
// often has them; otherwise `npm i -D playwright axe-core` in a scratch folder. Set
// PLAYWRIGHT_CHROMIUM_PATH if the installed browser build differs from Playwright's expected one.
//
// Safe by design: it only follows same-origin <a href> links with GET navigations. It never clicks
// buttons or submits forms, and skips links matching --exclude (logout, delete, …).
//
// For each page, on desktop (1280×900) and phone (Pixel 7):
//   full-page screenshot · HTTP status · console errors · uncaught errors · failed requests ·
//   CSP violations · horizontal overflow · images without alt · unlabelled inputs · unnamed
//   buttons/links · touch targets under 44 px (phone) · axe-core WCAG A/AA violations (if installed)
// Writes <out>/report.json and <out>/report.md.
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
const { chromium, devices } = require("playwright");
let axeSource = null;
try {
  axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
} catch {
  console.warn("axe-core not found: accessibility checks limited to the built-in ones.");
}

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
};
const start = arg("url");
if (!start) {
  console.error("Usage: node crawl_screens.mjs --url <start url> --out <dir> [--max 40] [--storage state.json] [--label name]");
  process.exit(1);
}
const out = arg("out", "audit/screens");
const max = Number(arg("max", "40"));
const storage = arg("storage");
const label = arg("label", storage ? "signed-in" : "visitor");
const exclude = new RegExp(arg("exclude", "logout|log-out|sign-?out|signout|delete|remove|destroy|unsubscribe"), "i");
const origin = new URL(start).origin;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
const profiles = [
  { name: "desktop", opts: { viewport: { width: 1280, height: 900 } } },
  { name: "phone", opts: { ...devices["Pixel 7"] } },
];

const queue = [start];
const seen = new Set();
const pages = [];

function slug(u) {
  const p = new URL(u);
  return (p.pathname + p.search).replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").slice(0, 80) || "root";
}

for (let i = 0; i < queue.length && pages.length < max; i++) {
  const url = queue[i];
  const key = url.split("#")[0];
  if (seen.has(key)) continue;
  seen.add(key);
  const record = { url: key, label, results: {} };
  for (const prof of profiles) {
    const ctx = await browser.newContext({ ...prof.opts, ...(storage ? { storageState: storage } : {}) });
    await ctx.addInitScript(() => {
      window.__csp = [];
      document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failed = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 300)));
    page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 300)));
    page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url().slice(0, 200)}`));
    let status = 0;
    try {
      const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      status = resp?.status() ?? 0;
    } catch (e) {
      pageErrors.push(`navigation: ${String(e).slice(0, 200)}`);
    }
    const finalUrl = page.url();
    const shot = `${label}-${prof.name}-${slug(url)}.png`;
    await page.screenshot({ path: join(out, shot), fullPage: true }).catch(() => {});
    const checks = await page.evaluate((isPhone) => {
      const name = (el) => (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim();
      const labelled = (el) =>
        el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest("label");
      const visible = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
      };
      const small = [];
      if (isPhone) {
        for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, [role=button]")) {
          if (!visible(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 44 && r.height < 44) small.push(`${el.tagName.toLowerCase()} "${name(el).slice(0, 40)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
        }
      }
      return {
        title: document.title,
        h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()).slice(0, 3),
        overflowPx: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        imagesWithoutAlt: [...document.querySelectorAll("img:not([alt])")].map((i) => i.src.slice(0, 120)),
        unlabelledInputs: [...document.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea")]
          .filter((el) => !labelled(el)).map((el) => `${el.tagName.toLowerCase()}[name=${el.name || "?"}]`),
        unnamedControls: [...document.querySelectorAll("button, a[href], [role=button]")].filter((el) => visible(el) && !name(el) && !el.querySelector("img[alt]:not([alt=''])"))
          .map((el) => el.outerHTML.slice(0, 120)),
        smallTargets: small.slice(0, 30),
        csp: window.__csp || [],
        links: [...document.querySelectorAll("a[href]")].map((a) => a.href),
      };
    }, prof.name === "phone");
    let axe = null;
    if (axeSource) {
      await page.addScriptTag({ content: axeSource }).catch(() => {});
      axe = await page
        .evaluate(async () => {
          const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
          return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(" ") }));
        })
        .catch(() => null);
    }
    record.results[prof.name] = { status, finalUrl, screenshot: shot, consoleErrors, pageErrors, failedRequests: failed.slice(0, 30), axe, ...checks, links: undefined };
    if (prof.name === "desktop") {
      for (const href of checks.links) {
        try {
          const u = new URL(href);
          if (u.origin !== origin || exclude.test(u.pathname + u.search)) continue;
          if (/\.(pdf|zip|png|jpe?g|webp|mp3|m4a|epub|ico)$/i.test(u.pathname) || u.pathname.includes("/download")) continue;
          const k = (u.origin + u.pathname + u.search).split("#")[0];
          if (!seen.has(k)) queue.push(k);
        } catch {}
      }
    }
    await ctx.close();
  }
  pages.push(record);
  console.log(`✓ ${key}`);
}
await browser.close();

writeFileSync(join(out, "report.json"), JSON.stringify(pages, null, 2));
const lines = [`# Crawl report (${label})`, "", `Start: ${start} · pages: ${pages.length} · max: ${max}`, ""];
for (const p of pages) {
  lines.push(`## ${p.url}`);
  for (const [prof, r] of Object.entries(p.results)) {
    const issues = [];
    if (r.status >= 400) issues.push(`HTTP ${r.status}`);
    if (r.finalUrl !== p.url) issues.push(`redirected to ${r.finalUrl}`);
    if (r.overflowPx > 0) issues.push(`horizontal overflow ${r.overflowPx}px`);
    if (r.consoleErrors.length) issues.push(`${r.consoleErrors.length} console errors`);
    if (r.pageErrors.length) issues.push(`${r.pageErrors.length} uncaught errors`);
    if (r.failedRequests.length) issues.push(`${r.failedRequests.length} failed requests`);
    if (r.csp.length) issues.push(`${r.csp.length} CSP violations`);
    if (r.imagesWithoutAlt.length) issues.push(`${r.imagesWithoutAlt.length} images without alt`);
    if (r.unlabelledInputs.length) issues.push(`${r.unlabelledInputs.length} unlabelled inputs`);
    if (r.unnamedControls.length) issues.push(`${r.unnamedControls.length} unnamed buttons/links`);
    if (r.smallTargets.length) issues.push(`${r.smallTargets.length} touch targets < 44px`);
    if (r.axe?.length) issues.push(`axe: ${r.axe.map((v) => `${v.id} (${v.impact}, ${v.nodes})`).join(", ")}`);
    lines.push(`- **${prof}** — "${r.title}" · ${r.screenshot}${issues.length ? "\n  - " + issues.join("\n  - ") : " · no automatic findings"}`);
  }
  lines.push("");
}
writeFileSync(join(out, "report.md"), lines.join("\n"));
console.log(`Report: ${join(out, "report.md")}`);
