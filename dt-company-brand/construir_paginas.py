#!/usr/bin/env python3
"""Constrói as páginas de área e o pedido de cotação do site DT Company,
e sincroniza o cabeçalho/rodapé de contactos.html com o index reescrito.
Reutiliza o cabeçalho e o rodapé do index (âncoras passam a /#, só em <a>)."""
import re
import sys
from pathlib import Path

SITE = Path(next((a for a in sys.argv[1:] if not a.startswith('--')), 'dt-company-site'))
idx = (SITE / 'index.html').read_text(encoding='utf-8')

def bloco(s, ini, fim):
    i = s.index(ini)
    j = s.index(fim, i) + len(fim)
    return s[i:j]

defs = bloco(idx, '<svg width="0" height="0" class="defs"', '</svg>\n')
if 'i-visto' not in defs:
    defs = defs.replace('</svg>\n', '  <symbol id="i-visto" viewBox="0 0 24 24"><path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol>\n</svg>\n')
header = bloco(idx, '<header class="topo"', '</header>')
footer = bloco(idx, '<footer class="rodape"', '</footer>')
head_meta = bloco(idx, '<meta name="theme-color"', 'site.css?v=2026111002">')

# âncoras de subpágina: só em <a href="#...">, nunca em <use href="#...">
fora = lambda s: re.sub(r'(<a\b[^>]*?href=")#', r'\1/#', s)
header_fora, footer_fora = fora(header), fora(footer)

ICONES = {'compliance-e-governanca': 'documento', 'tax': 'grafico', 'incorporacao': 'instituicao', 'consultoria-esg': 'equipa'}

AREAS = [
 {'slug': 'compliance-e-governanca', 'nome': 'Compliance e Governança',
  'frase': 'Estruturas de integridade e governança que sustentam contratos, crédito e investimento.',
  'fronteira_area': 'Acordos parassociais, estatutos e documentos sucessórios são redigidos pelo advogado parceiro.',
  'servicos': [
   {'id': 'programa-de-compliance-e-integridade', 'nome': 'Programa de Compliance e Integridade',
    'desafio': 'A ausência de regras internas e de controlos adequados expõe a organização a fraude e compromete o acesso a contratos e financiamento.',
    'entregaveis': ['Mapa de riscos de compliance e fraude', 'Código de conduta', 'Políticas: anticorrupção, conflitos de interesse, ofertas e hospitalidade, pagamentos e alteração de NIB', 'Canal de denúncia, implementado pela nossa equipa tecnológica', 'Formação da equipa e da direcção, com registo de presenças'],
    'avenca': 'Compliance officer externo, com reporte mensal à administração.'},
   {'id': 'due-diligence-de-terceiros', 'nome': 'Due Diligence de Terceiros',
    'desafio': 'Perdas relevantes têm origem em fornecedores, parceiros, sócios ou vendedores cuja identidade, idoneidade e situação real não foram verificadas.',
    'entregaveis': ['Relatório de verificação: existência, beneficiários efectivos, exposição política, sanções, reputação e documentação', 'Classificação de risco: baixo, médio ou alto', 'Sinais de alerta e pontos a confirmar antes da assinatura', 'Para terrenos e imóveis: verificação do DUAT, registos, titulares e ocupantes'],
    'avenca': 'Monitorização periódica da base de fornecedores.'},
   {'id': 'governanca-corporativa-e-familiar', 'nome': 'Governança Corporativa e Familiar',
    'desafio': 'A dependência de uma única pessoa, conflitos entre sócios ou familiares e documentação societária desorganizada comprometem o acesso a crédito e investimento.',
    'entregaveis': ['Diagnóstico de governança', 'Matriz de decisões: quem aprova o quê, e até que valor', 'Regimentos da administração, dos comités e do conselho consultivo', 'Regras de governança familiar e plano de sucessão na gestão'],
    'avenca': 'Secretariado societário: calendário de obrigações, convocatórias, actas e livros sociais.'}]},
 {'slug': 'tax', 'nome': 'Tax',
  'frase': 'Benefícios aproveitados, situação regularizada e inspecções preparadas.',
  'nota': 'Em Moçambique, as declarações fiscais e as demonstrações financeiras são obrigatoriamente assinadas por contabilistas certificados, e o contencioso fiscal em tribunal é conduzido por advogados. Neste pilar, a DT Company assume a gestão, a organização e o acompanhamento dos processos, em articulação com um contabilista certificado parceiro — tal como sucede com o advogado parceiro.',
  'servicos': [
   {'id': 'beneficios-fiscais-e-aduaneiros-do-investimento', 'nome': 'Benefícios Fiscais e Aduaneiros do Investimento',
    'desafio': 'Investidores suportam direitos e impostos por inteiro sobre equipamento e investimento por não terem requerido os benefícios a que tinham direito — ou perdem-nos por incumprimento das obrigações subsequentes.',
    'entregaveis': ['Estudo dos benefícios aplicáveis ao projecto', 'Dossier de candidatura e submissão do projecto de investimento', 'Lista de bens com isenção aduaneira aprovada', 'Calendário das obrigações associadas à manutenção dos benefícios', 'Relatório da poupança obtida'],
    'modelo': 'Honorário fixo, acrescido de percentagem da poupança obtida.'},
   {'id': 'regularizacao-fiscal-e-certidao-de-quitacao', 'nome': 'Regularização Fiscal e Certidão de Quitação',
    'desafio': 'Sem certidão de quitação, a empresa fica excluída de concursos públicos, não recebe pagamentos do Estado e enfrenta restrições junto da banca — frequentemente sem visibilidade sobre a sua própria posição fiscal.',
    'entregaveis': ['Levantamento da situação fiscal: dívidas, declarações em falta e coimas', 'Plano de regularização, incluindo pedidos de pagamento em prestações', 'Obtenção da certidão de quitação', 'Calendário fiscal anual com alertas de prazos'],
    'avenca': 'Acompanhamento mensal para manutenção da conformidade fiscal.'},
   {'id': 'preparacao-e-acompanhamento-de-inspeccoes-fiscais', 'nome': 'Preparação e Acompanhamento de Inspecções Fiscais',
    'desafio': 'Inspecções fiscais enfrentadas sem documentação organizada nem preparação adequada resultam em liquidações adicionais e multas significativas.',
    'entregaveis': ['Revisão fiscal preventiva, com identificação de riscos e contingências', 'Dossier de documentação organizado para a inspecção', 'Acompanhamento durante a inspecção e resposta aos pedidos da Autoridade Tributária', 'Relatório final com as correcções a implementar', 'Encaminhamento para o advogado parceiro em caso de contestação judicial']}]},
 {'slug': 'incorporacao', 'nome': 'Incorporação',
  'frase': 'Entrada no mercado e mobilidade de quadros, geridas de ponta a ponta.',
  'servicos': [
   {'id': 'constituicao-e-licenciamento-de-empresas', 'nome': 'Constituição e Licenciamento de Empresas',
    'desafio': 'A constituição de uma empresa consome meses entre registos, licenças e entidades distintas — com custos fixos a decorrer antes de a operação poder iniciar.',
    'entregaveis': ['Mapa de requisitos legais e custos para o negócio específico', 'Acompanhamento do registo da empresa, com modelos de estatutos padrão', 'NUIT, inscrição no INSS e licença de actividade', 'Dossier digital com toda a documentação da empresa', 'Calendário das primeiras obrigações: renovações e declarações'],
    'fronteira': 'Estatutos à medida e acordos parassociais são remetidos ao advogado parceiro.'},
   {'id': 'instalacao-de-empresas-estrangeiras', 'nome': 'Instalação de Empresas Estrangeiras',
    'desafio': 'Empresas estrangeiras que seleccionam inadequadamente a forma de entrada, ou que não registam o investimento, enfrentam posteriormente dificuldades na repatriação de lucros e de capital.',
    'entregaveis': ['Análise comparativa das formas de entrada — filial, sucursal ou escritório de representação — na perspectiva prática e operacional', 'Registo do projecto de investimento', 'Acompanhamento do registo do investimento estrangeiro junto do Banco de Moçambique', 'Abertura de conta bancária e instalação operacional', 'Articulação com os Benefícios Fiscais e Aduaneiros do Investimento (pilar Tax)']},
   {'id': 'gestao-de-quadros-estrangeiros', 'nome': 'Gestão de Quadros Estrangeiros',
    'desafio': 'Quotas, autorizações de trabalho, vistos e DIRE atrasam a entrada em funções de técnicos estrangeiros e expõem a empresa a sanções.',
    'entregaveis': ['Cálculo da quota disponível de trabalhadores estrangeiros', 'Pedidos de autorização de trabalho e de visto', 'Condução do processo de DIRE', 'Registo integral dos expatriados, com alertas de renovação'],
    'avenca': 'Regime de avença indexado ao número de expatriados geridos.'}]},
 {'slug': 'consultoria-esg', 'nome': 'Consultoria ESG',
  'frase': 'Sistemas e evidências que libertam financiamento e mantêm clientes internacionais.',
  'fronteira_area': 'Os estudos de impacto ambiental são elaborados por consultores ambientais registados, coordenados pela DT Company.',
  'servicos': [
   {'id': 'sistema-de-gestao-ambiental-e-social', 'nome': 'Sistema de Gestão Ambiental e Social para Financiamento',
    'desafio': 'O financiamento é aprovado, mas o desembolso fica condicionado à existência de um sistema de gestão ambiental e social conforme os requisitos do financiador.',
    'entregaveis': ['Diagnóstico face aos requisitos do financiador', 'Políticas ambientais, sociais e de saúde e segurança', 'Procedimentos, responsáveis e registos', 'Plano de acção ambiental e social', 'Reporte periódico ao financiador']},
   {'id': 'preparacao-para-clientes-internacionais', 'nome': 'Preparação para Clientes Internacionais',
    'desafio': 'Fornecedores e exportadores perdem clientes multinacionais e europeus por não conseguirem evidenciar boas práticas laborais, ambientais e de direitos humanos.',
    'entregaveis': ['Resposta aos questionários ESG dos clientes', 'Políticas de direitos humanos, condições de trabalho e combate ao trabalho infantil', 'Dossier de evidências organizado: registos, fotografias e certificados', 'Avaliação dos fornecedores do próprio cliente', 'Plano de melhoria para as avaliações subsequentes']},
   {'id': 'relacao-com-comunidades-e-mecanismo-de-queixas', 'nome': 'Relação com Comunidades e Mecanismo de Queixas',
    'desafio': 'Projectos em zonas rurais ou costeiras são suspensos por conflitos com comunidades que não foram envolvidas nem dispõem de um canal formal para apresentar queixas.',
    'entregaveis': ['Mapeamento das comunidades e partes interessadas', 'Plano de envolvimento e comunicação com as comunidades', 'Mecanismo de queixas: procedimento, canal e registo', 'Reporte periódico das queixas e das respostas', 'Acompanhamento de reuniões e consultas públicas']}]},
]

VISTO = '<svg class="entrega-ico" aria-hidden="true"><use href="#i-visto"/></svg>'
SETA = '<svg aria-hidden="true"><use href="#i-seta"/></svg>'

def pagina(titulo, descricao, corpo):
    return f'''<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo} · DT Company</title>
<meta name="description" content="{descricao}">
{head_meta}
</head>
<body class="pagina-interna">
{defs}
<a class="saltar" href="#conteudo">Saltar para o conteúdo</a>

{header_fora}

<main id="conteudo">
{corpo}
</main>

{footer_fora}

<script src="/assets/site.js?v=2026111002" defer></script>
</body>
</html>
'''

def seccao_servico(s, zebra):
    met = ''
    for rot, chave in (('Regime de avença', 'avenca'), ('Modelo de honorários', 'modelo'), ('Âmbito e parceiros', 'fronteira')):
        if s.get(chave):
            met += f'<div><dt>{rot}</dt><dd>{s[chave]}</dd></div>'
    met = f'\n    <dl class="servico-meta">{met}</dl>' if met else ''
    itens = '\n      '.join(f'<li>{VISTO}<span>{e}</span></li>' for e in s['entregaveis'])
    return f'''<section class="seccao{' marfim' if zebra else ''}" id="{s['id']}" aria-labelledby="t-{s['id']}">
  <div class="moldura servico-pg">
    <h2 id="t-{s['id']}">{s['nome']}</h2>
    <p class="desafio"><strong>O desafio.</strong> {s['desafio']}</p>
    <p class="sub-rotulo">Entregáveis</p>
    <ul class="entregaveis">
      {itens}
    </ul>{met}
  </div>
</section>
'''

# As páginas dos pilares passaram a ser geradas por dt-company-site/fonte/servicos.py (a partir do playbook).
for a in (AREAS if '--pilares-antigos' in sys.argv else []):
    nota = f'''
<section class="seccao" aria-label="Nota importante">
  <div class="moldura servico-pg"><div class="nota-pilar"><strong>Nota importante.</strong> {a['nota']}</div></div>
</section>
''' if a.get('nota') else ''
    fronteira = f'''
<section class="seccao" aria-label="Âmbito e parceiros">
  <div class="moldura servico-pg"><div class="nota-pilar"><strong>Âmbito e parceiros.</strong> {a['fronteira_area']}</div></div>
</section>
''' if a.get('fronteira_area') else ''
    servs = ''.join(seccao_servico(s, i % 2 == (0 if a.get('nota') else 1)) for i, s in enumerate(a['servicos']))
    faixa = '\n      '.join(
        f'<li><a href="#{s["id"]}"><svg aria-hidden="true"><use href="#i-{ICONES[a["slug"]]}"/></svg>{s["nome"]}</a></li>'
        for s in a['servicos'])
    corpo = f'''
<section class="abertura abertura-curta" aria-labelledby="t-area">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      <h1 id="t-area"><span class="h1-a">{a['nome']}.</span> <span class="h1-b">{a['frase']}</span></h1>
      <p class="abertura-desc">Três serviços com entregáveis definidos à partida — e a opção de avença para manter a empresa em dia.</p>
      <div class="acoes">
        <a class="botao botao-acao" href="/pedido-de-cotacao">Pedir cotação {SETA}</a>
        <a class="botao botao-contorno-claro" href="/pedido-de-cotacao">Pedir avaliação inicial</a>
      </div>
    </div>
  </div>
  <nav class="moldura faixa-areas" aria-label="Serviços desta área">
    <ul>
      {faixa}
    </ul>
  </nav>
</section>
{nota}{servs}{fronteira}
<section class="fecho">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="abertura-arte fecho-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480" loading="lazy"></div>
  <div class="moldura fecho-in">
    <h2 class="fecho-titulo">Vamos conversar sobre o&nbsp;seu&nbsp;desafio.</h2>
    <p>Respondemos com os entregáveis, os prazos e o âmbito — por escrito.</p>
    <div class="acoes">
      <a class="botao botao-acao" href="/pedido-de-cotacao">Conversar com um consultor {SETA}</a>
      <a class="botao botao-contorno-claro" href="/#servicos">Ver os quatro pilares</a>
    </div>
  </div>
</section>
'''
    (SITE / f'{a["slug"]}.html').write_text(pagina(a['nome'], a['frase'], corpo), encoding='utf-8')
    print('página:', a['slug'] + '.html')

# ---- pedido de cotação ----
corpo_pedido = f'''
<section class="abertura abertura-curta" aria-labelledby="t-pedido">
  <div class="abertura-luz" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="moldura abertura-in">
    <div class="abertura-arte" aria-hidden="true"><img src="/assets/marca/globo-luz.svg" alt="" width="480" height="480"></div>
    <div class="abertura-texto">
      <h1 id="t-pedido"><span class="h1-a">Pedido de cotação.</span> <span class="h1-b">Conte-nos o desafio; respondemos por escrito.</span></h1>
      <p class="abertura-desc">Uma avaliação inicial ou uma proposta à medida, com o âmbito, os entregáveis e o prazo. Sem qualquer compromisso.</p>
    </div>
  </div>
</section>

<section class="seccao" aria-labelledby="t-como-pedir">
  <div class="moldura servico-pg">
    <h2 id="t-como-pedir">O que incluir no seu pedido</h2>
    <ul class="entregaveis">
      <li>{VISTO}<span><b>Os seus dados</b> — nome, cargo, email e telefone</span></li>
      <li>{VISTO}<span><b>Dados da empresa</b> — nome, sector e dimensão</span></li>
      <li>{VISTO}<span><b>O principal desafio</b> — o que quer resolver ou alcançar</span></li>
      <li>{VISTO}<span><b>A urgência</b> — para quando precisa da solução</span></li>
    </ul>
    <div class="acoes" style="margin-top:28px">
      <a class="botao botao-acao" href="mailto:contacto@dtcompany.example?subject=Pedido%20de%20cota%C3%A7%C3%A3o%20%E2%80%94%20DT%20Company">Enviar pedido por email {SETA}</a>
    </div>
    <div class="nota-pilar" style="margin-top:22px"><strong>Nota.</strong> Os canais de contacto definitivos da DT Company estão em actualização; este email é provisório. A proposta é enviada por escrito e não implica qualquer compromisso.</div>
  </div>
</section>
'''
if '--pedido-antigo' in sys.argv:  # o pedido de cotação passou a ser gerado por dt-company-site/fonte/servicos.py
    (SITE / 'pedido-de-cotacao.html').write_text(pagina('Pedido de cotação', 'Peça uma cotação ou uma avaliação inicial à DT Company — resposta por escrito, com âmbito, entregáveis e prazo.', corpo_pedido), encoding='utf-8')
    print('página: pedido-de-cotacao.html')

# ---- contactos.html: cabeçalho/rodapé novos, sem mapa ----
c = (SITE / 'contactos.html').read_text(encoding='utf-8')
c = c.replace(bloco(c, '<header class="topo"', '</header>'), header_fora)
c = c.replace(bloco(c, '<footer class="rodape"', '</footer>'), footer_fora)
# O mapa da página de contactos fica (a DT está no mesmo edifício da Kingdom Company, em Maputo).
c = c.replace('<p><a href="mailto:contacto@dtcompany.example">contacto@dtcompany.example</a></p></li>',
              '<p><a href="mailto:contacto@dtcompany.example">contacto@dtcompany.example</a><br><small>Email provisório — canais definitivos em actualização.</small></p></li>', 1)
c = c.replace('Escreva-nos, ligue ou venha visitar-nos em Moçambique. Para receber uma proposta, peça uma cotação ou uma avaliação inicial.',
              'Escreva-nos ou visite-nos em Maputo. Para receber uma proposta, peça uma cotação ou uma avaliação inicial.')
(SITE / 'contactos.html').write_text(c, encoding='utf-8')
print('contactos.html sincronizado')

# ---- CSS das páginas de área (idempotente) ----
css = SITE / 'assets' / 'site.css'
s = css.read_text(encoding='utf-8')
MARCA = '/* páginas de área · DT */'
if MARCA not in s:
    s += f'''

{MARCA}
.marca {{ display: flex; align-items: center; gap: 10px; }}
.marca-nome {{ font-weight: 700; font-size: 1.05rem; letter-spacing: .01em; white-space: nowrap; }}
.servico-pg {{ max-width: 920px; }}
.servico-pg h2 {{ font-size: clamp(1.5rem, 2.6vw, 2.05rem); letter-spacing: -.012em; line-height: 1.2; }}
.servico-pg .desafio {{ margin-top: 14px; max-width: 72ch; }}
.servico-pg .desafio strong {{ color: var(--indigo); }}
.sub-rotulo {{ margin-top: 28px; font-size: .8125rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--cinza); }}
ul.entregaveis {{ margin-top: 14px; display: grid; gap: 10px; }}
ul.entregaveis li {{ display: flex; gap: 12px; align-items: flex-start; line-height: 1.55; }}
.entrega-ico {{ flex: none; width: 22px; height: 22px; margin-top: 2px; padding: 4px; border-radius: 50%; background: var(--realce); color: var(--laranja-texto); box-sizing: border-box; }}
dl.servico-meta {{ margin-top: 24px; border-top: 1px solid var(--linha); }}
dl.servico-meta div {{ display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 4px 24px; padding: 13px 0; border-bottom: 1px solid var(--linha-fria); }}
dl.servico-meta dt {{ font-weight: 700; font-size: .9375rem; color: var(--indigo); }}
dl.servico-meta dd {{ color: var(--cinza); font-size: .9688rem; }}
.nota-pilar {{ padding: 18px 22px; border-radius: var(--raio); background: var(--realce); max-width: 78ch; }}
.nota-pilar strong {{ color: var(--indigo); }}
@media (max-width: 720px) {{
  dl.servico-meta div {{ grid-template-columns: 1fr; }}
  .marca-nome {{ font-size: 1rem; }}
}}
'''
    css.write_text(s, encoding='utf-8')
    print('CSS das páginas de área acrescentado')
