#!/usr/bin/env python3
"""Gera o Playbook de vendas da Kingdom Company (HTML → PDF A4 horizontal) a partir de doc.json."""
import html
import json
import re
from pathlib import Path

AQUI = Path(__file__).resolve().parent
REPO = Path('/home/user/Kingdom-Workspace')
doc = json.load(open(AQUI / 'doc.json', encoding='utf-8'))

LOGO_BRANCO = (REPO / 'docs/marca/logotipo/kingdom-company-horizontal-branco.svg').as_uri()
LOGO_INDIGO = (REPO / 'docs/marca/logotipo/kingdom-company-horizontal-simples-indigo.svg').as_uri()
LOGO_VERT = (REPO / 'docs/marca/logotipo/kingdom-company-vertical-branco.svg').as_uri()
SIMBOLO = (REPO / 'docs/marca/logotipo/kingdom-simbolo-indigo.svg').as_uri()
GLOBO = (REPO / 'kingdom-company/assets/marca/globo-luz.svg').as_uri()
GRAO = (REPO / 'kingdom-company/assets/grao.png').as_uri()


# ---------- leitura do documento ----------
def runs_html(p):
    out = ''
    for r in p['runs']:
        t = html.escape(r['t'])
        if r['b']:
            t = f'<strong>{t}</strong>'
        if r['i']:
            t = f'<em>{t}</em>'
        out += t
    return out.strip()


def texto(p):
    return ''.join(r['t'] for r in p['runs']).strip()


def cel(c):
    return [runs_html(p) for p in c if texto(p)]


def tabela(primeiro):
    for b in doc:
        if b['type'] == 'table' and texto(b['rows'][0][0][0]).startswith(primeiro):
            return b['rows']
    raise SystemExit(f'tabela não encontrada: {primeiro}')


fichas = []
area = None
for i, b in enumerate(doc):
    if b['type'] == 'p' and b['h'] == 4:
        area, nome = [x.strip() for x in texto(b).split('·', 1)]
        t = doc[i + 1]['rows']
        d = {texto(r[0][0]): r[1] for r in t[1:]}
        def lista(k):
            return [re.sub(r'^•\s*', '', x).strip() for x in cel(d[k])]
        chave5 = next(k for k in d if k.startswith('5.'))
        fichas.append({
            'area': area, 'nome': nome,
            'oque': cel(d['1. O que é?'])[0],
            'problema': cel(d['2. Que problema resolve?'])[0],
            'dores': lista('Dores identificadas'),
            'quem': lista('3. Quem tem essa dor?'),
            'antes': cel(d['4. Transformação: antes'])[0],
            'depois': cel(d['4. Transformação: depois'])[0],
            'entrega': lista(chave5),
            'validar': 'confirmar' in chave5,
            'pitch': cel(d['6. Como apresentar comercialmente?'])[0],
        })
assert len(fichas) == 12, len(fichas)

bant = tabela('Critério')
processo = tabela('Etapa')
momentos = tabela('Momento')
objecoes = tabela('Objeção')
cadencia = tabela('Dia')


def lista_depois(titulo_inicio, nth=0):
    """Itens da primeira lista/citação a seguir ao parágrafo que começa por titulo_inicio."""
    achou = 0
    for i, b in enumerate(doc):
        if b['type'] == 'p' and texto(b).startswith(titulo_inicio):
            if achou < nth:
                achou += 1
                continue
            for b2 in doc[i + 1:]:
                if b2['type'] in ('list', 'blockquote'):
                    return [' '.join(runs_html(p) for p in it) for it in b2['items']]
    raise SystemExit(f'lista não encontrada: {titulo_inicio}')


def para_de(inicio):
    for b in doc:
        if b['type'] == 'p' and texto(b).startswith(inicio):
            return runs_html(b)
    raise SystemExit(f'parágrafo não encontrado: {inicio}')


pitch30 = lista_depois('A empresa em 30 segundos')
diferenciais = lista_depois('São cinco diferenciais')
script_sdr = lista_depois('Pedido de cotação ou avaliação inicial')[0]
regras_sdr = lista_depois('Três regras para não parecer insistente')
perguntas_sdr = lista_depois('Fazer pela ordem')
ficha_passagem = lista_depois('O SDR preenche a ficha')
abertura_closer = lista_depois('Abertura (exemplo)')[0]
diag_closer = lista_depois('Perguntas de diagnóstico')
decisao_closer = lista_depois('Pedir a decisão')[0]
arranque = lista_depois('Ficha de arranque')
metodo_obj = lista_depois('Uma objeção quase nunca')
reativacao = lista_depois('Reativação')
modelos = []
for rot in ['WhatsApp · lead sem resposta', 'Email · conteúdo útil', 'WhatsApp · proposta sem decisão', 'Email · fecho', 'Chamada · retomar']:
    titulo = para_de(rot)
    modelos.append((re.sub(r'</?strong>', '', titulo).rstrip(':'), lista_depois(rot)))

E = html.escape


# ---------- componentes ----------
paginas = []
indice = []


def rodape(seccao):
    return f'<footer class="rodape"><span>Playbook de vendas · Kingdom Company</span><span>{E(seccao)}</span><span class="n"></span></footer>'


def pagina(conteudo, seccao, classe=''):
    paginas.append(f'<section class="pagina conteudo {classe}"><div class="guias"></div><header class="topo"><span class="sec">{E(seccao)}</span><img class="simb" src="{LOGO_INDIGO}" alt=""></header><div class="miolo">{conteudo}</div>{rodape(seccao)}</section>')


def capa_seccao(num, titulo, intro, itens):
    indice.append((num, titulo, len(paginas) + 1))
    li = ''.join(f'<li>{E(x)}</li>' for x in itens)
    paginas.append(f'''<section class="pagina escura capa-sec">
  <div class="luz"><i></i><i></i></div><img class="globo" src="{GLOBO}" alt="">
  <div class="capa-sec-in">
    <img class="logo-mini" src="{LOGO_BRANCO}" alt="Kingdom Company">
    <div class="num">{num}</div>
    <h1>{E(titulo)}</h1>
    <p class="intro">{intro}</p>
    <div class="nesta"><span>Nesta secção</span><ul>{li}</ul></div>
  </div>
  <footer class="rodape claro"><span>Playbook de vendas · Kingdom Company</span><span>{num} · {E(titulo)}</span><span class="n"></span></footer>
</section>''')


def lista_html(itens, classe='pontos'):
    return f'<ul class="{classe}">' + ''.join(f'<li>{x}</li>' for x in itens) + '</ul>'


def icone(x):
    return f'<span class="ico">{x}</span>'


def cabeca(titulo, lead=None, rot=None, centro=False):
    r = f'<span class="rot">{rot}</span>' if rot else ''
    l = f'<p class="lead">{lead}</p>' if lead else ''
    return f'<div class="cabeca{" centro" if centro else ""}">{r}<h2>{titulo}</h2>{l}</div>'


def grade(colunas, n=None, classe=''):
    n = n or len(colunas)
    return f'<div class="grade g{n} {classe}">' + ''.join(f'<div class="gc">{c}</div>' for c in colunas) + '</div>'


def destaque(titulo, corpo):
    """Título escuro seguido de texto cinzento, como na Stripe."""
    return f'<p class="dst"><strong>{titulo}</strong> {corpo}</p>'


# ---------- capa ----------
paginas.append(f'''<section class="pagina escura capa">
  <div class="luz"><i></i><i></i><i></i></div>
  <img class="globo grande" src="{GLOBO}" alt="">
  <img class="logo" src="{LOGO_BRANCO}" alt="Kingdom Company">
  <div class="capa-txt">
    <span class="selo">Uso interno · Equipa comercial</span>
    <h1>Playbook<br>de vendas</h1>
    <p>Guia de abordagem, qualificação e conversão comercial para o SDR e o Closer.</p>
    <span class="meta">Versão 1.2 · Novembro de 2026</span>
  </div>
</section>''')
paginas.append('__COMO__')
paginas.append('__INDICE__')

# ---------- 01 ----------
capa_seccao('01', 'Quem somos',
            'Antes de vender um serviço, o vendedor vende a empresa. Aqui está a apresentação de 30 segundos e os cinco diferenciais que valem para todos os serviços.',
            ['A empresa em 30 segundos', 'Porque escolher a Kingdom Company'])
pagina(f'''{cabeca('A empresa em 30 segundos', rot='01 · Quem somos', centro=True)}
<blockquote class="citacao">«{pitch30[0]}»</blockquote>
<p class="cit-apoio">{pitch30[1]}</p>''', '01 · Quem somos', 'pag-centro')
difs = []
icons = ['◎', '⇄', '◍', '✓', '▣']
for k, d in enumerate(diferenciais, 1):
    m = re.match(r'<strong>(.*?)</strong>\s*(.*)', d)
    t, corpo = (m.group(1), m.group(2)) if m else ('', d)
    difs.append(f'{icone(f"0{k}")}{destaque(t, corpo)}')
pagina(f'''{cabeca('Porque escolher a Kingdom Company', 'Cinco diferenciais que valem para todos os serviços.', centro=True)}
{grade(difs[:3])}{grade(difs[3:] + [''], 3, 'sem-topo')}''', '01 · Quem somos')

# ---------- 02 ----------
capa_seccao('02', 'O que vendemos',
            'Doze serviços em quatro áreas, cada um com uma ficha em seis partes. O vendedor usa as dores para reconhecer o cliente: quando o ouve descrever uma delas, sabe que serviço apresentar.',
            ['Mapa dos 12 serviços', 'Regra: não vender características', 'As 12 fichas comerciais'])
areas = {}
for k, f in enumerate(fichas):
    areas.setdefault(f['area'], []).append((k, f['nome']))
cols = []
for a, ss in areas.items():
    cols.append(f'<h4 class="gt">{E(a)}</h4><ol class="servs">' + ''.join(f'<li><span>{k+1:02d}</span>{E(n)}</li>' for k, n in ss) + '</ol>')
pagina(f'''{cabeca('Doze serviços, quatro áreas', 'Cada ficha tem seis partes: o que é, que problema resolve, quem tem essa dor, a transformação, o que entregamos e como apresentar comercialmente.', centro=True)}
{grade(cols)}
<div class="regra-l"><span class="rot">Regra</span>{destaque('Não vender características.', 'Cada característica liga-se a um problema e a um resultado. Por exemplo: «o perfil vem em PDF, PPTX e DOCX» (característica) → «a sua equipa adapta-o a cada proposta sem pedir a um designer» (resultado).')}<p class="nota">Os entregáveis marcados <span class="tag">a validar</span> aguardam confirmação da direção.</p></div>''', '02 · O que vendemos')

for k, f in enumerate(fichas, 1):
    tag = ' <span class="tag">a validar</span>' if f['validar'] else ''
    sec = f'02 · Ficha {k:02d} · {f["nome"]}'
    # página A: o serviço e o cliente
    pagina(f'''<div class="ficha-cab"><span class="rot">{E(f['area'])} · Ficha {k:02d} de {len(fichas)}</span><h2>{E(f['nome'])}</h2></div>
{grade([f'{icone("1")}<h4 class="gt">O que é?</h4><p class="cz">{f["oque"]}</p>',
        f'{icone("2")}<h4 class="gt">Que problema resolve?</h4><p class="cz">{f["problema"]}</p>'], 2, 'grande')}
{grade([f'<span class="ico alerta">!</span><h4 class="gt">Dores identificadas</h4>{lista_html(f["dores"], "dores")}',
        f'{icone("3")}<h4 class="gt">Quem tem essa dor?</h4>{lista_html(f["quem"])}'], 2, 'sem-topo')}''', sec)
    # página B: a solução e como vender
    pagina(f'''<div class="ficha-cab"><span class="rot">{E(f['area'])} · Ficha {k:02d} de {len(fichas)}</span><h2>{E(f['nome'])}</h2></div>
{grade([f'{icone("4")}<h4 class="gt">Qual é a transformação?</h4><div class="ad"><p class="antes"><span>Antes</span>{f["antes"]}</p><p class="depois"><span>Depois</span>{f["depois"]}</p></div>',
        f'{icone("5")}<h4 class="gt">O que entregamos?{tag}</h4>{lista_html(f["entrega"], "checks")}'], 2, 'grande')}
<div class="pitch"><blockquote class="citacao media">«{re.sub(r"^«|»$", "", f["pitch"])}»</blockquote><p class="cit-autor"><strong>6 · Como apresentar comercialmente.</strong> Dizer por palavras próprias, ligado à dor que o cliente descreveu.</p></div>''', sec)

# ---------- 03 ----------
capa_seccao('03', 'Como qualificamos',
            'Cada serviço tem o seu cliente ideal, descrito na ficha. A qualificação é igual para todos: o método BANT, com quatro critérios que o vendedor confirma antes de passar a oportunidade ao Closer.',
            ['Os quatro critérios BANT', 'Perguntas e sinais de alerta', 'Regra de passagem'])
cols = []
for r in bant[1:]:
    nome = re.sub(r'<.*?>', '', ' '.join(cel(r[0])))
    m = re.match(r'(\w)\s*·\s*(\w+)\s*\((\w+)\)', nome)
    letra, pt, en = m.groups() if m else (nome[:1], nome, '')
    perg = re.split(r'(?<=\?)\s+', ' '.join(cel(r[2])))
    cols.append(f'''{icone(letra)}<h4 class="gt">{pt} <small>{en}</small></h4>
<p class="cz">{' '.join(cel(r[1]))}</p>
<span class="mini">Perguntas</span>{lista_html(perg, 'perg')}
<span class="mini ok">Cumprido quando</span><p class="cz">{' '.join(cel(r[3]))}</p>
<span class="mini alerta">Sinal de alerta</span><p class="cz">{' '.join(cel(r[4]))}</p>''')
regra = (lambda x: x[:1].upper() + x[1:])(para_de('Regra de passagem').split('</strong>', 1)[1].strip())
pagina(f'''{cabeca('Método BANT', para_de('Cada serviço tem o seu cliente ideal'), centro=True)}
{grade(cols)}''', '03 · Como qualificamos')
pagina(f'''{cabeca('Regra de passagem', rot='03 · Como qualificamos', centro=True)}
{grade([f'<div class="bl">N</div><h4 class="gt">Necessidade</h4><p class="cz obr">Obrigatório</p>', f'<div class="bl">A</div><h4 class="gt">Autoridade</h4><p class="cz obr">Obrigatório</p>', f'<div class="bl">B</div><h4 class="gt">Orçamento</h4><p class="cz obr">Obrigatório</p>', f'<div class="bl leve">T</div><h4 class="gt">Prazo</h4><p class="cz">Define a prioridade</p>'], 4, 'centrada')}
<blockquote class="citacao media">{regra}</blockquote>''', '03 · Como qualificamos', 'pag-centro')

# ---------- 04 ----------
capa_seccao('04', 'Processo comercial',
            'Sete etapas, duas funções: o SDR conduz as três primeiras e o Closer as quatro seguintes. Cada oportunidade tem sempre um responsável com nome e um canal: chamada, videoconferência ou WhatsApp.',
            ['As sete etapas', 'Responsabilidades e prazos', 'Estados da oportunidade no CRM'])
def et(r):
    return f'<span class="et-n">{E(texto(r[0][0]).split(".")[0])}</span><h4 class="gt">{E(texto(r[0][0]).split(". ", 1)[1])}</h4><p class="cz">{E(texto(r[2][0]))}</p>'
estados = ['Novo', 'Em qualificação', 'Reunião marcada', 'Diagnóstico feito', 'Proposta enviada', 'Em negociação', 'Ganho ou Perdido']
pagina(f'''{cabeca('As sete etapas', para_de('A passagem do SDR para o Closer'), centro=True)}
<div class="faixa"><span class="papel">SDR</span>{grade([et(r) for r in processo[1:4]] + ['<p class="passa">Ficha de passagem no CRM →</p>'], 4)}</div>
<div class="faixa"><span class="papel cl">Closer</span>{grade([et(r) for r in processo[4:8]], 4, 'sem-topo')}</div>
<div class="estados"><span class="rot">Estados da oportunidade no CRM</span><p>{' <i>→</i> '.join(E(s) for s in estados)}</p><p class="nota">{para_de('Os estados laterais')}</p></div>''', '04 · Processo comercial')
for parte, rows in (('1 a 4', processo[1:5]), ('5 a 7', processo[5:8])):
    linhas = ''.join('<tr>' + ''.join(f'<td>{" ".join(cel(c))}</td>' for c in r) + '</tr>' for r in rows)
    pagina(f'''{cabeca(f'Responsabilidades e prazos · etapas {parte}', 'Cada etapa tem objetivo, execução e critério de conclusão. Só se avança quando o critério está cumprido.', centro=True)}
<table class="tab tab-proc"><thead><tr>{''.join(f'<th>{" ".join(cel(c))}</th>' for c in processo[0])}</tr></thead><tbody>{linhas}</tbody></table>''', '04 · Processo comercial')

# ---------- 05 ----------
capa_seccao('05', 'Guia do SDR',
            'O SDR não vende serviços: vende a reunião com o Closer. Tem três tarefas, por esta ordem: abrir a conversa, qualificar e passar a oportunidade sem perder informação.',
            ['A. Primeiro contacto', 'B. Perguntas de qualificação', 'C. Critérios de qualificação', 'D. Ficha de passagem ao Closer'])
pagina(f'''{cabeca('A · Primeiro contacto', rot='05 · Guia do SDR', centro=True)}
<blockquote class="citacao media">«{script_sdr}»</blockquote>
<p class="cit-autor"><strong>Pedido de cotação ou avaliação inicial.</strong> Guião de abertura do SDR.</p>
{grade([destaque('Objetivo.', 'Conseguir 10 minutos de conversa.'), destaque('Conclusão.', 'O cliente responde a pelo menos duas perguntas de qualificação.'), destaque('Se pedir o preço logo no início,', para_de('Se o cliente pedir o preço').split('início, ', 1)[1])], 3)}
{grade([f'{icone(str(k))}{destaque(x, "")}' for k, x in enumerate(regras_sdr, 1)], 3, 'sem-topo')}''', '05 · Guia do SDR', 'pag-centro')
pq = []
for q in perguntas_sdr:
    m = re.match(r'(.*?)\s*<em>\((.*?)\)</em>', q)
    pq.append(f'<li>{m.group(1)}<small>{m.group(2)}</small></li>' if m else f'<li>{q}</li>')
pagina(f'''{cabeca('B · Perguntas de qualificação', para_de('Fazer pela ordem'), centro=True)}
<div class="duas-col"><ol class="pergs">{''.join(pq[:5])}</ol><ol class="pergs" start="6" style="counter-reset: q 5">{''.join(pq[5:])}</ol></div>''', '05 · Guia do SDR')
pagina(f'''{cabeca('C · Critérios de qualificação', para_de('O SDR usa o método BANT'), centro=True)}
{grade([f'<div class="bl">N</div><h4 class="gt">Necessidade</h4><p class="cz obr">Obrigatório</p>', f'<div class="bl">A</div><h4 class="gt">Autoridade</h4><p class="cz obr">Obrigatório</p>', f'<div class="bl">B</div><h4 class="gt">Orçamento</h4><p class="cz obr">Obrigatório</p>', f'<div class="bl leve">T</div><h4 class="gt">Prazo</h4><p class="cz">Define a prioridade</p>'], 4, 'centrada')}''', '05 · Guia do SDR', 'pag-centro')
pagina(f'''{cabeca('D · Ficha de passagem ao Closer', para_de('O SDR preenche a ficha'), centro=True)}
<div class="duas-col">{lista_html(ficha_passagem[:5], 'caixas')}{lista_html(ficha_passagem[5:], 'caixas')}</div>''', '05 · Guia do SDR')

# ---------- 06 ----------
capa_seccao('06', 'Guia do Closer',
            'O Closer conduz uma reunião de 45 a 60 minutos em cinco momentos e fala menos de metade do tempo até apresentar a solução. Antes de entrar, lê a ficha de passagem e prepara duas hipóteses de serviço.',
            ['Os cinco momentos da reunião', 'Guiões de abertura e de fecho', 'Perguntas de diagnóstico', 'Ficha de arranque'])
cols = []
for k, r in enumerate(momentos[1:], 1):
    c = [' '.join(cel(x)) for x in r]
    cols.append(f'<span class="et-n">{k}</span><h4 class="gt">{c[0].split(". ", 1)[-1]} <small>{c[1]}</small></h4><span class="mini">Objetivo</span><p class="cz">{c[2]}</p><span class="mini">Execução</span><p class="cz">{c[3]}</p><span class="mini ok">Avança quando</span><p class="cz">{c[4]}</p>')
pagina(f'''{cabeca('Os cinco momentos da reunião', para_de('O Closer conduz uma reunião'), centro=True)}
{grade(cols, 5)}''', '06 · Guia do Closer')
pagina(f'''{cabeca('Abrir e fechar a reunião', rot='06 · Guia do Closer', centro=True)}
<blockquote class="citacao media">«{abertura_closer}»</blockquote><p class="cit-autor"><strong>Abertura.</strong> Criar confiança e controlar a agenda.</p>
<blockquote class="citacao media lar">«{decisao_closer}»</blockquote><p class="cit-autor"><strong>Pedir a decisão.</strong> Sair sempre com uma decisão ou uma data.</p>''', '06 · Guia do Closer', 'pag-centro')
pagina(f'''{cabeca('Diagnóstico e passagem à entrega', rot='06 · Guia do Closer', centro=True)}
{grade([f'<h4 class="gt">Perguntas de diagnóstico</h4><ol class="pergs">{"".join(f"<li>{q}</li>" for q in diag_closer)}</ol>',
        f'<h4 class="gt">Ficha de arranque · passagem à entrega</h4>{lista_html([re.sub(r"[;.]$", "", x).capitalize() for x in arranque], "caixas")}'], 2)}''', '06 · Guia do Closer')

# ---------- 07 ----------
capa_seccao('07', 'Tratamento de objeções',
            'Uma objeção quase nunca é a razão verdadeira. O vendedor reconhece o que o cliente disse, faz a pergunta que revela a razão real e só depois responde. As respostas são direções, não textos para decorar.',
            ['O método em três passos', 'Biblioteca de 10 objeções'])
pagina(f'''{cabeca('O método em três passos', 'Uma objeção quase nunca é a razão verdadeira. As respostas das páginas seguintes são direções, não textos para decorar.', centro=True)}
{grade([f'{icone(str(k))}{destaque(x, "")}' for k, x in enumerate(metodo_obj, 1)], 3, 'centrada')}''', '07 · Tratamento de objeções', 'pag-centro')
for a in range(1, len(objecoes), 5):
    rows = objecoes[a:a + 5]
    tab = '<table class="tab tab-obj"><thead><tr>' + ''.join(f'<th>{" ".join(cel(c))}</th>' for c in objecoes[0]) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join(f'<td>{" ".join(cel(c))}</td>' for c in r) + '</tr>' for r in rows) + '</tbody></table>'
    pagina(f'''{cabeca(f'Objeções {a} a {a + len(rows) - 1}', centro=True)}{tab}''', '07 · Tratamento de objeções')

# ---------- 08 ----------
capa_seccao('08', 'Follow-up e recuperação',
            'Cada oportunidade tem seis tentativas em 30 dias, alternando os canais. Sem resposta depois da sexta, passa a Perdido com o motivo «sem resposta» e entra na reativação aos 90 dias.',
            ['Cadência de 30 dias', 'Modelos de mensagem', 'Reativação'])
cols = []
for r in cadencia[1:]:
    c = [' '.join(cel(x)) for x in r]
    cols.append(f'<div class="dd">Dia {c[0]}</div><span class="canal">{c[1]}</span><span class="mini">SDR · lead sem resposta</span><p class="cz">{c[2]}</p><span class="mini">Closer · proposta sem decisão</span><p class="cz">{c[3]}</p>')
pagina(f'''{cabeca('Cadência de 30 dias', para_de('Cada oportunidade tem 6 tentativas'), centro=True)}
{grade(cols, 6)}''', '08 · Follow-up e recuperação')
for grupo in (modelos[:3], modelos[3:]):
    cols = []
    for t, ps in grupo:
        canal = t.split('·')[0].strip()
        cols.append(f'<span class="mcanal {canal.lower()}">{E(canal)}</span><h4 class="gt">{E(t.split("·", 1)[1].strip())}</h4>' + ''.join(f'<p class="cz msg">{p}</p>' for p in ps))
    pagina(f'''{cabeca('Modelos de mensagem', 'Adaptar os campos entre parênteses retos. O tom é sempre curto, direto e com uma pergunta no fim.', centro=True)}
{grade(cols, 3)}''', '08 · Follow-up e recuperação')
pagina(f'''{cabeca('Reativação', rot='08 · Follow-up e recuperação', centro=True)}
{grade([destaque('Aos 90 dias.', reativacao[0].split(', ', 1)[1] if ', ' in reativacao[0] else reativacao[0]), destaque('Clientes ganhos.', reativacao[1].split(': ', 1)[1] if ': ' in reativacao[1] else reativacao[1])], 2)}''', '08 · Follow-up e recuperação', 'pag-centro')

# ---------- contracapa ----------
paginas.append(f'''<section class="pagina escura contracapa">
  <div class="luz"><i></i><i></i></div><img class="globo grande" src="{GLOBO}" alt="">
  <div class="cc-in">
    <img class="logo-v" src="{LOGO_VERT}" alt="Kingdom Company">
    <p class="slogan">Um único lugar. Tudo o que precisa para desenvolver o seu negócio.</p>
    <div class="contactos"><span>contact@kingdomcompany.co.za</span><span>+258 87 664 1836 · +258 85 1800 920</span><span>Edifício Millenium Park, Av. Vladimir Lenine, n.º 174, Maputo</span><span>www.kingdomcompany.co.za</span></div>
    <p class="interno">Documento de uso interno da equipa comercial. Não distribuir fora da Kingdom Company.</p>
  </div>
</section>''')

# ---------- como usar e índice ----------
sdrc = tabela('Secção')
quem = ''.join('<tr>' + ''.join(f'<td>{" ".join(cel(c))}</td>' for c in r) + '</tr>' for r in sdrc[1:])
def secao_pag(conteudo, seccao, classe=''):
    return f'<section class="pagina conteudo {classe}"><div class="guias"></div><header class="topo"><span class="sec">{E(seccao)}</span><img class="simb" src="{LOGO_INDIGO}" alt=""></header><div class="miolo">{conteudo}</div>{rodape(seccao)}</section>'
como = secao_pag(f'''{cabeca('Como usar este playbook', para_de('Um só playbook'), centro=True)}
{grade([f'{icone("1")}{destaque("Objetivo.", "O que tem de conseguir em cada etapa.")}', f'{icone("2")}{destaque("Execução.", "O que fazer, perguntar ou dizer.")}', f'{icone("3")}{destaque("Critério de conclusão.", "Como saber que pode avançar.")}'], 3)}
<table class="tab tab-quem"><thead><tr><th>Secção</th><th>SDR</th><th>Closer</th></tr></thead><tbody>{quem}</tbody></table>
<p class="nota centro">Fica de fora, por não ser essencial para vender: história da empresa, teoria de vendas, guiões para decorar, o Business Advising com o Shelton (fecha direto no site) e o treino de equipas (Kingdom Training).</p>''', 'Como usar este playbook')
idx = ''.join(f'<li><span class="in">{n}</span><span class="it">{E(t)}</span><span class="ip">{p:02d}</span></li>' for n, t, p in indice)
ind = secao_pag(f'''{cabeca('Índice', centro=True)}<ol class="indice">{idx}</ol>''', 'Índice', 'pag-centro')
paginas = [como if p == '__COMO__' else ind if p == '__INDICE__' else p for p in paginas]

css = (AQUI / 'playbook.css').read_text(encoding='utf-8').replace('__GRAO__', GRAO)
(AQUI / 'playbook.html').write_text(f'''<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>Playbook de vendas · Kingdom Company</title><style>{css}</style></head><body>{''.join(paginas)}</body></html>''', encoding='utf-8')
print('páginas:', len(paginas))
