// Test who can do what: run the same requests as each role and compare with what should happen.
//
//   node access_matrix.mjs matrix.json [--out audit/access]
//
// matrix.json (see assets/access-matrix.example.json):
// {
//   "baseUrl": "http://localhost:3000",
//   "roles": {
//     "visitor": {},
//     "member":  { "storageState": "auth-member.json" },            // Playwright login state (cookies)
//     "other":   { "headers": { "Authorization": "Bearer …" } },    // or explicit headers/cookies
//     "admin":   { "storageState": "auth-admin.json" }
//   },
//   "checks": [
//     { "name": "Admin page", "method": "GET", "path": "/admin",
//       "expect": { "visitor": "deny", "member": "deny", "admin": "allow" } },
//     { "name": "Member's own download", "method": "GET", "path": "/api/products/{ownedId}/download",
//       "expect": { "visitor": "deny", "member": "allow", "other": "deny" } }
//   ],
//   "vars": { "ownedId": "…" }
// }
//
// "allow" = 2xx, or a redirect that stays inside the requested path; "deny" = 401/403/404/5xx, or a
// redirect to a sign-in page or away to another area. The report shows each redirect target to confirm. Use GET for reads. For writes, only use a disposable test environment
// and resources created for the test, never production data.
import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(join(process.cwd(), "package.json"));
const { request } = require("playwright");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node access_matrix.mjs matrix.json [--out audit/access]");
  process.exit(1);
}
const outIdx = process.argv.indexOf("--out");
const out = outIdx >= 0 ? process.argv[outIdx + 1] : "audit/access";
mkdirSync(out, { recursive: true });
const cfg = JSON.parse(readFileSync(file, "utf8"));
const vars = cfg.vars ?? {};
const fill = (s) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
const signInPattern = new RegExp(cfg.signInPattern ?? "login|sign-?in|auth|access-denied|forbidden", "i");

const rows = [];
for (const [roleName, role] of Object.entries(cfg.roles)) {
  const ctx = await request.newContext({
    baseURL: cfg.baseUrl,
    storageState: role.storageState,
    extraHTTPHeaders: role.headers,
    ignoreHTTPSErrors: true,
  });
  for (const check of cfg.checks) {
    const expected = check.expect?.[roleName];
    if (!expected) continue;
    const path = fill(check.path);
    let status = 0;
    let location = "";
    try {
      const res = await ctx.fetch(path, {
        method: check.method ?? "GET",
        data: check.body,
        headers: check.headers,
        maxRedirects: 0,
      });
      status = res.status();
      location = res.headers()["location"] ?? "";
    } catch (e) {
      status = -1;
      location = String(e).slice(0, 120);
    }
    // A redirect counts as "allow" only when it stays inside the requested area (/admin → /admin/overview).
    // Being sent to a sign-in page, or away to another area (a member on /admin sent to /library), is "deny".
    let actual = "deny";
    if (status >= 200 && status < 300) actual = "allow";
    else if (status >= 300 && status < 400) {
      const target = new URL(location || "/", cfg.baseUrl).pathname;
      const requested = new URL(path, cfg.baseUrl).pathname;
      actual = !signInPattern.test(location) && target.startsWith(requested) ? "allow" : "deny";
    }
    rows.push({ check: check.name, role: roleName, method: check.method ?? "GET", path, expected, actual, status, location, ok: expected === actual });
  }
  await ctx.dispose();
}

writeFileSync(join(out, "access-results.json"), JSON.stringify(rows, null, 2));
const bad = rows.filter((r) => !r.ok);
const lines = ["# Access matrix", "", `Base: ${cfg.baseUrl} · checks: ${rows.length} · mismatches: ${bad.length}`, "", "| Check | Role | Expected | Actual | Status |", "|---|---|---|---|---|"];
for (const r of rows) lines.push(`| ${r.ok ? "" : "**✗** "}${r.check} (\`${r.method} ${r.path}\`) | ${r.role} | ${r.expected} | ${r.actual} | ${r.status}${r.location ? ` → ${r.location}` : ""} |`);
writeFileSync(join(out, "access-matrix.md"), lines.join("\n"));
console.log(lines.slice(0, 3).join("\n"));
for (const r of bad) console.log(`MISMATCH ${r.check} as ${r.role}: expected ${r.expected}, got ${r.actual} (${r.status})`);
process.exit(bad.some((r) => r.expected === "deny") ? 2 : 0);
