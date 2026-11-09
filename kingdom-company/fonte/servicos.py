#!/usr/bin/env python3
"""Gera as 12 páginas de serviço (/<área>/<serviço>) a partir de fonte/servicos.json.

Uso (na pasta kingdom-company):  python3 fonte/servicos.py

O cabeçalho, o rodapé e o <head> vêm de contactos.html, para ficarem iguais ao resto do site.
O conteúdo vem das fichas do Playbook de vendas. O site não mostra preços (R36).
Os entregáveis ainda por validar e o estudo de caso só aparecem na pré-visualização (classe so-previa).
"""
import html
import json
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
E = html.escape
DADOS = json.loads((SITE / 'fonte' / 'servicos.json').read_text(encoding='utf-8'))['servicos']
ICONE = {'desenvolvimento-editorial': 'i-documento', 'consultoria-estrategica': 'i-alvo', 'assessoria': 'i-camara', 'desenvolvimento-tecnologico': 'i-codigo'}
ANCORA = {'desenvolvimento-editorial': 'area-editorial', 'consultoria-estrategica': 'area-consultoria', 'assessoria': 'area-assessoria', 'desenvolvimento-tecnologico': 'area-tecnologia'}
FASES = [
    ('Diagnóstico', 'Percebemos o desafio, o contexto e o que a empresa quer alcançar.'),
    ('Proposição de soluções', 'Propomos a solução, o âmbito e o plano, por escrito.'),
    ('Implementação', 'Executamos e entregamos o que foi acordado.'),
    ('Avaliação de resultados', 'Medimos o resultado com indicadores.'),
    ('Treinamento', 'Preparamos a sua equipa para usar o que entregámos.'),
    ('Acompanhamento', 'Acompanhamos a aplicação e os próximos passos.'),
]
SETA = '<svg aria-hidden="true"><use href="#i-seta"/></svg>'


def partes_base():
    c = (SITE / 'contactos.html').read_text(encoding='utf-8')
    antes, resto = c.split('<main id="conteudo">', 1)
    _, depois = resto.split('</main>', 1)
    return antes, depois


def pagina(s, todos):
    rel = [x for x in todos if x['area_slug'] == s['area_slug'] and x['slug'] != s['slug']]
    url = f'/{s["area_slug"]}/{s["slug"]}'
    n_ent = len(s['entrega'])
    numeros = [
        (f'{n_ent}', 'entregáveis' if not s['validar'] else 'entregáveis previstos', s['validar']),
        ('6', 'fases do método, do diagnóstico ao acompanhamento', False),
        ('+50', 'negócios atendidos', False),
        ('4', 'áreas integradas numa só equipa', False),
    ]
    num_html = ''.join(f'<li{" class=so-previa" if v else ""}><b>{n}</b><span>{E(t)}</span></li>' for n, t, v in numeros)
    if s['validar']:
        num_html += '<li class="so-nao-previa"><b>+6</b><span>anos de mercado</span></li>'
    dores = ''.join(f'<li>{E(d)}</li>' for d in s['dores'])
    quem = ''.join(f'<li><p>{E(q)}</p></li>' for q in s['quem'])
    entrega = ''.join(f'<li>{E(e.rstrip("."))}</li>' for e in s['entrega'])
    fases = ''.join(f'<li><span>{k:02d}</span><h3>{E(n)}</h3><p>{E(t)}</p></li>' for k, (n, t) in enumerate(FASES, 1))
    rels = ''.join(f'''<li><a href="/{r["area_slug"]}/{r["slug"]}"><span class="serv-rel-ico" aria-hidden="true"><svg><use href="#{ICONE[r["area_slug"]]}"/></svg></span><b>{E(r["nome"])}</b><span>{E(r["depois"])}</span><i>Ver o serviço {SETA}</i></a></li>''' for r in rel[:2])
    entrega_cls = 'seccao serv-entrega' + (' so-previa' if s['validar'] else '')
    entrega_nota = '<p class="nota-previa">Entregáveis propostos, a confirmar pela direção antes de publicar.</p>' if s['validar'] else ''
    ld = {"@context": "https://schema.org", "@type": "Service", "name": s['nome'], "description": s['oque'], "serviceType": s['area'],
          "areaServed": ["MZ", "ZA"], "provider": {"@type": "Organization", "name": "Kingdom Company", "url": "https://www.kingdomcompany.co.za"},
          "url": f"https://www.kingdomcompany.co.za{url}"}
    main = f'''<main id="conteudo" class="pag-servico">

<section class="abertura abertura-curta" aria-labelledby="t-servico">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      <nav class="migalhas" aria-label="Caminho"><a href="/#servicos">Serviços</a><span aria-hidden="true">/</span><a href="/#{ANCORA[s["area_slug"]]}">{E(s["area"])}</a></nav>
      <h1 id="t-servico">{E(s["nome"])}</h1>
      <p class="abertura-desc">{E(s["oque"])}</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao">Pedir cotação {SETA}</a>
        <a class="botao botao-contorno-claro" href="/pedido-de-cotacao">Pedir avaliação inicial</a>
      </div>
    </div>
  </div>
</section>

<section class="serv-numeros" aria-label="O serviço em números">
  <div class="moldura"><ul>{num_html}</ul></div>
</section>

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

<section class="{entrega_cls}" aria-labelledby="t-entrega">
  <div class="moldura serv-duas">
    <div>
      <p class="contexto">O que entregamos</p>
      <h2 id="t-entrega">O que fica consigo no fim</h2>
      <p class="entrada">Cada proposta é feita à medida: o âmbito final é acordado consigo depois da avaliação inicial.</p>
      {entrega_nota}
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

<section class="seccao serv-fases" aria-labelledby="t-fases">
  <div class="moldura">
    <div class="cabeca">
      <p class="contexto">Como trabalhamos</p>
      <h2 id="t-fases">Seis fases, do diagnóstico ao acompanhamento</h2>
      <p class="entrada">O mesmo método em todos os serviços, com uma só equipa e indicadores para medir o progresso.</p>
    </div>
    <ol class="serv-fases-lista">{fases}</ol>
  </div>
</section>

<section class="seccao marfim so-previa" aria-labelledby="t-caso">
  <div class="moldura">
    <div class="caso por-receber"><p class="contexto">Estudo de caso</p><h2 id="t-caso">Um caso real deste serviço</h2><p class="entrada">Desafio, solução e resultado de um cliente, com autorização para publicar.</p></div>
  </div>
</section>

<section class="seccao serv-fecho" aria-labelledby="t-fecho">
  <div class="moldura serv-duas">
    <div>
      <h2 id="t-fecho">Vamos começar?</h2>
      <p class="entrada">{E(s["pitch"])}</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao">Pedir cotação {SETA}</a>
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


def main():
    antes, depois = partes_base()
    css_v = re.search(r'site\.css\?v=(\d+)', antes).group(1)
    for s in DADOS:
        url, corpo, ld = pagina(s, DADOS)
        cab = antes
        cab = re.sub(r'<title>.*?</title>', f'<title>{E(s["nome"])} · {E(s["area"])} · Kingdom Company</title>', cab)
        cab = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{E(s["oque"])}">', cab)
        cab = cab.replace('</head>', f'<link rel="canonical" href="https://www.kingdomcompany.co.za{url}">\n<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n</head>')
        destino = SITE / s['area_slug'] / f'{s["slug"]}.html'
        destino.parent.mkdir(exist_ok=True)
        destino.write_text(cab + corpo + depois, encoding='utf-8')
        print(destino.relative_to(SITE))
    print(f'{len(DADOS)} páginas (site.css?v={css_v})')


if __name__ == '__main__':
    main()
