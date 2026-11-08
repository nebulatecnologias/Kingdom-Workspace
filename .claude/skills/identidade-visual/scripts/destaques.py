"""Etapa 8 · Capas de destaques do Instagram (1080 × 1920): ícone de traço ao centro, dentro
do círculo que o Instagram mostra; a espessura do traço acompanha a do símbolo.

marca.json:
  "destaques": [{"nome": "Sobre nós", "icone": "simbolo"}, {"nome": "Bastidores", "icone": "bastidores"},
                {"nome": "Resultados", "icone": "resultados"}, {"nome": "Agendar", "icone": "agenda"}],
  "destaques_cores": [["principal", "#2B2850", "#FFFFFF"], ["acento", "#FF521A", "#FFFFFF"]]   # opcional
Ícones disponíveis: simbolo, bastidores, resultados, agenda, contacto, servicos, depoimentos, perguntas, loja, cursos.
Uso: python3 destaques.py marca.json [--traco 26]
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import carregar, caminho, saida, Simbolo, svg_para_png

cfg = carregar(sys.argv[1]); SIM = Simbolo(caminho(cfg, cfg['simbolo']))
TR = float(sys.argv[sys.argv.index('--traco') + 1]) if '--traco' in sys.argv else 26
T = 'fill="none" stroke="{c}" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"' % TR
def t(c): return T.format(c=c)
ICONES = {   # caixa 480 × 480
    'simbolo': lambda c: SIM.g((480 - 480 * min(1, SIM.proporcao)) / 2, (480 - 480 / max(1, SIM.proporcao)) / 2, 480 / max(1, SIM.proporcao), c),
    'bastidores': lambda c: (f'<rect x="64" y="196" width="352" height="214" rx="30" {t(c)}/><path d="M64 196 L64 150 Q64 120 94 116 L384 76 Q412 72 416 100 L420 130 Z" {t(c)}/>'
                             f'<path d="M150 108 L176 174 M244 98 L270 164 M338 86 L364 152" {t(c)}/><path d="M210 250 L300 303 L210 356 Z" fill="{c}" stroke="{c}" stroke-width="14" stroke-linejoin="round"/>'),
    'resultados': lambda c: (f'<rect x="96" y="318" width="64" height="94" rx="14" {t(c)}/><rect x="208" y="252" width="64" height="160" rx="14" {t(c)}/><rect x="320" y="186" width="64" height="226" rx="14" {t(c)}/>'
                             f'<path d="M92 222 L196 152 L262 186 L382 88" {t(c)}/><path d="M318 86 L384 86 L384 152" {t(c)}/>'),
    'agenda': lambda c: f'<rect x="70" y="104" width="340" height="316" rx="40" {t(c)}/><path d="M70 196 L410 196 M160 66 L160 136 M320 66 L320 136 M168 306 L222 356 L316 258" {t(c)}/>',
    'contacto': lambda c: f'<path d="M88 116 Q88 84 120 84 L360 84 Q392 84 392 116 L392 292 Q392 324 360 324 L210 324 L132 396 L132 324 L120 324 Q88 324 88 292 Z" {t(c)}/><path d="M168 204 L170 204 M240 204 L242 204 M312 204 L314 204" {t(c)} stroke-width="{TR * 1.6}"/>',
    'servicos': lambda c: f'<rect x="80" y="80" width="140" height="140" rx="30" {t(c)}/><rect x="260" y="80" width="140" height="140" rx="30" {t(c)}/><rect x="80" y="260" width="140" height="140" rx="30" {t(c)}/><rect x="260" y="260" width="140" height="140" rx="70" {t(c)}/>',
    'depoimentos': lambda c: f'<path d="M110 300 Q110 170 210 140 M270 300 Q270 170 370 140" {t(c)}/><circle cx="160" cy="300" r="50" {t(c)}/><circle cx="320" cy="300" r="50" {t(c)}/>',
    'perguntas': lambda c: f'<circle cx="240" cy="240" r="176" {t(c)}/><path d="M180 196 Q180 136 240 136 Q300 136 300 192 Q300 232 248 252 L240 290" {t(c)}/><path d="M240 352 L240 354" {t(c)} stroke-width="{TR * 1.6}"/>',
    'loja': lambda c: f'<path d="M96 168 L384 168 L360 412 L120 412 Z" {t(c)}/><path d="M176 196 L176 140 Q176 76 240 76 Q304 76 304 140 L304 196" {t(c)}/>',
    'cursos': lambda c: f'<path d="M40 190 L240 100 L440 190 L240 280 Z" {t(c)}/><path d="M120 230 L120 330 Q240 400 360 330 L360 230" {t(c)}/><path d="M440 190 L440 300" {t(c)}/>',
}
C = cfg['cores']; pri = C['principal']['hex']; ace = C.get('acento', {}).get('hex'); fun = C.get('fundo', {}).get('hex', '#FAFAF7')
CORES = cfg.get('destaques_cores') or ([['principal', pri, '#FFFFFF']] + ([['acento', ace, '#FFFFFF']] if ace else []) + [['fundo', fun, pri]])
LISTA = cfg.get('destaques') or [{'nome': 'Sobre nós', 'icone': 'simbolo'}, {'nome': 'Bastidores', 'icone': 'bastidores'}, {'nome': 'Resultados', 'icone': 'resultados'}, {'nome': 'Agendar', 'icone': 'agenda'}]
OUT = saida(cfg, 'instagram', 'destaques'); W, H, LADO = 1080, 1920, 520
pares = []
for d in LISTA:
    nome = re.sub(r'[^a-z0-9]+', '-', d['nome'].lower().encode('ascii', 'ignore').decode()).strip('-')
    for nc, fundo, tinta in CORES:
        s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{fundo}"/>'
             f'<g transform="translate({(W - LADO) / 2} {(H - LADO) / 2}) scale({LADO / 480:.5f})">{ICONES[d["icone"]](tinta)}</g></svg>\n')
        f = os.path.join(OUT, f'destaque-{nome}-{nc}.svg'); open(f, 'w').write(s); pares.append((f, f[:-4] + '.png', W))
svg_para_png(pares)
print('ok', len(pares), 'capas em', OUT)
