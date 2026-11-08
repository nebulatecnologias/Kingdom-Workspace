#!/usr/bin/env python3
"""Prepara logótipos de clientes para a faixa «Quem confia em nós».

Para cada imagem: tira o fundo branco (incluindo a mistura com o branco nas bordas),
recorta as margens, guarda em PNG transparente e calcula a largura com que o logótipo
ocupa a mesma área visual que os outros (um logótipo largo fica mais baixo, um redondo
mais alto). No fim imprime os <li> prontos a colar dentro de <ul class="logos-trilho">.

Uso:
  python3 logos_clientes.py --saida pasta-do-site/img/clientes \\
      "Nome do cliente=caminho/logo.png" "Outro cliente=outro.jpg" [--cinza]

--cinza   converte para tons de cinzento (por omissão ficam nas cores originais,
          que foi o que o cliente da Kingdom Company acabou por preferir).
--area    área alvo em px² no ecrã (por omissão 118 × 72)
"""
import argparse
import html
import math
import re
import unicodedata
from pathlib import Path

import numpy as np
from PIL import Image


def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')


def limpar(caminho, cinza):
    im = Image.open(caminho).convert('RGBA')
    a = np.asarray(im).astype(float)
    rgb, alfa0 = a[..., :3], a[..., 3] / 255
    dist = (255 - rgb).max(axis=2)                     # distância ao branco
    al = np.clip((dist - 14) / 36, 0, 1) * alfa0       # o branco puro fica transparente
    k = np.where(al > .02, al, 1)[..., None]
    cor = np.where((al < 1)[..., None], np.clip(255 - (255 - rgb) / k, 0, 255), rgb)
    if cinza:
        g = .299 * cor[..., 0] + .587 * cor[..., 1] + .114 * cor[..., 2]
        lo = np.percentile(g[al > .9], 3) if (al > .9).any() else 0
        g = np.clip((g - lo) / (235 - lo), 0, 1) ** 1.15 * 150 + 30
        cor = np.dstack([g, g, g])
    o = Image.fromarray(np.dstack([cor, al * 255]).astype(np.uint8), 'RGBA')
    caixa = o.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    if not caixa:
        raise SystemExit(f'{caminho}: a imagem ficou vazia (é toda branca?)')
    o = o.crop(caixa)
    o.thumbnail((520, 300), Image.LANCZOS)
    return o


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('logos', nargs='+', help='"Nome=caminho"')
    ap.add_argument('--saida', required=True)
    ap.add_argument('--cinza', action='store_true')
    ap.add_argument('--area', type=float, default=118 * 72)
    ap.add_argument('--web', default='/img/clientes', help='caminho no site (por omissão /img/clientes)')
    a = ap.parse_args()
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    linhas = []
    for item in a.logos:
        if '=' not in item:
            raise SystemExit(f'«{item}»: use "Nome do cliente=caminho/da/imagem"')
        nome, caminho = item.split('=', 1)
        o = limpar(caminho, a.cinza)
        f = slug(nome) + '.png'
        o.save(saida / f, optimize=True)
        w, h = o.size
        r = w / h
        largura = math.sqrt(a.area * r)
        escala = min(1, 190 / largura, 86 / (largura / r))   # limites da célula da faixa
        site_path = a.web.rstrip('/') + '/' + f
        linhas.append(f'        <li><img src="{site_path}" alt="{html.escape(nome)}" width="{w}" height="{h}" style="--w:{round(largura * escala)}px" loading="lazy"></li>')
        print(f'{f}: {w}×{h}, largura no ecrã {round(largura * escala)} px')
    print('\nColar dentro de <ul class="logos-trilho">:\n' + '\n'.join(linhas))


if __name__ == '__main__':
    main()
