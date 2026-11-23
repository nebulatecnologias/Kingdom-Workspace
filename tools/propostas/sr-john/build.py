#!/usr/bin/env python3
"""Proposta: Dashboard de Gestão com comanda eletrónica para o restaurante do Sr. John.
Estilo do portfólio da cooperação (tools/portfolio-cooperacao). A4 vertical.
Uso: python3 build.py && node ../../portfolio-cooperacao/render.mjs "$PWD" proposta
Exceções aprovadas pelo Shelton a 23/11/2026: desconto de 20 000 MT (R39) e manutenção
opcional, com gestão própria (R29).
"""
import html
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
PORT = AQUI.parent.parent / 'portfolio-cooperacao'
sys.path.insert(0, str(PORT))
import build as _  # noqa: F401  (gera o portfólio; reaproveitamos as funções)
from build import fios, logos, FONTES  # noqa: E402

e = html.escape
COOP = 'Cooperação Comercial DT Company e Kingdom Company'
CLIENTE = 'Restaurante do Sr. John'
DATA = 'Novembro de 2026'
TOTAL_P = 9


def mt(v):
    return f'{v:,.0f}'.replace(',', ' ') + ' MT'


def rod(n):
    return f'<footer class="rod"><span>Proposta para o {e(CLIENTE)} · {DATA}</span><span>{n:02d} / {TOTAL_P:02d}</span></footer>'


def cab(eb, titulo, lead=''):
    l = f'<p class="lead">{e(lead)}</p>' if lead else ''
    return f'<p class="eb">{e(eb)}</p><h1 class="h-qs">{e(titulo)}</h1>{l}'


FASES = [
    ('F0', 'Planificação e levantamento', 'Observação do serviço, do menu, da cozinha e do stock atual. Organização dos dados: mesas, pedidos, pratos, ingredientes e fornecedores.', 1, 1, 13500),
    ('F1', 'Protótipo', 'Ecrãs do tablet, da cozinha e do painel, para ver e aprovar antes de construir.', 2, 2, 22500),
    ('F2', 'Piloto da comanda eletrónica', 'Pedidos à mesa no tablet, gestão das mesas e envio dos pedidos à cozinha e ao bar.', 3, 4, 78500),
    ('F3', 'Desenvolvimento completo', 'Stock, fichas técnicas, compras, fecho de caixa e painel do proprietário.', 5, 6, 103000),
    ('F4', 'Cadastro', 'Introdução do menu, das fichas técnicas e do inventário inicial.', 6, 6, 15500),
    ('F5', 'Testes em serviço real', 'Testes num almoço e num jantar, verificação da rede Wi-Fi e testes de segurança.', 7, 7, 13500),
    ('F6', 'Lançamento', 'Formação da equipa, domínio e alojamento, e arranque do sistema.', 8, 8, 22500),
]
SUBTOTAL = sum(f[5] for f in FASES)
DESCONTO = 20000
TOTAL = SUBTOTAL - DESCONTO
PARCELAS = [
    ('1.ª parcela', 40, 'Na adjudicação, antes de começar'),
    ('2.ª parcela', 20, 'Com o protótipo aprovado (semana 2)'),
    ('3.ª parcela', 20, 'Com a entrega do piloto (semana 4)'),
    ('4.ª parcela', 20, 'No lançamento (semana 8)'),
]
assert SUBTOTAL == 269000 and TOTAL == 249000

pags = []

# 1 · Capa
pags.append(f'''<section class="pag noite capa">
{fios("fios-capa", 210, 170)}
<div class="capa-topo">{logos("branco")}</div>
<div class="capa-base">
  <p class="eb">Proposta comercial · Maputo, {DATA.lower()}</p>
  <h1 class="capa-h-prop">Dashboard de Gestão com comanda eletrónica</h1>
  <p class="capa-sub">Proposta para o {e(CLIENTE)}: pedidos feitos à mesa no tablet, enviados na hora à cozinha e ao bar, com o stock controlado em cada prato vendido.</p>
  <p class="capa-coop"><span class="duo"></span>{e(COOP)}</p>
</div>
</section>''')

# 2 · Resumo
factos = [('Prazo', '8 semanas'), ('Fases', '7 fases, de F0 a F6'), ('Acompanhamento', '30 dias depois do lançamento'),
          ('Investimento', f'{mt(TOTAL)} + IVA'), ('Pagamento', '4 parcelas, ao longo do projeto')]
indice = [('O que o sistema faz', 3), ('Como o sistema está organizado', 4), ('Fases e calendário', 5),
          ('Investimento', 6), ('Pagamento e manutenção', 7), ('Condições e próximos passos', 8)]
pags.append(f'''<section class="pag">
{cab("Resumo da proposta", "Um sistema para fazer os pedidos à mesa e controlar o stock")}
<div class="qs-texto">
<p>O Sr. John quer controlar o stock do restaurante e que os garçons façam os pedidos na própria mesa, num tablet ou telemóvel. A este sistema chama-se comanda eletrónica.</p>
<p>Propomos desenvolver, em 8 semanas, uma plataforma de gestão em que o garçom lança o pedido na mesa, a cozinha e o bar o recebem na hora, cada prato vendido desconta os ingredientes do stock e o Sr. John acompanha as vendas, os custos e o stock em tempo real.</p>
</div>
<dl class="factos">{"".join(f"<div><dt>{e(a)}</dt><dd>{e(b)}</dd></div>" for a, b in factos)}</dl>
<h2 class="h2">Conteúdo</h2>
<ol class="indice">{"".join(f"<li><em>{i:02d}</em><div><b>{e(t)}</b></div><small>{p:02d}</small></li>" for i, (t, p) in enumerate(indice, 1))}</ol>
{rod(2)}
</section>''')

# 3 · O que o sistema faz
grupos = [
    ('No serviço', [
        ('Pedidos sem papel', 'O garçom lança o pedido no tablet, com as observações do cliente (por exemplo, «sem cebola» ou «bem passado»).'),
        ('Cozinha e bar ligados', 'O pedido chega na hora, num ecrã ou numa impressora. Nenhum pedido se perde nem se troca.'),
        ('Conta da mesa automática', 'A conta soma-se sozinha. É possível dividir a conta ou transferir a mesa.'),
    ]),
    ('Na gestão', [
        ('Stock por ficha técnica', 'Cada prato vendido desconta automaticamente os ingredientes do stock.'),
        ('Custo por prato', 'Mostra quanto custa e quanto rende cada prato, e quais dão lucro.'),
        ('Painel do proprietário', 'Vendas por prato, por garçom e por hora, e alertas quando o stock chega ao mínimo.'),
    ]),
]
fluxo = [('Na mesa', 'O garçom abre a mesa no tablet e lança o pedido com as observações do cliente.'),
         ('Na cozinha e no bar', 'O pedido chega na hora. O garçom vê quando o prato está pronto.'),
         ('Na conta e no stock', 'A conta fecha com a forma de pagamento, os ingredientes saem do stock e o painel atualiza.')]
g = ''.join(f'<div class="grupo"><p class="lbl">{e(t)}</p><ul class="itens">{"".join(f"<li><b>{e(a)}</b><span>{e(b)}</span></li>" for a, b in its)}</ul></div>' for t, its in grupos)
pags.append(f'''<section class="pag">
{cab("01 · O que o sistema faz", "Liga a mesa, a cozinha, o bar e o stock", "Do pedido feito à mesa até ao painel do proprietário, a informação passa por um só sistema.")}
<div class="grupos">{g}</div>
<h2 class="h2">Como funciona um pedido</h2>
<ol class="fluxo">{"".join(f"<li><em>{i}</em><b>{e(a)}</b><span>{e(b)}</span></li>" for i, (a, b) in enumerate(fluxo, 1))}</ol>
{rod(3)}
</section>''')

# 4 · Organização, perfis e segurança
estrutura = [('Restaurante', 'Gestão central do menu, dos preços, do stock, dos fornecedores e dos utilizadores.'),
             ('Mesa', 'Cada mesa abre uma conta com os pedidos, até ao fecho e ao pagamento.'),
             ('Prato e ficha técnica', 'Cada prato tem os ingredientes e as quantidades que gasta.')]
perfis = [('Proprietário e gerente', 'Painel, menu, preços, stock, compras e fecho de caixa.'),
          ('Garçom', 'Abre mesas, lança pedidos no tablet e pede a conta. Não altera preços.'),
          ('Cozinha e bar', 'Recebem os pedidos e marcam o que está pronto.')]
seg = [('Acessos por perfil', 'Cada pessoa vê e altera só o que lhe compete.'),
       ('Política de privacidade', 'Os dados de clientes e da equipa são guardados com regras claras.'),
       ('Testes de segurança', 'As falhas encontradas são corrigidas antes do lançamento.'),
       ('Testes em serviço real', 'O sistema é testado num almoço e num jantar antes do lançamento.'),
       ('Rede Wi-Fi verificada', 'Confirmamos que a rede cobre a sala, a cozinha e o bar.'),
       ('Monitorização', 'Alertas, registo de erros e cópias de segurança diárias.')]
tab = lambda h, rows: f'<table class="tab"><thead><tr><th>{h[0]}</th><th>{h[1]}</th></tr></thead><tbody>{"".join(f"<tr><td>{e(a)}</td><td>{e(b)}</td></tr>" for a, b in rows)}</tbody></table>'
pags.append(f'''<section class="pag">
{cab("02 · Como o sistema está organizado", "Estrutura, perfis de acesso e segurança")}
<h2 class="h2 h2-1">Estrutura</h2>
{tab(("Elemento", "O que é"), estrutura)}
<h2 class="h2">Perfis de acesso</h2>
{tab(("Perfil", "O que pode fazer"), perfis)}
<h2 class="h2">Segurança e testes antes do lançamento</h2>
<ul class="seg">{"".join(f"<li><b>{e(a)}</b><span>{e(b)}</span></li>" for a, b in seg)}</ul>
{rod(4)}
</section>''')

# 5 · Fases e calendário
linhas = ''
for cod, nome, desc, s0, s1, _v in FASES:
    cel = ''.join(f'<td class="{("on" + (" ini" if s == s0 else "") + (" fim" if s == s1 else "")) if s0 <= s <= s1 else ""}"></td>' for s in range(1, 9))
    linhas += f'<tr><td class="f-cod">{cod}</td><td class="f-nome"><b>{e(nome)}</b><span>{e(desc)}</span></td>{cel}</tr>'
pags.append(f'''<section class="pag">
{cab("03 · Fases e calendário", "Sete fases em 8 semanas", "Primeiro desenhamos e aprovamos o sistema com o Sr. John (F0 e F1). Depois construímos, testamos e lançamos (F2 a F6).")}
<table class="gantt"><thead><tr><th></th><th>Fase e o que é entregue</th><th colspan="4">Mês 1</th><th colspan="4">Mês 2</th></tr>
<tr class="sem"><th></th><th></th>{"".join(f"<th>S{s}</th>" for s in range(1, 9))}</tr></thead><tbody>{linhas}</tbody></table>
<p class="nota-f">Os prazos dependem da entrega atempada do menu, das receitas e dos preços pelo restaurante.</p>
{rod(5)}
</section>''')

# 6 · Investimento
inv = ''.join(f'<tr><td class="f-cod">{c}</td><td>{e(n)}</td><td class="num">{"S" + str(a) if a == b else f"S{a} a S{b}"}</td><td class="num">{mt(v)}</td></tr>' for c, n, _d, a, b, v in FASES)
incl = ['Fases F0 a F6 completas', 'Comanda eletrónica para tablet ou telemóvel', 'Envio dos pedidos à cozinha e ao bar',
        'Stock por ficha técnica, compras e fornecedores', 'Painel do proprietário', 'Alojamento e domínio no 1.º ano',
        'Formação da equipa', '30 dias de acompanhamento depois do lançamento']
excl = ['Tablets, telemóveis e impressoras', 'Rede Wi-Fi', 'Faturação fiscal']
pags.append(f'''<section class="pag">
{cab("04 · Investimento", "Investimento por fase")}
<table class="inv"><thead><tr><th></th><th>Fase</th><th class="num">Semanas</th><th class="num">Valor</th></tr></thead>
<tbody>{inv}</tbody>
<tfoot><tr><td></td><td>Total das fases</td><td></td><td class="num">{mt(SUBTOTAL)}</td></tr>
<tr><td></td><td>Desconto</td><td></td><td class="num">− {mt(DESCONTO)}</td></tr>
<tr class="tot"><td></td><td>Total a pagar</td><td></td><td class="num">{mt(TOTAL)} <small>+ IVA</small></td></tr></tfoot></table>
<div class="inc">
  <div><p class="lbl">Está incluído</p><ul class="check">{"".join(f"<li>{e(x)}</li>" for x in incl)}</ul></div>
  <div><p class="lbl">Não está incluído</p><ul class="check nao">{"".join(f"<li>{e(x)}</li>" for x in excl)}</ul></div>
</div>
<p class="nota-f">O valor cobre o âmbito descrito nesta proposta. Se o restaurante quiser acrescentar funcionalidades, apresentamos o valor do âmbito alargado e paga-se apenas a diferença.</p>
{rod(6)}
</section>''')

# 7 · Pagamento e manutenção
parc = ''.join(f'<li><p class="lbl">{e(n)} · {p}%</p><b>{mt(TOTAL * p // 100)}</b><span>{e(q)}</span></li>' for n, p, q in PARCELAS)
pags.append(f'''<section class="pag">
{cab("05 · Pagamento e manutenção", "Quatro parcelas, ligadas às entregas", f"O total de {mt(TOTAL)} + IVA paga-se em meticais, em quatro parcelas ao longo das 8 semanas.")}
<ol class="parcelas">{parc}</ol>
<h2 class="h2">Depois do lançamento</h2>
<p class="txt">Nos primeiros 30 dias depois do lançamento, a nossa equipa acompanha o uso do sistema e corrige o que for preciso. A partir daí, o Sr. John escolhe como fica a manutenção:</p>
<div class="opcoes">
  <div><p class="lbl">Opção A</p><b>Gestão pelo restaurante</b><ul class="check"><li>O restaurante assume o alojamento do servidor e as cópias de segurança</li><li>O registo e a renovação do domínio</li><li>O apoio interno aos utilizadores</li></ul></div>
  <div><p class="lbl">Opção B</p><b>Manutenção pela nossa equipa</b><ul class="check"><li>A nossa equipa assegura a manutenção todos os meses</li><li>O valor mensal é definido pelo número de utilizadores</li><li>O Sr. John dedica-se ao restaurante e aos clientes</li></ul></div>
</div>
{rod(7)}
</section>''')

# 8 · Condições, próximos passos e aceitação
cond = ['Valores em meticais, sem IVA.', 'Pagamento em 4 parcelas: 40%, 20%, 20% e 20%.',
        'Inclui os honorários da equipa e o alojamento e o domínio no 1.º ano.',
        'Não inclui tablets, telemóveis, impressoras, rede Wi-Fi nem faturação fiscal.',
        'Funcionalidades novas, fora deste âmbito, são orçamentadas à parte; paga-se apenas a diferença.',
        'Os prazos dependem da entrega atempada do menu, das receitas e dos preços.']
passos = ['Aprovação da proposta pelo Sr. John', 'Assinatura do contrato de prestação de serviços',
          'Pagamento da 1.ª parcela', 'Reunião de arranque e início da fase F0']
pags.append(f'''<section class="pag">
{cab("06 · Condições e próximos passos", "Condições da proposta")}
<ul class="cond">{"".join(f"<li>{e(x)}</li>" for x in cond)}</ul>
<h2 class="h2">Próximos passos</h2>
<ol class="passos">{"".join(f"<li><b>{e(x)}</b><span></span></li>" for x in passos)}</ol>
<h2 class="h2">Aceitação da proposta</h2>
<div class="ass">
  <div><div class="lin"></div><small>Nome</small></div>
  <div><div class="lin"></div><small>Assinatura</small></div>
  <div><div class="lin"></div><small>Data</small></div>
</div>
{rod(8)}
</section>''')

# 9 · Contactos
pags.append(f'''<section class="pag noite contactos">
{fios("fios-ct", 210, 120)}
<div class="ct-in">
  <p class="eb">Obrigado pela confiança</p>
  <h1>Fale connosco</h1>
  <p class="capa-sub">Para qualquer dúvida sobre esta proposta, estamos ao seu dispor.</p>
  <div class="ct-grelha">
    <div class="ct"><p class="lbl">Email</p><p>contact@kingdomcompany.co.za</p><p>contact@dtcompany.co.za</p></div>
    <div class="ct"><p class="lbl">Telefone e WhatsApp</p><p>+258 87 664 1836</p><p>+258 85 1877 115</p><p>+258 82 987 8424</p></div>
    <div class="ct"><p class="lbl">Morada</p><p>Edifício Millennium Park</p><p>Av. Vladimir Lenine, n.º 174, Maputo</p></div>
    <div class="ct"><p class="lbl">Sites</p><p>www.kingdomcompany.co.za</p><p>www.dtcompany.co.za</p></div>
  </div>
</div>
<div class="ct-base">{logos("branco")}<p class="capa-coop"><span class="duo"></span>{e(COOP)}</p></div>
</section>''')
assert len(pags) == TOTAL_P

fontes = ''.join(f"@font-face{{font-family:'Manrope';src:url('file://{FONTES}/manrope-{w}.ttf');font-weight:{w};}}\n" for w in (400, 500, 600, 700))
css = (PORT / 'portfolio.css').read_text() + (AQUI / 'proposta.css').read_text()
(AQUI / 'proposta.html').write_text(f'''<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><title>Proposta · Dashboard de Gestão · {e(CLIENTE)}</title>
<style>{fontes}{css}</style></head><body>{"".join(pags)}</body></html>''')
print('proposta.html:', len(pags), 'páginas; total', mt(TOTAL))
