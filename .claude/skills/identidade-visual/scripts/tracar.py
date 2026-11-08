"""Etapa 1 · Recriar um símbolo a partir de uma imagem de referência (PNG/JPG).

Vectoriza a forma com contornos a 50%, depois de reamostrar a 8×, alisar o serrilhado
e (opcional) impor simetria. Dá um SVG limpo, centrado, com o lado maior a medir 480 unidades,
com um só caminho em fill-rule evenodd: pronto para logotipo.py.

Uso:
  python3 tracar.py ref.png simbolo.svg [--simetria nenhuma|x|y|xy] [--suavizar 1.0]
                    [--circulo] [--limiar 0.5] [--inverter]

  --simetria  x: espelho esquerda/direita; y: cima/baixo; xy: os quatro quadrantes
  --suavizar  desfoque em píxeis da imagem original antes de vectorizar (0,8 a 1,5)
  --circulo   o contorno exterior passa a ser um círculo perfeito (anéis, selos, globos)
  --inverter  quando o símbolo é claro sobre fundo escuro (deteção automática por omissão)

Depois de tracar: comparar com a referência (abre-se o PNG de verificação que o script
grava ao lado do SVG) e, se o desenho é geométrico, seguir references/reconstrucao-geometrica.md
para o refazer com primitivas exatas.
"""
import sys, argparse
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure
from shapely.geometry import Polygon, Point
from shapely import affinity

ap = argparse.ArgumentParser()
ap.add_argument('ref'); ap.add_argument('saida')
ap.add_argument('--simetria', default='nenhuma', choices=['nenhuma', 'x', 'y', 'xy'])
ap.add_argument('--suavizar', type=float, default=1.0)
ap.add_argument('--circulo', action='store_true')
ap.add_argument('--limiar', type=float, default=.5)
ap.add_argument('--inverter', action='store_true')
a = ap.parse_args()

g = np.array(Image.open(a.ref).convert('L')).astype(float) / 255
# o símbolo é a classe minoritária (fundo ocupa mais área); --inverter força
borda = np.r_[g[0], g[-1], g[:, 0], g[:, -1]].mean()
if a.inverter or borda < .5: g = 1 - g          # passa a ser escuro sobre claro
tinta = 1 - g                                     # 1 = símbolo
ys, xs = np.where(tinta > a.limiar)
if not len(xs): raise SystemExit('não encontrei o símbolo: ajustar --limiar ou --inverter')
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy = (x0 + x1 + 1) / 2, (y0 + y1 + 1) / 2
meio = max(x1 - x0, y1 - y0) / 2 + 6
S = 8; n = int(2 * meio * S)
gy, gx = (np.mgrid[0:n, 0:n] + .5) / S - meio
img = ndimage.map_coordinates(tinta, np.array([gy + cy - .5, gx + cx - .5]), order=3, mode='constant')
if a.simetria in ('x', 'xy'): img = (img + img[:, ::-1]) / 2
if a.simetria in ('y', 'xy'): img = (img + img[::-1, :]) / 2
img = ndimage.gaussian_filter(img, a.suavizar * S)

escala = 240 / (max(x1 - x0, y1 - y0) / 2)          # meia largura do símbolo -> 240 unidades
forma = None
for c in measure.find_contours(img, a.limiar):
    if len(c) < 12: continue
    pts = np.c_[(c[:, 1] / S - meio) * escala, (c[:, 0] / S - meio) * escala]
    p = Polygon(pts).buffer(0)
    if p.area < 4: continue
    forma = p if forma is None else forma.symmetric_difference(p)     # evenodd: furos alternam
if forma is None: raise SystemExit('nenhum contorno: baixar --suavizar ou ajustar --limiar')

if a.circulo:
    # o contorno exterior passa a círculo perfeito com o raio médio do traçado:
    # preenche as falhas entre o traçado e o círculo e corta o que passa dele
    ext = max(getattr(forma, 'geoms', [forma]), key=lambda q: q.area).exterior
    R = float(np.median(np.hypot(*np.array(ext.coords).T)))
    disco = Point(0, 0).buffer(R, 2048)
    forma = forma.union(disco.difference(Polygon(np.array(ext.coords)).buffer(0))).intersection(disco).buffer(0)

forma = forma.simplify(0.02, preserve_topology=True)
# caixa justa ao desenho: o lado maior mede 480 unidades
b = forma.bounds; L = max(b[2] - b[0], b[3] - b[1]); k = 480 / L
forma = affinity.translate(affinity.scale(forma, k, k, origin=(0, 0)), -k * b[0], -k * b[1])
VW, VH = k * (b[2] - b[0]), k * (b[3] - b[1])

def caminho(poly):
    s = ''
    for anel in [poly.exterior, *poly.interiors]:
        s += 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in anel.coords) + ' Z '
    return s
d = ' '.join(caminho(p) for p in getattr(forma, 'geoms', [forma]))
open(a.saida, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VW:.2f} {VH:.2f}"><path fill="#000" fill-rule="evenodd" d="{d}"/></svg>\n')

# PNG de verificação: referência e traçado lado a lado
ver = a.saida.rsplit('.', 1)[0] + '-verificacao.png'
ref = Image.open(a.ref).convert('L').crop((int(x0), int(y0), int(x1) + 1, int(y1) + 1))
from PIL import ImageDraw
tr = Image.new('L', (round(VW), round(VH)), 255); dr = ImageDraw.Draw(tr)
for p in getattr(forma, 'geoms', [forma]):
    dr.polygon(list(p.exterior.coords), fill=0)
    for h in p.interiors: dr.polygon(list(h.coords), fill=255)
ref = ref.resize((round(VW), round(VH)))
lado = Image.new('L', (2 * round(VW) + 20, round(VH)), 200); lado.paste(ref, (0, 0)); lado.paste(tr, (round(VW) + 20, 0)); lado.save(ver)
print('ok', a.saida, '| verificação:', ver, '| peças:', len(getattr(forma, 'geoms', [forma])))
