// Gera slides/01.png ... 07.png (1080x1350) a partir de carrossel.html.
// Uso: node render.mjs   (precisa do playwright; usa o Chromium em /opt/pw-browsers quando existir)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'slides');
mkdirSync(out, { recursive: true });

// playwright local (npm install na raiz do repo) ou global
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(path.join(execSync('npm root -g').toString().trim(), 'noop.js'))('playwright')); }

const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 7560, height: 1350 } });
await page.goto(pathToFileURL(path.join(dir, 'carrossel.html')).href);
await page.evaluate(() => document.fonts.ready);

if (process.argv.includes('--measure')) {
  const r = await page.$$eval('.slide', s => s.map((el, i) => {
    const b = el.querySelector('.body').getBoundingClientRect();
    const f = el.querySelector('.foot, .sign')?.getBoundingClientRect();
    return { slide: i + 1, bodyTop: Math.round(b.top), bodyBottom: Math.round(b.bottom), footTop: f ? Math.round(f.top) : null };
  }));
  console.table(r);
}

for (let i = 0; i < 7; i++) {
  await page.screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}.png`), clip: { x: i * 1080, y: 0, width: 1080, height: 1350 } });
}
await page.screenshot({ path: path.join(out, 'faixa.png'), clip: { x: 0, y: 0, width: 7560, height: 1350 }, scale: 'css' });
await browser.close();
