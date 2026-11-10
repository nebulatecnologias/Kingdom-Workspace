#!/usr/bin/env python3
"""Gera as 12 páginas de serviço (/<pilar>/<serviço>) e as 4 páginas de pilar (/<pilar>) do site DT Company,
a partir de fonte/servicos.json e fonte/areas.json.

Uso (na pasta dt-company-site):  python3 fonte/servicos.py

O cabeçalho, o rodapé e o <head> vêm de contactos.html, para ficarem iguais ao resto do site.
O conteúdo vem das fichas do Playbook de vendas da DT Company. O site não mostra preços:
cada proposta é feita à medida. Grafia anterior ao Acordo Ortográfico de 1990, como no playbook.
Regras de comunicação do playbook: organizamos, preparamos, verificamos, controlamos prazos;
nunca «acompanhamos processos», «representamos», «parecer», «consultoria fiscal» nem «garantimos».
"""
import html
import json
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
E = html.escape
DADOS = json.loads((SITE / 'fonte' / 'servicos.json').read_text(encoding='utf-8'))['servicos']
AREAS = json.loads((SITE / 'fonte' / 'areas.json').read_text(encoding='utf-8'))['areas']
ICONE = {'compliance-e-governanca': 'i-documento', 'tax': 'i-grafico', 'incorporacao': 'i-instituicao', 'consultoria-esg': 'i-equipa'}
FASES = [
    ('Diagnóstico', 'Percebemos o desafio, o contexto e o que a empresa precisa de resolver.'),
    ('Plano de trabalho', 'Definimos o âmbito, as fases, os prazos e os responsáveis, por escrito.'),
    ('Execução e entregas', 'Preparamos e entregamos a documentação, com os parceiros certificados quando é preciso.'),
    ('Entregáveis e relatório', 'Entregamos os instrumentos e um relatório factual do que foi feito e do que falta.'),
    ('Formação da equipa', 'Preparamos a sua equipa para usar o que entregámos no dia a dia.'),
    ('Controlo contínuo', 'Com a avença, controlamos prazos e obrigações depois da entrega.'),
]
SETA = '<svg aria-hidden="true"><use href="#i-seta"/></svg>'


def partes_base():
    c = (SITE / 'contactos.html').read_text(encoding='utf-8')
    antes, resto = c.split('<main id="conteudo">', 1)
    _, depois = resto.split('</main>', 1)
    return antes, depois


def proposta(texto):
    frase, _, resto = texto.partition('. ')
    return f'''<section class="serv-proposta" aria-labelledby="t-proposta">
  <div class="moldura serv-proposta-in">
    <p class="contexto" id="t-proposta">A nossa proposta</p>
    <div>
      <p class="serv-proposta-frase">{E(frase)}.</p>
      <p class="serv-proposta-resto">{E(resto)}</p>
    </div>
  </div>
</section>'''


def fronteira(s):
    parceiros = ''.join(f'<li>{E(p)}</li>' for p in s['parceiros'])
    avenca = f'''<div class="serv-avenca">
      <p class="contexto">Depois da entrega</p>
      <h2 id="t-avenca">Controlo contínuo por avença</h2>
      <p class="entrada">{E(s["avenca"].rstrip("."))}. Serve para que a empresa não volte a ficar em falta depois do mandato.</p>
    </div>''' if s.get('avenca') else ''
    return f'''<section class="seccao serv-fronteira" aria-labelledby="t-fronteira">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">Fronteiras claras</p>
      <h2 id="t-fronteira">Onde acaba o nosso trabalho</h2>
      <p class="entrada">{E(s["fronteira"])}</p>
      <ul class="serv-parceiros" aria-label="Parceiros envolvidos">{parceiros}</ul>
    </div>
    {avenca}
  </div>
</section>'''


def pagina(s, todos):
    rel = [x for x in todos if x['area_slug'] == s['area_slug'] and x['slug'] != s['slug']]
    url = f'/{s["area_slug"]}/{s["slug"]}'
    urg_t, urg_x = s['urgencia']
    dores = ''.join(f'<li>{E(d)}</li>' for d in s['dores'])
    quem = ''.join(f'<li><p>{E(q)}</p></li>' for q in s['quem'])
    entrega = ''.join(f'<li>{E(e.rstrip("."))}</li>' for e in s['entrega'])
    fases = ''.join(f'<li><span>{k:02d}</span><h3>{E(n)}</h3><p>{E(t)}</p></li>' for k, (n, t) in enumerate(FASES, 1))
    rels = ''.join(f'''<li><a href="/{r["area_slug"]}/{r["slug"]}"><span class="serv-rel-ico" aria-hidden="true"><svg><use href="#{ICONE[r["area_slug"]]}"/></svg></span><b>{E(r["nome"])}</b><span>{E(r["depois"])}</span><i>Ver o serviço {SETA}</i></a></li>''' for r in rel[:2])
    ld = {"@context": "https://schema.org", "@type": "Service", "name": s['nome'], "description": s['oque'], "serviceType": s['area'],
          "areaServed": ["MZ"], "provider": {"@type": "Organization", "name": "DT Company"}}
    main = f'''<main id="conteudo" class="pag-servico">

<section class="abertura abertura-curta" aria-labelledby="t-servico">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="211"></div>
    <div class="abertura-texto">
      <nav class="migalhas" aria-label="Caminho"><a href="/#servicos">Serviços</a><span aria-hidden="true">/</span><a href="/{s["area_slug"]}">{E(s["area"])}</a></nav>
      <h1 id="t-servico">{E(s["nome"])}</h1>
      <p class="abertura-desc">{E(s["oque"])}</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao?servico={s["slug"]}">Pedir cotação {SETA}</a>
        <a class="botao botao-contorno-claro" href="/pedido-de-cotacao?tipo=avaliacao&amp;servico={s["slug"]}">Pedir avaliação inicial</a>
      </div>
    </div>
  </div>
</section>

{proposta(s["pitch"])}

<section class="seccao serv-problema" aria-labelledby="t-problema">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O problema que resolve</p>
      <h2 id="t-problema">Reconhece alguma destas situações?</h2>
      <p class="entrada">{E(s["problema"])}</p>
    </div>
    <ul class="serv-dores">{dores}</ul>
  </div>
</section>

<section class="seccao marfim serv-quem" aria-labelledby="t-quem">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Para quem é este serviço</p>
      <h2 id="t-quem">Feito para empresas num destes momentos</h2>
    </div>
    <ul class="serv-colunas">{quem}</ul>
  </div>
</section>

<section class="seccao serv-entrega" aria-labelledby="t-entrega">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O que entregamos</p>
      <h2 id="t-entrega">O que fica na sua empresa no fim</h2>
      <p class="entrada">Cada proposta é feita à medida: o âmbito final é acordado consigo, por escrito, depois da avaliação inicial.</p>
    </div>
    <ul class="serv-entregaveis">{entrega}</ul>
  </div>
</section>

<section class="seccao marfim serv-transf" aria-labelledby="t-transf">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">A transformação</p>
      <h2 id="t-transf">Do ponto de partida ao resultado</h2>
    </div>
    <div class="serv-antes-depois">
      <div class="antes"><span>Antes</span><p>{E(s["antes"])}</p></div>
      <div class="seta-ad" aria-hidden="true">{SETA}</div>
      <div class="depois"><span>Depois</span><p>{E(s["depois"])}</p></div>
    </div>
  </div>
</section>

{fronteira(s)}

<section class="seccao marfim serv-fases" aria-labelledby="t-fases">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Como trabalhamos</p>
      <h2 id="t-fases">Do diagnóstico ao controlo contínuo</h2>
      <p class="entrada">O mesmo método em todos os serviços, com um só interlocutor e relatórios factuais em cada fase.</p>
    </div>
    <ol class="serv-fases-lista">{fases}</ol>
  </div>
</section>

<section class="seccao serv-caso so-previa" aria-labelledby="t-caso">
  <div class="moldura">
    <p class="contexto" id="t-caso">Um caso real deste serviço</p>
    <div class="caso-banner caso-banner-vazio"><span class="caso-banner-texto"><span class="caso-banner-meta">Caso por receber</span><span class="caso-banner-titulo">O banner do caso aparece aqui, com as cores e o logótipo do cliente</span><span class="caso-banner-res">Só casos reais, com autorização do cliente</span></span></div>
  </div>
</section>

<section class="seccao serv-fecho" aria-labelledby="t-fecho">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O custo de esperar</p>
      <h2 id="t-fecho">{E(urg_t)}</h2>
      <p class="entrada">{E(urg_x)}</p>
      <p class="serv-fecho-passo">Peça hoje a cotação ou a avaliação inicial e saiba por onde começar.</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao?servico={s["slug"]}">Pedir cotação {SETA}</a>
        <a class="ligacao" href="/contactos">Fale connosco {SETA}</a>
      </div>
    </div>
    <div>
      <p class="contexto">Serviços relacionados</p>
      <ul class="serv-rel">{rels}</ul>
    </div>
  </div>
</section>

</main>'''
    return url, main, ld


def pagina_area(a, todos):
    servs = [s for s in todos if s['area_slug'] == a['slug']]
    outras = [x for x in AREAS if x['slug'] != a['slug']]
    url = f'/{a["slug"]}'
    urg_t, urg_x = a['urgencia']
    cartoes = ''.join(f'''<li><a href="/{s["area_slug"]}/{s["slug"]}"><span class="area-serv-rot">{E(s["rotulo"])}</span><h3>{E(s["nome"])}</h3><p>{E(s["depois"])}</p><i>Ver o serviço {SETA}</i></a></li>''' for s in servs)
    escolher = ''.join(f'''<li><ul class="area-sinais">{"".join(f"<li>{E(d)}</li>" for d in s["dores"][:2])}</ul><a href="/{s["area_slug"]}/{s["slug"]}"><span>Precisa de</span><b>{E(s["nome"])}</b>{SETA}</a></li>''' for s in servs)
    rels = ''.join(f'''<li><a href="/{x["slug"]}"><span class="serv-rel-ico" aria-hidden="true"><svg><use href="#{ICONE[x["slug"]]}"/></svg></span><b>{E(x["nome"])}</b><span>{E(x["resumo"])}</span><i>Ver o pilar {SETA}</i></a></li>''' for x in outras)
    fases = ''.join(f'<li><span>{k:02d}</span><h3>{E(n)}</h3><p>{E(t)}</p></li>' for k, (n, t) in enumerate(FASES, 1))
    parceiros = ''.join(f'<li>{E(x)}</li>' for x in a['parceiros'])
    ld = {"@context": "https://schema.org", "@type": "Service", "name": a['nome'], "description": a['resumo'], "areaServed": ["MZ"],
          "provider": {"@type": "Organization", "name": "DT Company"},
          "hasOfferCatalog": {"@type": "OfferCatalog", "name": a['nome'], "itemListElement": [
              {"@type": "Offer", "itemOffered": {"@type": "Service", "name": s['nome']}} for s in servs]}}
    main = f'''<main id="conteudo" class="pag-servico pag-area">

<section class="abertura abertura-curta" aria-labelledby="t-area">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="211"></div>
    <div class="abertura-texto">
      <nav class="migalhas" aria-label="Caminho"><a href="/#servicos">Serviços</a></nav>
      <h1 id="t-area">{E(a["nome"])}</h1>
      <p class="abertura-desc">{E(a["resumo"])}</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao">Pedir cotação {SETA}</a>
        <a class="botao botao-contorno-claro" href="/pedido-de-cotacao?tipo=avaliacao">Pedir avaliação inicial</a>
      </div>
    </div>
  </div>
</section>

{proposta(a["pitch"])}

<section class="seccao marfim" aria-labelledby="t-servs">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Os serviços deste pilar</p>
      <h2 id="t-servs">{len(servs)} serviços, um só interlocutor</h2>
      <p class="entrada">Cada serviço resolve um desafio concreto. Quando faz sentido, juntamo-los numa só proposta.</p>
    </div>
    <ul class="area-servs">{cartoes}</ul>
  </div>
</section>

<section class="seccao" aria-labelledby="t-escolher">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Por onde começar</p>
      <h2 id="t-escolher">Reconhece alguma destas situações?</h2>
      <p class="entrada">Encontre a frase que mais se parece com o dia a dia da sua empresa. Se tiver dúvidas, a avaliação inicial indica o serviço certo.</p>
    </div>
    <ul class="area-escolher">{escolher}</ul>
  </div>
</section>

<section class="seccao marfim serv-fronteira" aria-labelledby="t-fronteira">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">Fronteiras claras</p>
      <h2 id="t-fronteira">Onde acaba o nosso trabalho</h2>
    </div>
    <div>
      <p class="entrada">{E(a["fronteira"])}</p>
      <ul class="serv-parceiros" aria-label="Parceiros envolvidos">{parceiros}</ul>
    </div>
  </div>
</section>

<section class="seccao serv-fases" aria-labelledby="t-fases">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Como trabalhamos</p>
      <h2 id="t-fases">Do diagnóstico ao controlo contínuo</h2>
      <p class="entrada">O mesmo método em todos os serviços, com um só interlocutor e relatórios factuais em cada fase.</p>
    </div>
    <ol class="serv-fases-lista">{fases}</ol>
  </div>
</section>

<section class="seccao marfim serv-fecho" aria-labelledby="t-fecho">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O custo de esperar</p>
      <h2 id="t-fecho">{E(urg_t)}</h2>
      <p class="entrada">{E(urg_x)}</p>
      <p class="serv-fecho-passo">Peça hoje a cotação ou a avaliação inicial e saiba por onde começar.</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao">Pedir cotação {SETA}</a>
        <a class="ligacao" href="/contactos">Fale connosco {SETA}</a>
      </div>
    </div>
    <div>
      <p class="contexto">Outros pilares</p>
      <ul class="serv-rel">{rels}</ul>
    </div>
  </div>
</section>

</main>'''
    return url, main, ld


def escreve(antes, depois, url, titulo, desc, ld, corpo, destino):
    cab = re.sub(r'<title>.*?</title>', f'<title>{E(titulo)}</title>', antes)
    cab = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{E(desc)}">', cab)
    if ld:
        cab = cab.replace('</head>', f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n</head>')
    destino.parent.mkdir(exist_ok=True)
    destino.write_text(cab + corpo + depois, encoding='utf-8')
    print(destino.relative_to(SITE))


def main():
    antes, depois = partes_base()
    for s in DADOS:
        url, corpo, ld = pagina(s, DADOS)
        escreve(antes, depois, url, f'{s["seo"][0]} · DT Company', s['seo'][1], ld, corpo,
                SITE / s['area_slug'] / f'{s["slug"]}.html')
    for a in AREAS:
        url, corpo, ld = pagina_area(a, DADOS)
        escreve(antes, depois, url, f'{a["seo"][0]} · DT Company', a['seo'][1], ld, corpo, SITE / f'{a["slug"]}.html')
    css_v = re.search(r'site\.css\?v=(\d+)', antes).group(1)
    print(f'{len(DADOS)} páginas de serviço e {len(AREAS)} de pilar (site.css?v={css_v})')


if __name__ == '__main__':
    main()
