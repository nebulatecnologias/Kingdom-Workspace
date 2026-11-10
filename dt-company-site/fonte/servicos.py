#!/usr/bin/env python3
"""Gera as 12 páginas de serviço (/<pilar>/<serviço>), as 4 páginas de pilar (/<pilar>), o pedido de cotação,
as páginas legais (/privacidade, /termos) e a 404 do site DT Company, a partir de fonte/servicos.json,
fonte/areas.json e fonte/<página>.html.

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
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
E = html.escape
sys.path.insert(0, str(Path(__file__).resolve().parent))
from casos import seccao_servico  # noqa: E402
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

{seccao_servico(s["area_slug"], s["slug"])}

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


def pagina_cotacao(todos):
    url = '/pedido-de-cotacao'
    grupos = ''.join(f'''<optgroup label="{E(a["nome"])}">{"".join(f'<option value="{s["slug"]}">{E(s["nome"])}</option>' for s in todos if s["area_slug"] == a["slug"])}</optgroup>''' for a in AREAS)
    passos = [
        ('Recebemos o seu pedido', 'Um consultor contacta-o pelo canal que escolher, para perceber melhor o desafio.'),
        ('Conversa de diagnóstico', 'Uma reunião para perceber o problema, o impacto e a prioridade, com quem decide.'),
        ('Proposta à medida', 'Recebe por escrito o âmbito, os entregáveis, o prazo e o investimento.'),
    ]
    lista = ''.join(f'<li><span>{k:02d}</span><div><h3>{E(n)}</h3><p>{E(x)}</p></div></li>' for k, (n, x) in enumerate(passos, 1))
    ld = {"@context": "https://schema.org", "@type": "ContactPage", "name": "Pedir cotação", "url": f"https://www.kingdomcompany.co.za{url}"}
    main = f'''<main id="conteudo" class="pag-servico pag-cotacao">

<section class="abertura abertura-curta" aria-labelledby="t-cotacao">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      <h1 id="t-cotacao">Pedir cotação</h1>
      <p class="abertura-desc">Conte-nos o desafio da sua empresa. Um consultor fala consigo e preparamos uma proposta à medida.</p>
    </div>
  </div>
</section>

<section class="seccao cot-seccao" aria-label="Formulário do pedido">
  <div class="moldura cot-duas">
    <form class="cot-form" data-cotacao novalidate>
      <fieldset class="cot-tipo">
        <legend>O que pretende?</legend>
        <label><input type="radio" name="tipo" value="cotacao" checked><span><b>Pedir cotação</b><small>Já sabe o serviço de que precisa.</small></span></label>
        <label><input type="radio" name="tipo" value="avaliacao"><span><b>Pedir avaliação inicial</b><small>Quer ajuda para escolher por onde começar.</small></span></label>
      </fieldset>

      <p class="cot-legenda"><span class="cot-obrig" aria-hidden="true">*</span> Campos obrigatórios</p>
      <h2 class="cot-grupo">O seu desafio</h2>
      <div class="cot-campo">
        <label for="c-servico">Serviço</label>
        <select id="c-servico" name="servico"><option value="">Ainda não sei, quero ajuda a escolher</option>{grupos}</select>
      </div>
      <div class="cot-campo">
        <label for="c-fase">Em que fase está o negócio?</label>
        <select id="c-fase" name="fase"><option value="">Escolha uma opção</option><option>Ideia ou projecto ainda por lançar</option><option>Empresa a começar, com menos de 2 anos</option><option>Empresa estabelecida</option><option>Empresa em expansão</option><option>Empresa a reestruturar ou a reposicionar-se</option><option>Empresa estrangeira a instalar-se em Moçambique</option></select>
      </div>
      <div class="cot-campo">
        <label for="c-desafio">O que quer resolver? <span class="cot-obrig" aria-hidden="true">*</span></label>
        <textarea id="c-desafio" name="desafio" rows="5" required aria-describedby="c-desafio-ajuda c-desafio-erro" placeholder="Por exemplo: vamos concorrer a um concurso público em março e as nossas propostas técnicas perdem pontos."></textarea>
        <p class="cot-ajuda" id="c-desafio-ajuda">Duas ou três frases chegam. Diga o que quer resolver e porquê agora.</p>
        <p class="cot-erro" id="c-desafio-erro" aria-live="polite"></p>
      </div>
      <div class="cot-campo">
        <label for="c-prazo">Para quando precisa?</label>
        <select id="c-prazo" name="prazo"><option value="">Escolha uma opção</option><option>Este mês</option><option>Nos próximos 3 meses</option><option>Daqui a mais de 3 meses</option><option>Ainda sem data</option></select>
      </div>

      <h2 class="cot-grupo">Os seus dados</h2>
      <div class="cot-linha">
        <div class="cot-campo">
          <label for="c-nome">Nome <span class="cot-obrig" aria-hidden="true">*</span></label>
          <input id="c-nome" name="nome" type="text" autocomplete="name" required aria-describedby="c-nome-erro">
          <p class="cot-erro" id="c-nome-erro" aria-live="polite"></p>
        </div>
        <div class="cot-campo">
          <label for="c-cargo">Cargo</label>
          <input id="c-cargo" name="cargo" type="text" autocomplete="organization-title" placeholder="Por exemplo: diretor-geral">
        </div>
      </div>
      <div class="cot-campo">
        <label for="c-empresa">Empresa <span class="cot-obrig" aria-hidden="true">*</span></label>
        <input id="c-empresa" name="empresa" type="text" autocomplete="organization" required aria-describedby="c-empresa-erro">
        <p class="cot-erro" id="c-empresa-erro" aria-live="polite"></p>
      </div>
      <div class="cot-linha">
        <div class="cot-campo">
          <label for="c-email">Email <span class="cot-obrig" aria-hidden="true">*</span></label>
          <input id="c-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="c-email-erro">
          <p class="cot-erro" id="c-email-erro" aria-live="polite"></p>
        </div>
        <div class="cot-campo">
          <label for="c-telefone">Telefone ou WhatsApp <span class="cot-obrig" aria-hidden="true">*</span></label>
          <input id="c-telefone" name="telefone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="+258 ..." aria-describedby="c-telefone-erro">
          <p class="cot-erro" id="c-telefone-erro" aria-live="polite"></p>
        </div>
      </div>
      <fieldset class="cot-canal">
        <legend>Como prefere ser contactado?</legend>
        <label><input type="radio" name="canal" value="Chamada" checked> Chamada</label>
        <label><input type="radio" name="canal" value="WhatsApp"> WhatsApp</label>
        <label><input type="radio" name="canal" value="Email"> Email</label>
      </fieldset>

      <div class="cot-enviar">
        <button class="botao botao-acao" type="submit">Enviar pedido {SETA}</button>
        <p class="cot-nota">Usamos estes dados só para responder ao seu pedido. <a href="/privacidade">Política de privacidade</a></p>
      </div>
      <div class="cot-feito" data-cot-feito hidden tabindex="-1">
        <h2>O seu pedido está pronto a enviar</h2>
        <p>Abrimos o seu programa de email com o pedido escrito, para <a href="mailto:contacto@dtcompany.example">contacto@dtcompany.example</a>. Só falta carregar em enviar.</p>
        <p>Se o programa de email não abriu, copie o pedido e envie-o para o mesmo endereço.</p>
        <button class="botao botao-contorno" type="button" data-cot-copiar>Copiar o pedido</button>
        <p class="cot-copiado" data-cot-copiado aria-live="polite"></p>
      </div>
    </form>

    <aside class="cot-lado" aria-labelledby="t-depois">
      <p class="contexto">O que acontece a seguir</p>
      <h2 id="t-depois">Três passos até à proposta</h2>
      <ol class="cot-passos">{lista}</ol>
      <div class="cot-direto">
        <h3>Prefere falar já?</h3>
        <p><a href="mailto:contacto@dtcompany.example">contacto@dtcompany.example</a><br>Edifício Millenium Park, Av. Vladimir Lenine, n.º 174, Maputo</p>
      </div>
    </aside>
  </div>
</section>

</main>'''
    return url, main, ld


def pagina_legal(slug, titulo, desc, data):
    corpo = (SITE / 'fonte' / f'{slug}.html').read_text(encoding='utf-8')
    corpo = re.sub(r'^<!--.*?-->\n', '', corpo, flags=re.S)
    seccoes = re.findall(r'<section id="([a-z-]+)">\s*<h2>(.*?)</h2>', corpo)
    indice = ''.join(f'<li><a href="#{i}">{t}</a></li>' for i, t in seccoes)
    url = f'/{slug}'
    ld = {"@context": "https://schema.org", "@type": "WebPage", "name": titulo, "url": f"https://www.kingdomcompany.co.za{url}", "dateModified": data}
    main = f'''<main id="conteudo" class="pag-servico pag-legal">

<section class="abertura abertura-curta" aria-labelledby="t-legal">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      <h1 id="t-legal">{E(titulo)}</h1>
      <p class="abertura-desc">{E(desc)}</p>
      <p class="legal-data">Última actualização: <time datetime="{data}">{data_pt(data)}</time></p>
    </div>
  </div>
</section>

<div class="seccao legal-seccao">
  <div class="moldura legal-duas">
    <nav class="legal-indice" aria-label="Nesta página">
      <p class="contexto">Nesta página</p>
      <ol>{indice}</ol>
    </nav>
    <div class="legal-texto">
{corpo}
      <aside class="legal-duvidas">
        <h2>Tem dúvidas?</h2>
        <p>Escreva para <a href="mailto:contacto@dtcompany.example">contacto@dtcompany.example</a> e respondemos com todo o gosto.</p>
      </aside>
    </div>
  </div>
</div>

</main>'''
    return url, main, ld


def data_pt(iso):
    a, m, d = iso.split('-')
    meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
    return f'{int(d)} de {meses[int(m) - 1]} de {a}'


def pagina_404():
    main = f'''<main id="conteudo" class="pag-servico pag-404">

<section class="abertura abertura-curta" aria-labelledby="t-404">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      <p class="contexto">Erro 404</p>
      <h1 id="t-404">Esta página não existe</h1>
      <p class="abertura-desc">O endereço pode ter mudado ou ter um erro. Escolha um dos caminhos abaixo.</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/">Ir para a página inicial {SETA}</a>
        <a class="botao botao-contorno-claro" href="/pedido-de-cotacao">Pedir cotação</a>
      </div>
    </div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-404-areas">
  <div class="moldura">
    <div class="cabeca"><h2 id="t-404-areas">Os nossos pilares</h2></div>
    <ul class="serv-rel">{"".join(f'<li><a href="/{a["slug"]}"><span class="serv-rel-ico" aria-hidden="true"><svg><use href="#{ICONE[a["slug"]]}"/></svg></span><b>{E(a["nome"])}</b><span>{E(a["resumo"])}</span><i>Ver o pilar {SETA}</i></a></li>' for a in AREAS)}</ul>
  </div>
</section>

</main>'''
    return main


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
    url, corpo, _ = pagina_cotacao(DADOS)
    escreve(antes, depois, url, 'Pedir cotação · DT Company',
            'Peça uma cotação ou uma avaliação inicial à DT Company. Um consultor fala consigo e preparamos uma proposta à medida, por escrito.',
            None, corpo, SITE / 'pedido-de-cotacao.html')
    for slug, titulo, desc, seo_t, seo_d in [
        ('privacidade', 'Política de privacidade', 'Que dados recolhemos neste site, para que os usamos e como pode pedir para os ver, corrigir ou apagar.',
         'Política de Privacidade · DT Company', 'Que dados a DT Company recolhe no site, para que os usa, com quem os partilha e quais são os seus direitos.'),
        ('termos', 'Termos de utilização', 'As regras para usar o site da DT Company e os seus conteúdos.',
         'Termos de Utilização do Site · DT Company', 'Termos de utilização do site da DT Company: informação sobre os serviços, fronteiras com os parceiros, propriedade intelectual e lei aplicável.')]:
        url, corpo, _ = pagina_legal(slug, titulo, desc, '2026-11-10')
        escreve(antes, depois, url, seo_t, seo_d, None, corpo, SITE / f'{slug}.html')
    cab = re.sub(r'<title>.*?</title>', '<title>Página não encontrada · DT Company</title>', antes)
    cab = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="Esta página não existe no site da DT Company.">', cab)
    (SITE / '404.html').write_text(cab + pagina_404() + depois, encoding='utf-8')
    css_v = re.search(r'site\.css\?v=(\d+)', antes).group(1)
    print(f'{len(DADOS)} páginas de serviço e {len(AREAS)} de pilar (site.css?v={css_v})')


if __name__ == '__main__':
    main()
