#!/usr/bin/env python3
"""Tira o logótipo de uma imagem (logótipo claro sobre fundo de cor) e grava versões em PNG transparente.

Uso:
  python3 logo_de_imagem.py imagem.png --cor-escura "#0046C8" [--saida pasta] [--prefixo marca]

Grava <prefixo>-logo-branco.png (para as capas escuras), <prefixo>-logo-cor.png (para as páginas brancas)
e <prefixo>-simbolo-cor.png (só o símbolo, cortado no maior espaço horizontal entre o símbolo e o texto).
Também imprime as cores do fundo em vários pontos, para escolher a paleta.
Se o logótipo for escuro sobre fundo claro, usar --escuro-sobre-claro.
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('imagem')
    ap.add_argument('--cor-escura', default='#000000', help='cor do logótipo nas páginas brancas')
    ap.add_argument('--saida', default='.')
    ap.add_argument('--prefixo', default='marca')
    ap.add_argument('--escuro-sobre-claro', action='store_true')
    a = ap.parse_args()
    im = Image.open(a.imagem).convert('RGB')
    arr = np.asarray(im).astype(int)
    h, w = arr.shape[:2]
    for nome, (x, y) in {'canto sup. dir.': (w - 5, 5), 'topo': (w // 2, h // 10), 'centro': (w // 2, h // 2), 'esquerda': (w // 10, h // 2), 'canto inf. esq.': (5, h - 5), 'base': (w // 2, h - h // 10)}.items():
        print(f'{nome:16} #%02X%02X%02X' % tuple(arr[y, x]))
    if a.escuro_sobre_claro:
        lum = 255 - arr.max(axis=2)
    else:
        lum = arr.min(axis=2)
    alfa = (np.clip((lum - 150) / 105, 0, 1) * 255).astype('uint8')
    m = Image.fromarray(alfa)
    caixa = m.point(lambda v: 255 if v > 40 else 0).getbbox()
    if not caixa:
        raise SystemExit('Não encontrei o logótipo (tente --escuro-sobre-claro).')
    saida = Path(a.saida)
    saida.mkdir(parents=True, exist_ok=True)
    cor = tuple(int(a.cor_escura.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4))

    def grava(rgb, nome):
        o = Image.new('RGBA', im.size, rgb + (0,))
        o.putalpha(m)
        o = o.crop(caixa)
        o.save(saida / nome)
        return o

    grava((255, 255, 255), f'{a.prefixo}-logo-branco.png')
    cor_img = grava(cor, f'{a.prefixo}-logo-cor.png')
    # símbolo: corta no maior espaço vazio horizontal (entre o símbolo e o texto)
    al = np.asarray(cor_img.getchannel('A')) > 40
    linhas = al.any(axis=1)
    melhor, ini = (0, None), None
    for y, cheia in enumerate(linhas):
        if not cheia and ini is None:
            ini = y
        if cheia and ini is not None:
            if y - ini > melhor[0]:
                melhor = (y - ini, ini)
            ini = None
    if melhor[1]:
        s = cor_img.crop((0, 0, cor_img.width, melhor[1]))
        s.crop(s.getbbox()).save(saida / f'{a.prefixo}-simbolo-cor.png')
    else:
        cor_img.save(saida / f'{a.prefixo}-simbolo-cor.png')
    print('Gravado em', saida)


if __name__ == '__main__':
    main()
