"""Fichas do processo comercial da Kingdom Company, em A4 vertical, para imprimir ou preencher no computador.

  01 · Ficha de passagem ao Closer (o SDR preenche antes da reunião)
  02 · Ficha de passagem ao gestor de projeto (o Closer preenche no fecho)
  03 · Checklist de onboarding do cliente (o gestor de projeto acompanha)

Uso: python3 fichas.py  →  gera fichas/<nome>.html; depois `node render.mjs` gera os PDF com campos preenchíveis.
Os campos marcam-se no HTML com data-n (nome único) e data-t (tx = texto, txm = várias linhas, cb = quadrado).
"""
import os, html

AQUI = os.path.dirname(os.path.abspath(__file__))
LOGO = 'file://' + os.path.join(AQUI, '..', '..', '..', 'docs', 'marca', 'logotipo', 'png', 'kingdom-company-horizontal-simples-indigo.png')
E = html.escape
_n = {}


def nome(base):
    base = ''.join(c if c.isalnum() else '_' for c in base.lower()).strip('_')[:40] or 'campo'
    _n[base] = _n.get(base, 0) + 1
    return base if _n[base] == 1 else f'{base}_{_n[base]}'


def campo(rotulo, larg='1fr', alto='', dica=''):
    """linha para escrever, com o rótulo por cima"""
    return (f'<div class="c" style="grid-column:span {larg}"><label>{E(rotulo)}{f" <i>{E(dica)}</i>" if dica else ""}</label>'
            f'<span class="f tx" data-t="tx" data-n="{nome(rotulo)}"></span></div>')


def caixa(rotulo, linhas=4, dica='', span=12):
    """caixa com pautas para texto mais longo"""
    return (f'<div class="c" style="grid-column:span {span}"><label>{E(rotulo)}{f" <i>{E(dica)}</i>" if dica else ""}</label>'
            f'<span class="f txm" data-t="txm" data-n="{nome(rotulo)}" style="height:{linhas * 7.2:.1f}mm"></span></div>')


def opcoes(rotulo, itens, span=12, outro=False, base=None):
    b = base or rotulo
    caixas = ''.join(f'<span class="op"><span class="f cb" data-t="cb" data-n="{nome(b + "_" + i)}"></span>{E(i)}</span>' for i in itens)
    if outro:
        caixas += f'<span class="op op-outro"><span class="f cb" data-t="cb" data-n="{nome(b + "_outro")}"></span>Outro <span class="f tx curto" data-t="tx" data-n="{nome(b + "_outro_qual")}"></span></span>'
    return f'<div class="c" style="grid-column:span {span}"><label>{E(rotulo)}</label><div class="ops">{caixas}</div></div>'


def linha(*cs):
    return f'<div class="g">{"".join(cs)}</div>'


def secao(n, titulo, corpo, nota=''):
    return (f'<section class="s"><h2><span>{n}</span>{E(titulo)}</h2>{f"<p class=sn>{nota}</p>" if nota else ""}{corpo}</section>')


def checklist(itens, base):
    """lista de verificação: quadrado, o passo, data e iniciais"""
    li = ''.join(f'<li><span class="f cb" data-t="cb" data-n="{nome(base + "_" + t[:30])}"></span><div><b>{E(t)}</b>{f"<small>{E(d)}</small>" if d else ""}</div>'
                 f'<span class="f tx data" data-t="tx" data-n="{nome(base + "_data")}"></span><span class="f tx ini" data-t="tx" data-n="{nome(base + "_ini")}"></span></li>'
                 for t, d in itens)
    return f'<ul class="ck"><li class="ck-cab"><span></span><div></div><span>Data</span><span>Quem</span></li>{li}</ul>'


SERVICOS = [
    ('Desenvolvimento Editorial', ['Identidade Visual', 'Modelos de Propostas Técnicas', 'Perfis Corporativos']),
    ('Consultoria Estratégica', ['Plano de Negócios', 'Planeamento Estratégico', 'Advisory']),
    ('Assessoria Estratégica', ['Produção Audiovisual', 'Gestão de Redes Sociais', 'Campanhas Publicitárias']),
    ('Desenvolvimento Tecnológico', ['Dashboards de Gestão', 'Websites e Aplicativos', 'CRM e Sistemas de Vendas']),
]


def servicos(base):
    cols = ''.join(f'<div class="sv"><b>{E(a)}</b>' + ''.join(
        f'<span class="op"><span class="f cb" data-t="cb" data-n="{nome(base + "_" + s)}"></span>{E(s)}</span>' for s in ss) + '</div>' for a, ss in SERVICOS)
    return (f'<div class="c" style="grid-column:span 12"><div class="svs">{cols}</div>'
            f'<div class="ops" style="margin-top:2mm"><span class="op"><span class="f cb" data-t="cb" data-n="{nome(base + "_nao_sabe")}"></span>Ainda não sabe</span></div></div>')


def pagina(sec, n_ficha, titulo, lead, corpo, n, total, primeira=True):
    cab = (f'<header class="cab"><div><span class="eb">{E(sec)}</span><h1>{E(titulo)}</h1><p class="lead">{lead}</p></div>'
           f'<img src="{LOGO}" alt="Kingdom Company"></header>') if primeira else (
           f'<header class="cab cab2"><span class="eb">{E(sec)} · continuação</span><img src="{LOGO}" alt="Kingdom Company"></header>')
    return (f'<div class="pagina">{cab}<main>{corpo}</main>'
            f'<footer><span>Kingdom Company · {E(n_ficha)}</span><span>Uso interno · confidencial</span><span>{n} / {total}</span></footer></div>')


CSS = open(os.path.join(AQUI, 'fichas.css')).read()


def documento(titulo, paginas):
    return (f'<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>{E(titulo)} · Kingdom Company</title>'
            f'<style>{CSS}</style></head><body>{"".join(paginas)}</body></html>')


# ---------------------------------------------------------------- 01 · SDR → Closer
_n.clear()
SEC1 = 'Ficha 01 · SDR → Closer'
p1 = pagina(SEC1, 'Ficha de passagem ao Closer', 'Ficha de passagem ao Closer',
            'O SDR preenche esta ficha antes da reunião e regista-a no CRM. O Closer lê-a antes de entrar e prepara duas hipóteses de serviço.',
            linha(campo('SDR responsável', 4), campo('Closer', 4), campo('Data', 2), campo('N.º no CRM', 2))
            + secao('1', 'O contacto', linha(campo('Nome', 6), campo('Cargo', 6)) + linha(campo('Telefone ou WhatsApp', 6), campo('Email', 6))
                    + linha(opcoes('Canal preferido', ['Chamada', 'WhatsApp', 'Email', 'Videoconferência'])))
            + secao('2', 'A empresa', linha(campo('Empresa', 7), campo('Setor', 5))
                    + linha(opcoes('N.º de colaboradores', ['1 a 9', '10 a 49', '50 a 249', '250 ou mais'], span=7),
                            opcoes('País', ['Moçambique'], span=5, outro=True))
                    + linha(opcoes('Origem do lead', ['Site', 'Instagram', 'Facebook', 'LinkedIn', 'Indicação', 'Kingdom Training', 'Evento'], outro=True))
                    + linha(campo('Quem indicou, campanha ou página de origem', 12)))
            + secao('3', 'A necessidade', linha(caixa('Dor principal, com as palavras do cliente', 7))),
            1, 2)
p2 = pagina(SEC1, 'Ficha de passagem ao Closer', '', '',
            secao('4', 'Serviço de interesse', linha(servicos('servico')), 'Marcar um ou mais.')
            + secao('5', 'Qualificação BANT',
                  linha(opcoes('Necessidade', ['Confirmada: há uma dor clara que um serviço resolve'], base='bant_necessidade'))
                  + linha(campo('Autoridade · quem decide (nome e cargo)', 6), campo('Quem mais participa na decisão', 6))
                  + linha(campo('Orçamento · investimento previsto', 6, dica='se o cliente o disse'),
                          opcoes('', ['O cliente não disse', 'Confirma que tem orçamento'], span=6, base='bant_orcamento'))
                  + linha(campo('Prazo · para quando precisa', 6), opcoes('', ['Nos próximos 30 dias (prioridade)'], span=6, base='bant_prazo')),
                  'Só passa ao Closer com Necessidade, Autoridade e Orçamento cumpridos. O Prazo define a prioridade.')
            + secao('6', 'O que já se sabe', linha(caixa('Objeções que já apareceram', 3, span=6), caixa('Notas para o Closer', 3, dica='contexto, concorrentes', span=6)))
            + secao('7', 'A reunião', linha(campo('Data', 3), campo('Hora', 2), opcoes('Canal', ['Presencial', 'Videoconferência', 'Chamada'], span=7))
                    + linha(campo('Local ou ligação', 8), opcoes('', ['Convite aceite pelo cliente'], span=4, base='convite')))
            + '<div class="ass"><div><span class="f tx" data-t="tx" data-n="ass_sdr"></span><small>SDR · ficha completa e registada no CRM</small></div>'
              '<div><span class="f tx" data-t="tx" data-n="ass_closer"></span><small>Closer · li a ficha antes da reunião</small></div></div>',
            2, 2, primeira=False)
open(os.path.join(AQUI, 'ficha-passagem-closer.html'), 'w').write(documento('Ficha de passagem ao Closer', [p1, p2]))

# ---------------------------------------------------------------- 02 · Closer → gestor de projeto
_n.clear()
SEC2 = 'Ficha 02 · Closer → Gestor de projeto'
marcos = ('<table class="tb"><thead><tr><th>Marco</th><th>O que se entrega</th><th>Data</th><th>% do valor</th><th>Pago</th></tr></thead><tbody>'
          + ''.join(f'<tr><td>{i}</td><td><span class="f tx" data-t="tx" data-n="marco{i}_entrega"></span></td><td><span class="f tx" data-t="tx" data-n="marco{i}_data"></span></td>'
                    f'<td><span class="f tx" data-t="tx" data-n="marco{i}_pct"></span></td><td class="ctr"><span class="f cb" data-t="cb" data-n="marco{i}_pago"></span></td></tr>' for i in range(1, 5))
          + '</tbody></table>')
entregaveis = '<ol class="nl">' + ''.join(f'<li><span class="f tx" data-t="tx" data-n="entregavel_{i}"></span></li>' for i in range(1, 7)) + '</ol>'
q1 = pagina(SEC2, 'Ficha de passagem ao gestor de projeto', 'Ficha de passagem ao gestor de projeto',
            'O Closer preenche esta ficha no dia do fecho e apresenta o cliente a quem vai entregar. O gestor de projeto lê-a antes da reunião de arranque.',
            linha(campo('Closer', 4), campo('Gestor de projeto', 4), campo('Data de fecho', 2), campo('N.º da proposta', 2))
            + secao('1', 'O cliente', linha(campo('Empresa', 8), campo('NUIT', 4)) + linha(campo('Morada', 12))
                    + linha(campo('Interlocutor do projeto (nome e cargo)', 6), campo('Telefone ou WhatsApp', 3), campo('Email', 3))
                    + linha(campo('Quem aprova as entregas (nome e cargo)', 6), opcoes('Canal preferido', ['Chamada', 'WhatsApp', 'Email'], span=6)))
            + secao('2', 'O que foi vendido', linha(servicos('vendido'))
                    + linha(opcoes('Plano', ['Essencial', 'Profissional', 'Premium'], span=6), campo('Valor total (MT)', 6))
                    + linha(caixa('Âmbito acordado', 3)))
            + secao('3', 'Entregáveis prometidos', entregaveis, 'Os mesmos da proposta, com os formatos acordados (PDF, PPTX, DOCX, site, sistema).'),
            1, 2)
q2 = pagina(SEC2, 'Ficha de passagem ao gestor de projeto', '', '',
            secao('4', 'Prazos e pagamento', linha(campo('Data de início', 4), campo('Prazo final prometido', 4), campo('Fatura n.º', 4)) + marcos,
                  'Os serviços pagam-se por marcos: o primeiro antes de começar e os seguintes a cada entrega intercalar (R38). Sem descontos (R39).')
            + secao('5', 'O que o cliente envia', linha(opcoes('Materiais', ['Logótipo e marca', 'Fotografias', 'Textos', 'Documentos da empresa', 'Acessos (site, domínio, redes)', 'Dados e relatórios'], outro=True))
                    + linha(campo('Prazo para enviar', 4), campo('Já recebido', 8)))
            + secao('6', 'O que surgiu na venda', linha(caixa('O que o cliente considera um bom resultado', 3, span=6), caixa('Prometido na venda, por palavras exatas', 3, span=6))
                    + linha(caixa('Objeções, sensibilidades e riscos', 3, span=6), caixa('Fora do âmbito, já explicado ao cliente', 3, span=6)))
            + secao('7', 'Reunião de arranque', linha(campo('Data e hora', 4), opcoes('Canal', ['Presencial', 'Videoconferência'], span=4), opcoes('', ['Cliente apresentado ao gestor'], span=4, base='apresentado')))
            + '<div class="ass"><div><span class="f tx" data-t="tx" data-n="ass_closer"></span><small>Closer · passagem feita</small></div>'
              '<div><span class="f tx" data-t="tx" data-n="ass_gestor"></span><small>Gestor de projeto · recebi e li</small></div></div>',
            2, 2, primeira=False)
open(os.path.join(AQUI, 'ficha-passagem-gestor-projeto.html'), 'w').write(documento('Ficha de passagem ao gestor de projeto', [q1, q2]))

# ---------------------------------------------------------------- 03 · Checklist de onboarding
_n.clear()
SEC3 = 'Ficha 03 · Onboarding do cliente'
A = [('Primeiro marco pago e confirmado', 'O projeto só arranca com o primeiro marco pago (R38).'),
     ('Ficha de passagem recebida e lida', 'Perguntar ao Closer o que não estiver claro.'),
     ('Proposta aceite e fatura arquivadas na pasta do cliente', ''),
     ('Pasta partilhada do projeto criada', 'Com subpastas: materiais, entregas, atas.'),
     ('Canal do projeto criado com o interlocutor', 'Grupo de WhatsApp ou email, como o cliente preferir.'),
     ('Mensagem de boas-vindas enviada', 'Quem é o gestor, próximos passos e data da reunião de arranque.'),
     ('Lista de materiais pedida ao cliente, com prazo', ''),
     ('Reunião de arranque marcada', 'Até 3 dias úteis depois do pagamento.')]
B = [('Equipa e papéis apresentados', 'Quem faz o quê, do lado da Kingdom e do cliente.'),
     ('Âmbito, entregáveis e o que fica fora confirmados', ''),
     ('Cronograma e marcos confirmados', 'Com as datas de cada entrega e de cada pagamento.'),
     ('Quem aprova e prazo para responder às revisões definidos', ''),
     ('Canal e frequência de contacto combinados', 'Por exemplo: ponto de situação semanal à segunda-feira.'),
     ('Materiais e acessos recolhidos, ou falta registada', ''),
     ('Ata enviada ao cliente no próprio dia', '')]
C = [('Diagnóstico feito', 'O ponto de partida, com dados do cliente.'),
     ('Plano de trabalho enviado', 'Fases, prazos e responsáveis, por escrito.'),
     ('Plano aprovado pelo cliente', '')]
D = [('Entrega intercalar apresentada', 'Com o que falta e a próxima data.'),
     ('Revisões registadas e fechadas', 'Dentro do número de revisões do plano.'),
     ('Marco seguinte pago antes de avançar', ''),
     ('Ponto de situação enviado ao cliente', 'Na frequência combinada no arranque.')]
F = [('Entregáveis finais entregues nos formatos acordados', ''),
     ('Formação da equipa do cliente feita', 'Para usar o que entregámos no dia a dia.'),
     ('Último marco pago', ''),
     ('Aceitação da entrega por escrito', 'Email ou termo assinado.')]
G = [('Contacto 15 dias depois da entrega', 'Está a usar? Precisa de ajuda?'),
     ('Avaliação de resultados aos 30 dias', 'Comparar com o ponto de partida do diagnóstico.'),
     ('Testemunho pedido', 'Com nome, cargo e autorização para publicar.'),
     ('Autorização para caso de cliente', 'E ficha do caso preenchida no documento de casos.'),
     ('Próximo serviço ou manutenção proposto', ''),
     ('Projeto fechado no CRM', 'Com os entregáveis arquivados na pasta do cliente.')]
cab3 = linha(campo('Cliente', 6), campo('Serviço', 6)) + linha(campo('Gestor de projeto', 6), campo('Data de início', 3), campo('Entrega prevista', 3))
r1 = pagina(SEC3, 'Checklist de onboarding', 'Checklist de onboarding do cliente',
            'O gestor de projeto segue esta lista do pagamento à avaliação de resultados. Cada passo leva a data e as iniciais de quem o fez.',
            cab3 + secao('A', 'Antes do arranque', checklist(A, 'a'), 'Do pagamento à reunião de arranque.')
            + secao('B', 'Reunião de arranque', checklist(B, 'b')), 1, 2)
r2 = pagina(SEC3, 'Checklist de onboarding', '', '',
            secao('C', 'Diagnóstico e plano', checklist(C, 'c'), 'Na primeira semana.')
            + secao('D', 'Implementação', checklist(D, 'd'), 'Repetir a cada entrega intercalar.')
            + secao('E', 'Entrega e formação', checklist(F, 'e'))
            + secao('F', 'Acompanhamento e resultados', checklist(G, 'f')), 2, 2, primeira=False)
open(os.path.join(AQUI, 'checklist-onboarding.html'), 'w').write(documento('Checklist de onboarding do cliente', [r1, r2]))
print('ok: 3 fichas em HTML')
