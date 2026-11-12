// Modo de demonstração (?demo=1): um cliente em memória com a mesma interface que o supabase-js usa no painel.
// Os dados são fictícios mas realistas (duas empresas de Moçambique) e reiniciam a cada carregamento.

const agora = () => new Date()
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2))
const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)))
function haDias(d, hora = 10, min = 0) {
  const x = agora(); x.setDate(x.getDate() - d); x.setHours(hora, min, 0, 0)
  if (x > agora()) x.setTime(agora().getTime() - 5 * 60000)
  return x.toISOString()
}
function haHoras(hh) { return new Date(Date.now() - hh * 3600000).toISOString() }
function dataRel(d) {
  const x = agora(); x.setDate(x.getDate() + d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

const EU = { id: 'u-demo-0001', email: 'comercial@kingdomcompany.co.za' }
const OUTRO_1 = '7c1e2f0a-4b8d-4e1a-9f3c-2d5b8a6e1c44'
const OUTRO_2 = '3a9d5e7b-1c2f-4a8e-b6d0-8f4e2c1a9b77'

const DEFEITOS = {
  painel_contactos: () => ({ utm: {}, etiquetas: [], consentimento: false, notas: null, nome: null, email: null, telefone: null, empresa: null, cargo: null, cidade: null, origem: null }),
  painel_mensagens: () => ({ tipo: 'contacto', dados: {}, estado: 'nova', respondida_em: null, contacto_id: null, servico: null, assunto: null, corpo: null, pagina: null }),
  painel_etapas: () => ({ ordem: 0, tipo: 'aberta', cor: null }),
  painel_oportunidades: () => ({ moeda: 'MZN', bant: {}, ordem: 0, valor: null, responsavel: null, proxima_accao: null, proxima_data: null, mensagem_id: null, motivo_perda: null, fechado_em: null, servico: null, contacto_id: null }),
  painel_actividades: () => ({ dados: {}, texto: null, contacto_id: null, oportunidade_id: null, autor: null }),
  painel_segmentos: () => ({ filtros: {} }),
  painel_artigos: () => ({ corpo_md: '', estado: 'rascunho', publicado_em: null, resumo: null, categoria: null, ambito: null, capa_url: null, seo_titulo: null, seo_descricao: null, autor: null }),
  painel_membros: () => ({ papel: 'comercial' }),
  painel_sites: () => ({ origens: [], cor: '#2B2850' }),
}
const COM_ACTUALIZADO = new Set(['painel_contactos', 'painel_oportunidades', 'painel_artigos'])
const TEMPO_REAL = new Set(['painel_mensagens', 'painel_oportunidades'])

function etapasPara(siteId) {
  return [
    ['Novo lead', 'aberta', '#8A8FA8'], ['Qualificação', 'aberta', '#6C63D9'], ['Reunião marcada', 'aberta', '#3B82F6'], ['Diagnóstico', 'aberta', '#0EA5E9'],
    ['Proposta', 'aberta', '#F59E0B'], ['Negociação', 'aberta', '#F97316'], ['Ganho', 'ganha', '#16A34A'], ['Perdido', 'perdida', '#DC2626'],
  ].map(([nome, tipo, cor], i) => ({ id: `${siteId}-e${i + 1}`, site_id: siteId, nome, ordem: i + 1, tipo, cor }))
}

function semente() {
  const db = { painel_sites: [], painel_membros: [], painel_contactos: [], painel_mensagens: [], painel_etapas: [], painel_oportunidades: [], painel_actividades: [], painel_segmentos: [], painel_artigos: [] }
  const KC = 'site-kingdom'; const DT = 'site-dt'
  db.painel_sites.push(
    { id: KC, slug: 'kingdom-company', nome: 'Kingdom Company', dominio: 'kingdomcompany.co.za', origens: ['kingdomcompany.co.za', 'www.kingdomcompany.co.za'], chave: 'a3f9c1e07b5d42e8a61f', cor: '#2B2850', email_remetente: 'contact@kingdomcompany.co.za', nome_remetente: 'Kingdom Company', criado_em: haDias(120) },
    { id: DT, slug: 'dt-company', nome: 'DT Company', dominio: 'dtcompany.co.za', origens: ['dtcompany.co.za'], chave: '5be8d2a94c0f17e3b9d6', cor: '#04123F', email_remetente: null, nome_remetente: 'DT Company', criado_em: haDias(60) },
  )
  db.painel_membros.push(
    { site_id: KC, user_id: EU.id, papel: 'admin', criado_em: haDias(120) },
    { site_id: KC, user_id: OUTRO_1, papel: 'comercial', criado_em: haDias(90) },
    { site_id: KC, user_id: OUTRO_2, papel: 'comercial', criado_em: haDias(40) },
    { site_id: DT, user_id: OUTRO_1, papel: 'admin', criado_em: haDias(60) },
    { site_id: DT, user_id: EU.id, papel: 'comercial', criado_em: haDias(58) },
  )
  db.painel_etapas.push(...etapasPara(KC), ...etapasPara(DT))

  // ---- Contactos da Kingdom Company ----
  // [nome, email, telefone, empresa, cargo, cidade, origem, etiquetas, consentimento, dias, utm]
  const C = [
    ['Nélio Macuácua', 'nelio.macuacua@mabunda-logistica.co.mz', '+258 84 312 4410', 'Mabunda Logística', 'Diretor-geral', 'Maputo', 'google', ['pme', 'quente'], true, 0, { source: 'google', medium: 'cpc', campaign: 'plano-negocios-nov' }],
    ['Ana Paula Cossa', 'anapaula@cossaefilhos.co.mz', '+258 82 455 1020', 'Cossa & Filhos Comércio', 'Sócia-gerente', 'Matola', 'instagram', ['pme', 'retalho'], true, 1, { source: 'instagram', medium: 'social', campaign: 'tesouraria' }],
    ['Edson Mondlane', 'edson.m@maputoagro.co.mz', '+258 86 210 7731', 'Maputo Agro Serviços', 'Administrador', 'Maputo', 'linkedin', ['quente'], true, 2, { source: 'linkedin', medium: 'social' }],
    ['Gércia Sitoe', 'gercia.sitoe@gmail.com', '+258 84 901 2234', null, null, 'Maputo', 'instagram', ['newsletter'], true, 3, {}],
    ['Hélder Nhantumbo', 'helder@nhantumbo-construcoes.co.mz', '+258 87 330 1188', 'Nhantumbo Construções', 'Diretor financeiro', 'Beira', 'google', ['pme'], false, 4, { source: 'google', medium: 'organic' }],
    ['Fátima Bila', 'fatima.bila@clinicapolana.co.mz', '+258 84 777 0912', 'Clínica Sorriso Polana', 'Diretora clínica', 'Maputo', 'indicação', ['quente', 'cliente'], true, 6, {}],
    ['Ivo Langa', 'ivo.langa@grupolanga.co.mz', '+258 82 118 4560', 'Grupo Langa Investimentos', 'CEO', 'Maputo', 'directo', ['cliente'], true, 8, {}],
    ['Celso Matsinhe', 'celso.matsinhe@matolagas.co.mz', '+258 84 640 3321', 'Matola Gás Distribuição', 'Gestor comercial', 'Matola', 'google', ['pme'], true, 9, { source: 'google', medium: 'cpc', campaign: 'marketing-vendas' }],
    ['Lurdes Chissano', 'lurdes.chissano@xaixaihotel.co.mz', '+258 86 552 9087', 'Xai-Xai Hotelaria', 'Proprietária', 'Xai-Xai', 'facebook', ['pme', 'turismo'], true, 11, { source: 'facebook', medium: 'social', campaign: 'hotelaria' }],
    ['Amélia Tembe', 'amelia.tembe@outlook.com', '+258 84 223 6754', null, 'Consultora independente', 'Maputo', 'instagram', ['newsletter'], true, 12, {}],
    ['Dércio Mabunda', 'dercio@beirapescas.co.mz', '+258 82 670 4412', 'Beira Pescas', 'Diretor de operações', 'Beira', 'linkedin', ['pme'], false, 14, { source: 'linkedin', medium: 'social' }],
    ['Sheila Muianga', 'sheila.muianga@farmaciacentral.co.mz', '+258 84 410 2290', 'Farmácia Central da Matola', 'Gerente', 'Matola', 'google', ['retalho', 'quente'], true, 16, { source: 'google', medium: 'organic' }],
    ['Osvaldo Nhaca', 'osvaldo.nhaca@tetemineracao.co.mz', '+258 87 905 1173', 'Tete Mineração Serviços', 'Diretor de recursos humanos', 'Tete', 'evento', ['evento-2026'], true, 19, {}],
    ['Benedita Machava', 'benedita.machava@gmail.com', '+258 84 338 7120', null, null, 'Inhambane', 'instagram', ['newsletter'], true, 21, {}],
    ['Albino Cumbe', 'albino@pembaturismo.co.mz', '+258 86 447 2091', 'Pemba Turismo', 'Sócio', 'Pemba', 'facebook', ['turismo'], false, 24, { source: 'facebook', medium: 'cpc' }],
    ['Rosita Mucavele', 'rosita.mucavele@inhambaneimob.co.mz', '+258 84 129 6630', 'Inhambane Imobiliária', 'Diretora comercial', 'Inhambane', 'google', ['pme'], true, 27, { source: 'google', medium: 'cpc', campaign: 'plano-negocios-out' }],
    ['Arsénio Massinga', 'arsenio.massinga@nampulatrans.co.mz', '+258 82 774 3015', 'Nampula Transportes', 'Administrador', 'Nampula', 'indicação', ['quente'], true, 30, {}],
    ['Yolanda Uamusse', 'yolanda.uamusse@quelimaneagro.co.mz', '+258 87 662 0487', 'Quelimane Agro', 'Gestora de projetos', 'Quelimane', 'linkedin', ['pme'], true, 33, {}],
    ['Telma Zandamela', 'telma.zandamela@gmail.com', '+258 84 556 1209', null, 'Empreendedora', 'Maputo', 'instagram', ['newsletter', 'evento-2026'], true, 36, {}],
    ['Jaime Guambe', 'jaime.guambe@guambeadvogados.co.mz', '+258 82 300 5541', 'Guambe Advogados', 'Sócio-gerente', 'Maputo', 'directo', ['cliente'], true, 40, {}],
    ['Inocência Mussa', 'inocencia@mussatexteis.co.mz', '+258 84 812 7736', 'Mussa Têxteis', 'Diretora-geral', 'Nampula', 'google', ['pme', 'retalho'], false, 44, { source: 'google', medium: 'organic' }],
    ['Cláudio Manhique', 'claudio.manhique@chimoiofrescos.co.mz', '+258 86 901 3328', 'Chimoio Frescos', 'Gerente', 'Chimoio', 'facebook', ['pme'], true, 47, { source: 'facebook', medium: 'social' }],
    ['Neusa Sumbana', 'neusa.sumbana@sumbanaconsult.co.mz', '+258 84 667 8810', 'Sumbana Consultores', 'Diretora', 'Maputo', 'linkedin', ['evento-2026'], true, 51, {}],
    ['Rui Chambal', 'rui.chambal@gmail.com', '+258 82 245 9902', null, null, 'Matola', 'google', [], false, 54, { source: 'google', medium: 'organic' }],
    ['Vânia Mondlane', 'vania.mondlane@ecoescola.co.mz', '+258 84 190 4467', 'Eco Escola Bilingue', 'Diretora administrativa', 'Maputo', 'evento', ['evento-2026', 'quente'], true, 57, {}],
  ]
  const cid = (i) => `kc-c${String(i + 1).padStart(2, '0')}`
  C.forEach((c, i) => db.painel_contactos.push({
    id: cid(i), site_id: KC, nome: c[0], email: c[1], telefone: c[2], empresa: c[3], cargo: c[4], cidade: c[5], origem: c[6], etiquetas: c[7], consentimento: c[8],
    criado_em: haDias(c[9], 9 + (i % 8), (i * 7) % 60), actualizado_em: haDias(Math.max(0, c[9] - 1)), utm: c[10], notas: null,
  }))
  db.painel_contactos.find((c) => c.id === cid(5)).notas = 'Quer reorganizar a gestão da clínica antes de abrir a segunda unidade na Sommerschield. Prefere reuniões ao fim da tarde.'
  db.painel_contactos.find((c) => c.id === cid(6)).notas = 'Cliente desde março (identidade visual). Decide rápido quando vê números.'

  // ---- Mensagens da Kingdom Company ----
  const M = [
    [0, 'cotacao', 'Perfis Corporativos', 'Pedido de cotação: Perfis Corporativos', 'Bom dia. Vamos concorrer a contratos de transporte com mineradoras e precisamos de um perfil corporativo profissional, em PDF e PowerPoint.', { 'Nº de colaboradores': '35', 'Orçamento previsto': '300 000 – 500 000 MT', 'Prazo': 'Até fim de janeiro', 'Como nos conheceu': 'Google' }, '/servicos/plano-de-negocios', 'nova', 0.4],
    [1, 'cotacao', 'Gestão de Redes Sociais', 'Pedido de cotação: Gestão de Redes Sociais', 'Temos duas lojas na Matola e as vendas caíram desde agosto. Queremos alguém que trate do Instagram e do Facebook todos os meses.', { 'Nº de colaboradores': '12', 'Orçamento previsto': 'Até 150 000 MT', 'Prazo': 'Dezembro' }, '/servicos/marketing-e-vendas', 'nova', 5],
    [2, 'avaliacao', 'Identidade Visual', 'Avaliação inicial: Identidade Visual', 'Somos uma empresa de serviços agrícolas com 60 trabalhadores e a nossa marca já não corresponde ao que somos hoje. Gostaríamos de uma avaliação inicial.', { 'Nº de colaboradores': '60', 'Principal desafio': 'Expansão para novas províncias', 'Disponibilidade': 'Terças e quintas de manhã' }, '/servicos/consultoria-estrategica', 'nova', 26],
    [3, 'newsletter', null, 'Inscrição na newsletter', null, { 'Interesses': 'Gestão, finanças pessoais' }, '/blog/cinco-erros-de-tesouraria', 'lida', 70],
    [4, 'cotacao', 'Modelos de Propostas Técnicas', 'Pedido de cotação: Modelos de Propostas Técnicas', 'Vamos concorrer a três concursos públicos em dezembro e queremos um modelo de proposta técnica que a equipa possa reutilizar.', { 'Nº de colaboradores': '120', 'Orçamento previsto': 'A definir', 'Prazo': 'Urgente' }, '/servicos/assessoria-corporativa', 'nova', 98],
    [5, 'contacto', null, 'Segunda unidade da clínica', 'Olá, foi a Dra. Lurdes que me indicou. Vamos abrir uma segunda clínica e preciso de ajuda com a gestão e os processos. Podem ligar-me?', { 'Melhor horário': 'Depois das 17h' }, '/contactos', 'lida', 146],
    [7, 'cotacao', 'CRM e Sistemas de Vendas', 'Pedido de cotação: CRM e Sistemas de Vendas', 'Queremos organizar a equipa comercial que vende gás a restaurantes e hotéis. Hoje os contactos estão em cadernos e no WhatsApp de cada vendedor.', { 'Nº de colaboradores': '48', 'Orçamento previsto': '200 000 – 400 000 MT', 'Prazo': 'Primeiro trimestre de 2027' }, '/servicos/marketing-e-vendas', 'lida', 212],
    [8, 'avaliacao', 'Websites e Aplicativos', 'Avaliação inicial: Websites e Aplicativos', 'Tenho um hotel pequeno em Xai-Xai e quero um site com reservas directas, para depender menos das plataformas.', { 'Nº de quartos': '18', 'Principal desafio': 'Financiamento da remodelação' }, '/servicos/plano-de-negocios', 'lida', 260],
    [11, 'cotacao', 'Websites e Aplicativos', 'Pedido de cotação: Websites e Aplicativos', 'Precisamos de uma aplicação simples de stock para três farmácias, com relatórios por loja.', { 'Nº de lojas': '3', 'Orçamento previsto': '250 000 MT', 'Prazo': 'Março' }, '/servicos/desenvolvimento-tecnologico', 'lida', 380],
    [12, 'contacto', null, 'Vídeo institucional em Tete', 'Bom dia. Somos uma empresa de serviços mineiros em Tete. Queremos um vídeo institucional e fotografias das operações para apresentar a novos clientes. Fazem gravações fora de Maputo?', { 'Participantes': '25' }, '/contactos', 'lida', 452],
    [14, 'cotacao', 'Produção de Campanhas Publicitárias', 'Pedido de cotação: Produção de Campanhas Publicitárias', 'Vamos abrir um lodge em Pemba em março e queremos uma campanha de lançamento nas redes sociais e no Google.', { 'Orçamento previsto': 'Até 300 000 MT', 'Prazo': 'Sem pressa' }, '/servicos/plano-de-negocios', 'arquivada', 575],
    [15, 'cotacao', 'Dashboards de Gestão', 'Pedido de cotação: Dashboards de Gestão', 'Procuramos um painel com as vendas e as visitas de cada agente da imobiliária, actualizado todas as semanas.', { 'Nº de colaboradores': '9', 'Orçamento previsto': '150 000 – 250 000 MT' }, '/servicos/consultoria-estrategica', 'lida', 650],
    [17, 'avaliacao', 'Produção Audiovisual', 'Avaliação inicial: Produção Audiovisual', 'A nossa transportadora faz 20 anos e queremos um vídeo sobre a história da empresa para o evento de aniversário.', { 'Nº de viaturas': '40' }, '/servicos/assessoria-corporativa', 'lida', 722],
    [18, 'cotacao', 'Identidade Visual', 'Pedido de cotação: Identidade Visual', 'Queremos renovar o logótipo e as cores da cooperativa antes da feira de março.', { 'Nº de páginas (estimado)': '180', 'Prazo': 'Junho de 2027' }, '/servicos/desenvolvimento-editorial', 'lida', 790],
    [19, 'newsletter', null, 'Inscrição na newsletter', null, { 'Interesses': 'Empreendedorismo' }, '/', 'lida', 864],
  ]
  const mid = (i) => `kc-m${String(i + 1).padStart(2, '0')}`
  M.forEach((m, i) => {
    const c = db.painel_contactos.find((x) => x.id === cid(m[0]))
    db.painel_mensagens.push({
      id: mid(i), site_id: KC, contacto_id: c.id, tipo: m[1], servico: m[2], assunto: m[3], corpo: m[4],
      dados: { Nome: c.nome, Email: c.email, Telefone: c.telefone, ...(c.empresa ? { Empresa: c.empresa } : {}), ...m[5], ...(Object.keys(c.utm || {}).length ? { utm: c.utm } : {}) },
      pagina: m[6], estado: m[7], respondida_em: i === 5 ? haHoras(140) : i === 6 ? haHoras(200) : null, criado_em: haHoras(m[8]),
    })
  })

  // ---- Oportunidades da Kingdom Company ----
  const E = (n) => `${KC}-e${n}`
  // [etapa, titulo, contacto, servico, valor, prox_accao, prox_data(offset), bant, mensagem, dias, responsavel]
  const O = [
    [1, 'Perfil corporativo · Mabunda Logística', 0, 'Perfis Corporativos', 420000, 'Ligar para qualificar o pedido', 0, { necessidade: 'Perfil para concursos de mineradoras', orcamento: '300 – 500 mil MT' }, 0, 0, EU.id],
    [1, 'Redes sociais · Cossa & Filhos', 1, 'Gestão de Redes Sociais', 150000, 'Responder com proposta de diagnóstico', 1, { necessidade: true }, 1, 0, OUTRO_1],
    [2, 'Identidade Visual · Maputo Agro', 2, 'Identidade Visual', 780000, 'Confirmar avaliação de terça', 2, { necessidade: 'Marca nova antes da expansão', autoridade: true }, 2, 1, EU.id],
    [3, 'Site da segunda unidade · Clínica Polana', 5, 'Websites e Aplicativos', 650000, 'Reunião na clínica às 17h30', 3, { necessidade: 'Site para a 2.ª unidade', autoridade: 'Dra. Fátima decide', prazo: 'Abertura em março' }, 5, 6, EU.id],
    [4, 'CRM comercial · Matola Gás', 7, 'CRM e Sistemas de Vendas', 1250000, 'Enviar relatório de diagnóstico', -2, { necessidade: true, autoridade: 'Conselho de administração', orcamento: '200 – 400 mil MT' }, 6, 9, OUTRO_1],
    [5, 'Site com reservas · Xai-Xai Hotelaria', 8, 'Websites e Aplicativos', 380000, 'Enviar proposta revista', -1, { necessidade: true, autoridade: true, orcamento: true }, 7, 11, EU.id],
    [5, 'Aplicação de stock · Farmácia Central', 11, 'Websites e Aplicativos', 960000, 'Apresentar proposta à gerência', 5, { necessidade: true, autoridade: true, orcamento: '250 mil MT', prazo: 'Março' }, 8, 16, OUTRO_2],
    [6, 'Vídeo institucional · Tete Mineração', 12, 'Produção Audiovisual', 2400000, 'Combinar datas da gravação', 4, { necessidade: true, autoridade: true, orcamento: true, prazo: 'Fevereiro' }, 9, 19, EU.id],
    [7, 'Painel de gestão · Grupo Langa', 6, 'Dashboards de Gestão', 1800000, null, null, { necessidade: true, autoridade: true, orcamento: true, prazo: true }, null, 50, EU.id],
    [7, 'Proposta técnica · Guambe Advogados', 19, 'Modelos de Propostas Técnicas', 540000, null, null, { necessidade: true, autoridade: true, orcamento: true, prazo: true }, null, 70, OUTRO_1],
    [8, 'Campanha de lançamento · Pemba Turismo', 14, 'Produção de Campanhas Publicitárias', 300000, null, null, { necessidade: true }, 10, 24, OUTRO_2],
    [8, 'Painel de vendas · Inhambane Imobiliária', 15, 'Dashboards de Gestão', 220000, null, null, { necessidade: true, autoridade: true }, 11, 27, EU.id],
  ]
  O.forEach((o, i) => {
    const etapa = db.painel_etapas.find((e) => e.id === E(o[0]))
    const fechado = etapa.tipo !== 'aberta'
    db.painel_oportunidades.push({
      id: `kc-o${String(i + 1).padStart(2, '0')}`, site_id: KC, contacto_id: cid(o[2]), etapa_id: etapa.id, titulo: o[1], servico: o[3], valor: o[4], moeda: 'MZN',
      responsavel: o[10], proxima_accao: o[5], proxima_data: o[6] == null ? null : dataRel(o[6]), bant: o[7], ordem: i, mensagem_id: o[8] == null ? null : mid(o[8]),
      motivo_perda: etapa.tipo === 'perdida' ? (i === 10 ? 'Sem orçamento este ano' : 'Escolheu outro fornecedor') : null,
      criado_em: haDias(o[9] + 1), actualizado_em: haDias(Math.max(0, o[9] - 2)), fechado_em: fechado ? haDias(Math.max(3, o[9] - 10)) : null,
    })
  })

  // ---- Atividades ----
  const A = (contacto, op, tipo, texto, dias, autor = EU.id, dados = {}) => db.painel_actividades.push({ id: uid(), site_id: KC, contacto_id: contacto, oportunidade_id: op, tipo, texto, dados, autor, criado_em: typeof dias === 'string' ? dias : haDias(dias, 11) })
  A(cid(5), 'kc-o04', 'chamada', 'Ligou a Dra. Fátima. Quer abrir a 2.ª unidade em março e precisa de manuais de processos e de um plano de contratações.', 5)
  A(cid(5), 'kc-o04', 'etapa', 'Qualificação → Reunião marcada', 4, EU.id, { de: E(2), para: E(3) })
  A(cid(5), 'kc-o04', 'nota', 'Enviar antes da reunião o caso da Clínica Vida (com autorização).', 2)
  A(cid(7), 'kc-o05', 'reuniao', 'Reunião com o Celso e o administrador. Vendem 70 % a particulares; querem chegar a 40 hotéis e restaurantes.', 8, OUTRO_1)
  A(cid(7), 'kc-o05', 'etapa', 'Reunião marcada → Diagnóstico', 7, OUTRO_1, { de: E(3), para: E(4) })
  A(cid(8), 'kc-o06', 'email', 'Proposta enviada: site com reservas directas (380 000 MT).', 6)
  A(cid(8), 'kc-o06', 'etapa', 'Diagnóstico → Proposta', 6, EU.id, { de: E(4), para: E(5) })
  A(cid(12), 'kc-o08', 'chamada', 'O Osvaldo confirmou orçamento aprovado para 25 participantes. Falta fechar datas.', 3)
  A(cid(12), 'kc-o08', 'etapa', 'Proposta → Negociação', 3, EU.id, { de: E(5), para: E(6) })
  A(cid(6), 'kc-o09', 'etapa', 'Negociação → Ganho', 40, EU.id, { de: E(6), para: E(7) })
  A(cid(14), 'kc-o11', 'etapa', 'Proposta → Perdido (motivo: Sem orçamento este ano)', 14, OUTRO_2, { de: E(5), para: E(8) })
  A(cid(0), 'kc-o01', 'sistema', 'Oportunidade criada a partir da mensagem «Pedido de cotação: Perfis Corporativos»', haHoras(0.3))

  // ---- Segmentos ----
  db.painel_segmentos.push(
    { id: 'kc-s1', site_id: KC, nome: 'Leads quentes', filtros: { origens: [], etiquetas: ['quente'], etiquetas_modo: 'qualquer', cidades: [], consentimento: null, criado_de: '', criado_ate: '', oportunidade_aberta: null, servicos: [] }, criado_em: haDias(20) },
    { id: 'kc-s2', site_id: KC, nome: 'Newsletter com consentimento', filtros: { origens: [], etiquetas: ['newsletter'], etiquetas_modo: 'qualquer', cidades: [], consentimento: true, criado_de: '', criado_ate: '', oportunidade_aberta: null, servicos: [] }, criado_em: haDias(15) },
  )

  // ---- Artigos ----
  db.painel_artigos.push(
    {
      id: 'kc-a1', site_id: KC, slug: 'como-preparar-um-plano-de-negocios-para-o-banco', titulo: 'Como preparar um plano de negócios para o banco', categoria: 'Gestão', ambito: 'Kingdom Company',
      resumo: 'O que os bancos moçambicanos analisam num pedido de crédito e como organizar o plano para responder a cada pergunta.',
      corpo_md: '## O que o banco quer saber\n\nUm analista de crédito tem três perguntas: **a empresa consegue pagar**, **o que acontece se correr mal** e **quem está por trás do projeto**. O plano de negócios existe para responder a estas três perguntas com números.\n\n## A estrutura que funciona\n\n- Resumo executivo de uma página\n- Mercado e clientes, com dados de Moçambique\n- Plano de operações e equipa\n- Projeções financeiras a três anos\n- Garantias e plano de reembolso\n\n> Um plano bem feito não promete crescimento: mostra de onde vem cada metical.\n\n## Os erros mais comuns\n\nProjeções sem pressupostos, mercado descrito em termos genéricos e ausência de cenário pessimista. Leia também o nosso guia sobre [tesouraria nas PME](/blog/cinco-erros-de-tesouraria).',
      capa_url: '', seo_titulo: 'Plano de negócios para o banco: guia para PME em Moçambique', seo_descricao: 'O que os bancos analisam num pedido de crédito e como estruturar um plano de negócios que responde a cada pergunta, com exemplos de PME moçambicanas.',
      estado: 'publicado', publicado_em: haDias(34), autor: EU.id, criado_em: haDias(38), actualizado_em: haDias(34),
    },
    {
      id: 'kc-a2', site_id: KC, slug: 'cinco-erros-de-tesouraria', titulo: 'Cinco erros de tesouraria nas PME moçambicanas', categoria: 'Finanças', ambito: 'Kingdom Company',
      resumo: 'Vender bem e ficar sem dinheiro no fim do mês: as causas mais frequentes e como evitá-las.',
      corpo_md: 'Muitas empresas lucrativas ficam sem dinheiro para pagar salários. Na maior parte dos casos, o problema não está nas vendas mas na tesouraria.\n\n## 1. Misturar contas pessoais e da empresa\n\nSem separação, ninguém sabe quanto a empresa realmente gera.\n\n## 2. Dar prazo sem controlar recebimentos\n\nUm cliente que paga a 90 dias é um empréstimo sem juros que a sua empresa concede.\n\n## 3. Comprar stock a mais\n\nDinheiro parado na prateleira não paga fornecedores.',
      capa_url: '', seo_titulo: 'Cinco erros de tesouraria nas PME moçambicanas', seo_descricao: 'As causas mais frequentes de falta de dinheiro em empresas lucrativas e o que fazer para as evitar.',
      estado: 'publicado', publicado_em: haDias(12), autor: EU.id, criado_em: haDias(15), actualizado_em: haDias(12),
    },
    {
      id: 'kc-a3', site_id: KC, slug: 'compliance-por-onde-comecar', titulo: 'Compliance: por onde começar numa empresa familiar', categoria: 'Governança', ambito: 'Kingdom Company',
      resumo: 'Os primeiros três passos para criar regras claras sem paralisar a empresa.',
      corpo_md: '## Comece pelo que já existe\n\nAntes de escrever um código de conduta, liste as decisões que hoje dependem de uma só pessoa.\n\n## Defina quem aprova o quê\n\nUma tabela simples de alçadas resolve metade dos conflitos entre sócios.',
      capa_url: '', seo_titulo: '', seo_descricao: '', estado: 'rascunho', publicado_em: null, autor: EU.id, criado_em: haDias(2), actualizado_em: haHoras(20),
    },
  )

  // ---- DT Company (dados mais pequenos) ----
  const D = [
    ['Abel Chongo', 'abel.chongo@chongoseguros.co.mz', '+258 84 220 1180', 'Chongo Seguros', 'Diretor de conformidade', 'Maputo', 'linkedin', ['banca-seguros'], true, 1],
    ['Marta Sambo', 'marta.sambo@moztelecom-servicos.co.mz', '+258 82 661 0034', 'MozTel Serviços', 'Diretora jurídica', 'Maputo', 'google', ['quente'], true, 3],
    ['Hermínio Cuna', 'herminio.cuna@cunaholding.co.mz', '+258 86 773 4402', 'Cuna Holding', 'Presidente do conselho', 'Beira', 'indicação', ['familiar'], true, 9],
    ['Sónia Matavele', 'sonia.matavele@gmail.com', '+258 84 318 9921', null, 'Gestora de RH', 'Matola', 'instagram', ['newsletter'], true, 14],
    ['Fernando Tivane', 'fernando.tivane@tivaneenergia.co.mz', '+258 87 112 6650', 'Tivane Energia', 'CEO', 'Maputo', 'google', ['quente'], false, 22],
    ['Luísa Macamo', 'luisa.macamo@macamologistica.co.mz', '+258 84 905 2273', 'Macamo Logística', 'Administradora', 'Nacala', 'linkedin', [], true, 30],
    ['Pedro Nhamirre', 'pedro.nhamirre@nhamirrebanco.co.mz', '+258 82 340 7716', 'Banco Comercial do Norte', 'Responsável de risco', 'Nampula', 'evento', ['banca-seguros'], true, 41],
    ['Graça Muchanga', 'graca.muchanga@escolamuchanga.co.mz', '+258 84 587 3309', 'Colégio Muchanga', 'Diretora', 'Maputo', 'facebook', [], false, 52],
  ]
  D.forEach((c, i) => db.painel_contactos.push({ id: `dt-c${i + 1}`, site_id: DT, nome: c[0], email: c[1], telefone: c[2], empresa: c[3], cargo: c[4], cidade: c[5], origem: c[6], etiquetas: c[7], consentimento: c[8], criado_em: haDias(c[9], 10 + i % 6), actualizado_em: haDias(c[9]), utm: {}, notas: null }))
  const DM = [
    [0, 'cotacao', 'Programa de Compliance e Integridade', 'Pedido de cotação: Programa de Compliance e Integridade', 'Precisamos de rever o programa de compliance antes da inspeção do regulador de seguros prevista para fevereiro.', { 'Nº de colaboradores': '210', 'Prazo': 'Janeiro' }, '/compliance-e-governanca', 'nova', 20],
    [1, 'cotacao', 'Due Diligence de Terceiros', 'Pedido de cotação: Due Diligence de Terceiros', 'Vamos contratar 14 subempreiteiros para um projeto de fibra ótica e o cliente exige due diligence de cada um.', { 'Nº de terceiros': '14' }, '/compliance-e-governanca', 'nova', 70],
    [2, 'avaliacao', 'Governança Corporativa e Familiar', 'Avaliação: Governança Corporativa e Familiar', 'Somos uma holding familiar com três gerações na gestão. Queremos um protocolo familiar.', {}, '/compliance-e-governanca', 'lida', 220],
    [4, 'cotacao', 'Planeamento Estratégico', 'Pedido de cotação: Planeamento Estratégico', 'Estratégia para entrar no mercado de energia solar em zonas rurais.', { 'Orçamento previsto': 'A definir' }, '/consultoria-estrategica', 'lida', 520],
  ]
  DM.forEach((m, i) => { const c = db.painel_contactos.find((x) => x.id === `dt-c${m[0] + 1}`); db.painel_mensagens.push({ id: `dt-m${i + 1}`, site_id: DT, contacto_id: c.id, tipo: m[1], servico: m[2], assunto: m[3], corpo: m[4], dados: { Nome: c.nome, Email: c.email, Telefone: c.telefone, Empresa: c.empresa, ...m[5] }, pagina: m[6], estado: m[7], respondida_em: null, criado_em: haHoras(m[8]) }) })
  const DO = [
    [1, 'Compliance · Chongo Seguros', 0, 'Programa de Compliance e Integridade', 1650000, 'Ligar ao Abel para qualificar', 0, { necessidade: true }],
    [3, 'Protocolo familiar · Cuna Holding', 2, 'Governança Corporativa e Familiar', 2100000, 'Reunião com os três irmãos', 6, { necessidade: true, autoridade: 'Conselho de família' }],
    [5, 'Estratégia solar · Tivane Energia', 4, 'Planeamento Estratégico', 890000, 'Rever proposta com o CEO', -3, { necessidade: true, autoridade: true, orcamento: true }],
    [7, 'Due diligence · Banco Comercial do Norte', 6, 'Due Diligence de Terceiros', 1200000, null, null, { necessidade: true, autoridade: true, orcamento: true, prazo: true }],
  ]
  DO.forEach((o, i) => { const etapa = db.painel_etapas.find((e) => e.id === `${DT}-e${o[0]}`); db.painel_oportunidades.push({ id: `dt-o${i + 1}`, site_id: DT, contacto_id: `dt-c${o[2] + 1}`, etapa_id: etapa.id, titulo: o[1], servico: o[3], valor: o[4], moeda: 'MZN', responsavel: i % 2 ? OUTRO_1 : EU.id, proxima_accao: o[5], proxima_data: o[6] == null ? null : dataRel(o[6]), bant: o[7], ordem: i, mensagem_id: null, motivo_perda: null, criado_em: haDias(10 + i * 6), actualizado_em: haDias(2 + i), fechado_em: etapa.tipo === 'aberta' ? null : haDias(12) }) })
  db.painel_artigos.push({ id: 'dt-a1', site_id: DT, slug: 'due-diligence-de-terceiros-guia', titulo: 'Due diligence de terceiros: guia prático', categoria: 'Compliance', ambito: 'DT Company', resumo: 'Como avaliar fornecedores e parceiros antes de assinar.', corpo_md: '## Porquê\n\nO risco de um parceiro passa a ser o seu risco.', capa_url: '', seo_titulo: '', seo_descricao: '', estado: 'publicado', publicado_em: haDias(20), autor: OUTRO_1, criado_em: haDias(22), actualizado_em: haDias(20) })
  return db
}

// ---------- Consulta (subconjunto do construtor do PostgREST) ----------
function compilarPadrao(p) {
  const esc = String(p).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/\*/g, '.*').replace(/_/g, '.')
  return new RegExp('^' + esc + '$', 'is')
}
function compara(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'pt', { sensitivity: 'base' })
}

class Consulta {
  constructor(motor, tabela) {
    this.m = motor; this.t = tabela; this.f = []; this.ordens = []; this.op = 'select'
    this.opcoes = {}; this.devolver = false; this.um = null; this.lim = null; this.intervalo = null
  }
  select(_cols, opcoes) { if (this.op === 'select') this.opcoes = opcoes || {}; else this.devolver = true; return this }
  insert(linhas) { this.op = 'insert'; this.carga = linhas; return this }
  update(patch) { this.op = 'update'; this.carga = patch; return this }
  upsert(linhas) { this.op = 'upsert'; this.carga = linhas; return this }
  delete() { this.op = 'delete'; return this }
  eq(c, v) { this.f.push((r) => r[c] === v || (r[c] != null && v != null && String(r[c]) === String(v))); return this }
  neq(c, v) { this.f.push((r) => r[c] !== v); return this }
  gt(c, v) { this.f.push((r) => r[c] != null && r[c] > v); return this }
  gte(c, v) { this.f.push((r) => r[c] != null && r[c] >= v); return this }
  lt(c, v) { this.f.push((r) => r[c] != null && r[c] < v); return this }
  lte(c, v) { this.f.push((r) => r[c] != null && r[c] <= v); return this }
  in(c, vs) { const s = new Set(vs); this.f.push((r) => s.has(r[c])); return this }
  is(c, v) { this.f.push((r) => (v === null ? r[c] == null : r[c] === v)); return this }
  not(c, op, v) { if (op === 'is' && (v === null || v === 'null')) this.f.push((r) => r[c] != null); else if (op === 'eq') this.f.push((r) => r[c] !== v); return this }
  ilike(c, p) { const re = compilarPadrao(p); this.f.push((r) => r[c] != null && re.test(String(r[c]))); return this }
  contains(c, vs) { this.f.push((r) => Array.isArray(r[c]) && vs.every((v) => r[c].includes(v))); return this }
  overlaps(c, vs) { this.f.push((r) => Array.isArray(r[c]) && vs.some((v) => r[c].includes(v))); return this }
  or(expr) {
    const partes = expr.split(',').map((p) => { const [c, op, ...resto] = p.split('.'); return { c, op, v: resto.join('.') } })
    const testes = partes.map(({ c, op, v }) => {
      if (op === 'ilike') { const re = compilarPadrao(v); return (r) => r[c] != null && re.test(String(r[c])) }
      if (op === 'eq') return (r) => String(r[c]) === v
      if (op === 'is') return (r) => (v === 'null' ? r[c] == null : String(r[c]) === v)
      return () => false
    })
    this.f.push((r) => testes.some((t) => t(r)))
    return this
  }
  order(c, { ascending = true } = {}) { this.ordens.push({ c, asc: ascending }); return this }
  range(a, b) { this.intervalo = [a, b]; return this }
  limit(n) { this.lim = n; return this }
  single() { this.um = 'single'; return this }
  maybeSingle() { this.um = 'maybe'; return this }
  then(ok, falha) { return new Promise((r) => setTimeout(r, 60 + Math.random() * 90)).then(() => this.executar()).then(ok, falha) }

  executar() {
    const tab = this.m.db[this.t]
    if (!tab) return { data: null, error: { message: `Tabela ${this.t} não existe` } }
    const passa = (r) => this.f.every((fn) => fn(r))
    let res
    if (this.op === 'select') {
      res = tab.filter(passa)
      for (const o of [...this.ordens].reverse()) res.sort((a, b) => (o.asc ? 1 : -1) * compara(a[o.c], b[o.c]))
      const total = res.length
      if (this.intervalo) res = res.slice(this.intervalo[0], this.intervalo[1] + 1)
      if (this.lim != null) res = res.slice(0, this.lim)
      if (this.opcoes.head) return { data: null, count: total, error: null }
      return this.fim(clone(res), this.opcoes.count ? total : null)
    }
    if (this.op === 'insert' || this.op === 'upsert') {
      const lista = Array.isArray(this.carga) ? this.carga : [this.carga]
      const novas = []
      for (const l of lista) {
        const r = { ...(DEFEITOS[this.t] ? DEFEITOS[this.t]() : {}), id: uid(), criado_em: new Date().toISOString(), ...clone(l) }
        if (COM_ACTUALIZADO.has(this.t)) r.actualizado_em = r.criado_em
        const dup = this.m.duplicado(this.t, r)
        if (dup) return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } }
        if (this.t === 'painel_artigos' && !/^[a-z0-9-]+$/.test(r.slug || '')) return { data: null, error: { code: '23514', message: 'O endereço (slug) só pode ter letras minúsculas, números e hífenes.' } }
        tab.push(r); novas.push(r)
      }
      novas.forEach((r) => this.m.emitir(this.t, 'INSERT', r))
      return this.fim(this.devolver ? clone(novas) : null)
    }
    if (this.op === 'update') {
      const alvo = tab.filter(passa)
      for (const r of alvo) {
        const novo = { ...r, ...clone(this.carga) }
        const dup = this.m.duplicado(this.t, novo, r)
        if (dup) return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } }
      }
      for (const r of alvo) { Object.assign(r, clone(this.carga)); if (COM_ACTUALIZADO.has(this.t)) r.actualizado_em = new Date().toISOString(); this.m.emitir(this.t, 'UPDATE', r) }
      return this.fim(this.devolver ? clone(alvo) : null)
    }
    if (this.op === 'delete') {
      const fora = tab.filter(passa)
      this.m.db[this.t] = tab.filter((r) => !passa(r))
      fora.forEach((r) => this.m.emitir(this.t, 'DELETE', r))
      this.m.cascata(this.t, fora)
      return this.fim(this.devolver ? clone(fora) : null)
    }
  }
  fim(data, count = null) {
    if (this.um) {
      const arr = data || []
      if (this.um === 'single' && arr.length !== 1) return { data: null, error: { code: 'PGRST116', message: 'Nenhuma linha encontrada' } }
      return { data: arr[0] || null, error: null }
    }
    return { data, count, error: null }
  }
}

export function criarClienteDemo() {
  const motor = {
    db: semente(),
    ouvintes: [],
    duplicado(t, r, antigo) {
      if (t === 'painel_contactos' && r.email) return this.db[t].some((x) => x !== antigo && x.site_id === r.site_id && x.email && x.email.toLowerCase() === r.email.toLowerCase() && x.id !== r.id)
      if (t === 'painel_artigos') return this.db[t].some((x) => x !== antigo && x.site_id === r.site_id && x.slug === r.slug && x.id !== r.id)
      return false
    },
    cascata(t, linhas) {
      const ids = new Set(linhas.map((l) => l.id))
      if (t === 'painel_contactos') {
        this.db.painel_actividades = this.db.painel_actividades.filter((a) => !ids.has(a.contacto_id))
        for (const x of [...this.db.painel_mensagens, ...this.db.painel_oportunidades]) if (ids.has(x.contacto_id)) x.contacto_id = null
      }
      if (t === 'painel_oportunidades') this.db.painel_actividades = this.db.painel_actividades.filter((a) => !ids.has(a.oportunidade_id))
    },
    emitir(t, evento, linha) {
      if (!TEMPO_REAL.has(t)) return
      for (const o of this.ouvintes) {
        if (o.tabela !== t) continue
        if (o.siteId && linha.site_id !== o.siteId) continue
        setTimeout(() => o.cb({ eventType: evento, new: evento === 'DELETE' ? {} : clone(linha), old: evento === 'DELETE' ? clone(linha) : {} , table: t }), 30)
      }
    },
  }
  let sessao = { user: EU, access_token: 'demo' }
  const ouvintesAuth = []
  const cliente = {
    from: (t) => new Consulta(motor, t),
    auth: {
      async getSession() { return { data: { session: sessao }, error: null } },
      async getUser() { return { data: { user: sessao ? sessao.user : null }, error: null } },
      async signInWithPassword({ email }) {
        await new Promise((r) => setTimeout(r, 300))
        sessao = { user: { ...EU, email: email || EU.email }, access_token: 'demo' }
        ouvintesAuth.forEach((cb) => cb('SIGNED_IN', sessao))
        return { data: { user: sessao.user, session: sessao }, error: null }
      },
      async signOut() { sessao = null; ouvintesAuth.forEach((cb) => cb('SIGNED_OUT', null)); return { error: null } },
      onAuthStateChange(cb) { ouvintesAuth.push(cb); return { data: { subscription: { unsubscribe() { const i = ouvintesAuth.indexOf(cb); if (i >= 0) ouvintesAuth.splice(i, 1) } } } } },
    },
    functions: {
      async invoke(nome, { body }) {
        await new Promise((r) => setTimeout(r, 700))
        if (nome !== 'painel-email') return { data: null, error: { message: 'Função desconhecida' } }
        const site = motor.db.painel_sites.find((s) => s.id === body.site_id)
        if (!site || !site.email_remetente) return { data: { erro: `O domínio de email de ${site ? site.dominio : 'este site'} ainda não está configurado para envio.` }, error: null }
        const id = uid()
        motor.db.painel_actividades.push({ id: uid(), site_id: body.site_id, contacto_id: body.contacto_id || null, oportunidade_id: body.oportunidade_id || null, tipo: 'email', texto: `Email enviado: ${body.assunto}`, dados: { para: body.para, assunto: body.assunto, corpo: body.corpo, id }, autor: sessao?.user.id, criado_em: new Date().toISOString() })
        if (body.mensagem_id) { const m = motor.db.painel_mensagens.find((x) => x.id === body.mensagem_id); if (m) { m.respondida_em = new Date().toISOString(); motor.emitir('painel_mensagens', 'UPDATE', m) } }
        return { data: { ok: true, id }, error: null }
      },
    },
    channel() {
      const canal = { regs: [], on(_tipo, filtro, cb) { const site = /site_id=eq\.(.+)$/.exec(filtro.filter || ''); this.regs.push({ tabela: filtro.table, siteId: site ? site[1] : null, cb }); return this }, subscribe(cb) { motor.ouvintes.push(...this.regs); cb && cb('SUBSCRIBED'); return this } }
      return canal
    },
    removeChannel(canal) { motor.ouvintes = motor.ouvintes.filter((o) => !canal.regs.includes(o)) },
  }
  // Ganchos para testes e demonstrações: simular a chegada de uma mensagem do site.
  window.__painelDemo = {
    db: motor.db,
    novaMensagem(siteId = 'site-kingdom') {
      const c = { id: uid(), site_id: siteId, nome: 'Zacarias Mavie', email: 'zacarias.mavie@maviecomercial.co.mz', telefone: '+258 84 702 3315', empresa: 'Mavie Comercial', cargo: 'Gerente', cidade: 'Maputo', origem: 'google', utm: { source: 'google', medium: 'cpc', campaign: 'plano-negocios-nov' }, etiquetas: [], consentimento: true, notas: null, criado_em: new Date().toISOString(), actualizado_em: new Date().toISOString() }
      motor.db.painel_contactos.push(c)
      const m = { id: uid(), site_id: siteId, contacto_id: c.id, tipo: 'cotacao', servico: 'Websites e Aplicativos', assunto: 'Pedido de cotação: Websites e Aplicativos', corpo: 'Boa tarde. Precisamos de um site novo com formulário de pedidos de orçamento. Podem enviar uma estimativa?', dados: { Nome: c.nome, Email: c.email, Telefone: c.telefone, Empresa: c.empresa, 'Orçamento previsto': 'Até 250 000 MT' }, pagina: '/servicos/plano-de-negocios', estado: 'nova', respondida_em: null, criado_em: new Date().toISOString() }
      motor.db.painel_mensagens.push(m)
      motor.emitir('painel_mensagens', 'INSERT', m)
      return m.id
    },
  }
  return cliente
}
