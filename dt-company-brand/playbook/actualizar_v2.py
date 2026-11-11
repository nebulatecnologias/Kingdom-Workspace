"""Playbook de vendas da DT Company, versão 2 (11/11/2026).

Parte da versão 1 (o exemplo da skill playbook-vendas) e aplica a revisão pedida:
- saem os pilares Tax, Incorporação e Consultoria ESG;
- entra a Consultoria Estratégica, com as três fichas do playbook da Kingdom Company;
- Compliance e Governança Corporativa e Treinamento Corporativo seguem o documento
  «DT Company — Pilares e Serviços» (entregáveis, fronteiras e regras de comunicação);
- os serviços de entrada, os pacotes e os preços ficam de fora;
- a DT Company deixa de ter parceiros advogados ou contabilistas: quando um tema o exige,
  indica-o por escrito e o cliente contrata directamente o profissional habilitado.
Grafia anterior ao Acordo Ortográfico de 1990, como no resto da DT.

Uso: python3 actualizar_v2.py   (grava playbook.json nesta pasta)
"""
import json, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
V1 = os.path.join(RAIZ, '.claude/skills/playbook-vendas/assets/exemplo-dt/playbook.json')
d = json.load(open(V1, encoding='utf-8'))

# ---------- marca: logótipos recriados ----------
LOGO = os.path.join(RAIZ, 'dt-company-brand/identidade/logotipo')
d['marca']['logo_claro'] = os.path.join(LOGO, 'dt-company-vertical-branco.svg')
d['marca']['logo_escuro'] = os.path.join(LOGO, 'dt-company-vertical-azul.svg')
d['marca']['simbolo_escuro'] = os.path.join(LOGO, 'dt-company-simbolo-azul.svg')
d['marca']['fonte_mono'] = {k: os.path.join(RAIZ, '.claude/skills/playbook-vendas/assets/exemplo-dt', v) for k, v in d['marca']['fonte_mono'].items()}
d['capa']['versao'] = 'Versão 2.0 · Novembro de 2026'

FRONT_JURIDICA = ('A DT Company não presta serviços jurídicos nem de contabilidade. Quando um tema o exige, '
                  'indica-o por escrito ao cliente, que contrata directamente o profissional habilitado.')
FRONT_FACTUAL = ('Os relatórios são factuais e não concluem sobre a validade jurídica de negócios ou documentos. '
                 'Consultas em conservatórias e no cadastro, queixas às autoridades, processos disciplinares, acordos entre sócios, '
                 'estatutos e registos são tratados pelo advogado do cliente, contratado directamente por ele.')
FRONT_FORMACAO = ('Certificados de participação. Para certificação profissional reconhecida, confirmar primeiro o registo junto da ANEP.')
AVENCA_FORMACAO = 'Plano Anual de Formação: levantamento de necessidades, plano anual, organização das acções e relatório anual com indicadores.'

# ---------- 01 · quem somos ----------
d['quem_somos']['pitch'] = [
    'A DT Company é uma empresa de Business Advisory & Development que ajuda as empresas em Moçambique a decidir com estratégia, '
    'a organizar as regras e os controlos que protegem o negócio e a preparar as equipas que o fazem crescer.',
    'Trabalhamos em três pilares: consultoria estratégica, compliance e governança corporativa, e treinamento corporativo. '
    'Cada serviço termina em entregáveis que ficam na empresa: planos, políticas, relatórios factuais e equipas formadas.']
d['quem_somos']['diferenciais'] = [
    ['Três pilares, um só interlocutor.', 'Estratégia, compliance e governança, e formação das equipas, organizados pela mesma equipa.'],
    ['Relatórios factuais.', 'Dizemos o que foi confirmado e o que não foi, sem prometer resultados que não dependem de nós.'],
    ['Formação com prova.', 'Cada treinamento tem avaliação antes e depois, registo de presenças, certificados de participação e relatório final.'],
    ['Tecnologia e marketing da Kingdom.', 'O canal de denúncia e a formação online são montados com a equipa de tecnologia da Kingdom; o marketing pode ser dado com a equipa de marketing e comunicação.'],
    ['Continuidade por avença.', 'Vários serviços continuam depois da entrega: compliance officer externo, monitorização de fornecedores, secretariado interno e plano anual de formação.']]
d['quem_somos']['regras'] = {
    'usar': ['organizamos', 'preparamos', 'verificamos', 'informamos', 'apoiamos', 'formamos'],
    'evitar': ['mandato', 'parecer', 'consulta jurídica', 'assessoria ou aconselhamento jurídico', 'garantimos (sobre resultados legais)',
               'auditoria (fora do contexto de sistemas de gestão)', '«jurista»', 'parceiros advogados ou contabilistas'],
    'fronteiras': [['Jurídico e contabilidade.', FRONT_JURIDICA],
                   ['Relatórios.', 'Indicam o que foi confirmado e o que não foi. Nunca dizer que garantem que um negócio, documento ou terreno é seguro ou legal.'],
                   ['Histórias.', 'Apresentadas como exemplos, nunca como casos reais de clientes sem autorização.'],
                   ['Casos concretos.', 'Em comentários e mensagens, não responder a perguntas sobre casos concretos: convidar para uma avaliação inicial.']]}
d['como_usar']['fora'] = ('Fica de fora, por não ser essencial para vender: história da empresa, teoria de vendas e guiões para decorar. '
                          'Ficam também de fora os serviços de entrada e os pacotes, e os temas jurídicos e de contabilidade: '
                          'a DT Company indica-os por escrito ao cliente, que contrata directamente o profissional habilitado.')
d['capas']['02'][1] = ('Onze serviços em três pilares, cada um com uma ficha. O vendedor usa as dores para reconhecer o cliente '
                       'e as fronteiras para saber até onde vai o nosso trabalho.')
d['capas']['02'][2] = ['Mapa dos 11 serviços', 'Regra: não vender características', 'As 11 fichas comerciais']
d['contracapa']['slogan'] = 'Estratégia, integridade e equipas preparadas.'

# ---------- 02 · o que vendemos ----------
PRE90 = [('projeções', 'projecções'), ('Projeções', 'Projecções'), ('projeto', 'projecto'), ('Projeto', 'Projecto'),
         ('direção', 'direcção'), ('direções', 'direcções'), ('Diretores', 'Directores'), ('diretores', 'directores'),
         ('atual', 'actual'), ('ação', 'acção')]
def pre90(s):
    for a, b in PRE90:                       # só palavras inteiras («elaboração» fica como está)
        s = re.sub(r'(?<![\wÀ-ÿ])' + a + r'(?![\wÀ-ÿ])', b, s)
    return s

def ficha(area, nome, oque, problema, dores, quem, antes, depois, entrega, pitch, avenca=None, fronteira=None, validar=False):
    f = {'area': area, 'nome': nome, 'oque': pre90(oque), 'problema': pre90(problema), 'dores': [pre90(x) for x in dores],
         'quem': [pre90(x) for x in quem], 'antes': pre90(antes), 'depois': pre90(depois), 'entrega': [pre90(x) for x in entrega]}
    if avenca: f['avenca'] = avenca
    if fronteira: f['fronteira'] = fronteira
    if validar: f['validar'] = True
    f['pitch'] = pre90(pitch)
    return f

CE, CG, TC = 'Consultoria Estratégica', 'Compliance e Governança Corporativa', 'Treinamento Corporativo'
v1 = {f['nome']: f for f in d['servicos']['fichas']}
F = []

# Consultoria Estratégica: as fichas do playbook da Kingdom Company
F.append(ficha(CE, 'Plano de Negócios',
    'É um serviço de elaboração do plano de negócios, que estrutura o modelo de negócio, o mercado, a concorrência e as projeções financeiras num documento que bancos, investidores e parceiros conseguem avaliar.',
    'Resolve a dificuldade de empreendedores e empresas que precisam de financiamento ou de validar um investimento, mas não conseguem demonstrar, com números sólidos, que o negócio é viável.',
    ['O banco ou o investidor pede um plano e não sabe por onde começar.', 'As projeções financeiras não resistem às primeiras perguntas.',
     'Não sabe quanto pedir, para quê, nem em quanto tempo consegue pagar.', 'A ideia tem potencial, mas não é apresentada de forma convincente.',
     'Vai investir sem ter validado o mercado, os custos e o retorno.'],
    ['Empreendedores que estão a iniciar um negócio.', 'Empresas que vão pedir crédito bancário.', 'Empresas que querem captar investidores ou sócios.',
     'Empresas que vão expandir, abrir uma nova unidade ou lançar uma linha de negócio.', 'Candidatos a programas de financiamento com prazo de submissão.'],
    'Uma ideia ou um projeto de expansão sem estrutura nem números que convençam quem financia.',
    'Um plano de negócios sólido, com números que se defendem, pronto a apresentar a bancos e investidores e a orientar o crescimento.',
    ['Análise do mercado e da concorrência.', 'Modelo de negócio.', 'Projeções financeiras.', 'Plano de negócios completo.', 'Pitch deck para investidores.',
     'Modelo financeiro editável.', 'Preparação para a reunião com bancos e investidores.'],
    'Ajudamos empreendedores e empresas a transformar uma ideia ou um projeto de expansão num plano de negócios sólido. Estruturamos o mercado, o modelo e os números para que chegue ao banco ou ao investidor preparado para responder a todas as perguntas.'))
F.append(ficha(CE, 'Planeamento Estratégico',
    'É um serviço de consultoria que conduz a direção na definição das prioridades, metas e responsáveis para o ano, e transforma essas decisões num plano de ação que se consegue acompanhar.',
    'Resolve a dificuldade de empresas que crescem ou mudam sem um rumo claro, em que a equipa trabalha muito mas sem prioridades, metas nem responsabilidades definidas.',
    ['A empresa trabalha muito, mas não sabe para onde vai.', 'Tudo é urgente e nada avança.', 'As metas ficam no papel e ninguém responde por elas.',
     'O dono passa o dia a apagar fogos em vez de dirigir.', 'Sócios e directores puxam em direcções diferentes.'],
    ['Empresas em crescimento que perderam o foco.', 'Empresas no início de um novo ano fiscal.', 'Empresas com vendas ou resultados estagnados.',
     'Empresas com novos sócios, nova direção ou uma mudança de estratégia.'],
    'Uma empresa que reage ao dia a dia, com uma equipa ocupada mas desalinhada.',
    'Uma empresa com um rumo definido, metas claras, responsáveis por cada uma e uma direção que acompanha os resultados.',
    ['Diagnóstico da situação atual.', 'Sessões de trabalho com a direção.', 'Prioridades e metas para o ano.', 'Plano de ação com responsáveis e prazos.',
     'Indicadores de acompanhamento.', 'Reuniões de acompanhamento da execução.'],
    'Ajudamos a direção a definir para onde a empresa vai e como lá chegar. Transformamos as prioridades em metas, responsáveis e um plano de ação acompanhado, para que a equipa trabalhe na mesma direção e os resultados apareçam.',
    validar=True))
F.append(ficha(CE, 'Advisory (Aconselhamento Empresarial)',
    'É um serviço de aconselhamento empresarial que apoia donos e directores na análise de uma decisão importante, dos seus cenários e riscos, antes de avançar.',
    'Resolve a dificuldade de quem tem de tomar decisões com grande impacto na empresa sem uma opinião independente e experiente com quem as discutir.',
    ['Decide sozinho, sem ninguém de confiança com quem discutir.', 'Tem uma decisão grande à frente e muito em jogo.',
     'Já perdeu dinheiro por decidir com pressa ou sem informação.', 'Os conselhos que recebe vêm de quem tem algo a ganhar.',
     'Adia a decisão porque não consegue ver os riscos com clareza.'],
    ['Donos e sócios perante um investimento importante.', 'Empresas a escolher um novo sócio, parceiro ou mercado.',
     'Directores perante uma reestruturação, uma contratação-chave ou uma mudança de modelo de negócio.'],
    'Uma decisão adiada ou tomada às cegas, com medo de errar.',
    'Uma decisão tomada com clareza e segurança, conhecendo os cenários, os riscos e o plano B.',
    ['Sessão para perceber a decisão e o contexto.', 'Análise de cenários e riscos.', 'Recomendação por escrito.', 'Sessões de acompanhamento da execução.'],
    'Ajudamos donos e directores a tomar decisões importantes com mais clareza e menos risco. Analisamos consigo os cenários e as consequências, para que avance com segurança e com um plano para o que pode correr mal.',
    fronteira='É aconselhamento de gestão. Decisões com efeitos jurídicos ou fiscais são confirmadas pelo advogado ou pelo contabilista do cliente, contratados directamente por ele.',
    validar=True))

# Compliance e Governança Corporativa: entregáveis do documento «Pilares e Serviços»
pc = v1['Programa de Compliance e Integridade']
F.append(ficha(CG, pc['nome'], pc['oque'], pc['problema'],
    [x.replace('aos parceiros', 'aos clientes e financiadores') for x in pc['dores']], pc['quem'], pc['antes'], pc['depois'],
    ['Mapa de riscos de compliance e fraude.', 'Código de conduta.',
     'Políticas: anticorrupção, conflitos de interesse, ofertas e brindes, pagamentos e mudança de NIB.',
     'Controlos anti-fraude: caixa, compras, recepção de mercadoria, stock e pagamentos.',
     'Canal de denúncia, montado com a equipa de tecnologia da Kingdom.',
     'Formação em ética, anticorrupção e prevenção de fraude, com registo de presenças.'],
    pc['pitch'], avenca='Compliance officer externo, com relatório mensal.'))
dd = v1['Due Diligence de Terceiros']
F.append(ficha(CG, dd['nome'],
    'É um serviço de verificação de fornecedores, parceiros, sócios e vendedores antes de a empresa assinar ou pagar.',
    dd['problema'], [x for x in dd['dores'] if 'terreno' not in x.lower() and 'imóvel' not in x.lower()],
    [x for x in dd['quem'] if 'terreno' not in x.lower() and 'imóve' not in x.lower()], dd['antes'], dd['depois'],
    ['Relatório de verificação: existência, sócios e beneficiários efectivos declarados, ligações políticas, sanções e reputação, com base em fontes públicas e documentos fornecidos.',
     'Visita ao local e verificação no terreno.', 'Classificação de risco: baixo, médio ou alto.',
     'Lista de sinais de alerta e de pontos a confirmar antes de assinar.'],
    dd['pitch'], avenca='Monitorização periódica da base de fornecedores.',
    fronteira='Os relatórios são factuais: indicam o que foi confirmado e o que não foi. Nunca dizer que garantem que um negócio, documento ou terreno é seguro ou legal. ' + FRONT_FACTUAL.split('. ', 1)[1]))
F.append(ficha(CG, 'Apuramento Interno de Denúncias e Desvios',
    'É um serviço que apura, de forma factual e organizada, uma suspeita ou denúncia de desvio dentro da empresa, e propõe controlos para que não se repita.',
    'Resolve a dificuldade de empresas em que suspeitas e denúncias de desvios ficam sem resposta ou são tratadas de forma informal, e o problema repete-se.',
    ['Recebeu uma denúncia e não sabe como a tratar sem criar conflito.', 'Desconfia de um desvio, mas não tem factos para decidir.',
     'Os casos são tratados de forma informal e acabam esquecidos.', 'O mesmo tipo de desvio volta a acontecer.',
     'Tem medo de acusar alguém sem provas organizadas.'],
    ['Empresas que receberam uma denúncia pelo canal ou por outra via.', 'Empresas com diferenças de caixa, stock ou pagamentos por explicar.',
     'Direcções que precisam de factos organizados antes de decidir.', 'Empresas com programa de compliance que precisam de tratar as denúncias recebidas.'],
    'Uma suspeita sem resposta, tratada de forma informal, e um problema que se repete.',
    'Factos organizados num relatório, uma decisão tomada com informação e controlos novos para que não se repita.',
    ['Recolha e análise factual de documentos e registos.', 'Entrevistas e cronologia dos factos.', 'Relatório factual do que foi apurado e do que não foi.',
     'Recomendações de controlo para que não se repita.'],
    'Ajudamos a direcção a tratar suspeitas e denúncias com método. Organizamos os documentos, as entrevistas e a cronologia num relatório factual do que foi apurado e do que não foi, e propomos os controlos para que não se repita.',
    fronteira=FRONT_FACTUAL))
gv = v1['Governança Corporativa e Familiar']
F.append(ficha(CG, gv['nome'],
    'É um serviço que organiza quem decide o quê na empresa, os órgãos de gestão e a passagem entre gerações, para que a empresa não dependa de uma só pessoa.',
    'Resolve a dificuldade de empresas que dependem de uma pessoa, com conflitos entre sócios ou familiares e documentação societária desorganizada que trava crédito e investimento.',
    gv['dores'], gv['quem'], gv['antes'], gv['depois'],
    ['Diagnóstico de governança.', 'Matriz de decisões: quem aprova o quê e até que valor.', 'Regimentos da administração, comités e conselho consultivo.',
     'Regras de governança familiar e plano de sucessão na gestão.'],
    gv['pitch'], avenca='Secretariado interno: calendário de obrigações, convocatórias, actas e livros.', fronteira=FRONT_FACTUAL.split('. ', 1)[1]))

# Treinamento Corporativo: entregáveis do documento; o resto da ficha é proposta
def tc(nome, oque, dor, dores, quem, antes, depois, entrega, pitch, nota=None):
    return ficha(TC, nome, oque, 'Resolve a dificuldade de ' + dor, dores, quem, antes, depois, entrega, pitch,
                 fronteira=(nota + ' ' if nota else '') + FRONT_FORMACAO)   # a avença (Plano Anual de Formação) está na nota do pilar
COMUNS = ['Avaliação antes e depois, registo de presenças e certificados de participação.', 'Relatório final com resultados e recomendações.']
F.append(tc('Liderança Corporativa',
    'É um programa de formação para chefias, adaptado ao nível da empresa, que prepara quem lidera para motivar a equipa, delegar e decidir.',
    'empresas com chefias promovidas sem preparação: equipas desmotivadas, conflitos, rotatividade alta e decisões que dependem sempre do dono.',
    ['Promoveu bons técnicos que não sabem liderar.', 'A equipa está desmotivada e há conflitos que ninguém resolve.', 'A rotatividade é alta.',
     'Todas as decisões voltam para o dono.', 'As chefias não dão feedback nem delegam.'],
    ['Directores, gestores e chefias.', 'Sobretudo chefias promovidas recentemente.', 'Empresas em crescimento que precisam de novas lideranças.'],
    'Chefias sem preparação, equipas desmotivadas e um dono que decide tudo.',
    'Chefias preparadas para motivar, delegar e decidir, com um plano de desenvolvimento para cada uma.',
    ['Programa adaptado ao nível das chefias da empresa.',
     'Módulos: papel do líder, gestão e motivação de equipas, delegação, comunicação e feedback, gestão de conflitos, tomada de decisão e gestão do tempo.',
     'Exercícios práticos com situações reais da empresa.', 'Plano de desenvolvimento individual para cada participante.'] + COMUNS,
    'Preparamos as chefias para liderar: motivar a equipa, delegar, dar feedback e decidir. O programa usa situações reais da empresa e termina com um plano de desenvolvimento para cada participante.'))
F.append(tc('Atendimento ao Cliente',
    'É um programa de formação para quem atende, adaptado ao tipo de atendimento da empresa, que define padrões e prepara a equipa para resolver reclamações e fidelizar.',
    'empresas que perdem clientes por mau atendimento, reclamações mal resolvidas e más avaliações que afastam novos clientes.',
    ['Perde clientes por mau atendimento.', 'As reclamações são mal resolvidas ou ficam sem resposta.', 'As más avaliações afastam novos clientes.',
     'Cada colaborador atende à sua maneira.', 'A equipa não sabe lidar com clientes difíceis.'],
    ['Equipas de loja, recepção, call center, apoio ao cliente e serviços.', 'Empresas que atendem por telefone, WhatsApp ou e-mail.',
     'Empresas com muitas reclamações ou más avaliações.'],
    'Um atendimento que depende de quem está ao balcão, com reclamações mal resolvidas.',
    'Uma equipa com padrões de atendimento claros, que resolve reclamações e fideliza clientes.',
    ['Programa adaptado ao tipo de atendimento da empresa: presencial, telefone, WhatsApp e e-mail.',
     'Módulos: padrões de atendimento, comunicação com o cliente, gestão de reclamações e clientes difíceis, fidelização e experiência do cliente.',
     'Simulações de atendimento (role-play).', 'Guia de padrões de atendimento da empresa, para usar no dia a dia.'] + COMUNS,
    'Formamos a equipa que atende para que cada cliente seja bem tratado, em todos os canais. Definimos os padrões da empresa, treinamos com simulações e deixamos um guia para usar no dia a dia.'))
F.append(tc('Vendas',
    'É um programa de formação para equipas comerciais, adaptado ao produto e ao cliente da empresa, que dá método a todo o processo de venda.',
    'equipas comerciais sem método: propostas que não fecham, descontos excessivos e metas que não se cumprem.',
    ['As propostas não fecham.', 'A equipa dá descontos para conseguir vender.', 'As metas não se cumprem.',
     'Cada vendedor vende à sua maneira, sem processo.', 'Não sabem tratar objecções nem negociar.'],
    ['Equipas comerciais e vendedores.', 'Gestores de conta.', 'Empresas com metas de vendas por cumprir.'],
    'Uma equipa comercial sem método, que fecha pouco e dá descontos a mais.',
    'Uma equipa com um processo de venda, um guião próprio e metas por vendedor.',
    ['Programa adaptado ao produto e ao cliente da empresa.',
     'Módulos: processo de venda, prospecção, apresentação da proposta, tratamento de objecções, negociação comercial, fecho e acompanhamento pós-venda.',
     'Simulações de venda e de negociação.', 'Guião de vendas e de tratamento de objecções da empresa.', 'Indicadores comerciais e metas por vendedor.'] + COMUNS,
    'Damos método à equipa comercial: do primeiro contacto ao fecho. Treinamos com simulações do vosso produto e deixamos um guião de vendas e metas por vendedor.'))
F.append(tc('Marketing',
    'É um programa de formação em marketing, adaptado ao sector e à dimensão da empresa, que ensina a definir o posicionamento, a comunicar e a medir resultados.',
    'empresas que investem em redes sociais e publicidade sem estratégia nem resultados mensuráveis.',
    ['Investe em redes sociais e publicidade sem ver resultados.', 'Não sabe a quem está a vender nem como se diferenciar.',
     'Publica sem plano nem objectivos.', 'Não mede o que traz clientes.', 'Depende de fornecedores para tudo o que é marketing.'],
    ['Donos de PME.', 'Equipas de marketing.', 'Equipas comerciais.'],
    'Investimento em marketing sem estratégia nem resultados que se meçam.',
    'Uma equipa que conhece o cliente, comunica com posicionamento claro e mede resultados, com um plano para 90 dias.',
    ['Programa adaptado ao sector e à dimensão da empresa.',
     'Módulos: fundamentos de marketing, conhecer o cliente, posicionamento e marca, marketing digital e redes sociais, conteúdos que vendem e medição de resultados.',
     'Exercícios aplicados à marca da própria empresa.', 'Plano de acção de marketing para 90 dias.'] + COMUNS,
    'Ensinamos a equipa a fazer marketing com estratégia: conhecer o cliente, posicionar a marca, comunicar e medir. Os exercícios são feitos com a marca da própria empresa e o programa termina com um plano para 90 dias.',
    nota='Pode ser dado com a equipa de marketing e comunicação da Kingdom.'))

d['servicos']['fichas'] = F
d['servicos']['lead'] = ('Cada ficha tem o que é o serviço, que problema resolve, as dores, quem as tem, a transformação, '
                         'os entregáveis, a fronteira e como apresentar comercialmente.')
d['servicos']['notas_pilar'] = {
    TC: ('Formatos: in-company, à medida na empresa; cursos abertos e seminários, com calendário trimestral; Programa de Desenvolvimento '
         'de Lideranças, de três a seis meses, com plano de desenvolvimento individual e mentoria; formação online, com módulos gravados, '
         'testes e certificados automáticos (tecnologia da Kingdom); e Plano Anual de Formação, por avença.')}

# ---------- 03 a 08: tirar tax, incorporação, ESG e parceiros ----------
NEC = 'O que mais preocupa a empresa: definir a estratégia, organizar regras e controlos, ou preparar a equipa?'
b = d['bant']['criterios']
b[0]['perguntas'][1] = NEC
b[3]['perguntas'][1] = 'Há alguma data que não pode falhar: um concurso, um financiamento, o início do ano ou a chegada de novas chefias?'
p = d['processo']['etapas']
p[3][4] = 'Dor, serviço indicado e decisor confirmados'
p[4][3] = 'Enviar a proposta com âmbito, entregáveis, fronteira, prazo, investimento e, quando existir, a opção de avença'
d['processo']['estados_nota'] = ('Os estados laterais são Nutrir, para quem ainda não está pronto, e Encaminhado, quando o pedido é só jurídico ou só '
                                 'de contabilidade: a DT Company indica-o por escrito e o cliente contrata directamente o profissional habilitado. '
                                 'Uma oportunidade perdida leva sempre o motivo.')
s = d['sdr']
s['perguntas'][1] = [NEC, 'pilar']
s['perguntas'][4] = ['O que já tentaram para resolver, e com quem?', 'soluções anteriores, objecções futuras']
s['perguntas'][8] = ['Há alguma data que não pode falhar: um concurso, um financiamento ou o início do ano?', 'prazo']
s['ficha'][5] = 'Quem já está envolvido do lado do cliente: consultores, advogado ou contabilista'
c = d['closer']
c['momentos'][2][3] = 'Apresentar o serviço que responde à dor principal, os entregáveis e a fronteira. Se o caso toca outros pilares, mostrar como se ligam'
c['diagnostico'][1] = 'Que prazos ou exigências estão em cima da mesa: concurso, banco, financiador, cliente grande ou novas metas?'
c['diagnostico'][2] = 'Quanto custa à empresa manter as coisas como estão: contratos perdidos, fraudes, clientes perdidos ou metas falhadas?'
c['diagnostico'][4] = 'Quem já está envolvido do lado da empresa: consultores, advogado, contabilista ou formadores?'
c['arranque'][3] = 'O contacto do lado do cliente e quem mais participa do lado dele'
o = d['objeccoes']['lista']
o[3] = ['«Já temos formação interna»', 'Acha que a formação que já tem chega', 'O que mudou na equipa depois da última formação?',
        'Mostrar o que fica: programa à medida, avaliação antes e depois, plano individual e relatório com resultados']
o[4] = ['«Isso é trabalho de advogado»', 'Não sabe onde acaba o nosso trabalho', 'Que parte do processo o preocupa mais?',
        'Mostrar a fronteira: organizamos, preparamos e verificamos; os temas jurídicos são do advogado do cliente, contratado directamente por ele']
o[5] = ['«Garantem que o negócio ou o parceiro é seguro?»', 'Quer certeza absoluta antes de decidir', 'O que precisa de saber para decidir com tranquilidade?',
        'Nunca garantir. O relatório diz o que foi confirmado e o que não foi, e lista os pontos a confirmar antes de assinar']
o[6][3] = 'Ligar a uma exigência real: concurso, financiador, cliente grande ou uma fraude que já aconteceu no sector'
o[7][3] = 'Ligar a uma data real (concurso, financiamento, início do ano, novas chefias) ou passar a Nutrir com data de retorno'
o[8][3] = 'Mostrar os entregáveis concretos que ficam com a empresa e o relatório final com resultados'
d['followup']['reactivacao'][0][1] = ('Contactar as oportunidades perdidas por «não é o momento» ou «sem orçamento», com um gatilho novo: um concurso, '
                                      'um financiamento, o início do ano, novas chefias ou um serviço novo.')

# ---------- verificação: palavras a evitar e pilares retirados ----------
texto = json.dumps(d, ensure_ascii=False)
for proibida in ['Tax', 'tax', 'Incorporação', 'ESG', 'parceira', 'advogado parceiro', 'contabilista certificada', 'mandato', 'parecer',
                 'auditoria', 'expatriad', 'Autoridade Tributária', 'Banco de Moçambique', 'DUAT']:
    for m in re.finditer(re.escape(proibida), texto):
        contexto = texto[max(0, m.start() - 60):m.end() + 40]
        if 'evitar' in contexto or 'auditoria (fora' in contexto or '«parecer' in contexto:
            continue
        print(f'aviso: «{proibida}» em …{contexto}…')
json.dump(d, open(os.path.join(AQUI, 'playbook.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'playbook.json: {len(F)} fichas em {len({f["area"] for f in F})} pilares')
