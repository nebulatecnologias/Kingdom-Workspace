#!/usr/bin/env python3
"""Gera /parceiros, /ferramentas-gratuitas, /materiais-gratuitos e uma página por material
(/materiais-gratuitos/<slug>), a partir de fonte/materiais.json e dos dados dos serviços.

Uso (na pasta dt-company-site), depois de fonte/servicos.py:
    python3 fonte/paginas.py
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from servicos import AREAS, DADOS, E, ICONE, SETA, SITE, escreve, partes_base  # noqa: E402

MATERIAIS = json.loads((SITE / 'fonte' / 'materiais.json').read_text(encoding='utf-8'))['materiais']
SERV = {(s['area_slug'], s['slug']): s for s in DADOS}
EMAIL = 'contact@dtcompany.co.za'


def abertura(id_, titulo, desc, contexto='', acoes=''):
    ctx = f'<p class="contexto contexto-claro">{E(contexto)}</p>' if contexto else ''
    return f'''<section class="abertura abertura-curta" aria-labelledby="{id_}">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      {ctx}
      <h1 id="{id_}">{E(titulo)}</h1>
      <p class="abertura-desc">{E(desc)}</p>
      {acoes}
    </div>
  </div>
</section>'''


def fecho(titulo, texto, servico=None):
    rel = ''
    if servico:
        s = SERV[tuple(servico)]
        rel = f'''<div>
      <p class="contexto">Quer ajuda com isto?</p>
      <ul class="serv-rel"><li><a href="/{s["area_slug"]}/{s["slug"]}"><span class="serv-rel-ico" aria-hidden="true"><svg><use href="#{ICONE[s["area_slug"]]}"/></svg></span><b>{E(s["nome"])}</b><span>{E(s["depois"])}</span><i>Ver o serviço {SETA}</i></a></li></ul>
    </div>'''
    return f'''<section class="seccao serv-fecho" aria-labelledby="t-fecho">
  <div class="moldura serv-duas">
    <div>
      <h2 id="t-fecho">{E(titulo)}</h2>
      <p class="entrada">{E(texto)}</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao{'?servico=' + servico[1] if servico else ''}">Pedir cotação {SETA}</a>
        <a class="ligacao" href="/pedido-de-cotacao?tipo=avaliacao">Pedir avaliação inicial {SETA}</a>
      </div>
    </div>
    {rel}
  </div>
</section>'''


def cartoes(tipos):
    return ''.join(f'<li><span class="serv-rel-ico" aria-hidden="true"><svg><use href="#{i}"/></svg></span><h3>{E(t)}</h3><p>{E(x)}</p></li>' for i, t, x in tipos)


# ---------- Parceiros ----------

def pagina_parceiros():
    fronteiras = [
        ('i-documento', 'Temas jurídicos e de contabilidade', 'A DT Company não presta serviços jurídicos nem de contabilidade. Quando um tema o exige, indicamo-lo por escrito e a empresa contrata directamente o profissional habilitado.'),
        ('i-codigo', 'Tecnologia da Kingdom', 'O canal de denúncia e a formação online são montados com a equipa de tecnologia da Kingdom e entregues prontos a usar no dia a dia da empresa.'),
        ('i-camara', 'Marketing e comunicação da Kingdom', 'A formação em marketing pode ser dada com a equipa de marketing e comunicação da Kingdom, com exercícios feitos sobre a marca da própria empresa.'),
    ]
    tipos = [
        ('i-equipa', 'Indicar clientes', 'Conhece uma empresa que precisa de um plano de negócios, de organizar o compliance e a governança ou de formar as suas equipas? Apresente-nos. Tratamos o contacto com o mesmo cuidado com que trataríamos um cliente seu.'),
        ('i-instituicao', 'Parcerias institucionais', 'Associações empresariais, câmaras de comércio e instituições que queiram levar aos seus membros seminários, cursos abertos ou uma avaliação inicial de estratégia, compliance ou formação.'),
    ]
    return f'''<main id="conteudo" class="pag-servico pag-parceiros">

{abertura('t-parceiros', 'Parceiros', 'Trabalhamos com quem partilha o nosso cuidado com o rigor e com o cliente. Dizemos por escrito, em cada proposta, o que fazemos e onde acaba o nosso trabalho.')}

<section class="seccao" aria-labelledby="t-rede">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Como trabalhamos</p>
      <h2 id="t-rede">Um só interlocutor, com fronteiras claras</h2>
      <p class="entrada">O cliente fala sempre com a DT Company. Parte do que entregamos é tecnologia e comunicação, montadas com as equipas da Kingdom.</p>
    </div>
    <ul class="parc-tipos">{cartoes(fronteiras)}</ul>
  </div>
</section>

<section class="seccao marfim" aria-labelledby="t-ser">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Seja nosso parceiro</p>
      <h2 id="t-ser">Duas formas de trabalharmos juntos</h2>
      <p class="entrada">Procuramos parceiros que partilhem o nosso cuidado com o rigor, com os prazos e com o cliente.</p>
    </div>
    <ul class="parc-tipos parc-tipos-2">{cartoes(tipos)}</ul>
    <div class="ajuda">
      <p><strong>Quer ser parceiro?</strong> Escreva-nos a dizer quem é e como gostaria de colaborar.</p>
      <a class="botao botao-acao" href="mailto:{EMAIL}?subject=Parceria%20com%20a%20DT%20Company">Propor uma parceria {SETA}</a>
    </div>
  </div>
</section>

</main>'''


# ---------- Ferramentas gratuitas ----------

OPCOES = [('2', 'Sim'), ('1', 'Em parte'), ('0', 'Não')]

AVALIACOES = [
    {
        'id': 'compliance', 'num': '02', 'titulo': 'Autoavaliação de compliance',
        'entrada': 'Dez perguntas para ver em que ponto está o programa de compliance da sua empresa, antes de um concurso, de um financiamento ou de um questionário de um cliente.',
        'nota': 'Responda pelo que existe hoje e está escrito, não pelo que está planeado. O resultado é uma orientação e não substitui uma avaliação.',
        'legenda': 'O que a sua empresa já tem?',
        'perguntas': [
            'Um código de conduta escrito e comunicado à equipa.',
            'Uma política anticorrupção, com regras sobre ofertas e brindes.',
            'Regras escritas sobre conflitos de interesse.',
            'Um procedimento para confirmar pedidos de mudança de NIB antes de pagar.',
            'Um canal para receber denúncias, com registo de cada caso.',
            'Um mapa dos riscos de fraude e de compliance da empresa.',
            'Verificação dos fornecedores e parceiros antes de assinar.',
            'Formação da equipa e da direcção, com registo de presenças.',
            'Uma pessoa responsável por compliance.',
            'Revisão das regras e dos controlos pelo menos uma vez por ano.',
        ],
        'faixas': [
            [80, 'Base sólida', 'A empresa tem a maior parte do programa. O passo seguinte é manter as evidências organizadas para as mostrar a clientes e financiadores sempre que pedirem.'],
            [50, 'Programa incompleto', 'Há regras e controlos, mas faltam peças que clientes e financiadores costumam pedir. Comece pelas respostas «Não» e «Em parte».'],
            [0, 'Programa por construir', 'Hoje seria difícil provar a um cliente ou financiador que a empresa actua com integridade. Um programa de compliance organiza as regras, os controlos e a formação de uma vez.'],
        ],
        'servico': ['compliance-e-governanca', 'programa-de-compliance-e-integridade'],
    },
    {
        'id': 'fornecedor', 'num': '03', 'titulo': 'Verificação rápida de um fornecedor',
        'entrada': 'Antes de assinar ou pagar, responda a oito perguntas sobre o fornecedor ou parceiro. A verificação mostra quantos pontos estão por confirmar e o nível de atenção que merecem.',
        'nota': 'Responda só com o que confirmou em documentos ou contactos, não com o que o fornecedor disse. Na dúvida, escolha «Não».',
        'legenda': 'O que já confirmou sobre o fornecedor?',
        'perguntas': [
            'A empresa está registada e activa, com o mesmo nome das facturas.',
            'Sabe quem são os donos reais, as pessoas que controlam a empresa.',
            'Nenhum dono ou administrador tem ligação a alguém da sua empresa.',
            'O fornecedor apresentou os comprovativos de situação regularizada nas Finanças e no INSS.',
            'Falou com clientes anteriores do fornecedor.',
            'A conta bancária está em nome da própria empresa.',
            'O pagamento não exige um adiantamento alto antes da primeira entrega.',
            'Há um contrato escrito com o âmbito, os prazos e as penalidades.',
        ],
        'faixas': [
            [80, 'Atenção baixa', 'Confirmou a maior parte dos pontos. Guarde os documentos no processo do fornecedor e repita a verificação quando o contrato for renovado.'],
            [50, 'Atenção média', 'Há pontos importantes por confirmar. Resolva-os antes de assinar, sobretudo os que dizem respeito aos donos e aos pagamentos.'],
            [0, 'Atenção alta', 'Ainda sabe pouco sobre quem está do outro lado. Antes de pagar, confirme os pontos em falta ou peça uma due diligence com relatório e classificação de risco.'],
        ],
        'servico': ['compliance-e-governanca', 'due-diligence-de-terceiros'],
    },
]


def avaliacao(a):
    lis = ''
    for i, p in enumerate(a['perguntas'], 1):
        ops = ''.join(f'<label><input type="radio" name="{a["id"]}-{i}" value="{v}"><span>{t}</span></label>' for v, t in OPCOES)
        lis += f'<li><fieldset><legend>{E(p)}</legend><div class="aval-opcoes">{ops}</div></fieldset></li>'
    s = SERV[tuple(a['servico'])]
    cfg = json.dumps({'faixas': a['faixas'], 'servico': s['nome'], 'url': f'/{s["area_slug"]}/{s["slug"]}', 'slug': s['slug']}, ensure_ascii=False).replace('</', '<\\/')
    fundo = ' marfim' if a['num'] == '02' else ''
    return f'''<section class="seccao{fundo} ferr" id="{a["id"]}" aria-labelledby="t-{a["id"]}">
  <div class="moldura ferr-duas">
    <div class="ferr-cabeca">
      <p class="contexto">Ferramenta {a["num"]}</p>
      <h2 id="t-{a["id"]}">{E(a["titulo"])}</h2>
      <p class="entrada">{E(a["entrada"])}</p>
      <p class="ferr-nota">{E(a["nota"])}</p>
    </div>
    <form class="ferr-caixa" data-avaliacao novalidate>
      <p class="aval-legenda">{E(a["legenda"])}</p>
      <ol class="aval-lista">{lis}</ol>
      <div class="ferr-resultado" data-aval-resultado aria-live="polite"><p class="ferr-vazio">Responda às {len(a["perguntas"])} perguntas para ver o resultado.</p></div>
      <script type="application/json" data-aval-dados>{cfg}</script>
    </form>
  </div>
</section>'''


def pagina_ferramentas():
    sinais = ''.join(
        f'<li><label><input type="checkbox" name="dor" value="{s["area_slug"]}/{s["slug"]}" data-area="{s["area_slug"]}"><span>{E(s["dores"][0])}</span></label></li>'
        for s in DADOS)
    nomes = {f'{s["area_slug"]}/{s["slug"]}': s['nome'] for s in DADOS}
    areas = {a['slug']: a['nome'] for a in AREAS}
    dados = json.dumps({'servicos': nomes, 'areas': areas}, ensure_ascii=False).replace('</', '<\\/')
    indice = '<a href="#diagnostico"><span>01</span>Diagnóstico: por onde começar</a>' + ''.join(
        f'<a href="#{a["id"]}"><span>{a["num"]}</span>{E(a["titulo"])}</a>' for a in AVALIACOES)
    return f'''<main id="conteudo" class="pag-servico pag-ferramentas">

{abertura('t-ferr', 'Ferramentas gratuitas', 'Um diagnóstico para saber por onde começar, uma autoavaliação de compliance e uma verificação rápida de fornecedores. Sem registo: as respostas ficam no seu navegador.')}

<nav class="moldura ferr-indice" aria-label="Ferramentas nesta página">
  {indice}
</nav>

<section class="seccao ferr" id="diagnostico" aria-labelledby="t-diag">
  <div class="moldura ferr-duas">
    <div class="ferr-cabeca">
      <p class="contexto">Ferramenta 01</p>
      <h2 id="t-diag">Diagnóstico: por onde começar</h2>
      <p class="entrada">Marque as frases que descrevem a sua empresa hoje. O diagnóstico mostra o pilar e os serviços que respondem a esses desafios.</p>
    </div>
    <form class="ferr-caixa" data-diagnostico novalidate>
      <fieldset><legend>O que acontece na sua empresa?</legend><ul class="diag-lista">{sinais}</ul></fieldset>
      <div class="ferr-resultado" data-diag-resultado aria-live="polite"><p class="ferr-vazio">Marque pelo menos uma frase para ver o resultado.</p></div>
    </form>
  </div>
  <script type="application/json" id="diag-dados">{dados}</script>
</section>

{''.join(avaliacao(a) for a in AVALIACOES)}

{fecho('Quer uma avaliação feita por nós?', 'Fazemos o diagnóstico completo, dizemos o que foi confirmado e o que não foi, e propomos um plano de trabalho por escrito.')}

</main>'''


# ---------- Materiais gratuitos ----------

def pagina_materiais():
    um = len(MATERIAIS) == 1
    itens = ''.join(f'''<li><a href="/materiais-gratuitos/{m["slug"]}"><span class="area-serv-rot">{E(m["tipo"])} · {sum(len(g[1]) for g in m["grupos"])} pontos</span><h3>{E(m["titulo"])}</h3><p>{E(m["resumo"])}</p><i>Abrir o {m["tipo"].lower()} {SETA}</i></a></li>''' for m in MATERIAIS)
    return f'''<main id="conteudo" class="pag-servico pag-materiais">

{abertura('t-mat', 'Materiais gratuitos', 'Checklists para organizar a empresa antes de um contrato ou de um pagamento. Abra, use no ecrã ou guarde em PDF, sem registo.')}

<section class="seccao marfim" aria-labelledby="t-mat-lista">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Para usar já</p>
      <h2 id="t-mat-lista">{'Um material' if um else f'{len(MATERIAIS)} materiais'} para os momentos que pedem documentos em ordem</h2>
      <p class="entrada">São orientações gerais. Os requisitos mudam com a actividade e com a lei: confirme as questões jurídicas com o advogado da empresa e as fiscais com o seu contabilista.</p>
    </div>
    <ul class="area-servs">{itens}</ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-mat-mais">
  <div class="moldura">
    <h2 id="t-mat-mais" class="visual-oculto">Mais materiais</h2>
    <div class="ajuda">
      <p><strong>Quer saber quando sair um material novo?</strong> Subscreva a newsletter na página inicial ou leia o blog.</p>
      <a class="botao botao-contorno" href="/blog">Ler o blog {SETA}</a>
    </div>
  </div>
</section>

</main>'''


def pagina_material(m):
    grupos = ''
    k = 0
    for nome, pontos in m['grupos']:
        lis = ''
        for p in pontos:
            k += 1
            lis += f'<li><label><input type="checkbox"><span>{E(p)}</span></label></li>'
        gid = re.sub(r'[^a-z0-9]+', '-', nome.lower().translate(str.maketrans('áàâãéêíóôõúç', 'aaaaeeiooouc'))).strip('-')
        grupos += f'<section class="mat-grupo" aria-labelledby="g-{gid}"><h2 id="g-{gid}">{E(nome)}</h2><ul class="mat-lista">{lis}</ul></section>'
    s = SERV[tuple(m['servico'])]
    acoes = f'''<div class="acoes">
        <button class="botao botao-acao" type="button" data-imprimir>Guardar em PDF ou imprimir {SETA}</button>
      </div>'''
    contexto = m['tipo'] + (' gratuito' if m['tipo'] == 'Guia' else ' gratuita')
    return f'''<main id="conteudo" class="pag-servico pag-material">

{abertura('t-material', m['titulo'], m['intro'], contexto, acoes)}

<section class="seccao mat-corpo" aria-label="{E(m["titulo"])}">
  <div class="moldura mat-duas">
    <div class="mat-texto">
      <p class="mat-progresso" data-mat-progresso aria-live="polite">0 de {k} pontos confirmados</p>
      {grupos}
      <p class="mat-fonte">DT Company · Orientação geral, a confirmar com os profissionais habilitados · {E(s["nome"])}</p>
    </div>
    <aside class="cot-lado mat-lado">
      <p class="contexto">Precisa de ajuda?</p>
      <h2 class="cot-titulo">{E(s["nome"])}</h2>
      <p class="mat-lado-texto">{E(s["pitch"].partition(". ")[0])}.</p>
      <a class="botao botao-acao" href="/pedido-de-cotacao?servico={s["slug"]}">Pedir cotação {SETA}</a>
      <a class="ligacao" href="/{s["area_slug"]}/{s["slug"]}">Ver o serviço {SETA}</a>
    </aside>
  </div>
</section>

</main>'''


def main():
    antes, depois = partes_base()
    escreve(antes, depois, '/parceiros', 'Parceiros · DT Company',
            'Como a DT Company trabalha com as equipas de tecnologia e de marketing da Kingdom, e como pode ser parceiro: indicar clientes ou criar uma parceria institucional.',
            None, pagina_parceiros(), SITE / 'parceiros.html')
    escreve(antes, depois, '/ferramentas-gratuitas', 'Ferramentas Gratuitas de Compliance · DT Company',
            'Ferramentas gratuitas para empresas em Moçambique: diagnóstico por pilar, autoavaliação de compliance e verificação rápida do risco de um fornecedor.',
            None, pagina_ferramentas(), SITE / 'ferramentas-gratuitas.html')
    escreve(antes, depois, '/materiais-gratuitos', 'Materiais Gratuitos para Empresas · DT Company',
            'Materiais gratuitos para empresas em Moçambique: checklist para verificar um fornecedor ou parceiro antes de assinar um contrato ou fazer um pagamento.',
            None, pagina_materiais(), SITE / 'materiais-gratuitos.html')
    for m in MATERIAIS:
        escreve(antes, depois, f'/materiais-gratuitos/{m["slug"]}', f'{m["seo"][0]} · DT Company', m['seo'][1],
                None, pagina_material(m), SITE / 'materiais-gratuitos' / f'{m["slug"]}.html')
    print(f'parceiros, ferramentas, materiais + {len(MATERIAIS)} material(is)')


if __name__ == '__main__':
    main()
