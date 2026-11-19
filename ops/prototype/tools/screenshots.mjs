import { chromium } from 'playwright';
const file = 'file:///home/user/Kingdom-Workspace/ops/prototype/index.html';
const out = '/home/user/Kingdom-Workspace/ops/.impeccable/review';
const screens = [
  ['home', '/'], ['agenda', '/agenda'], ['agenda-empty', '/agenda?date=2026-11-22'], ['card', '/cards/c1'], ['card-ata', '/cards/c4?tab=ata'], ['card-history', '/cards/c4?tab=history'],
  ['card-new', '/cards/new?pipeline=reunioes'], ['pipeline-reunioes', '/pipelines/reunioes'], ['pipeline-vendas', '/pipelines/vendas'], ['pipeline-tarefas', '/pipelines/tarefas?stage=t_curso'],
  ['atas', '/atas'], ['ata-new', '/atas/new?card=c12'], ['ata-choose', '/atas/new'], ['ata-m1', '/atas/m1'], ['ata-print', '/atas/m1/print'], ['team', '/team'], ['settings', '/settings/pipelines/reunioes'], ['login', '/login'],
];
const browser = await chromium.launch();
const errors = [];
for (const [name, w, h, native] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name} console: ${m.text()}`); });
  await page.goto(file + '#/');
  await page.evaluate(() => { try { localStorage.setItem('kops-device', 'desktop'); } catch {} });
  for (const [id, hash] of screens) {
    await page.goto(file + '#' + hash); await page.evaluate(() => { location.hash = location.hash; });
    await page.waitForTimeout(250); await page.evaluate(() => document.fonts.ready);
    const target = name === 'mobile' ? page.locator('.app-scroll') : page;
    // full page capture: expand the app scroller to its content height
    await page.evaluate(() => { const s = document.querySelector('.app-scroll'); const app = document.querySelector('.app'); if (s && app) { app.style.height = 'auto'; app.style.overflow = 'visible'; s.style.height = 'auto'; s.style.overflow = 'visible'; } });
    await page.waitForTimeout(80);
    await page.screenshot({ path: `${out}/screens/${name}-${id}.png`, fullPage: true });
    if (id === 'home') await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  }
  // move sheet (mobile + desktop)
  await page.goto(file + '#/cards/c1'); await page.waitForTimeout(200);
  await page.click('[data-action="move-open"]'); await page.waitForTimeout(150);
  await page.click('[data-action="move-select"][data-stage="s_adiada"]'); await page.waitForTimeout(150);
  await page.screenshot({ path: `${out}/screens/${name}-sheet-move.png` });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
