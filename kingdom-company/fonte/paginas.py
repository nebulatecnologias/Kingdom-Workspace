#!/usr/bin/env python3
"""Gera /parceiros, /ferramentas-gratuitas, /materiais-gratuitos e um guia por material
(/materiais-gratuitos/<slug>), a partir de fonte/materiais.json e dos dados dos serviços.

Uso (na pasta kingdom-company), depois de fonte/servicos.py e antes de fonte/seo.py:
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


# ---------- Parceiros ----------

def pagina_parceiros():
    certs = ['Google', 'Anthropic', 'Semrush', 'Wix', 'Universidade Rock Content']
    tipos = [
        ('i-equipa', 'Indicar clientes', 'Conhece uma empresa que precisa de organizar-se, de se apresentar melhor ou de vender mais? Apresente-nos. Tratamos o contacto com o mesmo cuidado com que trataríamos um cliente seu.'),
        ('i-foguete', 'Especialistas e fornecedores', 'Fotógrafos, realizadores, designers, programadores, consultores e outros profissionais que queiram trabalhar connosco em projetos de clientes.'),
        ('i-instituicao', 'Parcerias institucionais', 'Associações empresariais, câmaras de comércio, incubadoras e instituições que queiram levar formação, diagnóstico ou apoio aos seus membros.'),
    ]
    cartoes = ''.join(f'<li><span class="serv-rel-ico" aria-hidden="true"><svg><use href="#{i}"/></svg></span><h3>{E(t)}</h3><p>{E(x)}</p></li>' for i, t, x in tipos)
    main = f'''<main id="conteudo" class="pag-servico pag-parceiros">

{abertura('t-parceiros', 'Parceiros', 'A Kingdom Company faz parte de um grupo com base na África do Sul e trabalha com uma rede de parceiros, para levar a cada cliente mais do que uma empresa sozinha conseguiria.')}

<section class="seccao" aria-labelledby="t-grupo">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O nosso grupo</p>
      <h2 id="t-grupo">Membro da SDG (Pty) Ltd</h2>
    </div>
    <div class="parc-texto">
      <p class="entrada">A SDG (Pty) Ltd é um grupo de empresas de negócios, educação e tecnologia, com sede em Midrand, na África do Sul.</p>
      <p>Através do grupo e de parceiros de negócios internacionais, reunimos uma base de conhecimento nacional e regional. Acompanhamos o que muda em cada setor e damos aos clientes acesso às tendências do seu mercado a tempo de decidir primeiro.</p>
    </div>
  </div>
</section>

<section class="seccao marfim" aria-labelledby="t-segmentos">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Os nossos segmentos</p>
      <h2 id="t-segmentos">Formação para as pessoas, ao lado do trabalho com as empresas</h2>
      <p class="entrada">Além da Kingdom Company, o grupo tem dois segmentos dedicados às pessoas, para dar direção, estrutura e método em todas as fases da jornada empreendedora.</p>
    </div>
    <ul class="area-servs parc-segmentos">
      <li><a href="https://academy.kingdomcompny.com" rel="noopener"><span class="area-serv-rot">Para quem está a começar</span><h3>Kingdom Academy</h3><p>Plataforma de educação online com cursos e livros de marketing, vendas e inteligência artificial, para aprender ao seu ritmo e dar os primeiros passos com método.</p><i>Visitar a Kingdom Academy {SETA}</i></a></li>
      <li><a href="https://training.kingdomcompny.com" rel="noopener"><span class="area-serv-rot">Para líderes e equipas</span><h3>Kingdom Training</h3><p>Programas de desenvolvimento pessoal e profissional que fortalecem a mentalidade, a inteligência emocional e a performance de líderes e equipas, com formação prática em vendas, atendimento e gestão.</p><i>Visitar o Kingdom Training {SETA}</i></a></li>
    </ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-certs">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">Certificações da equipa</p>
      <h2 id="t-certs">Cinco certificações internacionais</h2>
      <p class="entrada">A nossa equipa tem certificações internacionais em marketing, inteligência artificial e vendas.</p>
    </div>
    <ul class="parc-certs">{''.join(f'<li>{E(c)}</li>' for c in certs)}</ul>
  </div>
</section>

<section class="seccao marfim" aria-labelledby="t-ser">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Seja nosso parceiro</p>
      <h2 id="t-ser">Três formas de trabalharmos juntos</h2>
      <p class="entrada">Procuramos parceiros que partilhem o nosso cuidado com o cliente e com a qualidade do trabalho.</p>
    </div>
    <ul class="parc-tipos">{cartoes}</ul>
    <div class="ajuda">
      <p><strong>Quer ser parceiro?</strong> Escreva-nos a dizer quem é e como gostaria de colaborar.</p>
      <a class="botao botao-acao" href="mailto:contact@kingdomcompany.co.za?subject=Parceria%20com%20a%20Kingdom%20Company">Propor uma parceria {SETA}</a>
    </div>
  </div>
</section>

</main>'''
    return main


# ---------- Ferramentas gratuitas ----------

def pagina_ferramentas():
    sinais = ''.join(
        f'<li><label><input type="checkbox" name="dor" value="{s["area_slug"]}/{s["slug"]}" data-area="{s["area_slug"]}"><span>{E(s["dores"][0])}</span></label></li>'
        for s in DADOS)
    nomes = {f'{s["area_slug"]}/{s["slug"]}': s['nome'] for s in DADOS}
    areas = {a['slug']: a['nome'] for a in AREAS}
    dados = json.dumps({'servicos': nomes, 'areas': areas}, ensure_ascii=False).replace('</', '<\\/')
    main = f'''<main id="conteudo" class="pag-servico pag-ferramentas">

{abertura('t-ferr', 'Ferramentas gratuitas', 'Um diagnóstico para saber por onde começar e duas calculadoras de gestão e marketing. Sem registo: os valores que escreve ficam no seu navegador.')}

<nav class="moldura ferr-indice" aria-label="Ferramentas nesta página">
  <a href="#diagnostico"><span>01</span>Diagnóstico: por onde começar</a>
  <a href="#equilibrio"><span>02</span>Ponto de equilíbrio</a>
  <a href="#campanhas"><span>03</span>Retorno de uma campanha</a>
</nav>

<section class="seccao ferr" id="diagnostico" aria-labelledby="t-diag">
  <div class="moldura ferr-duas">
    <div class="ferr-cabeca">
      <p class="contexto">Ferramenta 01</p>
      <h2 id="t-diag">Diagnóstico: por onde começar</h2>
      <p class="entrada">Marque as frases que descrevem a sua empresa hoje. O diagnóstico mostra a área e os serviços que respondem a esses desafios.</p>
    </div>
    <form class="ferr-caixa" data-diagnostico novalidate>
      <fieldset><legend>O que acontece na sua empresa?</legend><ul class="diag-lista">{sinais}</ul></fieldset>
      <div class="ferr-resultado" data-diag-resultado aria-live="polite"><p class="ferr-vazio">Marque pelo menos uma frase para ver o resultado.</p></div>
    </form>
  </div>
  <script type="application/json" id="diag-dados">{dados}</script>
</section>

<section class="seccao marfim ferr" id="equilibrio" aria-labelledby="t-equi">
  <div class="moldura ferr-duas">
    <div class="ferr-cabeca">
      <p class="contexto">Ferramenta 02</p>
      <h2 id="t-equi">Calculadora do ponto de equilíbrio</h2>
      <p class="entrada">Quanto tem de vender por mês para cobrir todos os custos? Abaixo deste valor a empresa perde dinheiro; acima, começa a lucrar.</p>
      <p class="ferr-nota">Custos fixos são os que paga mesmo sem vender: renda, salários, internet, contabilidade. O custo variável é o que gasta por cada unidade vendida: matéria-prima, comissões, transporte.</p>
    </div>
    <form class="ferr-caixa" data-equilibrio novalidate>
      <div class="cot-campo"><label for="e-fixos">Custos fixos por mês (MT)</label><input id="e-fixos" type="text" inputmode="decimal" placeholder="Por exemplo: 250 000" autocomplete="off"></div>
      <div class="cot-linha">
        <div class="cot-campo"><label for="e-preco">Preço de venda por unidade (MT)</label><input id="e-preco" type="text" inputmode="decimal" placeholder="Por exemplo: 1 500" autocomplete="off"></div>
        <div class="cot-campo"><label for="e-var">Custo variável por unidade (MT)</label><input id="e-var" type="text" inputmode="decimal" placeholder="Por exemplo: 900" autocomplete="off"></div>
      </div>
      <div class="ferr-resultado" data-equi-resultado aria-live="polite"><p class="ferr-vazio">Preencha os três valores para ver o resultado.</p></div>
    </form>
  </div>
</section>

<section class="seccao ferr" id="campanhas" aria-labelledby="t-camp">
  <div class="moldura ferr-duas">
    <div class="ferr-cabeca">
      <p class="contexto">Ferramenta 03</p>
      <h2 id="t-camp">Calculadora do retorno de uma campanha</h2>
      <p class="entrada">Antes de investir em anúncios, veja quantos clientes precisa de conseguir e quanto lhe custa cada um.</p>
      <p class="ferr-nota">Use os números das suas campanhas anteriores. Se ainda não os tem, comece com estimativas prudentes e corrija depois da primeira campanha.</p>
    </div>
    <form class="ferr-caixa" data-campanha novalidate>
      <div class="cot-linha">
        <div class="cot-campo"><label for="c-invest">Investimento em anúncios (MT)</label><input id="c-invest" type="text" inputmode="decimal" placeholder="Por exemplo: 30 000" autocomplete="off"></div>
        <div class="cot-campo"><label for="c-cpc">Custo por clique (MT)</label><input id="c-cpc" type="text" inputmode="decimal" placeholder="Por exemplo: 15" autocomplete="off"></div>
      </div>
      <div class="cot-linha">
        <div class="cot-campo"><label for="c-conv">Visitas que pedem contacto (%)</label><input id="c-conv" type="text" inputmode="decimal" placeholder="Por exemplo: 3" autocomplete="off"></div>
        <div class="cot-campo"><label for="c-fecho">Contactos que compram (%)</label><input id="c-fecho" type="text" inputmode="decimal" placeholder="Por exemplo: 20" autocomplete="off"></div>
      </div>
      <div class="cot-campo"><label for="c-valor">Valor médio de cada venda (MT)</label><input id="c-valor" type="text" inputmode="decimal" placeholder="Por exemplo: 12 000" autocomplete="off"></div>
      <div class="ferr-resultado" data-camp-resultado aria-live="polite"><p class="ferr-vazio">Preencha os cinco valores para ver o resultado.</p></div>
    </form>
  </div>
</section>

{fecho('Quer números de verdade, não estimativas?', 'Fazemos o diagnóstico completo da sua empresa e um plano com indicadores para medir o progresso.')}

</main>'''
    return main


# ---------- Materiais gratuitos ----------

def pagina_materiais():
    itens = ''.join(f'''<li><a href="/materiais-gratuitos/{m["slug"]}"><span class="area-serv-rot">{E(m["tipo"])} · {sum(len(g[1]) for g in m["grupos"])} pontos</span><h3>{E(m["titulo"])}</h3><p>{E(m["resumo"])}</p><i>Abrir o {m["tipo"].lower()} {SETA}</i></a></li>''' for m in MATERIAIS)
    main = f'''<main id="conteudo" class="pag-servico pag-materiais">

{abertura('t-mat', 'Materiais gratuitos', 'Guias e checklists para preparar os documentos mais importantes da sua empresa. Abra, use no ecrã ou guarde em PDF, sem registo.')}

<section class="seccao marfim" aria-labelledby="t-mat-lista">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Para usar já</p>
      <h2 id="t-mat-lista">{len(MATERIAIS)} materiais para os documentos que decidem negócios</h2>
    </div>
    <ul class="area-servs">{itens}</ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-mat-mais">
  <div class="moldura">
    <div class="ajuda">
      <p><strong>Quer saber quando sair um material novo?</strong> Subscreva a newsletter na página inicial ou leia o blog.</p>
      <a class="botao botao-contorno" href="/blog">Ler o blog {SETA}</a>
    </div>
  </div>
</section>

</main>'''
    return main


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
    main = f'''<main id="conteudo" class="pag-servico pag-material">

{abertura('t-material', m['titulo'], m['intro'], m['tipo'] + ' gratuito' if m['tipo'] == 'Guia' else m['tipo'] + ' gratuita', acoes)}

<section class="seccao mat-corpo" aria-label="{E(m["titulo"])}">
  <div class="moldura mat-duas">
    <div class="mat-texto">
      <p class="mat-progresso" data-mat-progresso aria-live="polite">0 de {k} pontos confirmados</p>
      {grupos}
      <p class="mat-fonte">Kingdom Company · www.kingdomcompany.co.za · {E(s["nome"])}</p>
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
    return main


def main():
    antes, depois = partes_base()
    escreve(antes, depois, '/parceiros', 'Parceiros e Grupo SDG · Kingdom Company',
            'A Kingdom Company é membro da SDG (Pty) Ltd e trabalha com o Kingdom Training, a Kingdom Academy e uma rede de parceiros. Saiba como ser parceiro.',
            None, pagina_parceiros(), SITE / 'parceiros.html')
    escreve(antes, depois, '/ferramentas-gratuitas', 'Ferramentas Gratuitas para Empresas · Kingdom Company',
            'Ferramentas gratuitas para empresas: diagnóstico do negócio, calculadora do ponto de equilíbrio e calculadora do retorno de campanhas, em meticais.',
            None, pagina_ferramentas(), SITE / 'ferramentas-gratuitas.html')
    escreve(antes, depois, '/materiais-gratuitos', 'Materiais Gratuitos: Guias e Checklists · Kingdom Company',
            'Guias e checklists gratuitos para empresas em Moçambique: proposta técnica para concursos, perfil corporativo e plano de negócios para o banco.',
            None, pagina_materiais(), SITE / 'materiais-gratuitos' / 'index.html')
    for m in MATERIAIS:
        escreve(antes, depois, f'/materiais-gratuitos/{m["slug"]}', f'{m["seo"][0]} · Kingdom Company', m['seo'][1],
                None, pagina_material(m), SITE / 'materiais-gratuitos' / f'{m["slug"]}.html')
    print(f'parceiros, ferramentas, materiais + {len(MATERIAIS)} guias')


if __name__ == '__main__':
    main()
