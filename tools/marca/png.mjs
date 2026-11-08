// Exporta os SVG do logótipo para PNG com fundo transparente.
// Uso: node tools/marca/png.mjs docs/marca/logotipo
import { createRequire } from "module";
import { readdirSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
const require = createRequire("/opt/node22/lib/node_modules/");
const { chromium } = require("playwright");
const dir = process.argv[2], out = join(dir, "png");
mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage();
async function exporta(svg, largura, nome) {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); const alt = Math.round(largura * m[2] / m[1]);
  await p.setViewportSize({ width: largura, height: alt });
  await p.setContent(`<style>*{margin:0}body{background:transparent}</style>` + svg.replace(/width="\d+" height="\d+"/, `width="${largura}" height="${alt}"`));
  await p.screenshot({ path: join(out, nome), omitBackground: true, clip: { x: 0, y: 0, width: largura, height: alt } });
}
for (const f of readdirSync(dir).filter(f => f.endsWith(".svg"))) {
  const svg = readFileSync(join(dir, f), "utf8"), base = f.replace(".svg", "");
  if (f === "favicon.svg") { for (const t of [16, 32, 48]) await exporta(svg, t, `favicon-${t}.png`); }
  else if (f.startsWith("kingdom-icone")) { await exporta(svg, 512, `${base}-512.png`); await exporta(svg, 180, `${base}-180.png`); }
  else await exporta(svg, 2000, `${base}.png`);
}
await b.close(); console.log("ok", readdirSync(out).length, "png");
