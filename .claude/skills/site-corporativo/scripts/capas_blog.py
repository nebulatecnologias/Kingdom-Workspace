#!/usr/bin/env python3
"""Recorta imagens de capa para o blog em 1200 × 630 (site e partilhas em redes sociais).

Uso:
  python3 capas_blog.py pasta-do-site "slug-do-artigo=foto.jpg" ["outro-slug=foto2.jpg:0.2"]

O número depois de «:» diz onde fica o recorte na vertical (0 = topo, 0.5 = centro,
1 = fundo); por omissão 0.5. Escolher o valor que mantém o assunto da foto no quadro
(o céu de uma cidade pede 0.9; um rosto perto do topo pede 0.15) e confirmar a ver.
Grava pasta-do-site/blog/img/<slug>.jpg e acrescenta «imagem:» ao artigo em
blog/artigos/<slug>.md, se existir. Depois correr blog/construir.py.
"""
import re
import sys
from pathlib import Path

from PIL import Image


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    site = Path(sys.argv[1])
    (site / 'blog' / 'img').mkdir(parents=True, exist_ok=True)
    for item in sys.argv[2:]:
        slug, resto = item.split('=', 1)
        caminho, _, fy = resto.partition(':')
        fy = float(fy or .5)
        im = Image.open(caminho).convert('RGB')
        w, h = im.size
        if w / h > 1200 / 630:                       # mais larga: corta dos lados, ao centro
            cw = round(h * 1200 / 630)
            x = (w - cw) // 2
            im = im.crop((x, 0, x + cw, h))
        else:
            ch = round(w * 630 / 1200)
            y = round((h - ch) * fy)
            im = im.crop((0, y, w, y + ch))
        im = im.resize((1200, 630), Image.LANCZOS)
        destino = site / 'blog' / 'img' / f'{slug}.jpg'
        im.save(destino, quality=82, optimize=True, progressive=True)
        artigo = site / 'blog' / 'artigos' / f'{slug}.md'
        if artigo.exists():
            t = artigo.read_text(encoding='utf-8')
            linha = f'imagem: /blog/img/{slug}.jpg'
            t = re.sub(r'^imagem:.*$', linha, t, count=1, flags=re.M) if re.search(r'^imagem:', t, re.M) else t.replace('\n---\n', f'\n{linha}\n---\n', 1)
            artigo.write_text(t, encoding='utf-8')
        print(f'{destino} ({destino.stat().st_size // 1024} KB){" · artigo atualizado" if artigo.exists() else ""}')


if __name__ == '__main__':
    main()
