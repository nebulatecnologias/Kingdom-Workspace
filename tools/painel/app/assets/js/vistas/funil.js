// Funil (Kanban): colunas por etapa, arrastar entre e dentro de colunas (rato, caneta e toque longo),
// "Mover para…" no telemóvel e por teclado, filtros, gaveta de edição e tempo real.
import { h, limpar, icone, botao, esqueleto, vazio, aviso, erro, abrirMenu, fmtMT, fmtNumero, fmtData, fmtPrazo, diasAte, pontoBant, semAcentos, adiar, lerLocal, guardarLocal } from '../ui.js'
import { abrirOportunidade, pedirMotivoPerda } from '../partilhado.js'

const movel = () => matchMedia('(max-width: 768px)').matches

export async function montar(el, ctx, params) {
  const { dados } = ctx
  let etapas = [], ops = [], contactos = new Map()
  const f = { resp: '', servico: '', q: '' }
  let etapaMovel = lerLocal('funil-etapa-' + ctx.site.id, null)
  let arrasto = null
  let gavetaAberta = null

  const resumo = h('p', { class: 'sub resumo-funil' })
  const iPesq = h('input', { type: 'search', placeholder: 'Procurar título, contacto ou empresa', 'aria-label': 'Procurar oportunidades' })
  const sResp = h('select', { 'aria-label': 'Responsável' })
  const sServ = h('select', { 'aria-label': 'Serviço' })
  const etapasMovel = h('div', { class: 'etapas-movel', role: 'group', 'aria-label': 'Etapa visível' })
  const quadro = h('div', { class: 'quadro', role: 'region', 'aria-label': 'Quadro de oportunidades por etapa' })
  const corpo = h('div', null, esqueleto(5, 'blocos'))
  el.appendChild(h('div', { class: 'pagina' },
    h('div', { class: 'pagina-cab' }, h('div', null, h('h1', null, 'Funil de vendas'), resumo),
      h('div', { class: 'pagina-accoes' }, botao('Nova oportunidade', { tipo: 'primario', icone: 'mais', onclick: () => abrirNova() }))),
    h('div', { class: 'filtros' }, h('div', { class: 'pesq' }, icone('procurar', 16), iPesq), sResp, sServ),
    corpo))

  iPesq.addEventListener('input', adiar(() => { f.q = iPesq.value.trim(); desenhar() }, 150))
  sResp.addEventListener('change', () => { f.resp = sResp.value; desenhar() })
  sServ.addEventListener('change', () => { f.servico = sServ.value; desenhar() })

  async function carregar() {
    try {
      const [e, o, m] = await Promise.all([dados.etapas(), dados.oportunidades(), dados.mapaContactos()])
      etapas = e; ops = o; contactos = m
    } catch (err) { erro(err, 'Não foi possível carregar o funil'); return false }
    // filtros
    const servicos = [...new Set(ops.map((o) => o.servico).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'))
    limpar(sServ).append(h('option', { value: '' }, 'Todos os serviços'), ...servicos.map((s) => h('option', { value: s, selected: s === f.servico }, s)))
    limpar(sResp).append(h('option', { value: '' }, 'Todos os responsáveis'), h('option', { value: 'eu', selected: f.resp === 'eu' }, 'As minhas'), h('option', { value: 'nenhum', selected: f.resp === 'nenhum' }, 'Sem responsável'),
      ...ctx.membros.filter((m) => m.user_id !== ctx.eu?.id).map((m) => h('option', { value: m.user_id, selected: f.resp === m.user_id }, ctx.rotuloMembro(m.user_id))))
    return true
  }

  function visiveis() {
    const t = semAcentos(f.q)
    return ops.filter((o) => {
      if (f.resp === 'eu' && o.responsavel !== ctx.eu?.id) return false
      if (f.resp === 'nenhum' && o.responsavel) return false
      if (f.resp && !['eu', 'nenhum'].includes(f.resp) && o.responsavel !== f.resp) return false
      if (f.servico && o.servico !== f.servico) return false
      if (t) { const c = contactos.get(o.contacto_id) || {}; if (!semAcentos([o.titulo, c.nome, c.empresa, o.servico].filter(Boolean).join(' ')).includes(t)) return false }
      return true
    })
  }

  function desenhar() {
    if (!etapas.length) { limpar(corpo).appendChild(vazio({ icone: 'funil', titulo: 'O funil ainda não tem etapas', texto: ctx.ehAdmin ? 'Crie as etapas do processo comercial em Definições.' : 'Peça a um administrador para criar as etapas em Definições.', accoes: ctx.ehAdmin ? [botao('Abrir definições', { onclick: () => ctx.navegar('#/definicoes') })] : null })); return }
    const lista = visiveis()
    const abertasIds = new Set(etapas.filter((e) => e.tipo === 'aberta').map((e) => e.id))
    const abertas = ops.filter((o) => abertasIds.has(o.etapa_id))
    limpar(resumo).append(h('span', null, h('strong', null, fmtNumero(abertas.length)), abertas.length === 1 ? ' oportunidade aberta' : ' oportunidades abertas'), h('span', null, h('strong', null, fmtMT(abertas.reduce((s, o) => s + (Number(o.valor) || 0), 0))), ' em aberto'))
    if (!etapaMovel || !etapas.some((e) => e.id === etapaMovel)) etapaMovel = etapas[0].id

    limpar(etapasMovel)
    for (const e of etapas) {
      const n = lista.filter((o) => o.etapa_id === e.id).length
      etapasMovel.appendChild(h('button', { type: 'button', 'aria-pressed': String(e.id === etapaMovel), onclick: (ev) => { etapaMovel = e.id; guardarLocal('funil-etapa-' + ctx.site.id, e.id); desenhar(); setTimeout(() => etapasMovel.querySelector('[aria-pressed=true]')?.scrollIntoView({ inline: 'center', block: 'nearest' }), 0) } }, h('span', { class: 'ponto-cor', style: { background: e.cor || '#8A8FA8' } }), e.nome, h('span', { class: 'n' }, n)))
    }
    limpar(quadro)
    for (const e of etapas) {
      const daEtapa = lista.filter((o) => o.etapa_id === e.id).sort((a, b) => a.ordem - b.ordem)
      const soma = daEtapa.reduce((s, o) => s + (Number(o.valor) || 0), 0)
      const cartoes = h('div', { class: 'coluna-cartoes', dataset: { etapa: e.id } })
      if (!daEtapa.length) cartoes.appendChild(h('div', { class: 'coluna-vazia' }, e.tipo === 'aberta' ? 'Arraste uma oportunidade para aqui' : e.tipo === 'ganha' ? 'Os negócios ganhos aparecem aqui' : 'As oportunidades perdidas aparecem aqui'))
      daEtapa.forEach((o) => cartoes.appendChild(cartao(o, e)))
      quadro.appendChild(h('section', { class: 'coluna' + (e.id === etapaMovel ? ' visivel-movel' : ''), dataset: { etapa: e.id }, 'aria-label': `${e.nome}: ${daEtapa.length} oportunidades, ${fmtMT(soma)}` },
        h('header', { class: 'coluna-cab' },
          h('div', { class: 'linha1' }, h('span', { class: 'ponto-cor', style: { background: e.cor || '#8A8FA8' } }), h('h2', null, e.nome), h('span', { class: 'n' }, daEtapa.length)),
          h('span', { class: 'soma' }, daEtapa.length ? fmtMT(soma) : '—')),
        cartoes))
    }
    limpar(corpo).append(etapasMovel, quadro)
  }

  function cartao(o, etapa) {
    const c = contactos.get(o.contacto_id)
    const n = o.proxima_data ? diasAte(o.proxima_data) : null
    const aberta = etapa.tipo === 'aberta'
    const abrir = h('button', { type: 'button', class: 'cartao-abrir', 'aria-label': `Abrir ${o.titulo}` })
    const mover = botao('', { icone: 'mover', tipo: 'fantasma', tamanho: 'peq', rotulo: 'Mover para…', extra: 'mover', onclick: (ev) => { ev.stopPropagation(); menuMover(ev.currentTarget, o) } })
    const el = h('div', { class: 'cartao', dataset: { id: o.id } },
      h('div', { class: 'titulo' }, o.titulo),
      c ? h('div', { class: 'quem' }, [c.nome, c.empresa].filter(Boolean).join(' · ')) : h('div', { class: 'quem texto-fraco' }, 'Sem contacto'),
      h('div', { class: 'linha-fim' }, h('span', { class: 'valor' }, o.valor ? fmtMT(o.valor, o.moeda) : h('span', { class: 'texto-fraco', style: { fontWeight: 400 } }, 'Sem valor')), pontoBant(o.bant)),
      aberta && (o.proxima_accao || o.proxima_data)
        ? h('div', { class: 'proxima' }, icone(n != null && n < 0 ? 'alerta' : 'calendario', 14), h('span', { class: 'txt' }, o.proxima_accao || 'Próxima ação'), o.proxima_data ? h('span', { class: 'prazo ' + (n < 0 ? 'atrasado' : n === 0 ? 'hoje' : '') }, n < 0 ? `${fmtPrazo(o.proxima_data)} · atrasada` : fmtPrazo(o.proxima_data)) : null)
        : !aberta && o.fechado_em ? h('div', { class: 'proxima' }, icone(etapa.tipo === 'ganha' ? 'certo' : 'fechar', 14), h('span', { class: 'txt' }, etapa.tipo === 'perdida' && o.motivo_perda ? o.motivo_perda : `Fechada a ${fmtData(o.fechado_em, { curta: true })}`)) : null,
      mover, abrir)
    abrir.addEventListener('click', () => { if (el.dataset.arrastado) return; ctx.navegar('#/funil/' + o.id) })
    return el
  }

  function menuMover(ancora, o) {
    abrirMenu(ancora, [{ cabecalho: 'Mover para…' }, ...etapas.map((e) => ({ texto: e.nome, cor: e.cor || '#8A8FA8', activo: e.id === o.etapa_id, fazer: () => { if (e.id !== o.etapa_id) mover(o, e.id, topoDe(e.id)) } }))], { alinhar: 'fim', largura: 220 })
  }
  function topoDe(etapaId) { const l = ops.filter((x) => x.etapa_id === etapaId); return l.length ? Math.min(...l.map((x) => x.ordem)) - 1 : 0 }

  async function mover(o, etapaId, ordem) {
    const destino = etapas.find((e) => e.id === etapaId)
    let motivo
    if (destino.tipo === 'perdida' && o.etapa_id !== etapaId) {
      motivo = await pedirMotivoPerda(o.motivo_perda)
      if (!motivo) { desenhar(); return }
    }
    const antes = { ...o }
    const origem = etapas.find((e) => e.id === o.etapa_id)
    Object.assign(o, { etapa_id: etapaId, ordem })
    if (origem?.id !== etapaId) o.fechado_em = destino.tipo === 'aberta' ? null : new Date().toISOString()
    if (motivo) o.motivo_perda = motivo
    desenhar()
    try {
      const novo = await dados.moverOportunidade(antes, etapaId, ordem, { motivo_perda: motivo })
      Object.assign(o, novo)
      if (origem?.id !== etapaId) aviso(destino.tipo === 'ganha' ? `Negócio ganho: ${o.titulo}.` : `${o.titulo} → ${destino.nome}`, { tipo: destino.tipo === 'ganha' ? 'sucesso' : 'info' })
    } catch (e) {
      Object.assign(o, antes); desenhar(); erro(e, 'Não foi possível mover')
    }
  }

  // ---------- Arrastar (ponteiro) ----------
  quadro.addEventListener('pointerdown', (e) => {
    if (movel() || (e.pointerType === 'mouse' && e.button !== 0)) return
    const card = e.target.closest('.cartao')
    if (!card || e.target.closest('.mover')) return
    const o = ops.find((x) => x.id === card.dataset.id); if (!o) return
    arrasto = { card, o, x0: e.clientX, y0: e.clientY, id: e.pointerId, toque: e.pointerType === 'touch', pronto: e.pointerType !== 'touch', iniciado: false }
    if (arrasto.toque) arrasto.timer = setTimeout(() => { if (arrasto) { arrasto.pronto = true; card.classList.add('fantasma-origem'); navigator.vibrate && navigator.vibrate(8) } }, 300)
    document.addEventListener('pointermove', aoMover)
    document.addEventListener('pointerup', aoLargar)
    document.addEventListener('pointercancel', cancelar)
  })
  quadro.addEventListener('touchmove', (e) => { if (arrasto && arrasto.pronto) e.preventDefault() }, { passive: false })
  quadro.addEventListener('contextmenu', (e) => { if (arrasto) e.preventDefault() })

  function aoMover(e) {
    if (!arrasto || e.pointerId !== arrasto.id) return
    const dx = e.clientX - arrasto.x0, dy = e.clientY - arrasto.y0
    if (!arrasto.iniciado) {
      if (Math.hypot(dx, dy) < 6) return
      if (!arrasto.pronto) { cancelar(); return }
      iniciar(e)
    }
    e.preventDefault()
    arrasto.ultimo = { x: e.clientX, y: e.clientY }
    posicionar(e.clientX, e.clientY)
  }
  function iniciar(e) {
    const r = arrasto.card.getBoundingClientRect()
    arrasto.iniciado = true
    arrasto.dx = e.clientX - r.left; arrasto.dy = e.clientY - r.top
    const fantasma = arrasto.card.cloneNode(true)
    fantasma.classList.add('a-arrastar'); fantasma.classList.remove('fantasma-origem')
    fantasma.style.width = r.width + 'px'
    fantasma.setAttribute('aria-hidden', 'true')
    document.body.appendChild(fantasma)
    arrasto.fantasma = fantasma
    arrasto.card.classList.add('fantasma-origem')
    arrasto.marcador = h('div', { class: 'marcador', 'aria-hidden': 'true' })
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    arrasto.loop = requestAnimationFrame(rolar)
  }
  function posicionar(x, y) {
    const a = arrasto
    a.fantasma.style.left = (x - a.dx) + 'px'
    a.fantasma.style.top = (y - a.dy) + 'px'
    const alvo = document.elementFromPoint(x, y)
    const col = alvo && alvo.closest('.coluna')
    quadro.querySelectorAll('.coluna.alvo').forEach((c) => { if (c !== col) c.classList.remove('alvo') })
    if (!col) { a.marcador.remove(); a.destino = null; return }
    col.classList.add('alvo')
    const contentor = col.querySelector('.coluna-cartoes')
    const cartoes = [...contentor.querySelectorAll('.cartao')].filter((c) => c !== a.card)
    let antesDe = null
    for (const c of cartoes) { const r = c.getBoundingClientRect(); if (y < r.top + r.height / 2) { antesDe = c; break } }
    if (antesDe) contentor.insertBefore(a.marcador, antesDe); else contentor.appendChild(a.marcador)
    a.destino = { etapaId: col.dataset.etapa, antesDe: antesDe ? antesDe.dataset.id : null, contentor }
  }
  function rolar() {
    if (!arrasto || !arrasto.iniciado) return
    const p = arrasto.ultimo
    if (p) {
      const r = quadro.getBoundingClientRect()
      const borda = 64
      if (p.x > r.right - borda) quadro.scrollLeft += Math.ceil((p.x - (r.right - borda)) / 4)
      else if (p.x < r.left + borda) quadro.scrollLeft -= Math.ceil(((r.left + borda) - p.x) / 4)
      const cont = arrasto.destino?.contentor
      if (cont) { const rc = cont.getBoundingClientRect(); if (p.y > rc.bottom - 40) cont.scrollTop += 8; else if (p.y < rc.top + 40) cont.scrollTop -= 8 }
      if (p.y > innerHeight - 40) window.scrollBy(0, 10)
      posicionar(p.x, p.y)
    }
    arrasto.loop = requestAnimationFrame(rolar)
  }
  function limparArrasto() {
    if (!arrasto) return
    clearTimeout(arrasto.timer); cancelAnimationFrame(arrasto.loop)
    arrasto.fantasma?.remove(); arrasto.marcador?.remove()
    arrasto.card.classList.remove('fantasma-origem')
    quadro.querySelectorAll('.coluna.alvo').forEach((c) => c.classList.remove('alvo'))
    document.body.style.cursor = ''; document.body.style.userSelect = ''
    document.removeEventListener('pointermove', aoMover)
    document.removeEventListener('pointerup', aoLargar)
    document.removeEventListener('pointercancel', cancelar)
    arrasto = null
  }
  function cancelar() { limparArrasto() }
  function aoLargar(e) {
    if (!arrasto || e.pointerId !== arrasto.id) return
    const a = arrasto
    if (!a.iniciado) { limparArrasto(); return }
    const destino = a.destino
    a.card.dataset.arrastado = '1'
    setTimeout(() => { delete a.card.dataset.arrastado }, 50)
    limparArrasto()
    if (!destino) return
    const naColuna = ops.filter((x) => x.etapa_id === destino.etapaId && x.id !== a.o.id && visiveis().includes(x)).sort((x, y) => x.ordem - y.ordem)
    const i = destino.antesDe ? naColuna.findIndex((x) => x.id === destino.antesDe) : naColuna.length
    const ant = naColuna[i - 1], seg = naColuna[i]
    let ordem
    if (ant && seg) ordem = (ant.ordem + seg.ordem) / 2
    else if (ant) ordem = ant.ordem + 1
    else if (seg) ordem = seg.ordem - 1
    else ordem = 0
    if (destino.etapaId === a.o.etapa_id && ((ant ? ant.ordem : -Infinity) < a.o.ordem) && ((seg ? seg.ordem : Infinity) > a.o.ordem)) return // ficou no mesmo sítio
    mover(a.o, destino.etapaId, ordem)
  }

  // ---------- Gaveta ----------
  function abrirNova() {
    gavetaAberta = abrirOportunidade(ctx, { aoGuardar: async () => { await carregar(); desenhar() } })
  }
  async function abrirId(id) {
    const g = await abrirOportunidade(ctx, { id, aoGuardar: async () => { await carregar(); desenhar() }, aoApagar: async () => { await carregar(); desenhar() } })
    gavetaAberta = g
    if (g && g.dlg) g.dlg.addEventListener('close', () => { if (location.hash.startsWith('#/funil/')) ctx.navegar('#/funil', { substituir: true }) })
  }

  const recarregar = adiar(async () => { if (arrasto) return; if (await carregar()) desenhar() }, 500)
  const desligar = dados.subscrever('painel_oportunidades', () => recarregar())
  const aoRedimensionar = adiar(() => desenhar(), 200)
  window.addEventListener('resize', aoRedimensionar)

  if (await carregar()) desenhar()
  if (params.id) abrirId(params.id)
  else if (params.query.get('nova') === '1') { history.replaceState(null, '', location.pathname + location.search + '#/funil'); abrirNova() }

  return {
    aoMudar(p) { if (p.id) abrirId(p.id); else if (p.query.get('nova') === '1') abrirNova() },
    destruir() { desligar(); recarregar.cancelar(); limparArrasto(); window.removeEventListener('resize', aoRedimensionar) },
  }
}
