"""Etapas 4 e 5 · Logótipo e variações, com o texto convertido em curvas.

Lê marca.json e gera em <saida>/logotipo/:
  <slug>-horizontal-<cor>.svg         símbolo + nome numa linha + descritor (se houver)
  <slug>-horizontal-simples-<cor>.svg sem descritor
  <slug>-vertical-<cor>.svg / -vertical-simples-<cor>.svg
  <slug>-simbolo-<cor>.svg            só o símbolo
  <slug>-icone-<cor>.svg              símbolo branco num quadrado arredondado (app, perfis)
  favicon.svg / favicon.ico           símbolo quase a ocupar o quadrado, para ler a 16 px
  png/                                tudo em PNG transparente (2000 px; ícones 512 e 180)
Uso: python3 logotipo.py marca.json [--sem-png]

Campos usados de marca.json: nome, descritor, fontes.logotipo (ttf), logotipo.tracking,
simbolo (svg), cores_logo {nome: hex}, cores_icone {nome: hex}.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import carregar, caminho, saida, slug, Simbolo, Letra, svg_para_png

cfg = carregar(sys.argv[1]); SEM_PNG = '--sem-png' in sys.argv
SIM = Simbolo(caminho(cfg, cfg['simbolo']))
L = Letra(caminho(cfg, cfg['fontes']['logotipo']))
LG = cfg.get('logotipo', {})
TRACK = LG.get('tracking', -0.02)
NOME = cfg['nome']; DESC = cfg.get('descritor')
CORES = cfg.get('cores_logo') or {'principal': cfg['cores']['principal']['hex'], 'branco': '#FFFFFF', 'preto': '#000000'}
ICONES = cfg.get('cores_icone') or {'principal': cfg['cores']['principal']['hex']}
OUT = saida(cfg, 'logotipo'); S_ = slug(cfg)
CAP = L.cap

def descritor(largura, x0, base):
    """o descritor ocupa exatamente a largura do nome; o tamanho resulta disso"""
    _, w1 = L.caminho(DESC, 10, 0, 0, tracking=0.01); t = 10 * largura / w1
    d, _ = L.caminho(DESC, t, x0, base, tracking=0.01); return d, t

def horizontal(com_desc):
    G = 120; Gw = G * SIM.proporcao; S = LG.get('tamanho_horizontal', 60); gap = G / 4
    cap = CAP * S
    _, w = L.caminho(NOME, S, 0, 0, tracking=TRACK)
    corpo = SIM.g(0, 0, G)
    if com_desc and DESC:
        _, t = descritor(w - 2, 0, 0); entre = 0.42 * S
        base = (G - (cap + entre + CAP * t)) / 2 + cap
        d, _ = L.caminho(NOME, S, Gw + gap, base, tracking=TRACK)
        dd, _ = descritor(w - 2, Gw + gap + 2, base + entre + CAP * t)
        corpo += f'<path d="{d}"/><path d="{dd}"/>'
    else:
        d, _ = L.caminho(NOME, S, Gw + gap, (G + cap) / 2, tracking=TRACK); corpo += f'<path d="{d}"/>'
    return Gw + gap + w + 4, G, corpo

def vertical(com_desc):
    G = 120; Gw = G * SIM.proporcao; S = LG.get('tamanho_vertical', 44); gap = G / 4
    cap = CAP * S
    _, w = L.caminho(NOME, S, 0, 0, tracking=TRACK)
    W = max(Gw, w) + 8; base = G + gap + cap
    d, _ = L.caminho(NOME, S, (W - w) / 2, base, tracking=TRACK)
    corpo = SIM.g((W - Gw) / 2, 0, G) + f'<path d="{d}"/>'
    if com_desc and DESC:
        _, t = descritor(w - 2, 0, 0); base += 0.42 * S + CAP * t
        dd, _ = descritor(w - 2, (W - w) / 2 + 1, base); corpo += f'<path d="{dd}"/>'
        return W, base + 0.24 * t, corpo
    return W, base + 0.24 * S, corpo

def grava(nome, W, H, corpo, cor):
    open(os.path.join(OUT, nome), 'w').write(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W:.0f}" height="{H:.0f}"><g fill="{cor}">{corpo}</g></svg>\n')

ficheiros = []
for forma, fn in (('horizontal', horizontal), ('vertical', vertical)):
    for suf, com in (('', True), ('-simples', False)):
        if com and not DESC: continue
        W, H, corpo = fn(com)
        for nc, hx in CORES.items():
            n = f'{S_}-{forma}{suf}-{nc}.svg'; grava(n, W, H, corpo, hx); ficheiros.append((n, 2000))
for nc, hx in CORES.items():
    W = 480 * SIM.proporcao; n = f'{S_}-simbolo-{nc}.svg'; grava(n, W, 480, SIM.g(0, 0, 480), hx); ficheiros.append((n, 2000))

def quadrado(fundo, ocupa, raio):
    lado = 512 * ocupa; alt = lado / max(1, SIM.proporcao); larg = alt * SIM.proporcao
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" rx="{raio}" fill="{fundo}"/>'
            f'<g fill="#FFFFFF">{SIM.g((512 - larg) / 2, (512 - alt) / 2, alt)}</g></svg>\n')
for nc, hx in ICONES.items():
    n = f'{S_}-icone-{nc}.svg'; open(os.path.join(OUT, n), 'w').write(quadrado(hx, .58, 115)); ficheiros += [(n, 512), (n, 180)]
open(os.path.join(OUT, 'favicon.svg'), 'w').write(quadrado(list(ICONES.values())[0], .78, 96))

if not SEM_PNG:
    png = os.path.join(OUT, 'png'); os.makedirs(png, exist_ok=True)
    pares = []
    for n, w in ficheiros:
        nome = n[:-4] + (f'-{w}' if 'icone' in n else '') + '.png'
        pares.append((os.path.join(OUT, n), os.path.join(png, nome), w))
    pares += [(os.path.join(OUT, 'favicon.svg'), os.path.join(png, f'favicon-{t}.png'), t) for t in (16, 32, 48)]
    svg_para_png(pares)
    from PIL import Image
    ims = [Image.open(os.path.join(png, f'favicon-{t}.png')) for t in (16, 32, 48)]
    ims[2].save(os.path.join(OUT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)], append_images=ims[:2])
print('ok', len(os.listdir(OUT)), 'ficheiros em', OUT)
