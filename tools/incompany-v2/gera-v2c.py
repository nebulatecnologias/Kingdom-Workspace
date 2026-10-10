# Gera as páginas de área e as páginas de planos do Kingdom InCompany v2 a partir de index.html.
# Correr dentro de incompany-v2/:  python3 <scratchpad>/gera-v2c.py
import html, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dados_v2 import AREAS
src=open('index.html',encoding='utf-8').read()
def corta(a,b,inc=True):
    i=src.index(a); j=src.index(b,i)+(len(b) if inc else 0); return src[i:j]
head=src[:src.index('</head>')]
sprite=corta('<svg width="0"','</svg>')
nav=corta('<header class="nav"','</header>')
for k in ('areas','metodo','numeros','midia','perguntas'): nav=nav.replace(f'href="#{k}"',f'href="/#{k}"')
footer=corta('<footer class="rodape">','</footer>')
predio=corta('<svg class="predio"','</svg>\n          <p class="obra-estado"',False)+'</svg>'
metodo=corta('<section class="claro" id="metodo"','</section>')
def pilar(id_): return corta(f'<article class="pilar" id="{id_}">','</article>')
WA='https://wa.me/message/VGKNLA2PLYBMI1'
e=lambda s: html.escape(s,quote=False)
a_=lambda s: html.escape(s,quote=True)
TITULO_CASA='Kingdom InCompany | Tudo o que a sua empresa precisa, num único lugar'
DESC_CASA='Desenvolvimento editorial, consultoria estratégica, marketing e vendas, desenvolvimento tecnológico e treinamento corporativo, num único parceiro. Moçambique e África do Sul.'

def cabeca(titulo, desc):
    h=head.replace(f'<title>{TITULO_CASA}</title>',f'<title>{e(titulo)}</title>')
    h=h.replace(f'content="{TITULO_CASA}"',f'content="{a_(titulo)}"')
    return h.replace(f'content="{DESC_CASA}"',f'content="{a_(desc)}"')

def ico(i): return f'<svg aria-hidden="true"><use href="#{i}"/></svg>'

def fecho(titulo, texto='Explicamos o que faz sentido para a sua empresa, numa conversa sem compromisso.'):
    return f'''<!-- ============ Fecho: agendar conversa ============ -->
<section class="fecho" id="agendar" aria-labelledby="t-fecho">
  <canvas class="estrelas" id="estrelas" aria-hidden="true"></canvas>
  <div class="fecho-luz" aria-hidden="true"></div>
  <div class="fecho-texto">
    <h2 id="t-fecho" class="revela">{e(titulo)}</h2>
    <p class="revela">{e(texto)}</p>
    <!-- Os botões abrem o formulário (Tracktor). Até termos o link, seguem para o WhatsApp comercial. -->
    <div class="fecho-accoes revela">
      <a class="btn btn-laranja btn-lg" href="{WA}" target="_blank" rel="noopener" data-formulario="agendar">{ico('i-calendario')}Agendar conversa</a>
      <a class="btn btn-escuro btn-lg" href="{WA}" target="_blank" rel="noopener" data-formulario="contacto">Preencher formulário de contacto</a>
    </div>
  </div>
</section>'''

def pagina(h, corpo):
    return f'''{h}</head>
<body>
<a class="saltar" href="#conteudo">Saltar para o conteúdo</a>

{sprite}

{nav}

<main id="conteudo">

{corpo}

</main>

{footer}

<script src="/v2.js" defer></script>
</body>
</html>
'''

def preco_html(s):
    if 'faixa' in s: return f'<b class="faixa">{e(s["faixa"])}</b>'
    return f'<b>{e(s["preco"])}</b>' + (f'<span>{e(s["unid"])}</span>' if s['unid'] else '')

# ---------------- páginas de área ----------------
for p in AREAS:
    url=f'/servicos/{p["slug"]}'
    ed=predio.replace(f'<g class="andar" data-andar="{p["andar"]}"',f'<g class="andar ativo" data-andar="{p["andar"]}"')
    ed=ed.replace('id="predio-nome" x=','x=').replace('>A sua empresa</text>','>Kingdom InCompany</text>')
    pil=re.sub(r'\s*<a class="pilar-ligacao" href="/servicos/[^"]+">.*?</a>','',pilar(p['pilar']))
    pratica=pil if p['pilar']=='a-treinamento' else pil+'\n    '+pilar('a-treinamento')
    reais=p.get('servicos',[]); prov=p.get('provisorios',[])
    cartoes=''.join(f'''<li class="servico servico-real cartao-claro revela"><a href="{url}/{s['slug']}"><span class="servico-ico">{ico(p['ico'])}</span><b>{e(s['nome'])}</b><span class="servico-desc">{e(s['resumo'])}</span><span class="servico-inclui">{e(s['inclui'])}</span><span class="servico-preco"><small>{'Entre' if 'faixa' in s else 'A partir de'}</small>{preco_html(s)}</span><span class="pilar-ligacao">Ver planos e preços{ico('i-seta')}</span></a></li>''' for s in reais)
    cartoes+=''.join(f'<li class="servico cartao-claro revela"><span class="servico-ico">{ico(p["ico"])}</span><b>{e(t[0])}</b><span class="servico-desc">{e(t[1])}</span>' + (f'<span class="servico-preco"><small>A partir de</small><b>{e(t[2])}</b></span>' if len(t)>2 else '<small>Planos e preços em breve</small>') + '</li>' for t in prov)
    n=len(reais)+len(prov); quantos={1:'Um serviço principal',2:'Dois serviços principais',3:'Três serviços principais',4:'Quatro serviços principais'}.get(n,f'{n} serviços principais')
    if reais and not prov: serv_txt=f'{quantos}, cada um com três planos. Escolha o que precisa agora e junte os outros quando fizer sentido.'
    elif reais: serv_txt=f'{quantos}. Os que têm página mostram os três planos e os preços; os outros chegam em breve.'
    else: serv_txt=f'{quantos}, com o preço de partida. Na primeira conversa fechamos o âmbito e o valor.'
    outras=''.join(f'<a class="outra cartao-claro revela" href="/servicos/{q["slug"]}"><span class="outra-andar">{q["rot"]}</span><span class="detalhe-ico">{ico(q["ico"])}</span><b>{e(q["nome"])}</b><span>{e(q["sub"])}</span><span class="pilar-ligacao" style="margin-top:6px">Conhecer a área{ico("i-seta")}</span></a>' for q in AREAS if q is not p)
    corpo=f'''<!-- ============ Abertura: o andar desta área no edifício ============ -->
<section class="hero hero-area" id="topo">
  <div class="hero-grelha" aria-hidden="true"></div>
  <div class="hero-luz" aria-hidden="true"></div>
  <div class="area-topo">
    <div class="area-texto">
      <nav class="migalhas revela" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/#areas">Áreas</a><span aria-hidden="true">/</span><span aria-current="page">{e(p['nome'])}</span></nav>
      <p class="area-andar revela"><span class="obra-n">{p['andar']}</span>{p['rot']} do edifício Kingdom InCompany</p>
      <h1 class="revela">{e(p['nome'])}</h1>
      <p class="hero-sub revela"><b>{e(p['tese'])}</b> {e(p['texto'])}</p>
      <div class="hero-accoes revela">
        <a class="btn btn-laranja btn-lg" href="#servicos">Ver os serviços</a>
        <a class="btn btn-escuro btn-lg" href="#video">{ico('i-play')}Ver o vídeo</a>
      </div>
    </div>
    <div class="area-predio revela" style="--m:#1D5BFF" aria-hidden="true">{ed}</div>
  </div>
</section>

<!-- ============ Vídeo de apresentação da área ============ -->
<section class="bloco secao-escura video-sec" id="video" aria-labelledby="t-video">
  <div class="cabeca">
    <h2 id="t-video" class="revela">A área em poucos minutos</h2>
    <p class="revela">Um especialista explica o que fazemos nesta área, para quem e como trabalhamos.</p>
  </div>
  <!-- data-video: o ID do vídeo no YouTube (ex. dQw4w9WgXcQ). Vazio mostra "Vídeo em breve". -->
  <div class="video-quadro revela" data-video="" data-titulo="Vídeo de apresentação: {a_(p['nome'])}">
    <div class="video-fundo" aria-hidden="true"><span class="video-ico">{ico(p['ico'])}</span></div>
    <button type="button" class="video-play" aria-label="Ver o vídeo de apresentação de {a_(p['nome'])}"><svg aria-hidden="true"><use href="#i-play"/></svg></button>
    <p class="video-legenda"><b>{e(p['nome'])}</b><span>Apresentação da área</span></p>
    <span class="video-estado">Vídeo em breve</span>
  </div>
</section>

<!-- ============ Serviços (claro) ============ -->
<section class="claro" id="servicos" aria-labelledby="t-servicos">
  <div class="bloco">
    <div class="cabeca">
      <h2 id="t-servicos" class="revela">O que fazemos nesta área</h2>
      <p class="revela">{serv_txt}</p>
    </div>
    <ul class="servicos">{cartoes}</ul>
  </div>
</section>

<!-- ============ Na prática: o visual vivo da área e o treinamento ============ -->
<section class="bloco pilares secao-escura" aria-labelledby="t-pratica">
  <div class="cabeca">
    <h2 id="t-pratica" class="revela">Como funciona na prática</h2>
    <p class="revela">O que esta área entrega à sua empresa{'' if p['pilar']=='a-treinamento' else ', e o treinamento que vem com ela'}.</p>
  </div>
  <div class="pilares-grelha">
    {pratica}
  </div>
</section>

{metodo}

{fecho('Fale com um especialista de '+p['nome'])}

<!-- ============ Outros andares (claro) ============ -->
<section class="claro" style="padding-top:120px" aria-labelledby="t-outras">
  <div class="bloco" style="padding-top:0">
    <div class="cabeca">
      <h2 id="t-outras" class="revela">Os outros andares</h2>
      <p class="revela">Cada área assenta na anterior. Juntas, são a estrutura completa para a sua empresa crescer.</p>
    </div>
    <nav class="outras" aria-label="Outras áreas">{outras}</nav>
  </div>
</section>'''
    open(f'servicos/{p["slug"]}.html','w',encoding='utf-8').write(pagina(cabeca(f'{p["nome"]} | Kingdom InCompany', f'{p["tese"]} {p["texto"]}'), corpo))

    # ---------------- páginas de planos de cada serviço ----------------
    for s in p.get('servicos',[]):
        os.makedirs(f'servicos/{p["slug"]}',exist_ok=True)
        planos=''
        for i,(nome,tag,preco,itens) in enumerate(s['planos']):
            if preco: pv=f'<span class="plano-valor">{e(preco)}</span>'+(f'<span class="plano-por">{e(s["unid"])}</span>' if s['unid'] else '')
            else: pv='<span class="plano-valor consulta">Sob consulta</span><span class="plano-por">Valor à medida da sua empresa</span>'
            lis=''.join(f'<li>{ico("i-check")}<span>{e(t)}</span></li>' for t in itens)
            dest=i==1
            planos+=f'''<article class="plano revela{' destaque' if dest else ''}" aria-labelledby="pl-{i}"><svg class="plano-ico" aria-hidden="true"><use href="#{('i-alvo','i-foguete','i-trofeu')[i]}"/></svg><h3 id="pl-{i}">{nome}</h3><p class="plano-desc">{e(tag)}</p><div class="plano-preco">{pv}</div><h4>O que inclui</h4><ul>{lis}</ul><a class="btn {'btn-branco' if dest else 'btn-escuro'}" href="{WA}" target="_blank" rel="noopener" data-formulario="plano">Escolher o {nome}</a></article>'''
        irmaos=''.join(f'<a class="outra cartao-claro revela" href="/servicos/{p["slug"]}/{t["slug"]}"><span class="detalhe-ico">{ico(p["ico"])}</span><b>{e(t["nome"])}</b><span>{e(t["resumo"])}</span><span class="pilar-ligacao" style="margin-top:6px">Ver planos e preços{ico("i-seta")}</span></a>' for t in p['servicos'] if t is not s)
        irmaos+=f'<a class="outra outra-area cartao-claro revela" href="/servicos/{p["slug"]}"><span class="outra-andar">{p["rot"]}</span><span class="detalhe-ico">{ico("i-casa")}</span><b>{e(p["nome"])}</b><span>Toda a área, com o vídeo de apresentação.</span><span class="pilar-ligacao" style="margin-top:6px">Voltar à área{ico("i-seta")}</span></a>'
        corpo=f'''<!-- ============ Abertura do serviço ============ -->
<section class="hero hero-area hero-servico" id="topo">
  <div class="hero-grelha" aria-hidden="true"></div>
  <div class="hero-luz" aria-hidden="true"></div>
  <div class="area-topo">
    <div class="area-texto">
      <nav class="migalhas revela" aria-label="Caminho"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/servicos/{p['slug']}">{e(p['nome'])}</a><span aria-hidden="true">/</span><span aria-current="page">{e(s['nome'])}</span></nav>
      <p class="area-andar revela"><span class="obra-n">{p['andar']}</span>{e(p['nome'])}</p>
      <h1 class="revela">{e(s['nome'])}</h1>
      <p class="hero-sub revela">{e(s['resumo'])}</p>
      <div class="hero-accoes revela">
        <a class="btn btn-laranja btn-lg" href="#planos">Ver os planos</a>
        <a class="btn btn-escuro btn-lg" href="#agendar">{ico('i-calendario')}Agendar conversa</a>
      </div>
    </div>
    <aside class="servico-resumo revela" aria-label="Resumo do serviço">
      <span class="sr-ico" aria-hidden="true">{ico(p['ico'])}</span>
      <small>{'Entre' if 'faixa' in s else 'A partir de'}</small>
      <p class="sr-preco">{preco_html(s)}</p>
      <dl>
        <div><dt>Inclui</dt><dd>{e(s['inclui'])}</dd></div>
        <div><dt>Planos</dt><dd>Essencial, Profissional e Premium</dd></div>
        <div><dt>Área</dt><dd>{e(p['nome'])}</dd></div>
      </dl>
    </aside>
  </div>
</section>

<!-- ============ Planos ============ -->
<section class="bloco secao-escura planos-sec" id="planos" aria-labelledby="t-planos">
    <div class="cabeca">
      <h2 id="t-planos" class="revela">Planos e preços</h2>
      <p class="revela">Três formas de contratar {e(s['nome'])}. Na primeira conversa confirmamos o plano certo para a sua empresa.</p>
    </div>
    <div class="planos">{planos}</div>
    <p class="precos-nota revela">Valores em meticais (MT). Os planos marcados como sob consulta são orçamentados na primeira conversa.</p>
</section>

{metodo}

{fecho('Fale connosco sobre '+s['nome'], 'Dizemos-lhe que plano faz sentido para a sua empresa, numa conversa sem compromisso.')}

<!-- ============ Mais nesta área (claro) ============ -->
<section class="claro" style="padding-top:120px" aria-labelledby="t-outras">
  <div class="bloco" style="padding-top:0">
    <div class="cabeca">
      <h2 id="t-outras" class="revela">Mais em {e(p['nome'])}</h2>
      <p class="revela">Os outros serviços desta área, que pode juntar a este.</p>
    </div>
    <nav class="outras" aria-label="Outros serviços">{irmaos}</nav>
  </div>
</section>'''
        open(f'servicos/{p["slug"]}/{s["slug"]}.html','w',encoding='utf-8').write(pagina(cabeca(f'{s["nome"]}: planos e preços | Kingdom InCompany', s['resumo']), corpo))
print('ok')
