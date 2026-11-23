#!/usr/bin/env python3
"""Gera portfolio.html (A4 vertical) do portfólio da cooperação DT Company e Kingdom Company.
Uso: python3 build.py && node render.mjs "$PWD"
"""
import html
import re
from pathlib import Path

import dados as D

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
FONTES = RAIZ / 'dt-company-brand/identidade/fontes'
LOGOS = {
    'k-branco': RAIZ / 'kingdom-company/assets/marca/kingdom-company-horizontal-simples-branco.svg',
    'k-indigo': RAIZ / 'kingdom-company/assets/marca/kingdom-company-horizontal-simples-indigo.svg',
    'dt-branco': RAIZ / 'dt-company-brand/identidade/logotipo/dt-company-horizontal-branco.svg',
    'dt-indigo': RAIZ / 'dt-company-brand/identidade/logotipo/dt-company-horizontal-indigo.svg',
}

e = html.escape


def svg(nome, classe):
    s = LOGOS[nome].read_text()
    s = re.sub(r'<\?xml[^>]*>\s*', '', s)
    s = re.sub(r'\s(width|height)="[^"]*"', '', s, count=2)
    return s.replace('<svg', f'<svg class="{classe}" aria-hidden="true"', 1)


def logos(tom):
    return f'<div class="logos">{svg("k-" + tom, "lg-k")}<i></i>{svg("dt-" + tom, "lg-dt")}</div>'


# Os dois fios: a marca gráfica da cooperação (laranja Kingdom, azul DT).
def fios(classe, w=210, h=150):
    a = f'M-10 {h*.78} C {w*.28} {h*.78}, {w*.36} {h*.18}, {w*.62} {h*.30} S {w*.92} {h*.70}, {w+10} {h*.36}'
    b = f'M-10 {h*.30} C {w*.24} {h*.30}, {w*.40} {h*.86}, {w*.64} {h*.66} S {w*.90} {h*.12}, {w+10} {h*.40}'
    return (f'<svg class="{classe}" viewBox="0 0 {w} {h}" preserveAspectRatio="none" aria-hidden="true">'
            f'<path d="{a}" stroke="#FF521A"/><path d="{b}" stroke="#0066FF"/></svg>')


def rodape(n):
    return f'<footer class="rod"><span>{e(D.COOPERACAO)}</span><span>{n:02d}</span></footer>'


paginas = []

# 1 · Capa
paginas.append(f'''<section class="pag noite capa">
{fios("fios-capa", 210, 170)}
<div class="capa-topo">{logos("branco")}</div>
<div class="capa-base">
  <p class="eb">2026</p>
  <h1>{e(D.TITULO)}</h1>
  <p class="capa-sub">Estratégia, compliance e governança, marca, comunicação, tecnologia e formação de equipas para empresas em Moçambique.</p>
  <p class="capa-coop"><span class="duo"></span>{e(D.COOPERACAO)}</p>
</div>
</section>''')

# 2 · Quem somos e índice
n_serv = sum(len(a['servicos']) for a in D.AREAS)
porque = ''.join(f'<li><b>{e(t)}</b><span>{e(x)}</span></li>' for t, x in D.QUEM_SOMOS['porque'])
indice = ''.join(
    f'<li><em>{i:02d}</em><div><b>{e(a["nome"])}</b><span>{e(" · ".join(s[0] for s in a["servicos"]))}</span></div><small>{i + 2:02d}</small></li>'
    for i, a in enumerate(D.AREAS, 1))
paginas.append(f'''<section class="pag">
<p class="eb">Quem somos</p>
<h1 class="h-qs">{e(D.QUEM_SOMOS["titulo"])}</h1>
<div class="qs-texto">{"".join(f"<p>{e(p)}</p>" for p in D.QUEM_SOMOS["texto"])}</div>
<h2 class="h2">Porque trabalhar connosco</h2>
<ol class="porque">{porque}</ol>
<h2 class="h2">{len(D.AREAS)} áreas, {n_serv} serviços</h2>
<ol class="indice">{indice}</ol>
{rodape(2)}
</section>''')

# 3–8 · Áreas
for i, a in enumerate(D.AREAS, 1):
    blocos = ''
    for nome, oque, depois, entrega in a['servicos']:
        itens = ''.join(f'<li>{e(x)}</li>' for x in entrega)
        blocos += f'''<article class="sv">
  <div class="sv-a"><h3>{e(nome)}</h3><p class="res">{e(depois)}</p></div>
  <div class="sv-b"><p>{e(oque)}</p><p class="lbl">O que entregamos</p><ul>{itens}</ul></div>
</article>'''
    nota = f'<p class="nota">{e(a["nota"])}</p>' if a.get('nota') else ''
    dens = ' densa' if len(a['servicos']) > 3 else ''
    paginas.append(f'''<section class="pag area{dens}">
<header class="ar-cab">
  <span class="ar-n">{i:02d}</span>
  <div><p class="eb">{e(a["rotulo"])}</p><h1>{e(a["nome"])}</h1><p class="ar-para">{e(a["para"])}</p></div>
</header>
<span class="duo"></span>
<div class="svs">{blocos}</div>
{nota}
{rodape(i + 2)}
</section>''')

# 9 · Como trabalhamos e como nos contratar
metodo = ''.join(f'<li><em>{k:02d}</em><b>{e(t)}</b><span>{e(x)}</span></li>' for k, (t, x) in enumerate(D.METODO, 1))
contratar = ''.join(f'<li><b>{e(t)}</b><span>{e(x)}</span></li>' for t, x in D.CONTRATAR)
np_ = len(paginas) + 1
paginas.append(f'''<section class="pag">
<p class="eb">Metodologia</p>
<h1 class="h-qs">Do diagnóstico à autonomia da equipa</h1>
<p class="lead">Acompanhamos a empresa em cada etapa: identificamos os desafios, definimos as soluções, pomos o plano em marcha e preparamos a equipa para continuar sozinha.</p>
<ol class="metodo">{metodo}</ol>
<h2 class="h2">Como nos contratar</h2>
<ol class="passos">{contratar}</ol>
<p class="fecho">A proposta é enviada por escrito e não implica qualquer compromisso.</p>
{rodape(np_)}
</section>''')

# 10 · Contactos
C = D.CONTACTOS
bl = lambda t, xs: f'<div class="ct"><p class="lbl">{t}</p>{"".join(f"<p>{e(x)}</p>" for x in xs)}</div>'
paginas.append(f'''<section class="pag noite contactos">
{fios("fios-ct", 210, 120)}
<div class="ct-in">
  <p class="eb">Os nossos contactos</p>
  <h1>Fale connosco</h1>
  <p class="capa-sub">Peça uma cotação ou marque uma avaliação inicial com um dos nossos consultores.</p>
  <div class="ct-grelha">{bl("Email", C["email"])}{bl("Telefone e WhatsApp", C["telefone"])}{bl("Morada", C["morada"])}{bl("Sites", C["sites"])}</div>
</div>
<div class="ct-base">{logos("branco")}<p class="capa-coop"><span class="duo"></span>{e(D.COOPERACAO)}</p></div>
</section>''')

fontes = ''.join(
    f"@font-face{{font-family:'Manrope';src:url('file://{FONTES}/manrope-{w}.ttf');font-weight:{w};}}\n" for w in (400, 500, 600, 700))
css = (AQUI / 'portfolio.css').read_text()
(AQUI / 'portfolio.html').write_text(f'''<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><title>{e(D.TITULO)} · {e(D.COOPERACAO)}</title>
<style>{fontes}{css}</style></head>
<body>{"".join(paginas)}</body></html>''')
print('portfolio.html:', len(paginas), 'páginas,', n_serv, 'serviços')
