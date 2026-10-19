// Gera os PNG dos flyers do Escala Previsível a partir de molde.html.
// Uso: node tools/criativos/escala/render.mjs <ficheiro.json> <pasta-de-saída>
// O JSON é uma lista: [{ "id":"01-mapa", "g":"gancho com *verde*", "s":"subtítulo", "cta":"Quero o mapa", "t":"escuro|claro" }]
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
const molde = pathToFileURL(resolve(dirname(fileURLToPath(import.meta.url)), "molde.html")).href;
const browser = await chromium.launch();
for (const c of lista) {
  for (const [f, h] of [["feed", 1350], ["story", 1920]]) {
    const p = await browser.newPage({ viewport: { width: 1080, height: h } });
    const q = new URLSearchParams({ g: c.g, s: c.s || "", f, t: c.t || "escuro", ...(c.cta ? { cta: c.cta } : {}) });
    await p.goto(`${molde}?${q}`, { waitUntil: "networkidle" });
    await p.evaluate(() => document.fonts.ready);
    const nome = `${saida}/${c.id}-${f}-1080x${h}.png`;
    await p.locator("#flyer").screenshot({ path: nome });
    console.log(nome);
    await p.close();
  }
}
await browser.close();
