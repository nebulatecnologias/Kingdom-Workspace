// Renderiza cada .art de <marca>/board.html para <marca>/NN.png e um quadro-resumo board.png.
// Uso: node render.mjs inc trn
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(path.join(execSync('npm root -g').toString().trim(), 'noop.js'))('playwright')); }
const dir = path.dirname(fileURLToPath(import.meta.url));
const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
for (const brand of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: { width: 4600, height: 1430 } });
  await page.goto(pathToFileURL(path.join(dir, brand, 'board.html')).href);
  await page.evaluate(() => document.fonts.ready);
  const arts = await page.$$('.art');
  for (let i = 0; i < arts.length; i++) await arts[i].screenshot({ path: path.join(dir, brand, `${String(i + 1).padStart(2, '0')}.png`) });
  await page.screenshot({ path: path.join(dir, brand, 'board.png'), fullPage: true, scale: 'css' });
  await page.close();
}
await browser.close();
