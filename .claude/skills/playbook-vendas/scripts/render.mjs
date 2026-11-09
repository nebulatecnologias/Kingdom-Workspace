// Converte playbook.html em playbook.pdf (A4 horizontal) e verifica se há texto por cima do rodapé.
// Uso: node render.mjs pasta-com-playbook.html
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }
const dir = process.argv[2];
if (!dir) { console.log('Uso: node render.mjs pasta'); process.exit(1); }
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file://' + dir + '/playbook.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const col = await p.$$eval('.pagina', (ps) => ps.map((pg, i) => {
  const f = pg.querySelector('.rodape'); if (!f) return null;
  const ft = f.getBoundingClientRect().top; let m = 0;
  pg.querySelectorAll('.miolo *').forEach((e) => { m = Math.max(m, e.getBoundingClientRect().bottom); });
  return m > ft - 2 ? [i + 1, Math.round(m - ft)] : null;
}).filter(Boolean));
console.log(col.length ? 'Páginas com texto por cima do rodapé (página, px): ' + JSON.stringify(col) : 'Nenhuma página com texto por cima do rodapé.');
await p.pdf({ path: dir + '/playbook.pdf', width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
await b.close();
console.log(dir + '/playbook.pdf');
