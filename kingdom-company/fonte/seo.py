#!/usr/bin/env python3
"""SEO do site da Kingdom Company: corre depois de gerar as páginas.

Uso (na pasta kingdom-company):
    python3 fonte/servicos.py && python3 blog/construir.py && python3 fonte/seo.py

Em cada página .html acrescenta, num bloco entre <!-- seo --> e <!-- /seo --> (refeito a cada corrida):
  canonical, Open Graph e Twitter, cor do tema, verificações do Google e do Bing,
  dados estruturados (empresa, site, migalhas, perguntas frequentes, artigos)
  e, se houver ID em fonte/seo.json, o Google Analytics 4 com Consent Mode.
Gera também sitemap.xml, robots.txt e llms.txt (resumo do site para as IAs).
A configuração (ID do Analytics, códigos de verificação, redes sociais) está em fonte/seo.json.
"""
import html
import json
import re
import subprocess
from datetime import date
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
CFG = json.loads((SITE / 'fonte' / 'seo.json').read_text(encoding='utf-8'))
D = CFG['dominio'].rstrip('/')
SERVICOS = json.loads((SITE / 'fonte' / 'servicos.json').read_text(encoding='utf-8'))['servicos']
AREAS = json.loads((SITE / 'fonte' / 'areas.json').read_text(encoding='utf-8'))['areas']
FORA = {'fonte', 'assets', 'img', '.impeccable', 'node_modules'}
E = lambda s: html.escape(s, quote=True)
ORG = f'{D}/#organizacao'
SITE_ID = f'{D}/#site'


def paginas():
    for f in sorted(SITE.rglob('*.html')):
        rel = f.relative_to(SITE)
        if rel.parts[0] in FORA or (rel.parts[0] == 'blog' and len(rel.parts) > 2):
            continue
        yield f, rel


def url_de(rel):
    p = rel.as_posix()
    if p == 'index.html':
        return '/'
    if p.endswith('/index.html'):
        return '/' + p[:-len('/index.html')]
    return '/' + p[:-len('.html')]


def texto(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()


def organizacao():
    servs = {a['slug']: [s for s in SERVICOS if s['area_slug'] == a['slug']] for a in AREAS}
    org = {
        '@type': ['Organization', 'ProfessionalService'],
        '@id': ORG,
        'name': 'Kingdom Company',
        'url': f'{D}/',
        'logo': {'@type': 'ImageObject', 'url': f'{D}/assets/marca/kingdom-company-horizontal-simples-indigo.svg'},
        'image': f'{D}{CFG["imagem"]}',
        'description': 'Empresa moçambicana de desenvolvimento empresarial, membro da SDG (Pty) Ltd. Reúne numa só equipa '
                       'desenvolvimento editorial, consultoria estratégica, assessoria estratégica e desenvolvimento tecnológico.',
        'slogan': 'Um único lugar para desenvolver o seu negócio',
        'email': 'contact@kingdomcompany.co.za',
        'telephone': '+258876641836',
        'address': [
            {'@type': 'PostalAddress', 'streetAddress': 'Edifício Millenium Park, Av. Vladimir Lenine, n.º 174',
             'addressLocality': 'Maputo', 'postalCode': '1106', 'addressCountry': 'MZ'},
        ],
        'geo': {'@type': 'GeoCoordinates', 'latitude': -25.9719319, 'longitude': 32.5754637},
        'areaServed': [{'@type': 'Country', 'name': 'Moçambique'}],
        'contactPoint': [{'@type': 'ContactPoint', 'contactType': 'sales', 'email': 'contact@kingdomcompany.co.za',
                          'telephone': ['+258876641836', '+258851877115'], 'availableLanguage': ['pt', 'en'],
                          'areaServed': ['MZ'], 'url': f'{D}/pedido-de-cotacao'}],
        'parentOrganization': {'@type': 'Organization', 'name': 'SDG (Pty) Ltd'},
        'knowsAbout': [s['nome'] for s in SERVICOS],
        'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Serviços', 'itemListElement': [
            {'@type': 'OfferCatalog', 'name': a['nome'], 'url': f'{D}/{a["slug"]}', 'itemListElement': [
                {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': s['nome'], 'url': f'{D}/{s["area_slug"]}/{s["slug"]}'}}
                for s in servs[a['slug']]]} for a in AREAS]},
    }
    if CFG.get('redes'):
        org['sameAs'] = CFG['redes']
    return org


def site_web():
    return {'@type': 'WebSite', '@id': SITE_ID, 'url': f'{D}/', 'name': 'Kingdom Company', 'inLanguage': 'pt-PT', 'publisher': {'@id': ORG}}


def migalhas(itens):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i, 'name': n, 'item': f'{D}{u}'} for i, (n, u) in enumerate(itens, 1)]}


def perguntas(corpo):
    pares = re.findall(r'<summary>(.*?)<svg.*?</summary>\s*<div class="faq-resposta">(.*?)</div>', corpo, re.S)
    if not pares:
        return None
    return {'@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': texto(q), 'acceptedAnswer': {'@type': 'Answer', 'text': texto(r)}} for q, r in pares]}


def artigos():
    res = {}
    for md in (SITE / 'blog' / 'artigos').glob('*.md'):
        m = re.match(r'---\n(.*?)\n---', md.read_text(encoding='utf-8'), re.S)
        meta = dict(l.split(':', 1) for l in m.group(1).splitlines() if ':' in l)
        res[md.stem] = {k.strip(): v.strip() for k, v in meta.items()}
    return res


ARTIGOS = artigos()


def casos():
    f = SITE / 'fonte' / 'casos.json'
    if not f.exists():
        return {}
    return {c['slug']: c for c in json.loads(f.read_text(encoding='utf-8')).get('casos', []) if c.get('autorizado')}


CASOS = casos()
AREA_NOME = {a['slug']: a['nome'] for a in AREAS}
SERV_NOME = {(s['area_slug'], s['slug']): s['nome'] for s in SERVICOS}


def grafo(rel, url, titulo, desc, corpo):
    nos = []
    partes = url.strip('/').split('/') if url != '/' else []
    pagina = {'@type': 'WebPage', '@id': f'{D}{url}#pagina', 'url': f'{D}{url}', 'name': titulo, 'description': desc,
              'inLanguage': 'pt-PT', 'isPartOf': {'@id': SITE_ID}, 'publisher': {'@id': ORG}}
    if url == '/':
        nos += [organizacao(), site_web()]
        pagina['about'] = {'@id': ORG}
        faq = perguntas(corpo)
        if faq:
            nos.append(faq)
    elif url == '/contactos':
        nos.append(organizacao())
        pagina['@type'] = 'ContactPage'
    if partes and partes[0] in AREA_NOME:
        trilho = [('Início', '/'), (AREA_NOME[partes[0]], f'/{partes[0]}')]
        if len(partes) == 2:
            trilho.append((SERV_NOME[(partes[0], partes[1])], url))
        nos.append(migalhas(trilho))
    elif partes and partes[0] == 'blog':
        trilho = [('Início', '/'), ('Blog', '/blog')]
        if len(partes) == 2 and partes[1] in ARTIGOS:
            a = ARTIGOS[partes[1]]
            trilho.append((a['titulo'], url))
            img = a.get('imagem') or CFG['imagem']
            nos.append({'@type': 'BlogPosting', 'headline': a['titulo'], 'description': a['resumo'], 'datePublished': a['data'],
                        'dateModified': a['data'], 'image': f'{D}{img}', 'articleSection': a.get('categoria', ''),
                        'inLanguage': 'pt-PT', 'mainEntityOfPage': f'{D}{url}', 'author': {'@id': ORG}, 'publisher': {'@id': ORG}})
        nos.append(migalhas(trilho))
    elif partes and partes[0] == 'cases':
        trilho = [('Início', '/'), ('Cases', '/cases')]
        if len(partes) == 2 and partes[1] in CASOS:
            trilho.append((CASOS[partes[1]]['titulo'], url))
        nos.append(migalhas(trilho))
    elif partes and partes[0] == 'materiais-gratuitos' and len(partes) == 2:
        nos.append(migalhas([('Início', '/'), ('Materiais gratuitos', '/materiais-gratuitos'), (titulo.split(' · ')[0], url)]))
    elif partes:
        nos.append(migalhas([('Início', '/'), (titulo.split(' · ')[0], url)]))
    nos.insert(0, pagina)
    return {'@context': 'https://schema.org', '@graph': nos}


def analise():
    ga = CFG.get('ga4', '').strip()
    if not ga:
        return ''
    return f'''<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}
var kcConsent=null;try{{kcConsent=localStorage.getItem('kc-consentimento');}}catch(e){{}}
gtag('consent','default',{{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:kcConsent==='sim'?'granted':'denied',wait_for_update:500}});
gtag('js',new Date());gtag('config','{ga}');window.KC_GA='{ga}';</script>
<script async src="https://www.googletagmanager.com/gtag/js?id={ga}"></script>'''


def bloco(rel, url, titulo, desc, corpo):
    blog_slug = url.split('/')[-1] if url.startswith('/blog/') else None
    artigo = ARTIGOS.get(blog_slug) if blog_slug else None
    img = (artigo.get('imagem') if artigo else None) or CFG['imagem']
    caso = CASOS.get(url.split('/')[-1]) if url.startswith('/cases/') else None
    if caso and caso.get('imagens'):
        base = re.sub(r'[^a-z0-9-]+', '-', Path(caso['imagens'][0][0]).stem.lower()).strip('-')
        img = f'/img/casos/{caso["slug"]}/{base}-1600.webp'
    img_dims = '' if artigo or caso else '\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">'
    nao_indexar = rel.as_posix() == '404.html'
    linhas = [
        '<!-- seo -->',
        '' if nao_indexar else f'<link rel="canonical" href="{D}{url}">',
        '<meta name="robots" content="noindex">' if nao_indexar else '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">',
        '<meta name="theme-color" content="#2B2850">',
        f'<meta property="og:type" content="{"article" if artigo else "website"}">',
        '<meta property="og:site_name" content="Kingdom Company">',
        '<meta property="og:locale" content="pt_PT">',
        f'<meta property="og:title" content="{E(titulo)}">',
        f'<meta property="og:description" content="{E(desc)}">',
        f'<meta property="og:url" content="{D}{url}">',
        f'<meta property="og:image" content="{D}{img}">{img_dims}',
        f'<meta property="og:image:alt" content="{E(titulo)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{E(titulo)}">',
        f'<meta name="twitter:description" content="{E(desc)}">',
        f'<meta name="twitter:image" content="{D}{img}">',
    ]
    if artigo:
        linhas.append(f'<meta property="article:published_time" content="{artigo["data"]}">')
    if CFG.get('google_site_verification'):
        linhas.append(f'<meta name="google-site-verification" content="{E(CFG["google_site_verification"])}">')
    if CFG.get('bing_site_verification'):
        linhas.append(f'<meta name="msvalidate.01" content="{E(CFG["bing_site_verification"])}">')
    if not nao_indexar:
        ld = json.dumps(grafo(rel, url, titulo, desc, corpo), ensure_ascii=False).replace('</', '<\\/')
        linhas.append(f'<script type="application/ld+json">{ld}</script>')
    ga = analise()
    if ga:
        linhas.append(ga)
    linhas.append('<!-- /seo -->')
    return '\n'.join(l for l in linhas if l)


def ultima_mudanca(f):
    try:
        d = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', str(f)], cwd=SITE, capture_output=True, text=True).stdout.strip()
        return d or date.today().isoformat()
    except OSError:
        return date.today().isoformat()


def main():
    mapa = []
    for f, rel in paginas():
        t = f.read_text(encoding='utf-8')
        t = re.sub(r'\n?<!-- seo -->.*?<!-- /seo -->', '', t, flags=re.S)
        t = re.sub(r'\n?<link rel="canonical"[^>]*>', '', t)
        titulo = texto(re.search(r'<title>(.*?)</title>', t, re.S).group(1))
        m = re.search(r'<meta name="description" content="([^"]*)"', t)
        desc = html.unescape(m.group(1)) if m else ''
        url = url_de(rel)
        corpo = t.split('</head>', 1)[1]
        t = t.replace('</head>', bloco(rel, url, titulo, desc, corpo) + '\n</head>', 1)
        f.write_text(t, encoding='utf-8')
        if rel.as_posix() != '404.html':
            mapa.append((url, ultima_mudanca(f)))
    ordem = lambda u: (u[0] != '/', u[0].count('/'), u[0])
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    xml += [f'  <url><loc>{D}{u}</loc><lastmod>{d}</lastmod></url>' for u, d in sorted(mapa, key=ordem)]
    xml.append('</urlset>')
    (SITE / 'sitemap.xml').write_text('\n'.join(xml) + '\n', encoding='utf-8')
    robots = f'''# Kingdom Company · www.kingdomcompany.co.za
# Todo o site pode ser lido por motores de busca e por assistentes de IA.
User-agent: *
Allow: /

# Assistentes e motores de IA (permitidos de forma explícita)
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bingbot
Allow: /

Sitemap: {D}/sitemap.xml
'''
    (SITE / 'robots.txt').write_text(robots, encoding='utf-8')
    (SITE / 'llms.txt').write_text(llms(), encoding='utf-8')
    print(f'{len(mapa)} páginas no sitemap · GA4: {CFG.get("ga4") or "por ligar"} · meta do Search Console: {"sim" if CFG.get("google_site_verification") else "não (verificado por DNS)"}')


def llms():
    l = ['# Kingdom Company', '',
         '> Empresa moçambicana de desenvolvimento empresarial, com sede em Maputo, membro da SDG (Pty) Ltd. '
         'Reúne numa só equipa desenvolvimento editorial, consultoria estratégica, assessoria estratégica e desenvolvimento tecnológico, '
         'para ajudar empresas a crescer, organizar-se, posicionar-se e competir.', '',
         'Factos principais:',
         '- Serve empresas em Moçambique: PME, grandes empresas, startups, instituições, associações e empreendedores.',
         '- 12 serviços em 4 áreas, com o mesmo método em seis fases: diagnóstico, proposição de soluções, implementação, avaliação de resultados, treinamento e acompanhamento.',
         '- Mais de 50 negócios atendidos, 6 anos de mercado e 5 certificações internacionais em marketing, inteligência artificial e vendas.',
         '- Cada proposta é feita à medida: o site não publica preços. Os projetos pagam-se por marcos.',
         f'- Pedido de cotação ou avaliação inicial: {D}/pedido-de-cotacao',
         '- Contactos: contact@kingdomcompany.co.za · +258 87 664 1836 · +258 85 1877 115',
         '- Morada: Edifício Millenium Park, Av. Vladimir Lenine, n.º 174, Maputo 1106, Moçambique',
         '- Língua do site: português europeu.', '']
    for a in AREAS:
        l += [f'## {a["nome"]}', '', f'[{a["nome"]}]({D}/{a["slug"]}): {a["pitch"]}', '']
        for s in (s for s in SERVICOS if s['area_slug'] == a['slug']):
            l.append(f'- [{s["nome"]}]({D}/{s["area_slug"]}/{s["slug"]}): {s["oque"]}')
        l.append('')
    l += ['## Empresa', '', f'- [Página inicial]({D}/): quem somos, áreas, método, perguntas frequentes',
          f'- [Contactos]({D}/contactos): moradas, telefones, email e mapa',
          f'- [Pedido de cotação]({D}/pedido-de-cotacao): formulário para pedir cotação ou avaliação inicial',
          f'- [Parceiros]({D}/parceiros): o grupo SDG (Pty) Ltd, o Kingdom Training, a Kingdom Academy e como ser parceiro', '',
          '## Recursos gratuitos', '',
          f'- [Ferramentas gratuitas]({D}/ferramentas-gratuitas): diagnóstico do negócio, calculadora do ponto de equilíbrio e calculadora do retorno de campanhas, em meticais']
    for m in json.loads((SITE / 'fonte' / 'materiais.json').read_text(encoding='utf-8'))['materiais']:
        l.append(f'- [{m["titulo"]}]({D}/materiais-gratuitos/{m["slug"]}): {m["resumo"]}')
    l += ['',
          '## Blog', '']
    for slug, a in sorted(ARTIGOS.items(), key=lambda x: x[1]['data'], reverse=True):
        l.append(f'- [{a["titulo"]}]({D}/blog/{slug}): {a["resumo"]}')
    if CASOS:
        l += ['', '## Casos de clientes', '']
        l += [f'- [{c["titulo"]}]({D}/cases/{c["slug"]}): {c["resumo"]}' for c in CASOS.values()]
    l += ['', '## Opcional', '', f'- [Política de privacidade]({D}/privacidade)', f'- [Termos de utilização]({D}/termos)', '']
    return '\n'.join(l)


if __name__ == '__main__':
    main()
