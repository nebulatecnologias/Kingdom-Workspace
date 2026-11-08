"""Gera os logótipos Kingdom (globo + «Kingdom <Braço>» numa só linha) em SVG, com o texto
convertido em curvas (Google Sans 500), para não depender da letra instalada.
Uso: python3 tools/marca/logotipo.py <fontes_dir> <saida_dir> [braços...]  (por omissão: Company)
     fontes_dir tem gs500.ttf e gs700.ttf (Google Sans)."""
import sys, json, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONTES, SAIDA = sys.argv[1], sys.argv[2]
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GLOBO = json.load(open(os.path.join(RAIZ, 'docs/marca/globo/pecas.json')))['globo']   # viewBox 0 0 480 480
os.makedirs(SAIDA, exist_ok=True)

class Letra:
    def __init__(self, ficheiro):
        self.blob = hb.Blob.from_file_path(ficheiro)
        self.face = hb.Face(self.blob); self.font = hb.Font(self.face)
        self.tt = TTFont(ficheiro); self.gs = self.tt.getGlyphSet(); self.upem = self.tt['head'].unitsPerEm
        self.ordem = self.tt.getGlyphOrder()
    def caminho(self, texto, tam, x0, base, tracking=0.0):
        """devolve (d, largura) com o texto em curvas; tracking em em"""
        buf = hb.Buffer(); buf.add_str(texto); buf.guess_segment_properties()
        hb.shape(self.font, buf, {'kern': True, 'liga': False})
        k = tam / self.upem; x = 0; partes = []
        for i, (inf, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
            nome = self.ordem[inf.codepoint]
            pen = SVGPathPen(self.gs)
            self.gs[nome].draw(TransformPen(pen, (k, 0, 0, -k, x0 + (x + pos.x_offset) * k, base - pos.y_offset * k)))
            partes.append(pen.getCommands())
            x += pos.x_advance + (tracking * self.upem if i < len(buf.glyph_infos) - 1 else 0)
        return ' '.join(partes), x * k

L500 = Letra(os.path.join(FONTES, 'gs500.ttf')); L700 = Letra(os.path.join(FONTES, 'gs700.ttf'))
CAP = 0.716

def globo(x, y, tam):
    return f'<path transform="translate({x:.2f} {y:.2f}) scale({tam/480:.5f})" fill-rule="evenodd" d="{GLOBO}"/>'

TRACK = -0.02                                  # tracking do nome, em em
# descritor por baixo do nome (os dos outros braços entram quando forem decididos)
DESCRITOR = {'Company': 'Desenvolvimento Empresarial, Educação e Tecnologia'}
XH = 0.53                                      # altura-x do Google Sans, em em

def descritor(texto, largura, x0, base):
    """texto do descritor ajustado à largura do nome: escolhe o tamanho com tracking fixo"""
    _, w1 = L500.caminho(texto, 10, 0, 0, tracking=0.01)
    tam = 10 * largura / w1
    return L500.caminho(texto, tam, x0, base, tracking=0.01) + (tam,)

def horizontal(braco, com_descritor=True):
    """globo à esquerda; «Kingdom <Braço>» numa só linha e, por baixo, o descritor"""
    G = 120; S = 60; gap = 30
    cap = CAP * S; nome = f'Kingdom {braco}'
    _, w = L500.caminho(nome, S, 0, 0, tracking=TRACK)
    if not (com_descritor and braco in DESCRITOR):
        base = (G + cap) / 2
        d, _ = L500.caminho(nome, S, G + gap, base, tracking=TRACK)
        return G + gap + w + 4, G, globo(0, 0, G) + f'<path d="{d}"/>'
    _, _, t = descritor(DESCRITOR[braco], w - 2, 0, 0)
    entre = 0.42 * S                           # da linha de base do nome ao topo das maiúsculas do descritor
    bloco = cap + entre + CAP * t
    base = (G - bloco) / 2 + cap
    d, _ = L500.caminho(nome, S, G + gap, base, tracking=TRACK)
    dd, _, _ = descritor(DESCRITOR[braco], w - 2, G + gap + 2, base + entre + CAP * t)
    return G + gap + w + 4, G, globo(0, 0, G) + f'<path d="{d}"/><path d="{dd}"/>'

def vertical(braco, com_descritor=True):
    """globo em cima; «Kingdom <Braço>» numa só linha, centrado, e o descritor por baixo"""
    G = 120; S = 44; gap = 30
    cap = CAP * S; nome = f'Kingdom {braco}'
    _, w = L500.caminho(nome, S, 0, 0, tracking=TRACK)
    W = max(G, w) + 8
    base = G + gap + cap
    d, _ = L500.caminho(nome, S, (W - w) / 2, base, tracking=TRACK)
    corpo = globo((W - G) / 2, 0, G) + f'<path d="{d}"/>'
    if com_descritor and braco in DESCRITOR:
        _, _, t = descritor(DESCRITOR[braco], w - 2, 0, 0)
        base += 0.42 * S + CAP * t
        dd, _, _ = descritor(DESCRITOR[braco], w - 2, (W - w) / 2 + 1, base)
        corpo += f'<path d="{dd}"/>'
        return W, base + 0.24 * t, corpo
    return W, base + 0.24 * S, corpo

CORES = {'indigo': '#2B2850', 'branco': '#FFFFFF', 'preto': '#000000'}
BRACOS = sys.argv[3:] or ['Company']           # os outros braços entram na fase de replicação
for braco in BRACOS:
    for forma, fn in (('horizontal', horizontal), ('vertical', vertical)):
        for sufixo, com in (('', True), ('-simples', False)):
            if com and braco not in DESCRITOR: continue
            W, H, corpo = fn(braco, com)
            for cor, hexa in CORES.items():
                nome = f'kingdom-{braco.lower()}-{forma}{sufixo}-{cor}.svg'
                open(os.path.join(SAIDA, nome), 'w').write(
                    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W:.0f}" height="{H:.0f}"><g fill="{hexa}">{corpo}</g></svg>\n')
for cor, hexa in CORES.items():
    open(os.path.join(SAIDA, f'kingdom-simbolo-{cor}.svg'), 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480"><g fill="{hexa}"><path fill-rule="evenodd" d="{GLOBO}"/></g></svg>\n')
# ícones: globo branco num quadrado de cantos arredondados (app, perfis) e favicon
FUNDOS = {'indigo': '#2B2850', 'laranja': '#FF521A'}
for cor, hexa in FUNDOS.items():
    open(os.path.join(SAIDA, f'kingdom-icone-{cor}.svg'), 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="115" fill="{hexa}"/>'
        f'<g fill="#FFFFFF">{globo(106, 106, 300)}</g></svg>\n')
# favicon: o globo ocupa quase todo o quadrado, para o anel não desaparecer a 16 px
open(os.path.join(SAIDA, 'favicon.svg'), 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="96" fill="#2B2850"/>'
    f'<g fill="#FFFFFF">{globo(56, 56, 400)}</g></svg>\n')
print('ok', len(os.listdir(SAIDA)), 'ficheiros')
