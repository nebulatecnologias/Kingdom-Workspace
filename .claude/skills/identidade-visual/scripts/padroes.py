"""Etapa 7 · Padrão da marca: uma peça do símbolo (ou o símbolo inteiro) repetida em fiadas
desencontradas, como tijolo: cada fiada avança meio módulo.

marca.json:
  "padrao": {"peca": "simbolo/estrela.svg",          # opcional; por omissão, o símbolo
             "densidades": {"densa": [120, 0.375], "ampla": [240, 0.2]},   # [largura do módulo, tamanho da peça / módulo]
             "cores": [["branco-sobre-principal", "#2B2850", "#FFFFFF"], ...]}   # opcional
Gera <saida>/padroes/: folhas 1200 × 1200 (SVG + PNG) e modulos/ (a peça que se repete sem emendas).
Uso: python3 padroes.py marca.json [--sem-png]
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import carregar, caminho, saida, slug, Simbolo, svg_para_png

cfg = carregar(sys.argv[1]); P = cfg.get('padrao', {})
PECA = Simbolo(caminho(cfg, P.get('peca') or cfg['simbolo']))
C = cfg['cores']; pri = C['principal']['hex']; fun = C.get('fundo', {}).get('hex', '#FAFAF7'); ace = C.get('acento', {}).get('hex')
CORES = P.get('cores') or ([['branco-sobre-principal', pri, '#FFFFFF'], ['principal-sobre-fundo', fun, pri]]
                           + ([['branco-sobre-acento', ace, '#FFFFFF']] if ace else [])
                           + [['tom-sobre-principal', pri, '#FFFFFF']])
DENS = P.get('densidades') or {'densa': [120, .375], 'ampla': [240, .2]}
OUT = saida(cfg, 'padroes'); MOD = saida(cfg, 'padroes', 'modulos'); S_ = slug(cfg)

def modulo(W, frac):
    H = round(W * 0.8667)                       # fiadas a 60°: altura = 0,8667 × largura
    # frac = altura da peça / largura do módulo; a peça tem de caber em meia célula (largura <= W/2, altura <= H/2)
    lim = min(0.5 / PECA.proporcao, 0.5 * 0.8667)
    if frac > lim:
        print(f'aviso: fração {frac} faz a peça passar da célula; usado {lim:.2f}'); frac = lim
    alt = W * frac; larg = alt * PECA.proporcao
    def em(cx, cy): return PECA.g(cx - larg / 2, cy - alt / 2, alt)
    return W, H, em(W / 4, H / 4) + em(3 * W / 4, 3 * H / 4)

pares = []
for nome_d, (W0, frac) in DENS.items():
    W, H, des = modulo(W0, frac)
    for nc, fundo, tinta in CORES:
        op = ' fill-opacity=".12"' if nc.startswith('tom') else ''
        mod = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{fundo}"/><g fill="{tinta}"{op}>{des}</g></svg>\n'
        f_mod = os.path.join(MOD, f'{S_}-padrao-{nome_d}-{nc}-modulo.svg'); open(f_mod, 'w').write(mod)
        F = 1200
        folha = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {F} {F}" width="{F}" height="{F}"><defs><pattern id="p" width="{W}" height="{H}" patternUnits="userSpaceOnUse">'
                 f'<g fill="{tinta}"{op}>{des}</g></pattern></defs><rect width="{F}" height="{F}" fill="{fundo}"/><rect width="{F}" height="{F}" fill="url(#p)"/></svg>\n')
        f_f = os.path.join(OUT, f'{S_}-padrao-{nome_d}-{nc}.svg'); open(f_f, 'w').write(folha)
        pares.append((f_f, os.path.join(saida(cfg, 'padroes', 'png'), os.path.basename(f_f)[:-4] + '.png'), 2000))
if '--sem-png' not in sys.argv: svg_para_png(pares)
print('ok', len(pares), 'padrões em', OUT)
