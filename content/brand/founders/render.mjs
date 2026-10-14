// Kingdom Founders: gera os modelos de post (templates/NN.png) e o Brand Book (brand-book.pdf + paginas/NN.png).
// Uso: node render.mjs [templates] [book]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { ({ chromium } = createRequire(path.join(execSync('npm root -g').toString().trim(), 'noop.js'))('playwright')); }
const dir = path.dirname(fileURLToPath(import.meta.url));
const what = process.argv.slice(2).length ? process.argv.slice(2) : ['templates', 'book'];
const exe = '/opt/pw-browsers/chromium';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const open = async (file, viewport) => {
  const page = await browser.newPage({ viewport });
  await page.goto(pathToFileURL(path.join(dir, file)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  return page;
};
if (what.includes('templates')) {
  mkdirSync(path.join(dir, 'templates'), { recursive: true });
  const page = await open('templates.html', { width: 8000, height: 1430 });
  const posts = await page.$$('.post');
  for (let i = 0; i < posts.length; i++) await posts[i].screenshot({ path: path.join(dir, 'templates', `${String(i + 1).padStart(2, '0')}.png`) });
  await page.close();
}
if (what.includes('book')) {
  mkdirSync(path.join(dir, 'paginas'), { recursive: true });
  const page = await open('brand-book.html', { width: 1920, height: 1080 });
  const pages = await page.$$('.page');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(dir, 'paginas', `${String(i + 1).padStart(2, '0')}.png`) });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(dir, 'Kingdom-Founders-Brand-Book.pdf'), width: '1920px', height: '1080px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.close();
}
await browser.close();
