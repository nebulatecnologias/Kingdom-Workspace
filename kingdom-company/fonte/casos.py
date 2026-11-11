#!/usr/bin/env python3
"""Casos de clientes da Kingdom Company.

Lê fonte/casos.json e as imagens de cada caso em fonte/casos/<slug>/ e gera:
  - img/casos/<slug>/*.webp (imagens convertidas e comprimidas: 1600 e 800 px de largura);
  - /cases/<slug> (uma página por caso, com galeria em carrossel);
  - /cases (todos os casos) e o link «Cases» do menu a apontar para lá.
O banner de cada página de serviço (fonte/servicos.py) usa banner().
Só entram casos com "autorizado": true. Sem casos, nada é publicado e o menu leva aos clientes na página inicial.

Uso (na pasta kingdom-company), antes de servicos.py:
    python3 fonte/casos.py
"""
import html
import json
import re
import shutil
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
FONTE = SITE / 'fonte' / 'casos'
E = html.escape
SETA = '<svg aria-hidden="true"><use href="#i-seta"/></svg>'
ANT = '<svg aria-hidden="true"><use href="#i-ant"/></svg>'


def carregar():
    f = SITE / 'fonte' / 'casos.json'
    if not f.exists():
        return []
    casos = json.loads(f.read_text(encoding='utf-8')).get('casos', [])
    return [c for c in casos if c.get('autorizado')]


CASOS = carregar()


def por_servico(area, slug):
    return next((c for c in CASOS if c['servico'] == [area, slug]), None)


# ---------- cores ----------

def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def luz(h):
    def canal(v):
        v /= 255
        return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    r, g, b = (canal(v) for v in rgb(h))
    return .2126 * r + .7152 * g + .0722 * b


def mistura(h, outra, peso):
    a, b = rgb(h), rgb(outra)
    return '#' + ''.join(f'{round(x * (1 - peso) + y * peso):02X}' for x, y in zip(a, b))


def claro(c):
    """Cor principal clara: o texto passa a escuro para manter a cor original da marca."""
    return 1.05 / (luz(c['cores'][0]) + .05) < 4.5


def estilo(c):
    c1 = c['cores'][0]
    c2 = c['cores'][1] if len(c['cores']) > 1 else c1
    return f'--c1:{c1};--c2:{c2};--ct:{"#1C1A30" if claro(c) else "#FFFFFF"}'


def classe(c):
    return ' claro' if claro(c) else ''


def nome(c):
    return c['cliente'] if c.get('mostrar_nome', True) else c['descricao_anonima']


# ---------- imagens ----------

def webp(origem, destino, largura):
    from PIL import Image, ImageOps
    if destino.exists() and destino.stat().st_mtime >= origem.stat().st_mtime:
        with Image.open(destino) as im:
            return im.size
    with Image.open(origem) as im:
        im = ImageOps.exif_transpose(im).convert('RGB')
        if im.width > largura:
            im = im.resize((largura, round(im.height * largura / im.width)), Image.LANCZOS)
        destino.parent.mkdir(parents=True, exist_ok=True)
        im.save(destino, 'WEBP', quality=78, method=6)
        return im.size


def imagens(c):
    saida = SITE / 'img' / 'casos' / c['slug']
    res = []
    for ficheiro, legenda in c['imagens']:
        origem = FONTE / c['slug'] / ficheiro
        base = re.sub(r'[^a-z0-9-]+', '-', Path(ficheiro).stem.lower()).strip('-')
        g = webp(origem, saida / f'{base}-1600.webp', 1600)
        webp(origem, saida / f'{base}-800.webp', 800)
        res.append({'src': f'/img/casos/{c["slug"]}/{base}-1600.webp', 'p': f'/img/casos/{c["slug"]}/{base}-800.webp',
                    'w': g[0], 'h': g[1], 'legenda': legenda})
    return res


def logotipo(c):
    origem = FONTE / c['slug'] / c['logo']
    destino = SITE / 'img' / 'casos' / c['slug'] / ('logo' + origem.suffix.lower())
    destino.parent.mkdir(parents=True, exist_ok=True)
    if origem.suffix.lower() == '.svg':
        shutil.copyfile(origem, destino)
    else:
        from PIL import Image
        with Image.open(origem) as im:
            im = im.convert('RGBA')
            if im.width > 640:
                im = im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)
            destino = destino.with_suffix('.png')
            im.save(destino, optimize=True)
    return '/' + destino.relative_to(SITE).as_posix()


# ---------- banner (páginas de serviço e /cases) ----------

def banner(c, contexto=True):
    res = c['resultados'][0] if c.get('resultados') else None
    r = f'<span class="caso-banner-res"><b>{E(res[0])}</b> {E(res[1])}</span>' if res else ''
    return f'''<a class="caso-banner{classe(c)}" href="/cases/{c["slug"]}" style="{estilo(c)}">
      <span class="caso-banner-logo"><img src="{c["_logo"]}" alt="{E(nome(c))}" loading="lazy" decoding="async"></span>
      <span class="caso-banner-texto">
        <span class="caso-banner-meta">{'Caso · ' if contexto else ''}{E(c["setor"])} · {E(c["cidade"])}</span>
        <span class="caso-banner-titulo">{E(c["titulo"])}</span>
        {r}
      </span>
      <span class="caso-banner-ver">Ver o caso {SETA}</span>
    </a>'''


def seccao_servico(area, slug):
    """Secção da página de serviço: o banner do caso, ou o lugar reservado (só na pré-visualização)."""
    c = por_servico(area, slug)
    if c:
        if '_logo' not in c:
            c['_logo'] = f'/img/casos/{c["slug"]}/' + ('logo.svg' if c['logo'].lower().endswith('.svg') else 'logo.png')
        return f'''<section class="seccao serv-caso" aria-labelledby="t-caso">
  <div class="moldura">
    <p class="contexto" id="t-caso">Um caso real deste serviço</p>
    {banner(c, contexto=False)}
  </div>
</section>'''
    return '''<section class="seccao serv-caso so-previa" aria-labelledby="t-caso">
  <div class="moldura">
    <p class="contexto" id="t-caso">Um caso real deste serviço</p>
    <div class="caso-banner caso-banner-vazio"><span class="caso-banner-texto"><span class="caso-banner-meta">Caso por receber</span><span class="caso-banner-titulo">O banner do caso aparece aqui, com as cores e o logótipo do cliente</span><span class="caso-banner-res">Preencha a ficha no documento «Casos por serviço»</span></span></div>
  </div>
</section>'''


# ---------- página de cada caso ----------

def galeria(imgs):
    n = len(imgs)
    itens = ''.join(f'''<li class="galeria-item{' ativa' if k == 0 else ''}"><button type="button" aria-label="Imagem {k + 1} de {n}: {E(i["legenda"])}" aria-current="{'true' if k == 0 else 'false'}" data-legenda="{E(i["legenda"])}"><img src="{i["p"]}" {'srcset' if k == 0 else 'data-srcset'}="{i["p"]} 800w, {i["src"]} 1600w" sizes="(max-width: 860px) 100vw, 1100px" width="{i["w"]}" height="{i["h"]}" alt="{E(i["legenda"])}" loading="lazy" decoding="async"></button></li>''' for k, i in enumerate(imgs))
    return f'''<section class="seccao marfim caso-galeria" aria-labelledby="t-galeria">
  <div class="moldura">
    <div class="noticias-cabeca">
      <h2 id="t-galeria">O projeto em imagens</h2>
      <div class="setas">
        <button type="button" data-g-ant aria-label="Imagem anterior">{ANT}</button>
        <button type="button" data-g-seg aria-label="Imagem seguinte">{SETA}</button>
      </div>
    </div>
    <div class="galeria" data-galeria aria-roledescription="carrossel" aria-label="Imagens do projeto">
      <ul class="galeria-faixa">{itens}</ul>
      <p class="galeria-legenda" aria-live="polite"><span data-g-n>01 / {n:02d}</span> <span data-g-texto>{E(imgs[0]["legenda"])}</span></p>
    </div>
  </div>
</section>'''


def pagina_caso(c, servicos, outros):
    s = servicos[tuple(c['servico'])]
    imgs = c['_imagens']
    res = ''.join(f'<li><b>{E(n)}</b><span>{E(t)}</span></li>' for n, t in c.get('resultados', []))
    fizemos = ''.join(f'<li>{E(x)}</li>' for x in c['fizemos'])
    frase = f'''<section class="seccao caso-frase" aria-label="O que diz o cliente">
  <div class="moldura">
    <figure><blockquote><p>«{E(c["frase"])}»</p></blockquote><figcaption>{E(c["autor"])}</figcaption></figure>
  </div>
</section>''' if c.get('frase') else ''
    mais = ''.join(f'<li>{banner(o)}</li>' for o in outros[:2])
    mais = f'''<div>
      <p class="contexto">Outros casos</p>
      <ul class="caso-outros">{mais}</ul>
    </div>''' if mais else ''
    return f'''<main id="conteudo" class="pag-servico pag-caso">

<section class="abertura abertura-curta caso-abertura{classe(c)}" style="{estilo(c)}" aria-labelledby="t-caso-titulo">
  <div class="moldura abertura-in">
    <div class="abertura-texto">
      <nav class="migalhas" aria-label="Caminho"><a href="/cases">Cases</a><span aria-hidden="true">/</span><a href="/{s["area_slug"]}/{s["slug"]}">{E(s["nome"])}</a></nav>
      <span class="caso-abertura-logo"><img src="{c["_logo"]}" alt="{E(nome(c))}"></span>
      <h1 id="t-caso-titulo">{E(c["titulo"])}</h1>
      <p class="abertura-desc">{E(c["resumo"])}</p>
      <dl class="caso-ficha">
        <div><dt>Cliente</dt><dd>{E(nome(c))}</dd></div>
        <div><dt>Setor</dt><dd>{E(c["setor"])} · {E(c["cidade"])}</dd></div>
        <div><dt>Serviço</dt><dd><a href="/{s["area_slug"]}/{s["slug"]}">{E(s["nome"])}</a></dd></div>
        <div><dt>Duração</dt><dd>{E(c["duracao"])}</dd></div>
      </dl>
    </div>
  </div>
</section>

{f'<section class="caso-resultados" aria-label="Resultados"><div class="moldura"><ul>{res}</ul></div></section>' if res else ''}

{galeria(imgs)}

<section class="seccao" aria-labelledby="t-desafio">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O desafio</p>
      <h2 id="t-desafio">O ponto de partida</h2>
      <p class="entrada">{E(c["desafio"])}</p>
    </div>
    <div>
      <p class="contexto">O que fizemos</p>
      <ul class="serv-entregaveis">{fizemos}</ul>
    </div>
  </div>
</section>

{frase}

<section class="seccao marfim serv-fecho" aria-labelledby="t-fecho">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O seu caso pode ser o próximo</p>
      <h2 id="t-fecho">Quer um resultado assim?</h2>
      <p class="entrada">{E(s["pitch"].partition(". ")[0])}.</p>
      <p class="serv-fecho-passo">Peça hoje a cotação ou a avaliação inicial e saiba por onde começar.</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao?servico={s["slug"]}">Pedir cotação {SETA}</a>
        <a class="ligacao" href="/{s["area_slug"]}/{s["slug"]}">Ver o serviço {SETA}</a>
      </div>
    </div>
    {mais}
  </div>
</section>

</main>'''


def pagina_todos(casos, areas):
    usadas = [a for a in areas if any(c['servico'][0] == a['slug'] for c in casos)]
    filtros = '<button type="button" data-filtro="" aria-pressed="true">Todos</button>' + ''.join(
        f'<button type="button" data-filtro="{a["slug"]}" aria-pressed="false">{E(a["nome"])}</button>' for a in usadas)
    itens = ''.join(f'<li class="caso-item" data-categoria="{c["servico"][0]}">{banner(c)}</li>' for c in casos)
    return f'''<main id="conteudo" class="pag-servico pag-cases">

<section class="abertura abertura-curta" aria-labelledby="t-cases">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      <h1 id="t-cases">Cases</h1>
      <p class="abertura-desc">Projetos reais, com o desafio de cada cliente, o que fizemos e o resultado.</p>
    </div>
  </div>
</section>

<section class="seccao" aria-label="Lista de casos">
  <div class="moldura">
    {f'<div class="blog-filtros" role="group" aria-label="Filtrar por área">{filtros}</div>' if len(usadas) > 1 else ''}
    <ul class="cases-lista" data-posts>{itens}</ul>
  </div>
</section>

</main>'''


def menu(tem):
    alvo = '/cases' if tem else None
    for f in [SITE / 'index.html', SITE / 'contactos.html'] + sorted((SITE / 'blog').glob('*.html')):
        t = f.read_text(encoding='utf-8')
        casa = '#clientes' if f.name == 'index.html' and f.parent == SITE else '/#clientes'
        novo = re.sub(r'(<a class="nav-botao" href=")[^"]*(">Cases</a>)', lambda m: m.group(1) + (alvo or casa) + m.group(2), t)
        if novo != t:
            f.write_text(novo, encoding='utf-8')


def main():
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    menu(bool(CASOS))
    from servicos import AREAS, DADOS, escreve, partes_base  # noqa: E402
    servicos = {(s['area_slug'], s['slug']): s for s in DADOS}
    pasta = SITE / 'cases'
    if pasta.exists():
        shutil.rmtree(pasta)
    if not CASOS:
        (SITE / 'cases.html').unlink(missing_ok=True)
        print('0 casos autorizados: /cases não é publicado')
        return
    antes, depois = partes_base()
    for c in CASOS:
        c['_imagens'] = imagens(c)
        c['_logo'] = logotipo(c)
    for c in CASOS:
        outros = [o for o in CASOS if o is not c]
        s = servicos[tuple(c['servico'])]
        escreve(antes, depois, f'/cases/{c["slug"]}', f'{c["titulo"]} · Caso {s["nome"]} · Kingdom Company', c['resumo'],
                None, pagina_caso(c, servicos, outros), pasta / f'{c["slug"]}.html')
    escreve(antes, depois, '/cases', 'Cases: Projetos de Clientes · Kingdom Company',
            'Casos reais da Kingdom Company em Moçambique: o desafio de cada cliente, o que fizemos e os resultados, em identidade visual, marketing e tecnologia.',
            None, pagina_todos(CASOS, AREAS), SITE / 'cases.html')
    print(f'{len(CASOS)} casos publicados em /cases')


if __name__ == '__main__':
    main()
