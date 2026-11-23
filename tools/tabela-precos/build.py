#!/usr/bin/env python3
"""Tabela de preços 2026 da cooperação DT Company e Kingdom Company (uso interno), A4 vertical.
Uso: python3 build.py && node ../portfolio-cooperacao/render.mjs "$PWD" tabela
"""
import html
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
PORT = AQUI.parent / 'portfolio-cooperacao'
sys.path.insert(0, str(PORT))
import build as _port  # noqa: E402,F401  (reaproveita as funções do portfólio)
from build import fios, logos, FONTES  # noqa: E402
sys.path.insert(0, str(AQUI))
import importlib.util  # noqa: E402
_spec = importlib.util.spec_from_file_location('dados_tabela', AQUI / 'dados.py')
D = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(D)

e = html.escape
COOP = 'Cooperação Comercial DT Company e Kingdom Company'
DATA = 'Novembro de 2026'
N_SERV = sum(len(s) for _, s in D.AREAS)
TOTAL_P = 3 + len(D.AREAS) + 2


def mt(v):
    return f'{v:,.0f}'.replace(',', '.')


def rod(n):
    return f'<footer class="rod"><span>Tabela de preços · {DATA} · Uso interno</span><span>{n:02d} / {TOTAL_P:02d}</span></footer>'


def chip(m):
    return f'<span class="chip ch-{m}">{e(D.MODELOS[m][0])}</span>'


pags = []

# 1 · Capa
pags.append(f'''<section class="pag noite capa">
{fios("fios-capa", 210, 170)}
<div class="capa-topo">{logos("branco")}</div>
<div class="capa-base">
  <p class="eb">Uso interno · {DATA}</p>
  <h1>Tabela de preços</h1>
  <p class="capa-sub">Preços de referência dos {N_SERV} serviços da cooperação, por modelo de venda e por plano, para preparar propostas.</p>
  <p class="capa-coop"><span class="duo"></span>{e(COOP)}</p>
</div>
</section>''')

# 2 · Como ler
mods = ''.join(f'<li class="md-{k}">{chip(k)}<span>{e(t)}</span></li>' for k, (_n, t) in D.MODELOS.items())
pags.append(f'''<section class="pag">
<p class="eb">Como ler esta tabela</p>
<h1 class="h-qs">Três modelos de venda, três planos por serviço</h1>
<p class="lead">O mercado moçambicano dá a estes serviços um valor percebido médio. A cooperação posiciona-se como especialista: acima dos freelancers e dos estúdios pequenos, abaixo das grandes consultoras internacionais. O trabalho consultivo cobra-se à hora; a produção, por projeto ou por pacote.</p>
<h2 class="h2">Modelos de venda</h2>
<ul class="modelos">{mods}</ul>
<h2 class="h2">Planos</h2>
<ul class="planos-exp">
<li><b>Essencial</b><span>O âmbito mínimo que resolve o problema. É o preço de entrada.</span></li>
<li><b>Profissional</b><span>O plano a recomendar na maioria dos casos: mais entregáveis e acompanhamento.</span></li>
<li><b>Premium</b><span>Âmbito alargado e acompanhamento prolongado. Serve também de referência para o cliente.</span></li>
</ul>
<h2 class="h2">Condições gerais</h2>
<ul class="cond">{"".join(f"<li>{e(c)}</li>" for c in D.CONDICOES)}</ul>
{rod(2)}
</section>''')

# 3 · Resumo
linhas = ''
for i, (area, servs) in enumerate(D.AREAS, 1):
    for j, (nome, mod, uni, planos, _s) in enumerate(servs):
        a = f'<td class="r-area" rowspan="{len(servs)}"><em>{i:02d}</em>{e(area)}</td>' if j == 0 else ''
        pr = ''.join(f'<td class="num">{mt(p[1])}</td>' for p in planos)
        linhas += f'<tr class="{"r-ini" if j == 0 else ""}">{a}<td class="r-serv"><b>{e(nome)}</b><span>{e(uni)}</span></td><td>{chip(mod)}</td>{pr}</tr>'
pags.append(f'''<section class="pag">
<p class="eb">Resumo</p>
<h1 class="h-qs">Os {N_SERV} serviços numa página</h1>
<p class="lead lead-c">Valores em MT, sem IVA. Nos projetos, os valores são «a partir de». Nos serviços pontuais, as colunas mostram exemplos de horas.</p>
<table class="resumo"><thead><tr><th>Área</th><th>Serviço e unidade</th><th>Modelo</th><th class="num">Essencial</th><th class="num">Profissional</th><th class="num">Premium</th></tr></thead>
<tbody>{linhas}</tbody></table>
{rod(3)}
</section>''')

# 4–9 · Áreas
for i, (area, servs) in enumerate(D.AREAS, 1):
    blocos = ''
    for nome, mod, uni, planos, sobe in servs:
        cols = ''
        for plano, preco, rot, inc in planos:
            pre = '<small>a partir de</small>' if mod == 'projeto' else ''
            r = f'<small class="rot">{e(rot)}</small>' if rot else ''
            cols += f'<div class="pl"><p class="lbl">{e(plano)}</p>{pre}<p class="preco">{mt(preco)} <i>MT</i></p>{r}<ul>{"".join(f"<li>{e(x)}</li>" for x in inc)}</ul></div>'
        blocos += f'''<article class="ps">
  <div class="ps-cab"><h3>{e(nome)}</h3>{chip(mod)}<span class="uni">{e(uni)}</span></div>
  <div class="pls">{cols}</div>
  <p class="sobe"><b>O preço sobe com:</b> {e(sobe)}</p>
</article>'''
    nota = f'<p class="nota">{e(D.NOTA_AREA[area])}</p>' if area in D.NOTA_AREA else ''
    dens = ' densa' if len(servs) > 3 else ''
    pags.append(f'''<section class="pag area{dens}">
<header class="ar-cab"><span class="ar-n">{i:02d}</span><div><p class="eb">Área {i:02d} de {len(D.AREAS):02d}</p><h1>{e(area)}</h1></div></header>
<span class="duo"></span>
<div class="pss">{blocos}</div>
{nota}
{rod(3 + i)}
</section>''')

# 10 · Serviços pontuais e extras
ex = ''.join(f'<tr><td><b>{e(a)}</b></td><td class="num">{e(b)}</td><td>{e(c)}</td></tr>' for a, b, c in D.EXTRAS)
np_ = 4 + len(D.AREAS)
pags.append(f'''<section class="pag">
<p class="eb">Hora consultiva e extras</p>
<h1 class="h-qs">O que se cobra à hora, por mês e à parte</h1>
<div class="hora"><p class="lbl">Hora consultiva</p><p class="preco-g">{mt(D.HORA)} <i>MT por hora</i></p><p>Aplica-se ao Advisory, aos apuramentos internos, às sessões de trabalho avulsas e a todo o trabalho pedido fora do âmbito de um projeto. Nas propostas, indica-se sempre a estimativa de horas.</p></div>
<table class="tab extras"><thead><tr><th>Item</th><th class="num">Valor</th><th>Quando se aplica</th></tr></thead><tbody>{ex}</tbody></table>
<p class="nota-f">Os preços desta tabela são referências internas para preparar propostas. Não se publicam no site nem se enviam como tabela ao cliente: o cliente recebe sempre uma proposta com o âmbito e o valor do seu caso.</p>
{rod(np_)}
</section>''')

# 11 · Contracapa
pags.append(f'''<section class="pag noite contactos">
{fios("fios-ct", 210, 120)}
<div class="ct-in">
  <p class="eb">Tabela de preços · {DATA}</p>
  <h1>Uso interno</h1>
  <p class="capa-sub">Documento para a equipa comercial. Não distribuir fora da DT Company e da Kingdom Company.</p>
  <div class="ct-grelha">
    <div class="ct"><p class="lbl">Email</p><p>contact@kingdomcompany.co.za</p><p>contact@dtcompany.co.za</p></div>
    <div class="ct"><p class="lbl">Telefone e WhatsApp</p><p>+258 87 664 1836</p><p>+258 85 1877 115</p><p>+258 82 987 8424</p></div>
  </div>
</div>
<div class="ct-base">{logos("branco")}<p class="capa-coop"><span class="duo"></span>{e(COOP)}</p></div>
</section>''')
assert len(pags) == TOTAL_P, (len(pags), TOTAL_P)

fontes = ''.join(f"@font-face{{font-family:'Manrope';src:url('file://{FONTES}/manrope-{w}.ttf');font-weight:{w};}}\n" for w in (400, 500, 600, 700))
css = (PORT / 'portfolio.css').read_text() + (AQUI.parent / 'propostas/sr-john/proposta.css').read_text() + (AQUI / 'tabela.css').read_text()
(AQUI / 'tabela.html').write_text(f'''<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><title>Tabela de preços · {e(COOP)}</title>
<style>{fontes}{css}</style></head><body>{"".join(pags)}</body></html>''')
print('tabela.html:', len(pags), 'páginas,', N_SERV, 'serviços')
