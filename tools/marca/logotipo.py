"""Gera os logótipos Kingdom (globo + «Kingdom <Braço>» numa só linha) em SVG, com o texto
convertido em curvas (Google Sans 500), para não depender da letra instalada.
Uso: python3 tools/marca/logotipo.py <fontes_dir> <saida_dir>
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

def horizontal(braco):
    """globo à esquerda; «Kingdom <Braço>» numa só linha, mesma letra, tamanho e peso"""
    G = 120; S = 60; gap = 30
    cap = CAP * S
    base = (G + cap) / 2                       # maiúsculas centradas na altura do globo
    d, w = L500.caminho(f'Kingdom {braco}', S, G + gap, base, tracking=TRACK)
    W = G + gap + w + 4; H = G
    return W, H, globo(0, 0, G) + f'<path d="{d}"/>'

def vertical(braco):
    """globo em cima; «Kingdom <Braço>» numa só linha, centrado por baixo"""
    G = 120; S = 44; gap = 30
    cap = CAP * S
    _, w = L500.caminho(f'Kingdom {braco}', S, 0, 0, tracking=TRACK)
    W = max(G, w) + 8
    base = G + gap + cap
    d, _ = L500.caminho(f'Kingdom {braco}', S, (W - w) / 2, base, tracking=TRACK)
    H = base + 0.24 * S                        # espaço para a descendente do «g»/«y»
    return W, H, globo((W - G) / 2, 0, G) + f'<path d="{d}"/>'

CORES = {'indigo': '#2B2850', 'branco': '#FFFFFF', 'preto': '#000000'}
for braco in ('Company', 'Training', 'Academy'):
    for forma, fn in (('horizontal', horizontal), ('vertical', vertical)):
        W, H, corpo = fn(braco)
        for cor, hexa in CORES.items():
            nome = f'kingdom-{braco.lower()}-{forma}-{cor}.svg'
            open(os.path.join(SAIDA, nome), 'w').write(
                f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W:.0f}" height="{H:.0f}"><g fill="{hexa}">{corpo}</g></svg>\n')
for cor, hexa in CORES.items():
    open(os.path.join(SAIDA, f'kingdom-simbolo-{cor}.svg'), 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480"><g fill="{hexa}"><path fill-rule="evenodd" d="{GLOBO}"/></g></svg>\n')
print('ok', len(os.listdir(SAIDA)), 'ficheiros')
