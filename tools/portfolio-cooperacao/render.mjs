import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }
const dir = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('file://' + dir + '/portfolio.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
// conteúdo por cima do rodapé ou da nota, ou fora da página
const col = await p.$$eval('.pag', (ps) => ps.map((pg, i) => {
  const r = pg.getBoundingClientRect();
  const lim = pg.querySelector('.nota') || pg.querySelector('.rod');
  if (!lim) return null;
  const t = lim.getBoundingClientRect().top; let m = 0;
  pg.querySelectorAll('.svs *, ol *, .qs-texto *, .fecho').forEach((e) => { m = Math.max(m, e.getBoundingClientRect().bottom); });
  return m > t - 3 ? [i + 1, Math.round(m - t)] : null;
}).filter(Boolean));
console.log('sobreposições', JSON.stringify(col));
await p.pdf({ path: dir + '/portfolio.pdf', width: '210mm', height: '297mm', printBackground: true, preferCSSPageSize: true });
await b.close();
