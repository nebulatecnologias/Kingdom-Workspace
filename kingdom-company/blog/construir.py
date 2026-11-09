#!/usr/bin/env python3
"""Constrói o blog da Kingdom Company a partir de blog/artigos/*.md.

Gera blog/<slug>.html (um por artigo), blog/index.html (lista) e blog/noticias.json
(lido pela secção «Últimas atualizações» da página inicial).

Uso, a partir da pasta kingdom-company:  python3 blog/construir.py
Precisa do pacote «markdown» (pip install markdown).
"""
import html
import json
import re
from pathlib import Path

import markdown

RAIZ = Path(__file__).resolve().parent.parent
BLOG = RAIZ / 'blog'
MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
CAPAS = {'Negócios': 'capa-negocios', 'Tecnologia': 'capa-tecnologia', 'Inteligência artificial': 'capa-ia'}
SETA = '<svg aria-hidden="true"><use href="#i-seta"/></svg>'


def ler_artigo(caminho):
    texto = caminho.read_text(encoding='utf-8')
    m = re.match(r'---\n(.*?)\n---\n(.*)', texto, re.S)
    if not m:
        raise SystemExit(f'{caminho.name}: falta o cabeçalho entre linhas ---')
    meta = {}
    for linha in m.group(1).splitlines():
        if ':' in linha:
            k, v = linha.split(':', 1)
            meta[k.strip()] = v.strip()
    for campo in ('titulo', 'resumo', 'categoria', 'data'):
        if not meta.get(campo):
            raise SystemExit(f'{caminho.name}: falta o campo «{campo}»')
    meta['slug'] = caminho.stem
    meta['corpo_md'] = m.group(2).strip()
    meta['minutos'] = max(1, round(len(meta['corpo_md'].split()) / 200))
    return meta


def data_pt(d):
    a, m, dia = d.split('-')
    return f'{int(dia)} de {MESES[int(m) - 1]} de {a}'


def corpo_html(md):
    h = markdown.markdown(md, extensions=['tables', 'sane_lists'])
    h = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', h)
    h = h.replace('<table>', '<div class="artigo-tabela"><table>').replace('</table>', '</table></div>')
    return h


def molde():
    """Topo e rodapé da página inicial, com as âncoras a apontar para a inicial."""
    s = (RAIZ / 'index.html').read_text(encoding='utf-8')
    topo, rodape = s[:s.index('<main id="conteudo">')], s[s.index('</main>') + len('</main>'):]
    fix = lambda t: re.sub(r'(<a\b[^>]*?\shref=")#(?!conteudo)', r'\1/#', t)
    return fix(topo), fix(rodape)


def pagina(topo, rodape, titulo, descricao, main):
    t = re.sub(r'<title>[^<]*</title>', f'<title>{html.escape(titulo)}</title>', topo, count=1)
    t = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{html.escape(descricao)}">', t, count=1)
    return t + main + rodape


def cartao(a):
    capa = a.get('imagem')
    fundo = f'<img src="{html.escape(capa)}" alt="" loading="lazy">' if capa else ''
    cls = 'capa-foto' if capa else CAPAS.get(a['categoria'], 'capa-negocios')
    meta = ' · '.join(x for x in (a['categoria'], a.get('ambito'), data_pt(a['data'])) if x)
    return f'''      <li class="post" data-categoria="{html.escape(a['categoria'])}">
        <a href="/blog/{a['slug']}">
          <span class="post-capa {cls}" aria-hidden="true">{fundo}<span class="capa-etiqueta">{html.escape(a['categoria'])}</span></span>
          <span class="post-meta">{html.escape(meta)} · {a['minutos']} min</span>
          <span class="post-titulo">{html.escape(a['titulo'])}</span>
          <span class="post-resumo">{html.escape(a['resumo'])}</span>
          <span class="post-ler">Ler o artigo {SETA}</span>
        </a>
      </li>
'''


def abertura(h1a, h1b, desc, extra=''):
    return f'''<section class="abertura abertura-curta" aria-labelledby="t-pagina">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      {extra}<h1 id="t-pagina"><span class="h1-a">{h1a}</span>{(' <span class="h1-b">' + h1b + '</span>') if h1b else ''}</h1>
      <p class="abertura-desc">{desc}</p>
    </div>
  </div>
</section>
'''


def main():
    artigos = sorted((ler_artigo(p) for p in (BLOG / 'artigos').glob('*.md')), key=lambda a: a['data'], reverse=True)
    topo, rodape = molde()

    for a in artigos:
        outros = [o for o in artigos if o['slug'] != a['slug']][:3]
        meta = ' · '.join(x for x in (a['categoria'], a.get('ambito'), data_pt(a['data']), f"{a['minutos']} min de leitura") if x)
        main_html = '<main id="conteudo">\n\n' + abertura(
            html.escape(a['titulo']), '', html.escape(a['resumo']),
            extra=f'<p class="artigo-meta"><a href="/blog">Blog</a> · {html.escape(meta)}</p>\n      ') + f'''
<section class="seccao" aria-label="Artigo">
  <div class="moldura">
    <article class="artigo">
{(f'<figure class="artigo-capa"><img src="{html.escape(a["imagem"])}" alt="" width="1200" height="630"></figure>' + chr(10)) if a.get('imagem') else ''}{corpo_html(a['corpo_md'])}
    </article>
    <aside class="artigo-cta" aria-labelledby="t-cta">
      <div>
        <h2 id="t-cta">Quer saber como isto se aplica à sua empresa?</h2>
        <p>Peça uma avaliação inicial. Um consultor analisa o seu desafio e indica o caminho certo, sem compromisso.</p>
      </div>
      <a class="botao botao-acao" href="/pedido-de-cotacao">Pedir avaliação inicial {SETA}</a>
    </aside>
  </div>
</section>
''' + (f'''
<section class="seccao marfim" aria-labelledby="t-mais">
  <div class="moldura">
    <div class="noticias-cabeca"><h2 id="t-mais">Continue a ler</h2><a class="noticias-blog" href="/blog">Ver o blog {SETA}</a></div>
    <ul class="posts">
{''.join(cartao(o) for o in outros)}    </ul>
  </div>
</section>
''' if outros else '') + '\n</main>'
        (BLOG / f"{a['slug']}.html").write_text(pagina(topo, rodape, f"{a['titulo']} · Kingdom Company", a['resumo'], main_html), encoding='utf-8')

    cats = [c for c in CAPAS if any(a['categoria'] == c for a in artigos)]
    filtros = ''.join(f'<button type="button" data-filtro="{c}" aria-pressed="false">{c}</button>' for c in cats)
    main_html = '<main id="conteudo">\n\n' + abertura(
        'Blog.', 'Últimas atualizações na área de negócios, tecnologia e inteligência artificial.',
        'Notícias nacionais e internacionais, explicadas para quem gere empresas: o que aconteceu, o que significa e o que pode fazer a seguir.') + f'''
<section class="seccao" aria-labelledby="t-artigos">
  <div class="moldura">
    <div class="blog-filtros" role="group" aria-label="Filtrar por categoria"><h2 id="t-artigos" class="visual-oculto">Artigos</h2><button type="button" data-filtro="" aria-pressed="true">Todos</button>{filtros}</div>
    <ul class="posts" data-posts>
{''.join(cartao(a) for a in artigos)}    </ul>
  </div>
</section>

</main>'''
    (BLOG / 'index.html').write_text(pagina(topo, rodape, 'Blog de Negócios, Marketing e IA · Kingdom Company', 'Artigos sobre negócios em Moçambique, marketing, tecnologia e inteligência artificial, escritos pela equipa da Kingdom Company.', main_html), encoding='utf-8')

    noticias = [{k: a[k] for k in ('titulo', 'resumo', 'categoria', 'ambito', 'data') if a.get(k)} | {'link': f"/blog/{a['slug']}"} | ({'imagem': a['imagem']} if a.get('imagem') else {}) for a in artigos]
    (BLOG / 'noticias.json').write_text(json.dumps(noticias, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{len(artigos)} artigos: ' + ', '.join(a['slug'] for a in artigos))


if __name__ == '__main__':
    main()
