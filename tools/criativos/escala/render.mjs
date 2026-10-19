// Gera os PNG dos flyers do Escala Previsível a partir dos moldes desta pasta (molde.html, molde-v2.html).
// Uso: node tools/criativos/escala/render.mjs <ficheiro.json> <pasta-de-saída>
// O JSON é uma lista de criativos: { "id":"02-lucro", "molde":"molde-v2.html", ...parâmetros do molde }
// Os parâmetros (g, r, v, m, n, t…) estão descritos no cabeçalho de cada molde. Sem "molde", usa molde-v2.html.
// Para cada criativo sai <id>-feed-1080x1350.png e <id>-story-1080x1920.png.
import { createRequire } from "module";
import { readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");

const [,, ficheiro, saida] = process.argv;
const lista = JSON.parse(readFileSync(ficheiro, "utf8"));
mkdirSync(saida, { recursive: true });
const pasta = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
for (const c of lista) {
  for (const [f, h] of [["feed", 1350], ["story", 1920]]) {
    const p = await browser.newPage({ viewport: { width: 1080, height: h } });
    const { id, molde = "molde-v2.html", ...param } = c;
    const q = new URLSearchParams({ t: "escuro", ...param, f });
    await p.goto(`${pathToFileURL(resolve(pasta, molde)).href}?${q}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    const nome = `${saida}/${c.id}-${f}-1080x${h}.png`;
    await p.locator("#flyer").screenshot({ path: nome });
    console.log(nome);
    await p.close();
  }
}
await browser.close();
