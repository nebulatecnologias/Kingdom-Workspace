import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }
const dir = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file://' + dir + '/playbook.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const over = await p.$$eval('.pagina', (ps) => ps.map((pg, i) => { const r = pg.getBoundingClientRect(); let worst = 0; pg.querySelectorAll('*').forEach((e) => { if (e.closest('.globo,.luz')) return; const q = e.getBoundingClientRect(); if (q.height && q.bottom - r.top > worst) worst = q.bottom - r.top; }); return [i + 1, Math.round(worst), Math.round(r.height)]; }).filter(([, w, h]) => w > h - 1));
console.log('overflow', JSON.stringify(over));
const col = await p.$$eval('.pagina', (ps) => ps.map((pg, i) => { const f = pg.querySelector('.rodape'); if (!f) return null; const ft = f.getBoundingClientRect().top; let m = 0; pg.querySelectorAll('.miolo *').forEach((e) => { m = Math.max(m, e.getBoundingClientRect().bottom); }); return m > ft - 2 ? [i + 1, Math.round(m - ft)] : null; }).filter(Boolean));
console.log('sobre o rodapé', JSON.stringify(col));
await p.pdf({ path: dir + '/playbook.pdf', width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
await b.close();
