// Gera os PDF A4 das fichas e guarda a posição de cada campo (para os tornar preenchíveis com campos.py).
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const dir = new URL('.', import.meta.url).pathname;
const nomes = ['ficha-passagem-closer', 'ficha-passagem-gestor-projeto', 'checklist-onboarding'];
const b = await chromium.launch();
for (const n of nomes) {
  const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
  await p.goto('file://' + dir + n + '.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const info = await p.$$eval('.pagina', (ps) => ps.map((pg, i) => {
    const r = pg.getBoundingClientRect(), pe = pg.querySelector('footer').getBoundingClientRect().top;
    let fundo = 0; pg.querySelectorAll('main *').forEach((e) => { fundo = Math.max(fundo, e.getBoundingClientRect().bottom); });
    const campos = [...pg.querySelectorAll('.f')].map((e) => { const q = e.getBoundingClientRect();
      return { n: e.dataset.n, t: e.dataset.t, x: q.left - r.left, y: q.top - r.top, w: q.width, h: q.height }; });
    return { pagina: i + 1, folga_mm: Math.round((pe - fundo) / 3.7795), campos };
  }));
  info.forEach((pg) => console.log(n, 'página', pg.pagina, 'folga até ao rodapé', pg.folga_mm, 'mm ·', pg.campos.length, 'campos'));
  writeFileSync(dir + n + '.campos.json', JSON.stringify(info));
  await p.pdf({ path: dir + n + '.base.pdf', width: '210mm', height: '297mm', printBackground: true, preferCSSPageSize: true });
  await p.screenshot({ path: dir + n + '.png', fullPage: true });
  await p.close();
}
await b.close();
