#!/usr/bin/env python3
"""Cria a pasta de um site corporativo a partir do modelo da skill.

Uso:
  python3 novo_site.py site.json --saida pasta-do-site [--marca marca.json]

site.json traz os dados do site (ver references/site-json.md). marca.json é o ficheiro
da skill identidade-visual: quando é dado, o nome, o slogan, as cores, a letra, o
símbolo e os contactos vêm dele, e o site.json só precisa do que é específico do site.

O script copia o modelo, troca os {{marcadores}}, recalcula a paleta do CSS para as
cores da marca, gera o globo de luz e o padrão a partir do símbolo, retira as secções
desligadas e no fim lista o que ficou por fazer (secções a reescrever, ligações sem destino).
"""
import argparse
import datetime
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

AQUI = Path(__file__).resolve().parent
MODELO = AQUI.parent / 'assets' / 'modelo'

# Paleta com que o modelo foi desenhado (site da Kingdom Company)
BASE_MODELO = {
    'principal': '#2B2850', 'fundo': '#FAF9F5', 'acento': '#FF521A', 'acento_texto': '#D63E12',
    'texto': '#1C1A30', 'texto_secundario': '#6A6682', 'linha': '#E8E4DC',
    'noite': '#0E0C1F', 'luz': '#6F67D6', 'lavanda': '#B9B3F2', 'branco': '#FFFFFF', 'preto': '#000000',
}

TERMOS_MODELO = ['Kingdom', 'SDG', 'Midrand', 'Maputo', 'Rock Content', 'Anthropic', 'Semrush', 'Wix', 'Google Skillshop', 'Moçambique e na África do Sul']
SECCOES = {  # chave em site.json → comentário que abre a secção no modelo
    'numeros': 'Em números', 'quem': 'Quem somos', 'servicos': 'O que fazemos',
    'plano': 'Do seu maior desafio empresarial à autonomia', 'porque': 'Porque trabalhar connosco',
    'clientes': 'Quem confia em nós', 'contratar': 'Como nos contratar', 'blog': 'Notícias e newsletter',
    'frentes': 'As nossas frentes', 'faq': 'Perguntas frequentes',
}


def erro(msg):
    sys.exit(f'Erro: {msg}')


# ---------- cores ----------
def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hexa(c):
    return '#' + ''.join(f'{max(0, min(255, round(v))):02X}' for v in c)


def mistura(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def luminancia(c):
    c = [v / 255 for v in c]
    c = [v / 12.92 if v <= 0.03928 else ((v + .055) / 1.055) ** 2.4 for v in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]


def contraste(a, b):
    la, lb = sorted((luminancia(a), luminancia(b)), reverse=True)
    return (la + .05) / (lb + .05)


def receita(cor, base):
    """Escreve uma cor do modelo como mistura de duas cores-base (a, b, t)."""
    alvo, melhor = rgb(cor), None
    nomes = list(base)
    for i, a in enumerate(nomes):
        for b in nomes[i:]:
            A, B = rgb(base[a]), rgb(base[b])
            d = [B[k] - A[k] for k in range(3)]
            dd = sum(x * x for x in d)
            t = 0 if dd == 0 else max(0, min(1, sum((alvo[k] - A[k]) * d[k] for k in range(3)) / dd))
            e = sum((alvo[k] - mistura(A, B, t)[k]) ** 2 for k in range(3))
            if melhor is None or e < melhor[0]:
                melhor = (e, a, b, t)
    return melhor[1:]


def recolorir(texto, nova):
    """Troca todas as cores (#hex e rgba(r, g, b, …)) do modelo pelas equivalentes na paleta nova."""
    cache = {}

    def nova_cor(h):
        h = h.upper()
        if h not in cache:
            a, b, t = receita(h, BASE_MODELO)
            cache[h] = mistura(rgb(nova[a]), rgb(nova[b]), t)
        return cache[h]

    texto = re.sub(r'#[0-9A-Fa-f]{6}\b', lambda m: hexa(nova_cor(m.group(0))), texto)
    texto = re.sub(r'rgba\((\d+), (\d+), (\d+),',
                   lambda m: 'rgba({}, {}, {},'.format(*(round(v) for v in nova_cor(hexa((int(m.group(1)), int(m.group(2)), int(m.group(3))))))), texto)
    return texto


# ---------- SVG ----------
def ler_svg(caminho):
    s = Path(caminho).read_text(encoding='utf-8')
    vb = re.search(r'viewBox="([^"]+)"', s)
    if not vb:
        erro(f'{caminho}: o SVG precisa de viewBox')
    interior = s[s.index('>', s.index('<svg')) + 1:s.rindex('</svg>')]
    interior = re.sub(r'<\?xml[^>]*>|<!--.*?-->', '', interior, flags=re.S).strip()
    return vb.group(1), interior


def sem_cor(interior):
    """Tira os fill de cor para o desenho herdar currentColor (mantém fill=\"none\" e url())."""
    return re.sub(r'\sfill="(?!none|url)[^"]*"', '', interior)


def caminhos(interior):
    return re.findall(r'<path[^>]*\sd="([^"]+)"', interior)


def globo(vb, ds, paragens, nome):
    st = ''.join(f'<stop offset="{o}" stop-color="{c}"{f" stop-opacity={chr(34)}{op}{chr(34)}" if op < 1 else ""}/>' for o, c, op in paragens)
    p = ''.join(f'<path fill="url(#{nome})" fill-rule="evenodd" d="{d}"/>' for d in ds)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><defs><linearGradient id="{nome}" x1=".1" y1="0" x2=".85" y2="1">{st}</linearGradient></defs>{p}</svg>'


def padrao(vb, ds, cor):
    x, y, w, h = (float(v) for v in vb.split())
    esc = 28 / max(w, h)
    p = ''.join(f'<path fill="{cor}" fill-rule="evenodd" d="{d}"/>' for d in ds)
    t = f'translate({66 - w * esc / 2 - x * esc:.2f} {66 - h * esc / 2 - y * esc:.2f}) scale({esc:.4f})'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 132 132"><g opacity=".5" transform="{t}">{p}</g></svg>'


# ---------- dados ----------
def juntar(site, marca, pasta_marca):
    d = dict(site)
    if marca:
        d.setdefault('nome', marca.get('nome'))
        d.setdefault('slogan', marca.get('slogan'))
        d.setdefault('fonte', (marca.get('fontes') or {}).get('familia'))
        cores = {k: v['hex'] for k, v in (marca.get('cores') or {}).items() if isinstance(v, dict) and 'hex' in v}
        cores.update(marca.get('gradiente_tons') or {})
        d['cores'] = {**cores, **(site.get('cores') or {})}
        if marca.get('simbolo') and not site.get('simbolo'):
            d['simbolo'] = str(pasta_marca / marca['simbolo'])
        if not site.get('logotipo'):
            saida = pasta_marca / marca.get('saida', 'marca') / 'logotipo'
            cands = [p for p in sorted(saida.glob('*horizontal-simples-*.svg')) if not re.search(r'-(branco|preto)\.svg$', p.name)]
            if cands:
                d['logotipo'] = str(cands[0])
        c = marca.get('contactos') or {}
        if c and not site.get('contactos'):
            d['contactos'] = {'email': c.get('email', ''), 'telefones': c.get('telefones', []),
                              'moradas': [{'cidade': (c.get('cidade') or '').split(',')[0], 'pais': (c.get('cidade') or ', ').split(',')[-1].strip(),
                                           'linhas': c.get('morada', [])}]}
    for campo in ('nome', 'slogan', 'logotipo', 'simbolo', 'contactos'):
        if not d.get(campo):
            erro(f'falta «{campo}» no site.json (ou no marca.json)')
    falta = [k for k in ('principal', 'fundo', 'acento', 'acento_texto', 'texto', 'texto_secundario', 'linha') if k not in d.get('cores', {})]
    if falta:
        erro('faltam cores: ' + ', '.join(falta))
    return d


def completar_cores(c):
    c = {k: v.upper() for k, v in c.items()}
    P = rgb(c['principal'])
    c.setdefault('noite', hexa(mistura(P, (0, 0, 0), .62)))
    c.setdefault('luz', hexa(mistura(P, (255, 255, 255), .35)))
    c.setdefault('lavanda', hexa(mistura(P, (255, 255, 255), .68)))
    c['branco'], c['preto'] = '#FFFFFF', '#000000'
    return c


def tel(n):
    return 'tel:' + re.sub(r'[^\d+]', '', n)


def esc(s):
    return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


NUMEROS = ['zero', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze',
           'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove', 'vinte']
ICONES = ['documento', 'alvo', 'camara', 'codigo', 'grafico', 'equipa', 'funil', 'instituicao', 'foguete', 'loja']


def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')


def por_extenso(n, masc=False):
    if n >= len(NUMEROS):
        return str(n)
    p = NUMEROS[n]
    return {'uma': 'um', 'duas': 'dois'}.get(p, p) if masc else p


def servicos(lista):
    """Áreas e serviços → menu, faixa da abertura, secção «O que fazemos» e rodapé."""
    if not lista:
        erro('falta «servicos» no site.json (áreas com os seus serviços; ver references/site-json.md)')
    areas = []
    for i, a in enumerate(lista):
        sa = a.get('slug') or slug(a['area'])
        itens = [{**x, 'url': x.get('url') or f'/{sa}/{x.get("slug") or slug(x["nome"])}'} for x in a.get('servicos', [])]
        areas.append({**a, 'id': 'area-' + (a.get('id') or sa), 'url': a.get('url') or f'/{sa}', 'icone': a.get('icone') or ICONES[i % len(ICONES)], 'itens': itens})
    cols = f'cols-{min(len(areas), 4)}'
    seta = '<svg class="seta" aria-hidden="true"><use href="#i-seta"/></svg>'
    def painel(pre):
        return f'<div class="painel-cols {cols}">' + ''.join(
            f'<div class="pcol"><a class="pcol-t" href="{pre}#{a["id"]}" data-area="{a["id"]}">{esc(a["area"])}</a><ul>'
            + ''.join(f'<li><a href="{x["url"]}"><b>{esc(x.get("curto") or x["nome"])}</b><span>{esc(x.get("resumo", ""))}</span></a></li>' for x in a['itens'])
            + '</ul></div>' for a in areas) + '</div>'
    faixa = '\n'.join(f'      <li><a href="#{a["id"]}" data-area="{a["id"]}"><svg aria-hidden="true"><use href="#i-{a["icone"]}"/></svg>{esc(a["area"])}</a></li>' for a in areas)
    blocos = '\n'.join(
        f'      <li class="area" id="{a["id"]}">\n        <div class="area-nome">\n          <h3><a href="{a["url"]}">{esc(a["area"])}</a></h3>\n'
        f'          <p>{esc(a.get("frase", ""))}</p>\n        </div>\n        <ul class="servicos">\n'
        + '\n'.join(f'          <li><a href="{x["url"]}"><span>{esc(x["nome"])}</span>{seta}</a></li>' for x in a['itens'])
        + f'\n        </ul>\n        <a class="area-ver" href="{a["url"]}" aria-label="Ver a área {esc(a["area"])}">Ver a área <svg aria-hidden="true"><use href="#i-seta"/></svg></a>\n      </li>'
        for a in areas)
    rodape = '\n'.join(f'        <li><a href="{a["url"]}">{esc(a["area"])}</a></li>' for a in areas)
    n, total = len(areas), sum(len(a['itens']) for a in areas)
    resumo = f'{por_extenso(n).capitalize()} área{"s" if n > 1 else ""}, {por_extenso(total, True)} serviço{"s" if total > 1 else ""}'
    entrada = f'{por_extenso(n).capitalize()} área{"s" if n > 1 else ""}, cada uma com soluções à medida. Escolha a que responde ao desafio que tem hoje; juntamos as outras quando fizer sentido.'
    return {'painel_servicos': painel(''), 'painel_servicos_fora': painel('/'), 'faixa_areas': faixa, 'areas': blocos,
            'rodape_servicos': rodape, 'resumo_areas': resumo, 'entrada_servicos': entrada}


def numeros_e_quem(d, grupo):
    """«Em números» e «Quem somos» a partir do site.json. Sem números, a secção sai."""
    v = {}
    nums = d.get('numeros') or []
    v['numeros_titulo'] = esc(d.get('numeros_titulo') or 'O parceiro certo para cada fase do seu negócio')
    v['numeros'] = '\n'.join(
        f'      <li{" class=\"ativo\"" if i == 0 else ""}><b>{esc(n.get("prefixo", "+"))}<span data-conta="{n["valor"]}">{n["valor"]}</span>{esc(n.get("sufixo", ""))}</b><span>{esc(n["texto"])}</span></li>'
        for i, n in enumerate(nums))
    q = d.get('quem') or {}
    v['quem_titulo'] = esc(q.get('titulo') or 'Um parceiro estratégico para o crescimento da sua empresa.')
    pars = q.get('paragrafos') or ['[Apresentação da empresa por escrever: quem é, onde está, o que faz e para quem.]']
    v['quem_texto'] = '\n'.join(f'      <p>{esc(x)}</p>' for x in pars)
    v['quem_grupo'] = f'\n        <div><dt>Membro de</dt><dd>{esc(grupo)}' + (f'<br>{esc(q["grupo_descricao"])}' if q.get('grupo_descricao') else '') + '</dd></div>' if grupo else ''
    return v, not nums, not q.get('paragrafos')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('site')
    ap.add_argument('--saida', required=True)
    ap.add_argument('--marca')
    ap.add_argument('--substituir', action='store_true', help='apaga a pasta de saída se já existir')
    a = ap.parse_args()

    site = json.loads(Path(a.site).read_text(encoding='utf-8'))
    marca, pasta_marca = None, Path('.')
    if a.marca:
        marca = json.loads(Path(a.marca).read_text(encoding='utf-8'))
        pasta_marca = Path(a.marca).resolve().parent
    base = Path(a.site).resolve().parent
    d = juntar(site, marca, pasta_marca)
    cores = completar_cores(d['cores'])

    saida = Path(a.saida)
    if saida.exists():
        if not a.substituir:
            erro(f'{saida} já existe (use --substituir para recomeçar do modelo)')
        shutil.rmtree(saida)
    shutil.copytree(MODELO, saida)

    # logótipo e símbolo
    caminho = lambda p: Path(p) if Path(p).is_absolute() else base / p
    lvb, lint = ler_svg(caminho(d['logotipo']))
    svb, sint = ler_svg(caminho(d['simbolo']))
    ds = caminhos(sint)
    if not ds:
        erro('o símbolo precisa de pelo menos um <path d="…">')
    _, _, lw, lh = (float(v) for v in lvb.split())
    marca_dir = saida / 'assets' / 'marca'
    marca_dir.mkdir(parents=True, exist_ok=True)
    (marca_dir / 'globo-luz.svg').write_text(globo(svb, ds, [(0, '#FFFFFF', .92), (.55, cores['lavanda'], .5), (1, cores['luz'], .1)], 'g'), encoding='utf-8')
    (marca_dir / 'globo-aurora.svg').write_text(globo(svb, ds, [(0, hexa(mistura(rgb(cores['lavanda']), (255, 255, 255), .7)), 1), (.35, cores['lavanda'], 1), (.7, cores['luz'], 1), (1, cores['principal'], 1)], 'a'), encoding='utf-8')
    if d.get('padrao'):
        shutil.copy(caminho(d['padrao']), marca_dir / 'padrao.svg')
    else:
        (marca_dir / 'padrao.svg').write_text(padrao(svb, ds, cores['luz']), encoding='utf-8')
    if d.get('favicon'):
        shutil.copy(caminho(d['favicon']), marca_dir / 'favicon.svg')
    else:
        (marca_dir / 'favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{svb}"><g fill="{cores["principal"]}">{sem_cor(sint)}</g></svg>', encoding='utf-8')

    # contactos
    c = d['contactos']
    moradas = c.get('moradas') or []
    principal = next((m for m in moradas if m.get('principal')), moradas[0] if moradas else {'cidade': '', 'pais': '', 'linhas': []})
    morada_txt = lambda m: ', '.join([*m.get('linhas', []), m.get('pais', '')]).strip(', ')
    tels = c.get('telefones', [])
    painel = ''.join(f'<li><a href="/contactos"><b>{esc(m["cidade"])}{", " + esc(m["pais"]) if m.get("pais") else ""}</b><span>{esc((m.get("linhas") or [""])[0])}</span></a></li>' for m in moradas)
    if c.get('email'):
        painel += f'<li><a href="mailto:{esc(c["email"])}"><b>{esc(c["email"])}</b><span>{" · ".join(esc(t) for t in tels)}</span></a></li>'
    rodape = '<p>' + '<br>'.join(([f'<a href="mailto:{esc(c["email"])}">{esc(c["email"])}</a>'] if c.get('email') else []) + [f'<a href="{tel(t)}">{esc(t)}</a>' for t in tels]) + '</p>'
    rodape += ''.join(f'\n      <p><strong>{esc(m["cidade"])}</strong><br>{esc(", ".join(m.get("linhas", [])))}</p>' for m in moradas)
    ico = lambda i: f'<span class="contacto-ico" aria-hidden="true"><svg><use href="#{i}"/></svg></span>'
    blocos = ''
    if c.get('email'):
        blocos += f'\n      <li>{ico("i-email")}<h3>Email</h3><p><a href="mailto:{esc(c["email"])}">{esc(c["email"])}</a></p></li>'
    if tels:
        blocos += f'\n      <li>{ico("i-telefone")}<h3>Telefone{"s" if len(tels) > 1 else ""}</h3><p>' + '<br>'.join(f'<a href="{tel(t)}">{esc(t)}</a>' for t in tels) + '</p></li>'
    for m in moradas:
        blocos += f'\n      <li>{ico("i-local")}<h3>{esc(m["cidade"])}{", " + esc(m["pais"]) if m.get("pais") else ""}</h3><p>' + '<br>'.join(esc(x) for x in m.get('linhas', [])) + '</p></li>'
    coords = c.get('maps_coords')
    q = f'{coords[0]},{coords[1]}+({d["nome"]})' if coords else morada_txt(principal)
    from urllib.parse import quote_plus
    maps_embed = f'https://www.google.com/maps?q={quote_plus(q, safe=",+()")}&amp;z=17&amp;output=embed'
    maps_link = esc(c.get('maps_link') or f'https://www.google.com/maps/search/?api=1&query={quote_plus(morada_txt(principal))}')

    grupo = d.get('grupo', '')
    slogan = d['slogan'] if isinstance(d['slogan'], list) else [d['slogan'], '']
    fonte = d.get('fonte') or 'Google Sans'
    valores = {
        'nome': esc(d['nome']), 'titulo': esc(f'{d["nome"]} · {" ".join(slogan).strip()}'),
        'descricao': esc(d.get('descricao', '')), 'slogan_1': esc(slogan[0]), 'slogan_2': esc(slogan[1] if len(slogan) > 1 else ''),
        'frase_abertura': esc(d.get('frase_abertura', '')), 'grupo': esc(grupo),
        'rodape_grupo': f' · Membro da {esc(grupo)}' if grupo else '', 'ano': str(d.get('ano', datetime.date.today().year)),
        'versao': datetime.datetime.now().strftime('%Y%m%d%H'), 'fonte': fonte, 'fonte_url': fonte.replace(' ', '+'),
        'cor_fundo_pagina': '#FFFFFF', 'email': esc(c.get('email', '')),
        'logotipo_symbol': f'<symbol id="logo" viewBox="{lvb}">{sem_cor(lint)}</symbol>',
        'simbolo_symbol': f'<symbol id="simbolo" viewBox="{svb}">{sem_cor(sint)}</symbol>',
        'logo_viewbox': lvb, 'logo_ratio': f'{lw:g} / {lh:g}', 'simbolo_viewbox': svb,
        'painel_onde': painel, 'rodape_contactos': rodape, 'contactos_blocos': blocos,
        'morada_principal': esc(morada_txt(principal)), 'cidade_principal': esc(principal.get('cidade', '')),
        'maps_embed': maps_embed, 'maps_link': maps_link,
        **servicos(d.get('servicos')),
    }
    extra, sem_numeros, sem_quem = numeros_e_quem(d, grupo)
    valores.update(extra)
    if d.get('servicos_entrada'):
        valores['entrada_servicos'] = esc(d['servicos_entrada'])

    desligar = [k for k, v in (d.get('seccoes') or {}).items() if v is False]
    if sem_numeros and 'numeros' not in desligar:
        desligar.append('numeros')
        print('Sem «numeros» no site.json: a secção «Em números» saiu (só números reais, confirmados pelo cliente).')
    if sem_quem:
        print('ATENÇÃO: falta «quem.paragrafos»; «Quem somos» tem um texto entre [ ] por escrever.')
    for f in saida.rglob('*'):
        if f.suffix not in ('.html', '.css', '.js', '.md', '.json') or not f.is_file():
            continue
        s = f.read_text(encoding='utf-8')
        if f.name == 'index.html' and f.parent == saida:
            for k in desligar:
                if k not in SECCOES:
                    erro(f'secção desconhecida em «seccoes»: {k} (válidas: {", ".join(SECCOES)})')
                i = s.find(f'<!-- {SECCOES[k]}')
                if i >= 0:
                    j = s.index('</section>', i) + len('</section>')
                    s = s[:i] + s[j:].lstrip('\n')
        s = re.sub(r'\{\{(\w+)\}\}', lambda m: valores.get(m.group(1), m.group(0)), s)
        if f.suffix == '.css':
            s = recolorir(s, cores)
        f.write_text(s, encoding='utf-8')

    # avisos
    print(f'Site criado em {saida}')
    restos = sorted({m for f in saida.rglob('*.html') for m in re.findall(r'\{\{\w+\}\}', f.read_text(encoding='utf-8'))})
    if restos:
        print('Marcadores por preencher:', ', '.join(restos))
    idx = (saida / 'index.html').read_text(encoding='utf-8')
    ids = set(re.findall(r'\sid="([^"]+)"', idx))
    soltos = sorted({h for h in re.findall(r'href="#([\w-]+)"', idx) if h not in ids and h != 'conteudo'})
    if soltos:
        print('Ligações sem destino na página inicial (âncoras):', ', '.join('#' + h for h in soltos))
    paginas = sorted({h for h in re.findall(r'href="(/[a-z0-9][\w/-]*)"', idx) if not (saida / (h.strip('/') + '.html')).exists() and not (saida / h.strip('/') / 'index.html').exists() and not h.startswith('/assets')})
    if paginas:
        print('Páginas ainda por construir:', ', '.join(paginas))
    fundo, txt = rgb('#FFFFFF'), rgb(cores['acento_texto'])
    if contraste(txt, fundo) < 4.5:
        print(f'Aviso: o laranja/acento de texto {cores["acento_texto"]} tem contraste {contraste(txt, fundo):.2f} com branco (botões com texto branco pedem 4,5).')
    for k in ('principal', 'texto'):
        if contraste(rgb(cores[k]), fundo) < 7:
            print(f'Aviso: a cor «{k}» {cores[k]} tem contraste {contraste(rgb(cores[k]), fundo):.2f} com branco.')
    print('Painéis do menu com texto do modelo a reescrever: Soluções, Sobre nós, Cases, Parceiros, Recursos (o de Serviços já vem do site.json).')
    feitas = {'numeros', 'servicos'} | (set() if sem_quem else {'quem'})
    print('Secções com texto do modelo a reescrever:', ', '.join(v for k, v in SECCOES.items() if k not in desligar and k not in feitas))
    termos = {t: n for t in TERMOS_MODELO if (n := sum(f.read_text(encoding='utf-8').count(t) for f in saida.rglob('*.html')))}
    if termos and 'Kingdom' not in d['nome']:
        print('Factos do site de origem ainda no texto (trocar antes de mostrar):', ', '.join(f'{t} ×{n}' for t, n in termos.items()))
    if not grupo and ('{{grupo}}' in (MODELO / 'index.html').read_text(encoding='utf-8')):
        print('Sem «grupo»: rever «Quem somos», «Porque trabalhar connosco» e a FAQ, que falam de um grupo.')


if __name__ == '__main__':
    main()
