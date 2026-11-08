"""Padrão da marca Kingdom: a estrela central do globo (Direção), repetida.
Gera, para cada padrão e cada combinação de cores:
  - um módulo que se repete sem emendas (padroes/modulos/*.svg), para usar como amostra
    de padrão no Illustrator, Figma ou Canva;
  - uma folha de 1200 × 1200 já preenchida (padroes/*.svg).
Uso: python3 tools/marca/padroes.py <saida_dir>   (depois: node tools/marca/png.mjs <saida_dir>)"""
import sys, os, json
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = json.load(open(os.path.join(RAIZ, 'docs/marca/globo/pecas.json')))   # caminhos em 0 0 480 480
SAIDA = sys.argv[1]; os.makedirs(os.path.join(SAIDA, 'modulos'), exist_ok=True)

def peca(nome, cx, cy, tam):
    """peça do globo com o centro em (cx, cy) e diâmetro do globo = tam"""
    k = tam / 480
    return f'<path transform="translate({cx - tam/2:.2f} {cy - tam/2:.2f}) scale({k:.5f})" fill-rule="evenodd" d="{P[nome]}"/>'

# só a estrela central (Direção), decisão de 08/11/2026: módulos desencontrados (como tijolo)
def estrela():       # denso: a estrela tem 45 de largura num módulo de 120 × 104
    return 120, 104, peca('estrela', 30, 26, 120) + peca('estrela', 90, 78, 120)
def estrela_ampla(): # arejado: mais espaço entre estrelas, para fundos grandes
    return 240, 208, peca('estrela', 60, 52, 130) + peca('estrela', 180, 156, 130)

PADROES = {'estrela': estrela, 'estrela-ampla': estrela_ampla}
# fundo, desenho (regra: nunca laranja sobre índigo)
CORES = {
    'branco-sobre-indigo': ('#2B2850', '#FFFFFF'),
    'indigo-sobre-marfim': ('#FAF9F5', '#2B2850'),
    'branco-sobre-laranja': ('#FF521A', '#FFFFFF'),
    'tom-sobre-indigo': ('#2B2850', '#37336A'),
    'tom-sobre-marfim': ('#FAF9F5', '#EDE9E1'),
}
n = 0
for nome, fn in PADROES.items():
    w, h, desenho = fn()
    for cor, (fundo, tinta) in CORES.items():
        modulo = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
                  f'<rect width="{w}" height="{h}" fill="{fundo}"/><g fill="{tinta}">{desenho}</g></svg>\n')
        open(os.path.join(SAIDA, 'modulos', f'kingdom-padrao-{nome}-{cor}-modulo.svg'), 'w').write(modulo)
        F = 1200
        folha = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {F} {F}" width="{F}" height="{F}"><defs>'
                 f'<pattern id="p" width="{w}" height="{h}" patternUnits="userSpaceOnUse"><g fill="{tinta}">{desenho}</g></pattern></defs>'
                 f'<rect width="{F}" height="{F}" fill="{fundo}"/><rect width="{F}" height="{F}" fill="url(#p)"/></svg>\n')
        open(os.path.join(SAIDA, f'kingdom-padrao-{nome}-{cor}.svg'), 'w').write(folha)
        n += 1
print('ok', n, 'padrões')
