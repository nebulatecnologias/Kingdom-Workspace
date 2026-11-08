#!/usr/bin/env python3
"""Prepara uma cópia do site para pré-visualizar como Artifact no Claude.

Serve quando a Vercel não está disponível (limite diário de publicações, sem projeto,
sem acesso). O Artifact recebe a página inicial como ficheiro principal e as outras
páginas e ficheiros em `files`; tudo tem de usar caminhos relativos e a página
principal não pode ter <!DOCTYPE>, <html>, <head> nem <body> (o Artifact põe o esqueleto).

Uso:
  python3 artefacto.py pasta-do-site pasta-de-saida [--exemplos]

--exemplos   mostra as notícias de exemplo do blog quando ainda não há artigos.

No fim imprime a lista de ficheiros para passar em `files` no Artifact.
Os mapas do Google não aparecem dentro de um Artifact (iframes bloqueados): o bloco
do mapa sai da cópia e fica o botão «Abrir no Google Maps».
"""
import json
import re
import shutil
import sys
from pathlib import Path


def relativo(s, prof):
    """Caminhos /… → relativos, para uma página a `prof` pastas da raiz."""
    sobe = '../' * prof
    s = re.sub(r'(href|src)="/(assets|img|blog/img)/', lambda m: f'{m.group(1)}="{sobe}{m.group(2)}/', s)
    s = re.sub(r'href="/blog/([a-z0-9-]+)"', lambda m: f'href="{sobe}blog/{m.group(1)}.html"', s)
    s = s.replace('href="/blog"', f'href="{sobe}blog/index.html"')
    s = re.sub(r'href="/([a-z0-9-]+(?:/[a-z0-9-]+)*)"', lambda m: f'href="{sobe}{m.group(1)}.html"', s)
    s = s.replace('href="/#', f'href="{sobe}index.html#').replace('href="/"', f'href="{sobe}index.html"')
    s = re.sub(r'(site\.(css|js))\?v=\d+', r'\1', s)
    s = re.sub(r'<link rel="(icon|apple-touch-icon)"[^>]*>\n?', '', s)
    s = re.sub(r'<div class="mapa">.*?</div>\n?', '', s, flags=re.S)
    s = s.replace('data-fonte="blog/noticias.json"', f'data-fonte="{sobe}blog/noticias.json"')
    return s


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    site, saida = Path(sys.argv[1]), Path(sys.argv[2])
    exemplos = '--exemplos' in sys.argv
    if saida.exists():
        shutil.rmtree(saida)
    ficheiros = []
    for f in site.rglob('*'):
        if not f.is_file() or any(p.startswith('.') for p in f.relative_to(site).parts):
            continue
        rel = f.relative_to(site)
        if rel.parts[0] in ('blog',) and len(rel.parts) > 1 and rel.parts[1] == 'artigos' or rel.suffix in ('.md', '.py'):
            continue
        destino = saida / rel
        destino.parent.mkdir(parents=True, exist_ok=True)
        if f.suffix == '.html':
            s = relativo(f.read_text(encoding='utf-8'), len(rel.parts) - 1)
            if rel == Path('index.html'):
                s = re.sub(r'<!DOCTYPE html>\s*<html[^>]*>\s*<head>\s*', '', s)
                s = re.sub(r'<meta charset="[^"]*">\n?|<meta name="viewport"[^>]*>\n?', '', s)
                s = s.replace('</head>\n<body>\n', '').replace('</body>\n</html>', '')
                s = re.sub(r'<!--.*?-->\n?', '', s, count=1, flags=re.S) if s.startswith('<!--') else s
                if exemplos:
                    s = s.replace('data-fonte="blog/noticias.json"', 'data-fonte="blog/exemplos.json"')
            destino.write_text(s, encoding='utf-8')
        elif f.suffix == '.css':
            destino.write_text(re.sub(r'url\(/assets/', 'url(', f.read_text(encoding='utf-8')), encoding='utf-8')
        elif f.name in ('noticias.json', 'exemplos.json'):
            n = json.loads(f.read_text(encoding='utf-8'))
            for x in n:
                x['link'] = re.sub(r'^/blog/(.+)$', r'blog/\1.html', x.get('link', ''))
                if x.get('imagem'):
                    x['imagem'] = x['imagem'].lstrip('/')
            destino.write_text(json.dumps(n, ensure_ascii=False), encoding='utf-8')
        else:
            shutil.copy(f, destino)
        if rel != Path('index.html'):
            ficheiros.append(str(rel))
    print(f'Cópia pronta em {saida}')
    print('Publicar com o Artifact: file_path =', saida / 'index.html', ', root =', saida)
    print('files =', json.dumps(sorted(ficheiros), ensure_ascii=False))


if __name__ == '__main__':
    main()
