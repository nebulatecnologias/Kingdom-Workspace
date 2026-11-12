// Caixa de mensagens: lista + painel de leitura (um de cada vez no telemóvel), filtros, tempo real.
import { h, limpar, icone, botao, chip, esqueleto, vazio, aviso, erro, copiar, fmtRelativo, fmtDataHora, iniciais, semAcentos, adiar, TIPOS_MSG, TIPOS_MSG_CURTO, rotuloOrigem } from '../ui.js'
import { abrirEmail, abrirOportunidade } from '../partilhado.js'

const TOM_TIPO = { cotacao: 'acento', avaliacao: 'info', contacto: 'neutro', newsletter: 'marca', outro: 'neutro' }

export async function montar(el, ctx, params) {
  const { dados } = ctx
  const f = { vista: 'caixa', tipo: '', servico: '', q: params.query.get('q') || '' }
  let mensagens = []
  let contactos = new Map()
  let opsPorMensagem = new Map()
  let selId = params.id || null
  let valores = { servicosPedidos: [] }

  const sub = h('p', { class: 'sub' })
  const seg = h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Estado' })
  const iPesq = h('input', { type: 'search', placeholder: 'Procurar nome, empresa ou texto', 'aria-label': 'Procurar mensagens', value: f.q })
  const sTipo = h('select', { 'aria-label': 'Tipo de mensagem' }, h('option', { value: '' }, 'Todos os tipos'), Object.entries(TIPOS_MSG).map(([v, r]) => h('option', { value: v }, r)))
  const sServ = h('select', { 'aria-label': 'Serviço' }, h('option', { value: '' }, 'Todos os serviços'))
  const lista = h('ul', { class: 'caixa-itens', 'aria-label': 'Mensagens' })
  const leitura = h('section', { class: 'caixa-leitura', 'aria-label': 'Mensagem selecionada', tabindex: '-1' })
  const caixa = h('div', { class: 'bloco caixa' },
    h('div', { class: 'caixa-lista' },
      h('div', { class: 'caixa-lista-cab' }, seg,
        h('div', { class: 'filtros', style: { margin: 0 } }, h('div', { class: 'pesq', style: { maxWidth: 'none' } }, icone('procurar', 16), iPesq)),
        h('div', { class: 'linha' }, sTipo, sServ)),
      lista),
    leitura)
  el.appendChild(h('div', { class: 'pagina' },
    h('div', { class: 'pagina-cab' }, h('div', null, h('h1', null, 'Caixa de mensagens'), sub)),
    caixa))

  function desenharSeg(contagens = {}) {
    limpar(seg)
    ;[['caixa', 'Caixa'], ['nova', 'Por ler'], ['arquivada', 'Arquivadas']].forEach(([v, r]) => seg.appendChild(h('button', { type: 'button', 'aria-pressed': String(f.vista === v), onclick: () => { f.vista = v; desenharSeg(contagens); carregar() } }, r, contagens[v] != null ? h('span', { class: 'n' }, contagens[v]) : null)))
  }
  desenharSeg()
  iPesq.addEventListener('input', adiar(() => { f.q = iPesq.value.trim(); desenharLista() }, 180))
  sTipo.addEventListener('change', () => { f.tipo = sTipo.value; carregar() })
  sServ.addEventListener('change', () => { f.servico = sServ.value; carregar() })

  async function carregar({ manterScroll = false } = {}) {
    const scroll = lista.scrollTop
    if (!manterScroll) limpar(lista).appendChild(h('li', null, esqueleto(7)))
    try {
      const [msgs, mapa, ops, porLer] = await Promise.all([
        dados.mensagens({ estado: f.vista, tipo: f.tipo, servico: f.servico }),
        dados.mapaContactos(), dados.oportunidades(), dados.contagemPorLer(),
      ])
      mensagens = msgs; contactos = mapa
      opsPorMensagem = new Map(ops.filter((o) => o.mensagem_id).map((o) => [o.mensagem_id, o]))
      sub.textContent = porLer ? `${porLer} ${porLer === 1 ? 'mensagem por ler' : 'mensagens por ler'}` : 'Está tudo lido'
      desenharSeg({ nova: porLer || null })
      desenharLista()
      if (manterScroll) lista.scrollTop = scroll
      desenharLeitura()
    } catch (e) { erro(e, 'Não foi possível carregar as mensagens'); limpar(lista) }
  }
  try {
    valores = await dados.valoresDistintos()
    valores.servicosPedidos.forEach((s) => sServ.appendChild(h('option', { value: s }, s)))
  } catch {}

  const nomeDe = (m) => { const c = contactos.get(m.contacto_id); return c?.nome || m.dados?.Nome || m.dados?.nome || c?.email || m.dados?.Email || 'Visitante do site' }
  function filtradas() {
    if (!f.q) return mensagens
    const t = semAcentos(f.q)
    return mensagens.filter((m) => { const c = contactos.get(m.contacto_id) || {}; return semAcentos([nomeDe(m), c.email, c.empresa, m.assunto, m.corpo, m.servico].filter(Boolean).join(' ')).includes(t) })
  }

  function desenharLista() {
    limpar(lista)
    const itens = filtradas()
    if (!itens.length) {
      const semFiltros = !f.q && !f.tipo && !f.servico
      if (semFiltros && f.vista === 'caixa' && !mensagens.length) lista.appendChild(h('li', null, vazioIntegracao(ctx)))
      else lista.appendChild(h('li', null, vazio({ icone: f.vista === 'nova' ? 'certo' : 'caixa', titulo: f.vista === 'nova' && semFiltros ? 'Está tudo lido' : f.vista === 'arquivada' && semFiltros ? 'Nada arquivado' : 'Nenhuma mensagem com estes filtros', texto: semFiltros ? null : 'Experimente outro tipo, serviço ou texto de pesquisa.', accoes: semFiltros ? null : [botao('Limpar filtros', { onclick: () => { f.q = ''; f.tipo = ''; f.servico = ''; iPesq.value = ''; sTipo.value = ''; sServ.value = ''; carregar() } })] })))
      return
    }
    for (const m of itens) {
      const c = contactos.get(m.contacto_id)
      lista.appendChild(h('li', null, h('a', { href: '#/caixa/' + m.id, class: `msg-item ${m.estado === 'nova' ? 'nova' : ''} ${m.id === selId ? 'sel' : ''}`, 'aria-current': m.id === selId ? 'true' : null, dataset: { id: m.id } },
        h('span', { class: 'ponto', 'aria-label': m.estado === 'nova' ? 'Por ler' : null }),
        h('span', { class: 'de' }, nomeDe(m), c?.empresa ? h('span', { class: 'texto-fraco', style: { fontWeight: 400 } }, ' · ' + c.empresa) : null),
        h('span', { class: 'quando' }, fmtRelativo(m.criado_em)),
        h('span', { class: 'assunto' }, m.assunto || m.servico || TIPOS_MSG[m.tipo]),
        m.corpo ? h('span', { class: 'resumo' }, m.corpo) : null,
        h('span', { class: 'chips' }, chip(TIPOS_MSG_CURTO[m.tipo], { tom: TOM_TIPO[m.tipo] }), m.respondida_em ? chip('Respondida', { tom: 'sucesso', icone: 'responder' }) : null, opsPorMensagem.has(m.id) ? chip('Oportunidade', { tom: 'marca', icone: 'alvo' }) : null))))
    }
  }

  async function desenharLeitura() {
    caixa.classList.toggle('a-ler', !!selId)
    limpar(leitura)
    if (!selId) {
      leitura.appendChild(vazio({ icone: 'aberto', titulo: 'Escolha uma mensagem', texto: 'As mensagens dos formulários do site aparecem à esquerda, das mais recentes para as mais antigas. Ao abrir uma mensagem, ela fica marcada como lida.' }))
      return
    }
    let m = mensagens.find((x) => x.id === selId)
    if (!m) {
      try { m = await dados.mensagem(selId) } catch (e) { erro(e) }
      if (!m) { leitura.appendChild(vazio({ icone: 'alerta', titulo: 'Mensagem não encontrada', texto: 'Pode ter sido apagada ou pertencer a outro site.' })); return }
    }
    if (m.estado === 'nova') {
      m.estado = 'lida'
      dados.actualizarMensagem(m.id, { estado: 'lida' }).then(() => { ctx.actualizarContagem(); desenharLista() }).catch((e) => erro(e))
    }
    const c = contactos.get(m.contacto_id) || (m.contacto_id ? await dados.contacto(m.contacto_id).catch(() => null) : null)
    const email = c?.email || m.dados?.Email || m.dados?.email
    const telefone = c?.telefone || m.dados?.Telefone || m.dados?.telefone
    const nome = nomeDe(m)
    const op = opsPorMensagem.get(m.id)

    const marcar = async (estado, texto) => {
      try { await dados.actualizarMensagem(m.id, { estado }); m.estado = estado; aviso(texto); ctx.actualizarContagem(); if ((f.vista === 'nova' && estado !== 'nova') || (f.vista === 'caixa' && estado === 'arquivada') || (f.vista === 'arquivada' && estado !== 'arquivada')) { mensagens = mensagens.filter((x) => x.id !== m.id); ctx.navegar('#/caixa') } else { desenharLista(); desenharLeitura() } }
      catch (e) { erro(e, 'Não foi possível atualizar') }
    }
    const barra = h('div', { class: 'leitura-barra' },
      botao('', { icone: 'esquerda', tipo: 'fantasma', rotulo: 'Voltar à lista', extra: 'leitura-voltar', onclick: () => ctx.navegar('#/caixa') }),
      email ? botao('Responder', { tipo: 'primario', icone: 'responder', onclick: () => abrirEmail(ctx, { para: email, nome, assunto: /^re:/i.test(m.assunto || '') ? m.assunto : 'Re: ' + (m.assunto || (m.servico ? 'Pedido sobre ' + m.servico : 'O seu contacto')), contacto_id: m.contacto_id, mensagem_id: m.id, aoEnviar: () => { m.respondida_em = new Date().toISOString(); desenharLista(); desenharLeitura() } }) }) : null,
      op ? h('a', { class: 'btn btn-secundario', href: '#/funil/' + op.id }, icone('alvo', 18), h('span', null, 'Ver oportunidade'))
        : botao('Criar oportunidade', { icone: 'alvo', onclick: () => criarOportunidade(m, c) }),
      h('span', { class: 'espaco' }),
      m.estado === 'arquivada'
        ? botao('', { icone: 'caixa', tipo: 'fantasma', rotulo: 'Mover para a caixa', onclick: () => marcar('lida', 'Mensagem movida para a caixa.') })
        : botao('', { icone: m.estado === 'nova' ? 'aberto' : 'email', tipo: 'fantasma', rotulo: m.estado === 'nova' ? 'Marcar como lida' : 'Marcar como por ler', onclick: () => marcar(m.estado === 'nova' ? 'lida' : 'nova', m.estado === 'nova' ? 'Marcada como lida.' : 'Marcada como por ler.') }),
      m.estado !== 'arquivada' ? botao('', { icone: 'arquivar', tipo: 'fantasma', rotulo: 'Arquivar', onclick: () => marcar('arquivada', 'Mensagem arquivada.') }) : null,
      m.contacto_id ? h('a', { class: 'btn btn-fantasma btn-icone', href: '#/contactos/' + m.contacto_id, 'aria-label': 'Abrir contacto', title: 'Abrir contacto' }, icone('pessoa', 18)) : null)

    const dadosForm = Object.entries(m.dados || {}).filter(([k, v]) => k !== 'utm' && v != null && v !== '' && typeof v !== 'object')
    const utm = { ...(c?.utm || {}), ...((m.dados && typeof m.dados.utm === 'object') ? m.dados.utm : {}) }
    const origem = [['Página', m.pagina], ['Origem', c?.origem ? rotuloOrigem(c.origem) : null], ['Fonte (utm_source)', utm.source || utm.utm_source], ['Meio (utm_medium)', utm.medium || utm.utm_medium], ['Campanha (utm_campaign)', utm.campaign || utm.utm_campaign], ['Termo (utm_term)', utm.term || utm.utm_term]].filter(([, v]) => v)

    leitura.append(barra, h('article', { class: 'leitura' },
      h('header', { class: 'leitura-cab' },
        h('span', { class: 'avatar' }, iniciais(nome)),
        h('div', { class: 'leitura-de', style: { minWidth: 0 } },
          h('h2', null, nome, c?.empresa ? h('span', { class: 'texto-fraco', style: { fontWeight: 400 } }, ' · ' + c.empresa) : null),
          h('div', { class: 'meta' },
            email ? h('a', { href: 'mailto:' + email }, icone('email', 14), email) : null,
            telefone ? h('a', { href: 'tel:' + telefone.replace(/\s/g, '') }, icone('telefone', 14), telefone) : null,
            h('span', { title: fmtDataHora(m.criado_em) }, icone('relogio', 14), fmtDataHora(m.criado_em))))),
      h('div', { class: 'chips' }, chip(TIPOS_MSG[m.tipo], { tom: TOM_TIPO[m.tipo] }), m.servico ? chip(m.servico, { tom: 'neutro' }) : null, m.respondida_em ? chip('Respondida ' + fmtRelativo(m.respondida_em), { tom: 'sucesso', icone: 'responder' }) : null, m.estado === 'arquivada' ? chip('Arquivada') : null),
      m.assunto ? h('h3', { class: 'leitura-assunto' }, m.assunto) : null,
      m.corpo ? h('p', { class: 'leitura-corpo' }, m.corpo) : h('p', { class: 'texto-suave' }, m.tipo === 'newsletter' ? 'Inscrição na newsletter, sem mensagem escrita.' : 'Sem texto na mensagem.'),
      op ? h('a', { class: 'ligado', href: '#/funil/' + op.id }, h('span', { class: 'icone-redondo' }, icone('alvo', 16)), h('span', { class: 'textos' }, h('strong', null, op.titulo), h('small', null, 'Oportunidade criada a partir desta mensagem')), icone('direita', 18)) : null,
      dadosForm.length ? h('section', null, h('h3', { class: 'seccao-titulo' }, 'Dados do formulário'), h('dl', { class: 'dl' }, dadosForm.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, String(v))]))) : null,
      origem.length ? h('section', null, h('h3', { class: 'seccao-titulo' }, 'De onde veio'), h('dl', { class: 'dl' }, origem.flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)]))) : null))
  }

  async function criarOportunidade(m, c) {
    const etapas = await dados.etapas()
    const etapa = etapas.find((e) => semAcentos(e.nome) === 'novo lead') || etapas.find((e) => e.tipo === 'aberta')
    const quem = c?.empresa || c?.nome || m.dados?.Empresa || m.dados?.Nome || ''
    const titulo = [m.servico || TIPOS_MSG[m.tipo], quem].filter(Boolean).join(' · ')
    abrirOportunidade(ctx, {
      inicial: { titulo, servico: m.servico || null, contacto_id: m.contacto_id || null, mensagem_id: m.id, etapa_id: etapa?.id, proxima_accao: 'Responder ao pedido', proxima_data: new Date().toISOString().slice(0, 10) },
      origemTexto: `Oportunidade criada a partir da mensagem «${m.assunto || TIPOS_MSG[m.tipo]}»`,
      aoGuardar: (op) => { opsPorMensagem.set(m.id, op); desenharLista(); desenharLeitura(); aviso('Oportunidade criada em ' + (etapa?.nome || 'Novo lead') + '.', { tipo: 'sucesso', accao: { texto: 'Ver no funil', fazer: () => ctx.navegar('#/funil/' + op.id) } }) },
    })
  }

  const aoChegar = adiar(() => carregar({ manterScroll: true }), 300)
  document.addEventListener('painel:mensagem', aoChegar)
  await carregar()

  return {
    aoMudar(p) { selId = p.id || null; lista.querySelectorAll('.msg-item').forEach((a) => { const s = a.dataset.id === selId; a.classList.toggle('sel', s); if (s) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current') }); desenharLeitura(); if (selId && innerWidth <= 768) window.scrollTo(0, 0) },
    destruir() { document.removeEventListener('painel:mensagem', aoChegar); aoChegar.cancelar() },
  }
}

export function vazioIntegracao(ctx) {
  const snippet = `<script src="https://painel.kingdomcompany.co.za/recolha.js" data-site="${ctx.site.chave}" defer></script>`
  return vazio({
    icone: 'caixa', titulo: 'Ainda não chegaram mensagens',
    texto: 'As mensagens chegam dos formulários do seu site. Cole este código antes de </body> em cada página com formulários; os envios passam a aparecer aqui em tempo real.',
    extra: h('div', { class: 'codigo-caixa' }, h('pre', { class: 'codigo' }, snippet), botao('Copiar código', { icone: 'copiar', tamanho: 'peq', onclick: async () => { aviso((await copiar(snippet)) ? 'Código copiado.' : 'Não foi possível copiar. Selecione o texto e copie à mão.', { tipo: 'sucesso' }) } })),
    accoes: [botao('Abrir definições', { onclick: () => ctx.navegar('#/definicoes') })],
  })
}
