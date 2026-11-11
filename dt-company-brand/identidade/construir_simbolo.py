"""Símbolo e logótipo da DT Company, reconstruídos com geometria exata.

O símbolo «dp» assenta numa só unidade, t (a espessura da faixa), igual a 60 no desenho:
- as barrigas do d e do p têm a mesma altura, 2t + c, com c = 7/8 t (o furo);
- o p é o d rodado 180° em torno do centro do traço central, que as duas letras partilham;
- o d fica uma faixa abaixo do p, por isso as linhas horizontais das duas barrigas coincidem;
- os traços oblíquos fazem 58° com a horizontal; o central mede t, o do d 1,25t,
  e o canal entre eles 5/8 t (medidas na perpendicular ao traço);
- as pontas das barrigas são elipses concêntricas na proporção 1,2 : 1; o furo é a elipse exterior a 0,3;
- o pescoço do d tem uma concordância de raio 0,4t; as pontas levam um arredondamento de 0,16t e os cantos interiores 0,1t.
Ajustado à imagem original da marca: coincidência (IoU) de 0,976.

Uso: python3 construir_simbolo.py   (grava simbolo/, logotipo/ e medidas.json nesta pasta)
"""
import json, math, os, re
import numpy as np
from shapely.geometry import Polygon, MultiPolygon, box, Point
from shapely import affinity
from shapely.ops import unary_union

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.environ.get('SAIDA', AQUI)          # para gerar variantes noutra pasta
T = 60.0
ANG = 32.0                                   # inclinação face à vertical (58° face à horizontal)
K = -math.tan(math.radians(ANG)); COS = math.cos(math.radians(ANG))
M = dict(t=T, c=.875 * T, larg_central=1.0 * T, larg_d=1.25 * T, canal=.625 * T, concordancia=.4 * T,
         proporcao_elipse=1.2, furo=.3, dist_centro=10 / 3 * T, canto=float(os.environ.get('CANTO', .16)) * T, canto_concavo=.1 * T, angulo=90 - ANG)
C = M['c']; HB = 2 * T + C; HT = 3 * T + C
BO = HB / 2; AO = M['proporcao_elipse'] * BO; BI = C / 2; AI = M['furo'] * AO
XC, YC = 0.0, HT / 2                         # centro de rotação (as coordenadas finais são deslocadas no fim)
Y0 = 0.0


def elipse(cx, cy, a, b, n=720):
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    return Polygon(np.c_[cx + a * np.cos(t), cy + b * np.sin(t)])


def obliquo(xc, w, y1, y2):
    """faixa oblíqua de largura horizontal w, com o eixo a passar por (xc, YC)"""
    xa = lambda y: xc + K * (y - YC)
    return Polygon([(xa(y1) - w / 2, y1), (xa(y1) + w / 2, y1), (xa(y2) + w / 2, y2), (xa(y2) - w / 2, y2)])


def esquerda_de(xc):
    xa = lambda y: xc + K * (y - YC)
    return Polygon([(xa(-999), -999), (xa(999), 999), (-9999, 999), (-9999, -999)])


wB, wA, g = M['larg_central'] / COS, M['larg_d'] / COS, M['canal'] / COS
xBl, xBr = XC - wB / 2, XC + wB / 2
xAr = xBl - g
cxd = XC - M['dist_centro']
yd = Y0 + T; ymd = yd + BO

central = obliquo(XC, wB, Y0, Y0 + HT)
traco_d = obliquo(xAr - wA / 2, wA, Y0, yd + T)
ponta = elipse(cxd, ymd, AO, BO).intersection(box(-9999, -9999, cxd, 9999))
topo = box(cxd, yd, 9999, yd + T).intersection(esquerda_de(xAr))
fundo = box(cxd, yd + T + C, 9999, yd + HB).intersection(esquerda_de(xBr))
recheio = box(cxd - .01, yd + T, cxd + 1, yd + T + C)
furo = unary_union([elipse(cxd, ymd, AI, BI).intersection(box(-9999, -9999, cxd + .5, 9999)),
                    box(cxd, yd + T, 9999, yd + T + C).intersection(esquerda_de(xBl))])
barriga_d = unary_union([ponta, topo, fundo, recheio]).difference(furo)

# concordância côncava no pescoço do d: arco de raio f tangente ao topo da barriga e à borda esquerda do traço do d
f = M['concordancia']
xAl = xAr - wA
Px = xAl + K * (yd - YC); Py = yd                                  # canto entre o topo da barriga e o traço
u1 = np.array([-1.0, 0.0])                                         # ao longo do topo da barriga, para a esquerda
u2 = np.array([-K, -1.0]); u2 /= np.linalg.norm(u2)                # ao longo do traço, para cima
teta = math.acos(float(u1 @ u2))                                   # ângulo do espaço vazio (≈ 122°)
dt_ = f / math.tan(teta / 2)
T1 = np.array([Px, Py]) + u1 * dt_; T2 = np.array([Px, Py]) + u2 * dt_
bis = (u1 + u2) / np.linalg.norm(u1 + u2)
Cc = np.array([Px, Py]) + bis * f / math.sin(teta / 2)
a1 = math.atan2(*(T1 - Cc)[::-1]); a2 = math.atan2(*(T2 - Cc)[::-1])
if a2 - a1 > math.pi: a2 -= 2 * math.pi
if a1 - a2 > math.pi: a2 += 2 * math.pi
arco = [(Cc[0] + f * math.cos(a), Cc[1] + f * math.sin(a)) for a in np.linspace(a1, a2, 96)]
pescoco = Polygon([(Px, Py)] + arco)
letra_d = unary_union([barriga_d, traco_d, pescoco])

barriga_p = affinity.rotate(barriga_d, 180, origin=(XC, YC))
simbolo = unary_union([barriga_d, traco_d, barriga_p, central]).intersection(box(-9999, Y0, 9999, Y0 + HT))
# arredondamento dos cantos, antes da concordância (que tem de ficar tangente):
# convexo (as pontas) com o raio escolhido; côncavo com um raio pequeno, abaixo de metade do canal, para não o fechar
r = M['canto']; rc = M['canto_concavo']
simbolo = simbolo.buffer(-r, join_style=1, quad_segs=48).buffer(r, join_style=1, quad_segs=48)
simbolo = simbolo.buffer(rc, join_style=1, quad_segs=48).buffer(-rc, join_style=1, quad_segs=48)
simbolo = unary_union([simbolo, pescoco])

# deslocar para começar em (0, 0)
x0, y0_, x1, y1 = simbolo.bounds
DX, DY = -x0, -y0_
mover = lambda geo: affinity.translate(geo, DX, DY)
W, H = x1 - x0, y1 - y0_


def caminho(geo, casas=2):
    polys = geo.geoms if isinstance(geo, MultiPolygon) else [geo]
    d = []
    for pg in polys:
        pg = pg.simplify(.02)
        for anel in [pg.exterior, *pg.interiors]:
            pts = list(anel.coords)[:-1]
            d.append('M' + ' L'.join(f'{x:.{casas}f} {y:.{casas}f}' for x, y in pts) + 'Z')
    return ''.join(d)


def svg(conteudo, w, h, vb=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb or f"0 0 {w:.2f} {h:.2f}"}">{conteudo}</svg>\n'


os.makedirs(os.path.join(SAIDA, 'simbolo', 'pecas'), exist_ok=True)
D = caminho(mover(simbolo))
open(os.path.join(SAIDA, 'simbolo', 'dt-simbolo.svg'), 'w').write(svg(f'<path fill="#04123F" fill-rule="evenodd" d="{D}"/>', W, H))

# peças (mesmo viewBox do símbolo) para as páginas de significado e construção
pecas = {'letra-d': letra_d.intersection(simbolo), 'letra-p': unary_union([barriga_p, central]).intersection(simbolo),
         'traco-central': central.intersection(simbolo), 'barriga-d': barriga_d.intersection(simbolo),
         'barriga-p': barriga_p.intersection(simbolo), 'traco-d': unary_union([traco_d, pescoco]).intersection(simbolo)}
for nome, geo in pecas.items():
    open(os.path.join(SAIDA, 'simbolo', 'pecas', f'{nome}.svg'), 'w').write(svg(f'<path fill="#04123F" fill-rule="evenodd" d="{caminho(mover(geo))}"/>', W, H))

# ®: anel e «R» da Google Sans Bold, centrado no canto inferior direito do d
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
RD = .37 * T                                   # raio exterior do ® (diâmetro 0,74t)
RC = (.586 * W + DX * 0 - DX, .926 * H - DY)   # centro em coordenadas do símbolo antes de deslocar
reg_c = (.586 * W, .926 * H)
anel = Point(reg_c).buffer(RD, quad_segs=64).difference(Point(reg_c).buffer(RD * .80, quad_segs=64))
fb = TTFont(os.path.join(AQUI, 'fontes', 'google-sans-700.ttf'))
gsb = fb.getGlyphSet(); gR = fb.getBestCmap()[ord('R')]
bp = BoundsPen(gsb); gsb[gR].draw(bp); bx0, by0, bx1, by1 = bp.bounds
esc = (RD * 1.02) / (by1 - by0)
pen = SVGPathPen(gsb)
gsb[gR].draw(TransformPen(pen, (esc, 0, 0, -esc, reg_c[0] - (bx0 + bx1) / 2 * esc, reg_c[1] + (by0 + by1) / 2 * esc)))
R_path = pen.getCommands()
REG = f'<path fill-rule="evenodd" d="{caminho(anel)}"/><path d="{R_path}"/>'
reg_bottom = reg_c[1] + RD


def texto_curvas(texto, fonte, tam, tracking=0.0):
    """texto em curvas (sem depender da letra instalada); devolve (path d, largura, altura de maiúsculas)"""
    import uharfbuzz as hb
    tt = TTFont(fonte); gs = tt.getGlyphSet(); ordem = tt.getGlyphOrder(); upm = tt['head'].unitsPerEm
    font = hb.Font(hb.Face(hb.Blob.from_file_path(fonte)))
    buf = hb.Buffer(); buf.add_str(texto); buf.guess_segment_properties(); hb.shape(font, buf, {'kern': True})
    e = tam / upm; x = 0; d = ''
    infos = list(zip(buf.glyph_infos, buf.glyph_positions))
    for i, (inf, pos) in enumerate(infos):
        pen = SVGPathPen(gs)
        gs[ordem[inf.codepoint]].draw(TransformPen(pen, (e, 0, 0, -e, x + pos.x_offset * e, 0)))
        d += pen.getCommands()
        x += pos.x_advance * e + (tracking * tam if i < len(infos) - 1 else 0)
    return d, x, tt['OS/2'].sCapHeight * e


DESC = 'Business Advisory & Development'
# na referência, o descritor tem 1,19 × a largura do símbolo e maiúsculas de 0,56t
tam = .56 * T / .716
d_desc, larg, cap = texto_curvas(DESC, os.path.join(AQUI, 'fontes', 'google-sans-400.ttf'), tam)
escala_d = 1.19 * W / larg
tam *= escala_d
d_desc, larg, cap = texto_curvas(DESC, os.path.join(AQUI, 'fontes', 'google-sans-400.ttf'), tam)
GAP = .82 * T


def logo_vertical(cor, com_desc=True):
    lw = max(W, larg) if com_desc else W
    sx = (lw - W) / 2
    partes = f'<g transform="translate({sx:.2f} 0)"><path fill-rule="evenodd" d="{D}"/>{REG}</g>'
    h = max(H, reg_bottom)
    if com_desc:
        base_y = H + GAP + cap
        partes += f'<g transform="translate({(lw - larg) / 2:.2f} {base_y:.2f})"><path d="{d_desc}"/></g>'
        h = base_y + .25 * cap * 1.4                     # espaço para descendentes (y, p)
    return svg(f'<g fill="{cor}">{partes}</g>', lw, h)


def logo_horizontal(cor):
    """símbolo à esquerda, descritor em duas linhas à direita, centrado na altura do símbolo"""
    l1, l2 = 'Business Advisory', '& Development'
    t2 = .30 * H / .716                               # maiúsculas a 30% da altura do símbolo
    a, la, ca = texto_curvas(l1, os.path.join(AQUI, 'fontes', 'google-sans-400.ttf'), t2)
    b, lb, _ = texto_curvas(l2, os.path.join(AQUI, 'fontes', 'google-sans-400.ttf'), t2)
    x = W + .75 * T
    entre = ca * 1.65
    y1 = H / 2 - entre / 2 + ca / 2 - ca * .05
    partes = (f'<path fill-rule="evenodd" d="{D}"/>{REG}<g transform="translate({x:.2f} {y1:.2f})"><path d="{a}"/></g>'
              f'<g transform="translate({x:.2f} {y1 + entre:.2f})"><path d="{b}"/></g>')
    return svg(f'<g fill="{cor}">{partes}</g>', x + max(la, lb), max(H, reg_bottom))


CORES = {'indigo': '#04123F', 'azul': '#0A57E7', 'branco': '#FFFFFF', 'preto': '#000000'}
os.makedirs(os.path.join(SAIDA, 'logotipo'), exist_ok=True)
for nome, cor in CORES.items():
    open(os.path.join(SAIDA, 'logotipo', f'dt-company-vertical-{nome}.svg'), 'w').write(logo_vertical(cor))
    open(os.path.join(SAIDA, 'logotipo', f'dt-company-horizontal-{nome}.svg'), 'w').write(logo_horizontal(cor))
    open(os.path.join(SAIDA, 'logotipo', f'dt-company-simbolo-{nome}.svg'), 'w').write(logo_vertical(cor, com_desc=False))

json.dump({**{k: round(v, 4) if isinstance(v, float) else v for k, v in M.items()}, 'largura': round(W, 2), 'altura': round(H, 2),
           'elipse_exterior': [round(AO, 2), round(BO, 2)], 'elipse_furo': [round(AI, 2), round(BI, 2)],
           'registo': {'centro': [round(reg_c[0], 2), round(reg_c[1], 2)], 'raio': round(RD, 2)},
           'descritor': {'texto': DESC, 'tamanho': round(tam, 2), 'largura': round(larg, 2), 'espaco_simbolo': GAP}},
          open(os.path.join(SAIDA, 'simbolo', 'medidas.json'), 'w'), indent=1, ensure_ascii=False)
print(f'símbolo {W:.1f} × {H:.1f} (t = {T:.0f}) · descritor {tam:.1f} · {len(CORES)} cores')
