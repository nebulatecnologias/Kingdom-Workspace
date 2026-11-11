// Fotografa cada slide de carrossel.html em PNG (1080 × 1350) e junta-os num PDF para o LinkedIn.
// Uso: node tools/marca/carrossel.mjs <pasta com carrossel.html>
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }
const dir = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await p.goto('file://' + dir + '/carrossel.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const ids = await p.$$eval('.slide', (s) => s.map((x) => x.id));
for (const id of ids) await p.locator('#' + id).screenshot({ path: `${dir}/kingdom-nova-marca-${id.slice(1)}.png` });
await p.addStyleTag({ content: '@page{size:1080px 1350px;margin:0} html,body{background:none} .slide{margin:0;break-after:page}' });
await p.pdf({ path: `${dir}/kingdom-nova-marca-carrossel.pdf`, width: '1080px', height: '1350px', printBackground: true });
await b.close();
console.log(ids.length, 'slides');
