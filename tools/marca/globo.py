"""Globo v3: geometria pura (anel circular, eixo, equador, meridianos elípticos ajustados
ao original) + curvas das estrelas tiradas do original simetrizado e alisado.
Uso: python3 globo3.py <original.png> <saida.svg>"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure
from shapely.geometry import Polygon, Point, box
from shapely.ops import unary_union
from shapely import affinity

orig, saida = sys.argv[1], sys.argv[2]
CX, CY = 539.25, 526.75
f = 240 / 239.5                       # unidades finais: raio exterior 240

# ---------- imagem simetrizada e alisada, em unidades finais ----------
g = np.array(Image.open(orig).convert('L')).astype(float) / 255
S = 8; meio = 260; n = 2 * meio * S
ys, xs = (np.mgrid[0:n, 0:n] + .5) / S - meio
img = ndimage.map_coordinates(g, np.array([ys + CY - .5, xs + CX - .5]), order=3)
img = (img + img[:, ::-1] + img[::-1, :] + img[::-1, ::-1]) / 4
img = ndimage.gaussian_filter(img, 1.2 * S)
def px(u):   # unidades finais -> índice na grelha
    return (u / f + meio) * S

def bordas_linha(yu):
    """posições x (unidades finais) onde a linha y cruza 0,5, só no lado esquerdo"""
    lin = img[int(round(px(yu))), :n // 2]
    i = np.where(np.diff(np.sign(lin - .5)) != 0)[0]
    out = []
    for k in i:
        x0 = k + (.5 - lin[k]) / (lin[k + 1] - lin[k])
        out.append((x0 / S - meio) * f)
    return out

# ---------- anel, eixo, equador ----------
R = 240.0
rs = []
for yu in np.arange(-150, -60, 2):
    b = bordas_linha(yu)
    rs.append(np.hypot(b[1], yu))               # 2.ª borda = interior do anel
r = float(np.median(rs))
def borda_col(xu):
    col = img[:, int(round(px(xu)))]
    i = np.where(np.diff(np.sign(col - .5)) != 0)[0]
    return [((k + (.5 - col[k]) / (col[k + 1] - col[k])) / S - meio) * f for k in i]
eixo = 2 * float(np.median([abs(bordas_linha(yu)[-1]) for yu in np.arange(-190, -110, 2)]))
equador = json.load(open('param.json'))['equador']   # do ajuste global (as estrelas tocam o equador em toda a largura)

# ---------- meridianos: elipse interior e exterior ajustadas separadamente ----------
def ajusta_elipse(pontos):
    # x²/a² + y²/b² = 1  ->  mínimos quadrados em (1/a², 1/b²)
    A = np.c_[pontos[:, 0] ** 2, pontos[:, 1] ** 2]
    sol, *_ = np.linalg.lstsq(A, np.ones(len(A)), rcond=None)
    return 1 / np.sqrt(sol[0]), 1 / np.sqrt(sol[1])
ext, inn = [], []
for yu in np.arange(-195, -95, 1.5):
    b = bordas_linha(yu)        # anel(2), meridiano(2), eixo(1)
    if len(b) >= 4:
        ext.append((b[2], yu)); inn.append((b[3], yu))
a_ext, b_ext = ajusta_elipse(np.array(ext))
a_int, b_int = ajusta_elipse(np.array(inn))

def elipse(a, b, m=4096):
    t = np.linspace(0, 2 * np.pi, m, endpoint=False)
    return Polygon(np.c_[a * np.cos(t), b * np.sin(t)])
meridianos = elipse(a_ext, b_ext).difference(elipse(a_int, b_int))

# ---------- estrelas: concordâncias superelípticas ajustadas ao original ----------
# cada canto é {u>=0, v>=0, (u/U)^p + (v/V)^p <= 1}, com u medido a partir da borda
# do traço vertical (eixo ou meridiano) e v a partir da borda do equador: a curva é
# tangente às duas bordas, sem quebras.
from scipy.optimize import least_squares
cont = measure.find_contours(img, .5)
furos = []
for c in cont:
    pts = np.c_[(c[:, 1] / S - meio) * f, (c[:, 0] / S - meio) * f]
    if len(pts) < 50 or np.hypot(*pts.T).max() > r + 8: continue
    furos.append(pts)
topo = -equador / 2
def x_ext(y): return -a_ext * np.sqrt(np.clip(1 - (y / b_ext) ** 2, 0, 1))
def x_int(y): return -a_int * np.sqrt(np.clip(1 - (y / b_int) ** 2, 0, 1))
def x_anel(y): return -np.sqrt(np.clip(r ** 2 - y ** 2, 0, None))
def ajusta(pts):
    u, v = pts[:, 0], pts[:, 1]
    def res(q):
        U, V, p = q
        return (np.abs(u / U) ** p + np.abs(v / V) ** p) ** (1 / p) - 1
    return least_squares(res, [60, 60, .7], bounds=([5, 5, .2], [400, 400, 2])).x
# canto do centro: furo entre o eixo e o meridiano interior (lado esquerdo do eixo, acima do equador)
pc = []
for pts in furos:
    sel = (pts[:, 0] > x_int(pts[:, 1]) + 4) & (pts[:, 0] < -eixo / 2 - 1) & (pts[:, 1] < topo - 1) & (pts[:, 1] > topo - 110)
    if sel.sum() > 30: pc.append(np.c_[-eixo / 2 - pts[sel, 0], topo - pts[sel, 1]])
pc = np.vstack(pc)
Uc, Vc, Pc = ajusta(pc)
# canto do meridiano: furo entre o anel e o meridiano (do lado de fora do meridiano)
pm = []
for pts in furos:
    xe = x_ext(pts[:, 1])
    sel = (pts[:, 0] < xe - 1) & (pts[:, 0] > x_anel(pts[:, 1]) + 4) & (pts[:, 1] < topo - 1) & (pts[:, 1] > topo - 110)
    if sel.sum() > 30: pm.append(np.c_[xe[sel] - pts[sel, 0], topo - pts[sel, 1]])
pm = np.vstack(pm)
Um, Vm, Pm = ajusta(pm)
print('centro U,V,p', round(Uc, 2), round(Vc, 2), round(Pc, 3), '| meridiano U,V,p', round(Um, 2), round(Vm, 2), round(Pm, 3))

def curva(U, V, p, m=600):
    t = np.linspace(0, np.pi / 2, m)
    return U * np.cos(t) ** (2 / p), V * np.sin(t) ** (2 / p)
u, v = curva(Uc, Vc, Pc)
c1 = Polygon(np.r_[[(-eixo / 2, topo)], np.c_[-eixo / 2 - u, topo - v], [(-eixo / 2, topo)]]).buffer(0)
u, v = curva(Um, Vm, Pm)
yy = topo - v
borda = np.linspace(topo - Vm, topo, 200)
c2 = Polygon(np.r_[np.c_[x_ext(yy) - u, yy], np.c_[x_ext(borda) + 3, borda]]).buffer(0)
cantos = []
for c in (c1, c2):
    for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        cantos.append(affinity.scale(c, sx, sy, origin=(0, 0)))

anel = Point(0, 0).buffer(R, 4096).difference(Point(0, 0).buffer(r, 4096))
interior = Point(0, 0).buffer(r + .25, 4096)
pecas = [box(-eixo / 2, -R, eixo / 2, R), box(-R, -equador / 2, R, equador / 2), meridianos, *cantos]
forma = unary_union([anel, unary_union(pecas).intersection(interior)]).simplify(0.01, preserve_topology=True)

def caminho(poly):
    s = ''
    for a in [poly.exterior, *poly.interiors]:
        s += 'M' + ' L'.join(f'{x+R:.2f} {y+R:.2f}' for x, y in a.coords) + ' Z '
    return s
d = ' '.join(caminho(pl) for pl in getattr(forma, 'geoms', [forma]))
open(saida, 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path fill="currentColor" fill-rule="evenodd" d="{d}"/></svg>\n')
json.dump(dict(R=R, r=r, eixo=eixo, equador=equador, a_ext=a_ext, b_ext=b_ext, a_int=a_int, b_int=b_int, centro=[Uc, Vc, Pc], meridiano=[Um, Vm, Pm]), open('geo3.json', 'w'), indent=1)
print(dict(r=round(r, 2), eixo=round(eixo, 2), equador=round(equador, 2), ext=(round(a_ext, 2), round(b_ext, 2)), int=(round(a_int, 2), round(b_int, 2))), 'furos', len(furos))
