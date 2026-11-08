"""Capas de destaques do Instagram (1080 × 1920): o ícone fica no centro, dentro do círculo
que o Instagram mostra. Ícones de traço com a mesma espessura do anel do globo.
Uso: python3 tools/marca/destaques.py <saida_dir>   (gera SVG e PNG)"""
import sys, os, json, subprocess, tempfile
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GLOBO = json.load(open(os.path.join(RAIZ, 'docs/marca/globo/pecas.json')))['globo']
SAIDA = sys.argv[1]; os.makedirs(SAIDA, exist_ok=True)
T = 'fill="none" stroke="{c}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"'
ICONES = {   # desenhados numa caixa de 480 × 480
    'sobre-nos': lambda c: f'<path fill="{c}" fill-rule="evenodd" d="{GLOBO}"/>',
    'bastidores': lambda c: (f'<rect x="64" y="196" width="352" height="214" rx="30" {T.format(c=c)}/>'
                             f'<path d="M64 196 L64 150 Q64 120 94 116 L384 76 Q412 72 416 100 L420 130 Z" {T.format(c=c)}/>'
                             f'<path d="M150 108 L176 174 M244 98 L270 164 M338 86 L364 152" {T.format(c=c)}/>'
                             f'<path d="M210 250 L300 303 L210 356 Z" fill="{c}" stroke="{c}" stroke-width="14" stroke-linejoin="round"/>'),
    'resultados': lambda c: (f'<rect x="96" y="318" width="64" height="94" rx="14" {T.format(c=c)}/>'
                             f'<rect x="208" y="252" width="64" height="160" rx="14" {T.format(c=c)}/>'
                             f'<rect x="320" y="186" width="64" height="226" rx="14" {T.format(c=c)}/>'
                             f'<path d="M92 222 L196 152 L262 186 L382 88" {T.format(c=c)}/><path d="M318 86 L384 86 L384 152" {T.format(c=c)}/>'),
    'agendamento': lambda c: (f'<rect x="70" y="104" width="340" height="316" rx="40" {T.format(c=c)}/>'
                              f'<path d="M70 196 L410 196" {T.format(c=c)}/><path d="M160 66 L160 136 M320 66 L320 136" {T.format(c=c)}/>'
                              f'<path d="M168 306 L222 356 L316 258" {T.format(c=c)}/>'),
}
CORES = {'indigo': ('#2B2850', '#FFFFFF'), 'laranja': ('#FF521A', '#FFFFFF'), 'marfim': ('#FAF9F5', '#2B2850')}
W, H, LADO = 1080, 1920, 520          # o ícone mede 520 px: metade do círculo que o Instagram mostra
tmp = tempfile.mkdtemp(); trabalhos = []
for nome, fn in ICONES.items():
    for cor, (fundo, tinta) in CORES.items():
        k = LADO / 480
        s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{fundo}"/>'
             f'<g transform="translate({(W-LADO)/2} {(H-LADO)/2}) scale({k:.5f})">{fn(tinta)}</g></svg>\n')
        f = os.path.join(SAIDA, f'destaque-{nome}-{cor}.svg'); open(f, 'w').write(s); trabalhos.append(f)
js = '''import { createRequire } from "module"; import { readFileSync } from "fs";
const require = createRequire("/opt/node22/lib/node_modules/"); const { chromium } = require("playwright");
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
for (const f of %s) { await p.setContent("<style>*{margin:0}</style>" + readFileSync(f, "utf8")); await p.screenshot({ path: f.replace(".svg", ".png") }); }
await b.close();''' % json.dumps(trabalhos)
open(os.path.join(tmp, 'r.mjs'), 'w').write(js); subprocess.run(['node', os.path.join(tmp, 'r.mjs')], check=True)
print('ok', len(trabalhos), 'capas')
