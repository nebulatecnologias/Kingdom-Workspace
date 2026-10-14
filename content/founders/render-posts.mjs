// Kingdom Founders: exporta cada <section class="post" data-file="…"> de uma página de semana para PNG 1080×1350.
// Uso: node render-posts.mjs semana-01   → gera semana-01/png/<data-file>
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(path.join(execSync('npm root -g').toString().trim(), 'noop.js'))('playwright')); }
const dir = path.dirname(fileURLToPath(import.meta.url));
const week = process.argv[2];
if (!week) { console.error('Uso: node render-posts.mjs <pasta-da-semana>'); process.exit(1); }
const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 4600, height: 1500 } });
await page.goto(pathToFileURL(path.join(dir, week, 'index.html')).href);
await page.evaluate(() => document.fonts.ready);
await page.waitForLoadState('networkidle');
const posts = await page.$$('.post');
for (const post of posts) {
  const file = await post.getAttribute('data-file');
  const out = path.join(dir, week, 'png', file);
  mkdirSync(path.dirname(out), { recursive: true });
  await post.screenshot({ path: out });
  console.log(path.relative(dir, out));
}
await browser.close();
