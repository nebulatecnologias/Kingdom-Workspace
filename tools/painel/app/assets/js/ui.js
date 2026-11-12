// Peças de interface partilhadas: construção de elementos, formatos, avisos, gavetas, menus, CSV.
import { icone } from './icones.js'
export { icone }

// ---------- Construção de elementos ----------
export function h(tag, attrs, ...filhos) {
  const el = document.createElement(tag)
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue
      if (k === 'class') el.className = v
      else if (k === 'html') el.innerHTML = v
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v)
      else if (k === 'dataset') Object.assign(el.dataset, v)
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v)
      else if (k === 'value') el.value = v
      else if (k === 'checked') el.checked = !!v
      else if (v === true) el.setAttribute(k, '')
      else el.setAttribute(k, v)
    }
  }
  juntar(el, filhos)
  return el
}
function juntar(el, filhos) {
  for (const f of filhos) {
    if (f == null || f === false) continue
    if (Array.isArray(f)) juntar(el, f)
    else if (f instanceof Node) el.appendChild(f)
    else el.appendChild(document.createTextNode(String(f)))
  }
}
export function limpar(el) { while (el.firstChild) el.removeChild(el.firstChild); return el }

export function botao(texto, { icone: ic, tipo = 'secundario', onclick, rotulo, extra = '', tamanho, disabled, title, type = 'button' } = {}) {
  const b = h('button', { type, class: `btn btn-${tipo} ${tamanho ? 'btn-' + tamanho : ''} ${!texto ? 'btn-icone' : ''} ${extra}`.trim(), onclick, 'aria-label': rotulo || null, title: title || (!texto ? rotulo : null), disabled })
  if (ic) b.appendChild(icone(ic, tamanho === 'peq' ? 16 : 18))
  if (texto) b.appendChild(h('span', null, texto))
  return b
}

export function campo(rotulo, controlo, { ajuda, id, extra = '' } = {}) {
  const cid = id || controlo.id || ('c' + Math.random().toString(36).slice(2, 8))
  controlo.id = cid
  return h('div', { class: 'campo ' + extra },
    h('label', { for: cid }, rotulo),
    controlo,
    ajuda ? h('p', { class: 'campo-ajuda' }, ajuda) : null)
}

// ---------- Formatos ----------
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const ESP = ' ' // espaço fino inquebrável

export function fmtNumero(n, casas = 0) {
  if (n == null || isNaN(n)) return '—'
  const neg = n < 0
  const fix = Math.abs(Number(n)).toFixed(casas)
  const [int, dec] = fix.split('.')
  const grupos = int.replace(/\B(?=(\d{3})+(?!\d))/g, ESP)
  return (neg ? '−' : '') + grupos + (dec ? ',' + dec : '')
}
export function fmtMT(v, moeda = 'MZN') {
  if (v == null || v === '') return '—'
  const sufixo = moeda === 'MZN' ? 'MT' : moeda
  return fmtNumero(Math.round(Number(v))) + ' ' + sufixo
}
export function fmtMTCurto(v) {
  if (v == null) return '—'
  const n = Number(v)
  if (Math.abs(n) >= 1e6) return fmtNumero(n / 1e6, n % 1e6 === 0 ? 0 : 1) + ' M MT'
  if (Math.abs(n) >= 1e4) return fmtNumero(Math.round(n / 1e3)) + ' mil MT'
  return fmtMT(n)
}
export function paraData(d) {
  if (!d) return null
  if (d instanceof Date) return d
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) { const [a, m, dia] = d.split('-').map(Number); return new Date(a, m - 1, dia) }
  return new Date(d)
}
export function fmtData(d, { curta = false } = {}) {
  const x = paraData(d)
  if (!x || isNaN(x)) return '—'
  const base = `${x.getDate()} ${MESES[x.getMonth()]}`
  if (curta && x.getFullYear() === new Date().getFullYear()) return base
  return `${base} ${x.getFullYear()}`
}
export function fmtDataHora(d) {
  const x = paraData(d); if (!x) return '—'
  return `${fmtData(x)}, ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}
export function fmtRelativo(d) {
  const x = paraData(d); if (!x) return '—'
  const s = Math.round((Date.now() - x.getTime()) / 1000)
  if (s < 45) return 'agora mesmo'
  const m = Math.round(s / 60); if (m < 60) return `há ${m} min`
  const hh = Math.round(m / 60); if (hh < 24) return `há ${hh} h`
  const dias = Math.round(hh / 24)
  if (dias === 1) return 'ontem'
  if (dias < 7) return `há ${dias} dias`
  return fmtData(x, { curta: true })
}
export function hojeISO(desloc = 0) {
  const d = new Date(); d.setDate(d.getDate() + desloc)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function diasAte(dataISO) {
  const d = paraData(dataISO); if (!d) return null
  const hoje = paraData(hojeISO())
  return Math.round((d - hoje) / 86400000)
}
export function fmtPrazo(dataISO) {
  const n = diasAte(dataISO)
  if (n == null) return ''
  if (n === 0) return 'Hoje'
  if (n === 1) return 'Amanhã'
  if (n === -1) return 'Ontem'
  return fmtData(dataISO, { curta: true })
}
export function iniciais(nome = '') {
  const p = nome.trim().split(/\s+/).filter(Boolean)
  if (!p.length) return '?'
  return ((p[0][0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}
export function primeiroNome(nome = '') { return (nome || '').trim().split(/\s+/)[0] || '' }

export function slugify(s = '') {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-').slice(0, 80)
}
export function semAcentos(s = '') { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() }

// ---------- Rótulos ----------
export const TIPOS_MSG = { cotacao: 'Pedido de cotação', avaliacao: 'Avaliação', contacto: 'Contacto', newsletter: 'Newsletter', outro: 'Outro' }
export const TIPOS_MSG_CURTO = { cotacao: 'Cotação', avaliacao: 'Avaliação', contacto: 'Contacto', newsletter: 'Newsletter', outro: 'Outro' }
const ORIGENS = { google: 'Google', instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', directo: 'Direto', direto: 'Direto', 'indicação': 'Indicação', indicacao: 'Indicação', evento: 'Evento', email: 'Email', site: 'Site' }
export function rotuloOrigem(o) { if (!o) return 'Sem origem'; return ORIGENS[o.toLowerCase()] || (o.charAt(0).toUpperCase() + o.slice(1)) }
export const TIPOS_ACT = { nota: 'Nota', email: 'Email enviado', chamada: 'Chamada', reuniao: 'Reunião', etapa: 'Mudança de etapa', mensagem: 'Mensagem recebida', sistema: 'Sistema' }
export const ICONE_ACT = { nota: 'nota', email: 'email', chamada: 'telefone', reuniao: 'reuniao', etapa: 'etapa', mensagem: 'mensagem', sistema: 'sistema' }
export const BANT = [
  ['necessidade', 'Necessidade', 'Que problema quer resolver?'],
  ['autoridade', 'Autoridade', 'Quem decide a compra?'],
  ['orcamento', 'Orçamento', 'Há verba prevista?'],
  ['prazo', 'Prazo', 'Para quando precisa?'],
]
export function bantCompleto(b = {}) { return BANT.filter(([k]) => b && b[k] && b[k] !== 'false').length }

// ---------- Avisos (toasts) ----------
export function aviso(texto, { tipo = 'info', accao, duracao = 4200 } = {}) {
  const raiz = document.getElementById('avisos')
  const ic = { info: 'info', sucesso: 'certo', erro: 'alerta' }[tipo] || 'info'
  const el = h('div', { class: `aviso aviso-${tipo}`, role: tipo === 'erro' ? 'alert' : 'status' },
    icone(ic, 18), h('span', { class: 'aviso-texto' }, texto),
    accao ? h('button', { class: 'aviso-accao', type: 'button', onclick: () => { accao.fazer(); fechar() } }, accao.texto) : null,
    h('button', { class: 'aviso-fechar', type: 'button', 'aria-label': 'Fechar aviso', onclick: () => fechar() }, icone('fechar', 16)))
  raiz.appendChild(el)
  requestAnimationFrame(() => el.classList.add('visivel'))
  let t = setTimeout(fechar, tipo === 'erro' ? duracao * 1.6 : duracao)
  el.addEventListener('pointerenter', () => clearTimeout(t))
  el.addEventListener('pointerleave', () => { t = setTimeout(fechar, 2000) })
  function fechar() { el.classList.remove('visivel'); setTimeout(() => el.remove(), 220) }
  return fechar
}
export function erro(e, contexto) {
  console.warn(contexto || 'Erro', e)
  aviso(mensagemErro(e, contexto), { tipo: 'erro' })
}
export function mensagemErro(e, contexto) {
  const m = (e && (e.message || e.erro || e.error_description)) || String(e || '')
  if (e && e.code === '23505') return 'Já existe um registo com estes dados (por exemplo, o mesmo email ou endereço).'
  if (/Failed to fetch|NetworkError|network/i.test(m)) return 'Sem ligação ao servidor. Verifique a internet e tente outra vez.'
  if (/JWT|expired|401/i.test(m)) return 'A sua sessão expirou. Entre outra vez.'
  if (/row-level security|permission|42501/i.test(m)) return 'Não tem permissão para esta ação neste painel.'
  return (contexto ? contexto + ': ' : '') + (m || 'algo correu mal.')
}

// ---------- Gaveta lateral (dialog) ----------
export function gaveta({ titulo, subtitulo, conteudo, rodape, largura = 'media', aoFechar, rotulo }) {
  const corpo = h('div', { class: 'gaveta-corpo' })
  const pe = h('div', { class: 'gaveta-rodape' })
  const tituloEl = h('h2', { class: 'gaveta-titulo', id: 'gt' + Math.random().toString(36).slice(2, 7) }, titulo)
  const dlg = h('dialog', { class: `gaveta gaveta-${largura}`, 'aria-labelledby': tituloEl.id },
    h('div', { class: 'gaveta-caixa' },
      h('header', { class: 'gaveta-topo' },
        h('div', { class: 'gaveta-titulos' }, tituloEl, subtitulo ? h('p', { class: 'gaveta-sub' }, subtitulo) : null),
        h('button', { class: 'btn btn-fantasma btn-icone', type: 'button', 'aria-label': rotulo || 'Fechar', onclick: () => fechar() }, icone('fechar', 20))),
      corpo, pe))
  if (conteudo) juntar(corpo, [conteudo])
  if (rodape) juntar(pe, [rodape]); else pe.remove()
  document.body.appendChild(dlg)
  let fechado = false
  function fechar(valor) {
    if (fechado) return; fechado = true
    dlg.classList.add('a-fechar')
    setTimeout(() => { try { dlg.close() } catch {} dlg.remove(); aoFechar && aoFechar(valor) }, 180)
  }
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); fechar() })
  dlg.addEventListener('mousedown', (e) => { if (e.target === dlg) fechar() })
  dlg.showModal()
  const primeiro = corpo.querySelector('[autofocus], input:not([type=hidden]):not([disabled]), textarea, select')
  if (primeiro) setTimeout(() => primeiro.focus(), 30)
  return { dlg, corpo, rodape: pe, fechar, titulo: tituloEl }
}

// Pequeno diálogo centrado para confirmações que protegem dados
export function confirmar(texto, { titulo = 'Confirmar', accao = 'Confirmar', perigo = false, detalhe } = {}) {
  return new Promise((resolve) => {
    let resposta = false
    const ok = h('button', { class: `btn ${perigo ? 'btn-perigo' : 'btn-primario'}`, type: 'button', onclick: () => { resposta = true; d.fechar() } }, accao)
    const d = dialogo({ titulo, conteudo: [h('p', null, texto), detalhe ? h('p', { class: 'texto-suave' }, detalhe) : null], botoes: [h('button', { class: 'btn btn-secundario', type: 'button', onclick: () => d.fechar() }, 'Cancelar'), ok], aoFechar: () => resolve(resposta) })
    setTimeout(() => ok.focus(), 40)
  })
}
export function dialogo({ titulo, conteudo, botoes, aoFechar }) {
  const tid = 'dt' + Math.random().toString(36).slice(2, 7)
  const dlg = h('dialog', { class: 'dialogo', 'aria-labelledby': tid },
    h('div', { class: 'dialogo-caixa' }, h('h2', { id: tid, class: 'dialogo-titulo' }, titulo), h('div', { class: 'dialogo-corpo' }, conteudo), h('div', { class: 'dialogo-botoes' }, botoes)))
  document.body.appendChild(dlg)
  let fechado = false
  function fechar() { if (fechado) return; fechado = true; try { dlg.close() } catch {} dlg.remove(); aoFechar && aoFechar() }
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); fechar() })
  dlg.showModal()
  return { dlg, fechar }
}

// ---------- Menu flutuante ----------
let menuAberto = null
export function abrirMenu(ancora, itens, { alinhar = 'inicio', largura } = {}) {
  fecharMenu()
  const lista = h('div', { class: 'menu', role: 'menu', style: largura ? { minWidth: largura + 'px' } : null })
  for (const it of itens) {
    if (it === '-') { lista.appendChild(h('div', { class: 'menu-sep', role: 'separator' })); continue }
    if (it.cabecalho) { lista.appendChild(h('div', { class: 'menu-cab' }, it.cabecalho)); continue }
    lista.appendChild(h('button', { class: `menu-item ${it.perigo ? 'perigo' : ''} ${it.activo ? 'activo' : ''}`, role: it.activo != null ? 'menuitemradio' : 'menuitem', type: 'button', disabled: it.disabled, 'aria-checked': it.activo != null ? String(!!it.activo) : null, onclick: () => { fecharMenu(); it.fazer && it.fazer() } },
      it.cor ? h('span', { class: 'ponto-cor', style: { background: it.cor } }) : it.icone ? icone(it.icone, 16) : null,
      h('span', { class: 'menu-texto' }, it.texto, it.sub ? h('small', null, it.sub) : null),
      it.activo ? icone('certo', 16, 'menu-certo') : null))
  }
  document.body.appendChild(lista)
  const r = ancora.getBoundingClientRect()
  const lw = lista.offsetWidth, lh = lista.offsetHeight
  let x = alinhar === 'fim' ? r.right - lw : r.left
  x = Math.max(8, Math.min(x, innerWidth - lw - 8))
  let y = r.bottom + 6
  if (y + lh > innerHeight - 8) y = Math.max(8, r.top - lh - 6)
  lista.style.left = x + 'px'; lista.style.top = y + 'px'
  ancora.setAttribute('aria-expanded', 'true')
  const itensFoc = [...lista.querySelectorAll('.menu-item:not([disabled])')]
  ;(itensFoc.find((b) => b.classList.contains('activo')) || itensFoc[0])?.focus()
  const tecla = (e) => {
    const i = itensFoc.indexOf(document.activeElement)
    if (e.key === 'Escape') { e.preventDefault(); fecharMenu(); ancora.focus() }
    else if (e.key === 'ArrowDown') { e.preventDefault(); itensFoc[(i + 1) % itensFoc.length]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); itensFoc[(i - 1 + itensFoc.length) % itensFoc.length]?.focus() }
    else if (e.key === 'Tab') fecharMenu()
  }
  const fora = (e) => { if (!lista.contains(e.target) && !ancora.contains(e.target)) fecharMenu() }
  lista.addEventListener('keydown', tecla)
  setTimeout(() => document.addEventListener('pointerdown', fora), 0)
  menuAberto = { lista, ancora, fora }
}
export function fecharMenu() {
  if (!menuAberto) return
  document.removeEventListener('pointerdown', menuAberto.fora)
  menuAberto.ancora.setAttribute('aria-expanded', 'false')
  menuAberto.lista.remove(); menuAberto = null
}

// ---------- Estados ----------
export function esqueleto(linhas = 6, tipo = 'linhas') {
  if (tipo === 'blocos') return h('div', { class: 'esq-blocos', 'aria-hidden': 'true' }, Array.from({ length: linhas }, () => h('div', { class: 'esq esq-bloco' })))
  return h('div', { class: 'esq-lista', 'aria-busy': 'true', 'aria-label': 'A carregar' }, Array.from({ length: linhas }, (_, i) => h('div', { class: 'esq-linha' }, h('div', { class: 'esq esq-circulo' }), h('div', { class: 'esq-textos' }, h('div', { class: 'esq esq-texto', style: { width: (55 + ((i * 17) % 35)) + '%' } }), h('div', { class: 'esq esq-texto esq-fino', style: { width: (30 + ((i * 23) % 40)) + '%' } })))))
}
export function vazio({ icone: ic = 'info', titulo, texto, accoes, extra }) {
  return h('div', { class: 'vazio' },
    h('div', { class: 'vazio-icone' }, icone(ic, 22)),
    h('h3', { class: 'vazio-titulo' }, titulo),
    texto ? h('p', { class: 'vazio-texto' }, texto) : null,
    extra || null,
    accoes ? h('div', { class: 'vazio-accoes' }, accoes) : null)
}
export function chip(texto, { tom = 'neutro', icone: ic, titulo } = {}) {
  return h('span', { class: `chip chip-${tom}`, title: titulo || null }, ic ? icone(ic, 13) : null, texto)
}
export function pontoBant(b) {
  const n = bantCompleto(b)
  const nomes = BANT.filter(([k]) => b && b[k] && b[k] !== 'false').map(([, r]) => r)
  return h('span', { class: 'bant', role: 'img', 'aria-label': `BANT: ${n} de 4${nomes.length ? ' (' + nomes.join(', ') + ')' : ''}`, title: `BANT ${n}/4${nomes.length ? ': ' + nomes.join(', ') : ''}` },
    BANT.map(([k]) => h('i', { class: b && b[k] && b[k] !== 'false' ? 'cheio' : '' })))
}

// ---------- Utilidades ----------
export function adiar(fn, ms = 300) {
  let t
  const f = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) }
  f.cancelar = () => clearTimeout(t)
  f.ja = (...a) => { clearTimeout(t); return fn(...a) }
  return f
}
export async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true } catch {
    const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } }); ta.value = texto
    document.body.appendChild(ta); ta.select()
    let ok = false; try { ok = document.execCommand('copy') } catch {}
    ta.remove(); return ok
  }
}
export function guardarLocal(chave, valor) { try { localStorage.setItem('painel.' + chave, JSON.stringify(valor)) } catch {} }
export function lerLocal(chave, defeito = null) { try { const v = localStorage.getItem('painel.' + chave); return v == null ? defeito : JSON.parse(v) } catch { return defeito } }

// ---------- CSV ----------
export function paraCSV(linhas, colunas) {
  const esc = (v) => {
    if (v == null) return ''
    let s = Array.isArray(v) ? v.join('|') : typeof v === 'boolean' ? (v ? 'sim' : 'não') : String(v)
    if (/[";\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"'
    return s
  }
  const cab = colunas.map((c) => c.rotulo || c.chave).join(';')
  const corpo = linhas.map((l) => colunas.map((c) => esc(c.valor ? c.valor(l) : l[c.chave])).join(';'))
  return '﻿' + [cab, ...corpo].join('\r\n')
}
export function descarregar(nome, conteudo, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }))
  const a = h('a', { href: url, download: nome })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
export function lerCSV(texto) {
  texto = texto.replace(/^﻿/, '')
  const primeira = texto.split(/\r?\n/)[0] || ''
  const conta = (c) => (primeira.match(new RegExp('\\' + c, 'g')) || []).length
  const sep = [';', ',', '\t'].sort((a, b) => conta(b) - conta(a))[0]
  const linhas = []; let linha = []; let cel = ''; let aspas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (aspas) {
      if (c === '"') { if (texto[i + 1] === '"') { cel += '"'; i++ } else aspas = false }
      else cel += c
    } else if (c === '"') aspas = true
    else if (c === sep) { linha.push(cel); cel = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && texto[i + 1] === '\n') i++; linha.push(cel); linhas.push(linha); linha = []; cel = '' }
    else cel += c
  }
  if (cel !== '' || linha.length) { linha.push(cel); linhas.push(linha) }
  const uteis = linhas.filter((l) => l.some((c) => c.trim() !== ''))
  const [cab = [], ...resto] = uteis
  return { colunas: cab.map((c) => c.trim()), linhas: resto }
}

// Cor de texto legível sobre um fundo
export function corTexto(hex) {
  const l = luminancia(hex)
  return (1.05 / (l + 0.05)) >= 4.5 ? '#FFFFFF' : '#1B1934'
}
export function luminancia(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 0
  const n = parseInt(m[1], 16)
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
export function misturar(hex, comHex, peso) {
  const a = parseInt(hex.slice(1), 16), b = parseInt(comHex.slice(1), 16)
  const ch = (x, s) => (x >> s) & 255
  const m = (s) => Math.round(ch(a, s) * (1 - peso) + ch(b, s) * peso)
  return '#' + [m(16), m(8), m(0)].map((v) => v.toString(16).padStart(2, '0')).join('')
}
