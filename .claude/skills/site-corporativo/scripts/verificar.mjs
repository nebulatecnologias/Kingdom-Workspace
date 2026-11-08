// Capturas e verificação de um site corporativo (Playwright).
// Uso: node verificar.mjs pasta-do-site pasta-das-capturas [porta]
// Serve a pasta com um servidor local, abre a página inicial, os painéis do menu,
// o menu no telemóvel, a página de contactos e o blog, e grava capturas em computador
// (1440) e telemóvel (390). No fim lista os erros da consola e os pedidos falhados.
// As capturas são com reducedMotion para ficarem estáveis; ver as animações à parte.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const require = createRequire('/opt/node22/lib/node_modules/');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }

const [site, out, porta = '8740'] = process.argv.slice(2);
if (!site || !out) { console.log('Uso: node verificar.mjs pasta-do-site pasta-das-capturas [porta]'); process.exit(1); }
mkdirSync(out, { recursive: true });
const servidor = spawn('python3', ['-m', 'http.server', porta, '--directory', site], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 900));
const base = `http://localhost:${porta}`;
const erros = [];
const b = await chromium.launch();
try {
  for (const [nome, w, h] of [['computador', 1440, 900], ['telemovel', 390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', (e) => erros.push(`${nome}: ${e.message}`));
    p.on('console', (m) => { if (m.type() === 'error') erros.push(`${nome} consola: ${m.text()}`); });
    p.on('requestfailed', (r) => { if (!r.url().includes('google.com/maps')) erros.push(`${nome} falhou: ${r.url()}`); });
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: join(out, `${nome}-abertura.png`) });
    await p.screenshot({ path: join(out, `${nome}-inicial.png`), fullPage: true });
    if (w > 1000) {
      for (const id of await p.$$eval('.nav-botao[aria-controls]', (bs) => bs.map((x) => x.getAttribute('aria-controls')))) {
        await p.evaluate(() => scrollTo(0, 0));
        await p.click(`[aria-controls=${id}]`); await p.waitForTimeout(350);
        await p.screenshot({ path: join(out, `menu-${id}.png`), clip: { x: 0, y: 0, width: w, height: 760 } });
        await p.click(`[aria-controls=${id}]`); await p.waitForTimeout(250);
      }
    } else {
      await p.evaluate(() => scrollTo(0, 0));
      await p.click('.menu'); await p.waitForTimeout(300);
      await p.screenshot({ path: join(out, 'menu-telemovel.png') });
      await p.click('.menu');
    }
    for (const [pg, ficheiro] of [['contactos', 'contactos.html'], ['blog', 'blog/index.html']]) {
      if (!existsSync(join(site, ficheiro))) continue;
      await p.goto(`${base}/${ficheiro}`, { waitUntil: 'networkidle' });
      await p.screenshot({ path: join(out, `${nome}-${pg}.png`), fullPage: true });
    }
    await p.close();
  }
} finally {
  await b.close();
  servidor.kill();
}
console.log(erros.length ? 'Problemas:\n' + [...new Set(erros)].join('\n') : 'Sem erros na consola nem pedidos falhados.');
console.log(`Capturas em ${out}. Abrir e ver: abertura, página inteira, cada painel do menu, telemóvel.`);
