// Início: visão geral do site (indicadores, leads por semana, origens, serviços, próximas ações, últimas mensagens).
import { h, limpar, icone, botao, fmtNumero, fmtMT, fmtMTCurto, fmtData, fmtRelativo, fmtPrazo, diasAte, hojeISO, rotuloOrigem, esqueleto, vazio, TIPOS_MSG_CURTO, chip, erro } from '../ui.js'

const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

export async function montar(el, ctx) {
  const { dados } = ctx
  const hoje = new Date()
  const pagina = h('div', { class: 'pagina' })
  pagina.appendChild(h('div', { class: 'pagina-cab' },
    h('div', null, h('h1', null, 'Visão geral'), h('p', { class: 'sub' }, `${ctx.site.nome} · ${DIAS_SEMANA[hoje.getDay()]}, ${fmtData(hoje)}`)),
    h('div', { class: 'pagina-accoes accoes-rapidas' },
      botao('Nova oportunidade', { tipo: 'primario', icone: 'mais', onclick: () => ctx.navegar('#/funil?nova=1') }),
      botao('Novo contacto', { icone: 'pessoa', onclick: () => ctx.navegar('#/contactos?novo=1') }),
      botao('Escrever artigo', { icone: 'editar', onclick: () => ctx.navegar('#/blog/novo') }))))
  const corpo = h('div', null, esqueleto(4, 'blocos'))
  pagina.appendChild(corpo)
  el.appendChild(pagina)

  let dadosInicio
  try {
    const desde90 = new Date(Date.now() - 90 * 86400000).toISOString()
    const [contactos, mensagens, ops, etapas, porLer] = await Promise.all([
      dados.todosContactos(), dados.mensagensDesde(desde90), dados.oportunidades(), dados.etapas(), dados.contagemPorLer(),
    ])
    dadosInicio = { contactos, mensagens, ops, etapas, porLer }
  } catch (e) { erro(e, 'Não foi possível carregar a visão geral'); limpar(corpo).appendChild(vazio({ icone: 'alerta', titulo: 'Sem dados por agora', texto: 'Não conseguimos ler os dados do painel. Tente recarregar a página.' })); return }
  desenhar(corpo, ctx, dadosInicio)
  return {}
}

function desenhar(corpo, ctx, { contactos, mensagens, ops, etapas, porLer }) {
  const agora = Date.now()
  const dia = 86400000
  const tipoEtapa = new Map(etapas.map((e) => [e.id, e]))
  const novos7 = contactos.filter((c) => agora - new Date(c.criado_em) <= 7 * dia).length
  const novos30 = contactos.filter((c) => agora - new Date(c.criado_em) <= 30 * dia).length
  const abertas = ops.filter((o) => (tipoEtapa.get(o.etapa_id)?.tipo || 'aberta') === 'aberta')
  const valorAberto = abertas.reduce((s, o) => s + (Number(o.valor) || 0), 0)
  const fechadas90 = ops.filter((o) => o.fechado_em && agora - new Date(o.fechado_em) <= 90 * dia)
  const ganhas = fechadas90.filter((o) => tipoEtapa.get(o.etapa_id)?.tipo === 'ganha').length
  const perdidas = fechadas90.filter((o) => tipoEtapa.get(o.etapa_id)?.tipo === 'perdida').length
  const taxa = ganhas + perdidas ? Math.round((ganhas / (ganhas + perdidas)) * 100) : null
  const msgs30 = mensagens.filter((m) => agora - new Date(m.criado_em) <= 30 * dia).length

  limpar(corpo)
  corpo.appendChild(h('section', { class: 'bloco kpis', 'aria-label': 'Indicadores' },
    kpi('Novos contactos', fmtNumero(novos7), [h('span', null, 'últimos 7 dias · '), h('span', { class: 'destaque' }, fmtNumero(novos30)), ' em 30 dias'], '#/contactos'),
    kpi('Mensagens por ler', fmtNumero(porLer), [h('span', { class: 'destaque' }, fmtNumero(msgs30)), ' recebidas em 30 dias'], '#/caixa'),
    kpi('Oportunidades abertas', fmtNumero(abertas.length), [h('span', { class: 'destaque' }, fmtMT(valorAberto)), ' em aberto'], '#/funil'),
    kpi('Taxa de fecho', taxa == null ? '—' : [fmtNumero(taxa), h('small', null, ' %')], taxa == null ? 'Ainda sem negócios fechados em 90 dias' : [`${ganhas} ganhas · ${perdidas} perdidas · 90 dias`], '#/funil')))

  // Leads por semana
  const semanas = []
  const fimHoje = new Date(); fimHoje.setHours(23, 59, 59, 999)
  for (let i = 7; i >= 0; i--) {
    const fim = new Date(fimHoje.getTime() - i * 7 * dia)
    const inicio = new Date(fim.getTime() - 7 * dia + 1)
    semanas.push({ inicio, fim, n: contactos.filter((c) => { const t = new Date(c.criado_em); return t >= inicio && t <= fim }).length })
  }
  const totalSem = semanas.reduce((s, x) => s + x.n, 0)

  const hojeStr = hojeISO()
  const limite = hojeISO(7)
  const proximas = abertas.filter((o) => o.proxima_data && o.proxima_data <= limite).sort((a, b) => a.proxima_data.localeCompare(b.proxima_data))
  const mapaC = new Map(contactos.map((c) => [c.id, c]))

  corpo.appendChild(h('div', { class: 'grelha-inicio' },
    h('section', { class: 'bloco', 'aria-labelledby': 'h-leads' },
      h('div', { class: 'bloco-cab' }, h('div', null, h('h2', { id: 'h-leads' }, 'Leads por semana'), h('p', { class: 'sub' }, `${fmtNumero(totalSem)} novos contactos nas últimas 8 semanas`)), h('a', { class: 'bloco-ligacao', href: '#/contactos' }, 'Ver contactos', icone('direita', 16))),
      h('div', { class: 'bloco-corpo' }, graficoSemanas(semanas))),
    h('section', { class: 'bloco', 'aria-labelledby': 'h-prox' },
      h('div', { class: 'bloco-cab' }, h('div', null, h('h2', { id: 'h-prox' }, 'Próximas ações'), h('p', { class: 'sub' }, 'Atrasadas e nos próximos 7 dias')), h('a', { class: 'bloco-ligacao', href: '#/funil' }, 'Funil', icone('direita', 16))),
      proximas.length ? h('ul', { class: 'lista-simples' }, proximas.slice(0, 7).map((o) => {
        const n = diasAte(o.proxima_data)
        const c = mapaC.get(o.contacto_id)
        return h('li', null, h('a', { class: 'item-accao', href: '#/funil/' + o.id },
          h('span', { class: 'icone-redondo ' + (n < 0 ? 'perigo' : n === 0 ? 'aviso' : '') }, icone(n < 0 ? 'alerta' : 'calendario', 16)),
          h('span', { style: { minWidth: 0 } }, h('span', { class: 'titulo' }, o.proxima_accao || 'Definir próxima ação'), h('span', { class: 'meta' }, [o.titulo, c?.nome].filter(Boolean).join(' · '))),
          h('span', { class: 'prazo ' + (n < 0 ? 'atrasado' : n === 0 ? 'hoje' : '') }, n < 0 ? `Atrasada · ${fmtPrazo(o.proxima_data)}` : fmtPrazo(o.proxima_data))))
      })) : vazio({ icone: 'certo', titulo: 'Nada pendente esta semana', texto: 'Quando uma oportunidade tiver uma próxima ação com data, aparece aqui.', extra: null })),
  ))

  // Origens e serviços
  const desde90 = agora - 90 * dia
  const porOrigem = contar(contactos.filter((c) => new Date(c.criado_em) >= desde90).map((c) => rotuloOrigem(c.origem)))
  const porServico = contar(mensagens.filter((m) => m.servico).map((m) => m.servico))
  const ultimas = mensagens.filter((m) => m.estado !== 'arquivada').slice(0, 6)
  corpo.appendChild(h('div', { class: 'grelha-inicio-2' },
    h('section', { class: 'bloco', 'aria-labelledby': 'h-orig' },
      h('div', { class: 'bloco-cab' }, h('div', null, h('h2', { id: 'h-orig' }, 'Leads por origem'), h('p', { class: 'sub' }, 'Contactos novos · 90 dias'))),
      h('div', { class: 'bloco-corpo' }, ranking(porOrigem, 'Ainda sem contactos nos últimos 90 dias.'))),
    h('section', { class: 'bloco', 'aria-labelledby': 'h-serv' },
      h('div', { class: 'bloco-cab' }, h('div', null, h('h2', { id: 'h-serv' }, 'Pedidos por serviço'), h('p', { class: 'sub' }, 'Mensagens com serviço · 90 dias'))),
      h('div', { class: 'bloco-corpo' }, ranking(porServico, 'Os pedidos de cotação com serviço indicado aparecem aqui.'))),
    h('section', { class: 'bloco', 'aria-labelledby': 'h-msg' },
      h('div', { class: 'bloco-cab' }, h('div', null, h('h2', { id: 'h-msg' }, 'Últimas mensagens'), h('p', { class: 'sub' }, porLer ? `${fmtNumero(porLer)} por ler` : 'Tudo lido')), h('a', { class: 'bloco-ligacao', href: '#/caixa' }, 'Caixa', icone('direita', 16))),
      ultimas.length ? h('ul', { class: 'lista-simples' }, ultimas.map((m) => {
        const c = mapaC.get(m.contacto_id)
        return h('li', null, h('a', { class: 'item-accao', href: '#/caixa/' + m.id },
          h('span', { class: 'icone-redondo' }, icone(m.estado === 'nova' ? 'email' : 'aberto', 16)),
          h('span', { style: { minWidth: 0 } }, h('span', { class: 'titulo', style: { fontWeight: m.estado === 'nova' ? 700 : 500 } }, c?.nome || 'Visitante do site'), h('span', { class: 'meta' }, m.servico || TIPOS_MSG_CURTO[m.tipo])),
          h('span', { class: 'prazo' }, fmtRelativo(m.criado_em))))
      })) : vazio({ icone: 'caixa', titulo: 'Ainda sem mensagens', texto: 'Os formulários do site chegam aqui. O código de integração está em Definições.', accoes: [botao('Ver código de integração', { onclick: () => ctx.navegar('#/definicoes') })] })),
  ))
}

function kpi(rotulo, valor, detalhe, href) {
  return h('a', { class: 'kpi', href },
    h('span', { class: 'kpi-rotulo' }, rotulo),
    h('span', { class: 'kpi-valor' }, valor),
    h('span', { class: 'kpi-detalhe' }, detalhe))
}

function contar(lista) {
  const m = new Map()
  for (const x of lista) m.set(x, (m.get(x) || 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt'))
}

function ranking(pares, textoVazio) {
  if (!pares.length) return h('p', { class: 'texto-suave' }, textoVazio)
  const max = pares[0][1]
  const total = pares.reduce((s, p) => s + p[1], 0)
  const visiveis = pares.slice(0, 6)
  const resto = pares.slice(6).reduce((s, p) => s + p[1], 0)
  if (resto) visiveis.push(['Outros', resto])
  return h('ul', { class: 'ranking' }, visiveis.map(([nome, n]) => h('li', null,
    h('span', { class: 'nome' }, nome),
    h('span', { class: 'valor', title: `${Math.round((n / total) * 100)} % do total` }, fmtNumero(n)),
    h('span', { class: 'trilho', 'aria-hidden': 'true' }, h('i', { style: { width: Math.max(3, (n / max) * 100) + '%' } })))))
}

function graficoSemanas(semanas) {
  const W = 640, H = 210, esq = 28, base = H - 28, topo = 16
  const max = Math.max(4, ...semanas.map((s) => s.n))
  const passo = Math.ceil(max / 4)
  const teto = passo * 4
  const ns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(ns, 'svg')
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', `Leads por semana nas últimas 8 semanas: ${semanas.map((s) => `${fmtData(s.inicio, { curta: true })}, ${s.n}`).join('; ')}`)
  const el = (t, a) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); return e }
  const y = (v) => base - (v / teto) * (base - topo)
  for (let i = 0; i <= 4; i++) {
    const v = i * passo
    svg.appendChild(el('line', { x1: esq, x2: W, y1: y(v), y2: y(v), class: 'grade' }))
    const t = el('text', { x: esq - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'eixo' }); t.textContent = v; svg.appendChild(t)
  }
  const largura = (W - esq) / semanas.length
  const barraW = Math.min(40, largura * 0.56)
  const dica = h('div', { class: 'dica', hidden: true })
  const caixa = h('div', { class: 'grafico' }, svg, dica)
  semanas.forEach((s, i) => {
    const cx = esq + largura * i + largura / 2
    const alt = Math.max(s.n ? 3 : 0, base - y(s.n))
    const r = Math.min(4, alt / 2)
    const x = cx - barraW / 2, yt = base - alt
    const caminho = alt > 0 ? `M${x},${base} V${yt + r} Q${x},${yt} ${x + r},${yt} H${x + barraW - r} Q${x + barraW},${yt} ${x + barraW},${yt + r} V${base} Z` : ''
    const barra = el('path', { d: caminho, class: 'barra' + (i === semanas.length - 1 ? ' barra-actual' : '') })
    svg.appendChild(barra)
    const rot = el('text', { x: cx, y: base + 18, 'text-anchor': 'middle', class: 'eixo' }); rot.textContent = i === semanas.length - 1 ? 'Esta semana' : fmtData(s.inicio, { curta: true }); svg.appendChild(rot)
    if (i === semanas.length - 1) { const v = el('text', { x: cx, y: yt - 6, 'text-anchor': 'middle', class: 'rotulo-valor' }); v.textContent = s.n; svg.appendChild(v) }
    const alvo = el('rect', { x: esq + largura * i, y: topo, width: largura, height: base - topo, class: 'alvo-barra' })
    alvo.addEventListener('pointerenter', () => {
      barra.classList.add('realce')
      dica.hidden = false
      dica.innerHTML = ''
      dica.append(h('strong', null, `${s.n} ${s.n === 1 ? 'lead' : 'leads'}`), ` · ${fmtData(s.inicio, { curta: true })} a ${fmtData(s.fim, { curta: true })}`)
      const bw = svg.getBoundingClientRect().width / W
      dica.style.left = cx * bw + 'px'; dica.style.top = (yt * bw) + 'px'
    })
    alvo.addEventListener('pointerleave', () => { barra.classList.remove('realce'); dica.hidden = true })
    svg.appendChild(alvo)
  })
  const tabela = h('table', { class: 'visualmente-oculto' }, h('caption', null, 'Leads por semana'), h('thead', null, h('tr', null, h('th', null, 'Semana'), h('th', null, 'Leads'))), h('tbody', null, semanas.map((s) => h('tr', null, h('td', null, `${fmtData(s.inicio)} a ${fmtData(s.fim)}`), h('td', null, s.n)))))
  caixa.appendChild(tabela)
  return caixa
}
