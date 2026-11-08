"""Padrões da marca Kingdom feitos com o globo e a estrela.
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

# cada padrão: (largura, altura do módulo, função que devolve o desenho do módulo)
def grelha():        # globos alinhados em grelha
    return 160, 160, peca('globo', 80, 80, 64)
def alternado():     # globos em fiadas desencontradas (como tijolo)
    return 200, 176, peca('globo', 50, 44, 56) + peca('globo', 150, 132, 56)
def estrela():       # só a estrela (Direção), desencontrada, mais pequena
    # a estrela ocupa 180/480 do globo: com tam=120 fica com 45 de largura
    return 120, 104, peca('estrela', 30, 26, 120) + peca('estrela', 90, 78, 120)
def mistura():       # globo e estrela alternados
    return 200, 200, peca('globo', 50, 50, 60) + peca('estrela', 150, 150, 150) + peca('estrela', 150, -50, 150) + peca('estrela', -50, 150, 150)
def grande():        # globos grandes, para fundos (fica bem em tom sobre tom)
    return 480, 480, peca('globo', 240, 240, 300) + peca('globo', 0, 0, 300) + peca('globo', 480, 0, 300) + peca('globo', 0, 480, 300) + peca('globo', 480, 480, 300)

PADROES = {'grelha': grelha, 'alternado': alternado, 'estrela': estrela, 'mistura': mistura, 'grande': grande}
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
        if nome != 'grande' and cor.startswith('tom'): continue      # tom sobre tom só no padrão grande
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
