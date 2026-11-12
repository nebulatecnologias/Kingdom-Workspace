// Arranque, sessão, moldura (barra lateral, barra de topo) e encaminhamento por hash.
import config from './config.js'
import { criarDados } from './dados.js'
import { h, limpar, icone, aviso, erro, abrirMenu, guardarLocal, lerLocal, adiar, corTexto, misturar, iniciais, botao, mensagemErro } from './ui.js'

const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm'
const DEMO = new URLSearchParams(location.search).get('demo') === '1'

const ROTAS = [
  { id: 'inicio', texto: 'Início', icone: 'inicio' },
  { id: 'caixa', texto: 'Caixa de mensagens', nav: 'Mensagens', curto: 'Caixa', icone: 'caixa' },
  { id: 'contactos', texto: 'Contactos', icone: 'contactos' },
  { id: 'segmentos', texto: 'Segmentos', icone: 'segmentos' },
  { id: 'funil', texto: 'Funil de vendas', curto: 'Funil', icone: 'funil' },
  { id: 'blog', texto: 'Blog', icone: 'blog' },
  { id: 'definicoes', texto: 'Definições', icone: 'definicoes' },
]
const MODULOS = {
  inicio: () => import('./vistas/inicio.js'),
  caixa: () => import('./vistas/caixa.js'),
  contactos: () => import('./vistas/contactos.js'),
  contacto: () => import('./vistas/contacto.js'),
  segmentos: () => import('./vistas/segmentos.js'),
  funil: () => import('./vistas/funil.js'),
  blog: () => import('./vistas/blog.js'),
  artigo: () => import('./vistas/artigo.js'),
  definicoes: () => import('./vistas/definicoes.js'),
}

const raiz = document.getElementById('raiz')
let dados = null
let estado = { sites: [], site: null, membros: [], vista: null, rota: null, desligar: [] }

aplicarTema(config.marca.cor)
arrancar().catch((e) => { console.error(e); ecraErro(e) })

async function arrancar() {
  let cliente
  if (DEMO) {
    const { criarClienteDemo } = await import('./demo.js')
    cliente = criarClienteDemo()
  } else {
    const { createClient } = await import(SUPABASE_CDN)
    cliente = createClient(config.supabaseUrl, config.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'painel-auth' } })
  }
  dados = criarDados(cliente, { demo: DEMO })
  dados.aoMudarSessao((evento) => { if (evento === 'SIGNED_OUT') ecraEntrada() })
  const sessao = await dados.sessao()
  if (!sessao) return ecraEntrada()
  await entrarNoPainel()
}

function aplicarTema(cor) {
  const c = /^#[0-9a-f]{6}$/i.test(cor || '') ? cor : config.marca.cor
  const r = document.documentElement.style
  r.setProperty('--marca', c)
  r.setProperty('--marca-texto', corTexto(c))
  r.setProperty('--marca-forte', misturar(c, '#000000', 0.18))
  r.setProperty('--marca-suave', misturar(c, '#FFFFFF', 0.9))
  r.setProperty('--marca-linha', misturar(c, '#FFFFFF', 0.78))
  r.setProperty('--acento', config.marca.acento)
  r.setProperty('--acento-texto', corTexto(config.marca.acento))
  r.setProperty('--acento-forte', misturar(config.marca.acento, '#000000', 0.12))
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', c)
}

// ---------- Entrada ----------
function ecraEntrada(mensagem) {
  desmontarVista()
  estado = { sites: [], site: null, membros: [], vista: null, rota: null, desligar: [] }
  document.title = 'Entrar · ' + config.marca.nome
  aplicarTema(config.marca.cor)
  const email = h('input', { type: 'email', name: 'email', autocomplete: 'username', required: true, inputmode: 'email', id: 'entrar-email' })
  const palavra = h('input', { type: 'password', name: 'password', autocomplete: 'current-password', required: true, id: 'entrar-palavra' })
  const msg = h('p', { class: 'form-erro', role: 'alert', hidden: !mensagem }, mensagem || '')
  const enviar = h('button', { class: 'btn btn-primario btn-largo', type: 'submit' }, h('span', null, 'Entrar'))
  const form = h('form', { class: 'entrada-form', novalidate: true, onsubmit: async (e) => {
    e.preventDefault()
    msg.hidden = true
    if (!email.value.trim() || !palavra.value) { msg.textContent = 'Escreva o email e a palavra-passe.'; msg.hidden = false; (email.value ? palavra : email).focus(); return }
    enviar.disabled = true; enviar.classList.add('a-carregar'); enviar.firstChild.textContent = 'A entrar…'
    try {
      await dados.entrar(email.value.trim(), palavra.value)
      await entrarNoPainel()
    } catch (err) {
      const m = /invalid login|invalid credentials|invalid_grant/i.test(err.message || '') ? 'Email ou palavra-passe incorretos.' : /email not confirmed/i.test(err.message || '') ? 'Este email ainda não foi confirmado. Veja a sua caixa de correio.' : mensagemErro(err)
      msg.textContent = m; msg.hidden = false
      enviar.disabled = false; enviar.classList.remove('a-carregar'); enviar.firstChild.textContent = 'Entrar'
      palavra.select()
    }
  } },
  h('div', { class: 'campo' }, h('label', { for: 'entrar-email' }, 'Email'), email),
  h('div', { class: 'campo' }, h('label', { for: 'entrar-palavra' }, 'Palavra-passe'), palavra),
  msg, enviar)
  limpar(raiz).appendChild(h('main', { class: 'entrada' },
    h('div', { class: 'entrada-caixa' },
      h('div', { class: 'entrada-marca' }, h('span', { class: 'marca-simbolo', 'aria-hidden': 'true' }, iniciais(config.marca.nome.replace(/^Painel\s+/i, '')).slice(0, 1)), h('span', null, config.marca.nome)),
      h('h1', { class: 'entrada-titulo' }, 'Entrar no painel'),
      h('p', { class: 'entrada-sub' }, 'Mensagens, contactos, funil de vendas e blog do seu site, num só lugar.'),
      form,
      h('p', { class: 'entrada-nota' }, 'As contas são criadas pelo administrador do painel. Se se esqueceu da palavra-passe, peça-lhe uma nova.'),
      DEMO ? h('p', { class: 'entrada-nota' }, 'Modo de demonstração: qualquer email e palavra-passe servem.') : null)))
  setTimeout(() => email.focus(), 30)
}

function ecraErro(e) {
  limpar(raiz).appendChild(h('main', { class: 'entrada' }, h('div', { class: 'entrada-caixa' },
    h('h1', { class: 'entrada-titulo' }, 'Não foi possível abrir o painel'),
    h('p', { class: 'entrada-sub' }, mensagemErro(e)),
    h('button', { class: 'btn btn-primario', type: 'button', onclick: () => location.reload() }, 'Tentar outra vez'))))
}

async function entrarNoPainel() {
  limpar(raiz).appendChild(h('div', { class: 'arranque', role: 'status' }, h('span', { class: 'arranque-ponto' }), h('span', null, 'A carregar os seus painéis…')))
  let sites
  try { sites = await dados.sites() } catch (e) { return ecraErro(e) }
  if (!sites.length) {
    limpar(raiz).appendChild(h('main', { class: 'entrada' }, h('div', { class: 'entrada-caixa' },
      h('div', { class: 'vazio-icone' }, icone('escudo', 22)),
      h('h1', { class: 'entrada-titulo' }, 'A sua conta não tem acesso a nenhum painel.'),
      h('p', { class: 'entrada-sub' }, `Entrou como ${dados.utilizador?.email || 'utilizador'}. Peça ao administrador que o adicione como membro do site.`),
      h('button', { class: 'btn btn-secundario', type: 'button', onclick: () => dados.sair() }, icone('sair', 18), h('span', null, 'Terminar sessão')))))
    return
  }
  estado.sites = sites
  const ultimo = lerLocal('site')
  await escolherSite(sites.find((s) => s.id === ultimo) || sites[0], { primeira: true })
}

async function escolherSite(site, { primeira = false } = {}) {
  desmontarVista()
  estado.desligar.forEach((f) => f()); estado.desligar = []
  estado.site = site
  dados.usarSite(site.id)
  guardarLocal('site', site.id)
  aplicarTema(site.cor)
  try { estado.membros = await dados.membros() } catch { estado.membros = [] }
  montarMoldura()
  ligarTempoReal()
  actualizarContagem()
  if (!ouvinteHash) { ouvinteHash = true; window.addEventListener('hashchange', () => encaminhar()) }
  if (!location.hash || location.hash === '#' || location.hash === '#/') history.replaceState(null, '', location.pathname + location.search + '#/inicio')
  encaminhar(true)
}

// ---------- Moldura ----------
let refs = {}
function montarMoldura() {
  const recolhida = lerLocal('lateral-recolhida', false)
  const nav = h('nav', { class: 'lateral-nav', 'aria-label': 'Módulos' },
    ROTAS.map((r) => h('a', { href: '#/' + r.id, class: 'lateral-item', dataset: { rota: r.id }, title: r.texto },
      icone(r.icone, 20), h('span', { class: 'lateral-texto' }, r.nav || r.texto),
      r.id === 'caixa' ? h('span', { class: 'contagem', hidden: true, 'aria-label': 'mensagens por ler' }) : null)))
  const recolher = h('button', { class: 'lateral-recolher', type: 'button', 'aria-label': recolhida ? 'Expandir barra lateral' : 'Recolher barra lateral', 'aria-pressed': String(recolhida), onclick: () => {
    const app = raiz.querySelector('.app'); const nova = !app.classList.contains('recolhida')
    app.classList.toggle('recolhida', nova); guardarLocal('lateral-recolhida', nova)
    recolher.setAttribute('aria-label', nova ? 'Expandir barra lateral' : 'Recolher barra lateral'); recolher.setAttribute('aria-pressed', String(nova))
  } }, icone('painel', 18), h('span', { class: 'lateral-texto' }, 'Recolher'))

  const lateral = h('aside', { class: 'lateral' },
    h('a', { class: 'lateral-marca', href: '#/inicio', 'aria-label': config.marca.nome + ', início' },
      h('span', { class: 'marca-simbolo', 'aria-hidden': 'true' }, iniciais(estado.site.nome).slice(0, 1)),
      h('span', { class: 'lateral-texto lateral-marca-nome' }, h('strong', null, estado.site.nome), h('small', null, config.marca.nome))),
    nav, h('div', { class: 'lateral-fim' }, recolher))

  // Seletor de site
  const seletor = h('button', { class: 'seletor-site', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': `Site atual: ${estado.site.nome}. Mudar de site`, onclick: (e) => {
    abrirMenu(e.currentTarget, [{ cabecalho: 'Os seus sites' }, ...estado.sites.map((s) => ({ texto: s.nome, sub: s.dominio || s.slug, cor: s.cor || config.marca.cor, activo: s.id === estado.site.id, fazer: () => { if (s.id !== estado.site.id) escolherSite(s).then(() => aviso(`Mudou para ${s.nome}.`)) } }))], { largura: 260 })
  } }, h('span', { class: 'ponto-cor', style: { background: estado.site.cor || config.marca.cor } }), h('span', { class: 'seletor-nome' }, estado.site.nome), estado.sites.length > 1 ? icone('baixo', 16) : null)
  if (estado.sites.length < 2) seletor.disabled = true

  const pesquisa = criarPesquisaGlobal()
  const eu = dados.utilizador
  const utilizador = h('button', { class: 'avatar-btn', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': 'Menu da conta', onclick: (e) => abrirMenu(e.currentTarget, [
    { cabecalho: eu.email },
    { texto: estado.site.papel === 'admin' ? 'Administrador deste site' : 'Comercial neste site', icone: 'escudo', disabled: true },
    '-',
    { texto: 'Terminar sessão', icone: 'sair', fazer: () => dados.sair() },
  ], { alinhar: 'fim', largura: 240 }) }, h('span', { class: 'avatar' }, iniciais(eu.email.split('@')[0].replace(/[._-]/g, ' '))))

  const topo = h('header', { class: 'topo' },
    seletor,
    DEMO ? h('span', { class: 'chip chip-aviso topo-demo', title: 'Dados fictícios. Nada é guardado.' }, 'Demonstração') : null,
    pesquisa.el,
    h('div', { class: 'topo-direita' }, pesquisa.botaoMovel, utilizador))

  const vista = h('main', { class: 'vista', id: 'vista', tabindex: '-1' })
  const barra = h('nav', { class: 'barra-movel', 'aria-label': 'Módulos' },
    ['inicio', 'caixa', 'contactos', 'funil'].map((id) => { const r = ROTAS.find((x) => x.id === id); return h('a', { href: '#/' + id, class: 'barra-item', dataset: { rota: id } }, h('span', { class: 'barra-icone' }, icone(r.icone, 22), id === 'caixa' ? h('span', { class: 'contagem', hidden: true }) : null), h('span', null, r.curto || r.texto)) }),
    h('button', { class: 'barra-item', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', dataset: { rota: 'mais' }, onclick: (e) => abrirMenu(e.currentTarget, [
      { texto: 'Segmentos', icone: 'segmentos', fazer: () => navegar('#/segmentos') },
      { texto: 'Blog', icone: 'blog', fazer: () => navegar('#/blog') },
      { texto: 'Definições', icone: 'definicoes', fazer: () => navegar('#/definicoes') },
    ], { alinhar: 'fim', largura: 220 }) }, h('span', { class: 'barra-icone' }, icone('opcoes', 22)), h('span', null, 'Mais')))

  const app = h('div', { class: 'app' + (recolhida ? ' recolhida' : '') },
    h('a', { class: 'saltar', href: '#vista', onclick: (e) => { e.preventDefault(); vista.focus() } }, 'Saltar para o conteúdo'),
    lateral, h('div', { class: 'principal' }, topo, vista), barra)
  limpar(raiz).appendChild(app)
  refs = { app, vista, lateral, barra }
}

function criarPesquisaGlobal() {
  const input = h('input', { type: 'search', class: 'pesquisa-input', placeholder: 'Procurar contactos por nome, email ou empresa', 'aria-label': 'Procurar contactos', autocomplete: 'off', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': 'pesquisa-res', 'aria-autocomplete': 'list' })
  const res = h('div', { class: 'pesquisa-res', id: 'pesquisa-res', role: 'listbox', hidden: true })
  let itens = []; let sel = -1
  const el = h('div', { class: 'pesquisa', role: 'search' }, icone('procurar', 18, 'pesquisa-ic'), input, h('kbd', { class: 'pesquisa-atalho', 'aria-hidden': 'true' }, '/'), res)
  const fechar = () => { res.hidden = true; input.setAttribute('aria-expanded', 'false'); sel = -1; el.classList.remove('aberta-movel') }
  const marcar = () => itens.forEach((b, i) => { b.classList.toggle('sel', i === sel); b.setAttribute('aria-selected', String(i === sel)) })
  const procurar = adiar(async () => {
    const t = input.value.trim()
    if (t.length < 2) { fechar(); return }
    try {
      const lista = await dados.pesquisaGlobal(t)
      limpar(res)
      itens = lista.map((c) => h('a', { href: '#/contactos/' + c.id, class: 'pesquisa-item', role: 'option', onclick: () => { input.value = ''; fechar() } },
        h('span', { class: 'avatar avatar-peq' }, iniciais(c.nome || c.email)),
        h('span', { class: 'pesquisa-textos' }, h('strong', null, c.nome || c.email), h('small', null, [c.empresa, c.email].filter(Boolean).join(' · ')))))
      if (!itens.length) res.appendChild(h('p', { class: 'pesquisa-nada' }, `Nenhum contacto encontrado para «${t}».`))
      else itens.forEach((i) => res.appendChild(i))
      res.appendChild(h('a', { class: 'pesquisa-todos', href: '#/contactos?q=' + encodeURIComponent(t), onclick: () => { input.value = ''; fechar() } }, 'Ver todos os resultados em Contactos', icone('direita', 16)))
      sel = -1; res.hidden = false; input.setAttribute('aria-expanded', 'true')
    } catch (e) { erro(e, 'Pesquisa') }
  }, 220)
  input.addEventListener('input', procurar)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && itens.length) { e.preventDefault(); sel = (sel + 1) % itens.length; marcar() }
    else if (e.key === 'ArrowUp' && itens.length) { e.preventDefault(); sel = (sel - 1 + itens.length) % itens.length; marcar() }
    else if (e.key === 'Enter') { e.preventDefault(); if (sel >= 0) itens[sel].click(); else if (input.value.trim()) { navegar('#/contactos?q=' + encodeURIComponent(input.value.trim())); input.value = ''; fechar() } }
    else if (e.key === 'Escape') { input.value = ''; fechar(); input.blur() }
  })
  input.addEventListener('blur', () => setTimeout(() => { if (!el.contains(document.activeElement)) fechar() }, 150))
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && !document.activeElement?.isContentEditable && !document.querySelector('dialog[open]')) { e.preventDefault(); input.focus() }
  })
  const botaoMovel = h('button', { class: 'btn btn-fantasma btn-icone pesquisa-movel', type: 'button', 'aria-label': 'Procurar contactos', onclick: () => { el.classList.add('aberta-movel'); input.focus() } }, icone('procurar', 20))
  return { el, botaoMovel }
}

// ---------- Tempo real e contagem ----------
function ligarTempoReal() {
  const recontar = adiar(actualizarContagem, 400)
  estado.desligar.push(dados.subscrever('painel_mensagens', (p) => {
    recontar()
    if (p.eventType === 'INSERT' && p.new) {
      const quem = (p.new.dados && (p.new.dados.Nome || p.new.dados.nome)) || 'um visitante do site'
      aviso(`Nova mensagem de ${quem}${p.new.servico ? ' · ' + p.new.servico : ''}.`, { accao: { texto: 'Abrir', fazer: () => navegar('#/caixa/' + p.new.id) }, duracao: 7000 })
      document.dispatchEvent(new CustomEvent('painel:mensagem', { detail: p.new }))
    } else document.dispatchEvent(new CustomEvent('painel:mensagem', { detail: p.new }))
  }))
}
async function actualizarContagem() {
  try {
    const n = await dados.contagemPorLer()
    raiz.querySelectorAll('.contagem').forEach((b) => { b.hidden = !n; b.textContent = n > 99 ? '99+' : String(n) })
    const base = config.marca.nome
    document.title = (n ? `(${n}) ` : '') + (estado.rotaTitulo ? estado.rotaTitulo + ' · ' : '') + base
    estado.porLer = n
  } catch (e) { console.warn('Contagem', e) }
}

// ---------- Encaminhamento ----------
export function navegar(hash, { substituir = false } = {}) {
  if (substituir) { history.replaceState(null, '', location.pathname + location.search + hash); encaminhar() }
  else if (location.hash === hash) encaminhar()
  else location.hash = hash
}
function lerHash() {
  const bruto = (location.hash || '#/inicio').slice(2)
  const [caminho, qs] = bruto.split('?')
  const partes = caminho.split('/').filter(Boolean).map(decodeURIComponent)
  return { partes, query: new URLSearchParams(qs || '') }
}
function desmontarVista() {
  if (estado.vista && estado.vista.destruir) { try { estado.vista.destruir() } catch (e) { console.warn(e) } }
  estado.vista = null
}
let geracao = 0
let ouvinteHash = false
async function encaminhar() {
  if (!estado.site || !refs.vista) return
  const { partes, query } = lerHash()
  let [seccao = 'inicio', id] = partes
  if (!ROTAS.some((r) => r.id === seccao)) { navegar('#/inicio', { substituir: true }); return }
  let modulo = seccao
  if (seccao === 'contactos' && id) modulo = 'contacto'
  if (seccao === 'blog' && id) modulo = 'artigo'
  const params = { id, query, partes }
  // marcar navegação
  raiz.querySelectorAll('[data-rota]').forEach((a) => {
    const activo = a.dataset.rota === seccao || (a.dataset.rota === 'mais' && ['segmentos', 'blog', 'definicoes'].includes(seccao))
    a.classList.toggle('activo', activo)
    if (a.tagName === 'A') { if (activo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current') }
  })
  const rota = ROTAS.find((r) => r.id === seccao)
  estado.rotaTitulo = rota.texto
  document.title = (estado.porLer ? `(${estado.porLer}) ` : '') + rota.texto + ' · ' + config.marca.nome
  if (estado.rota === modulo && estado.vista && estado.vista.aoMudar) { estado.vista.aoMudar(params); return }
  desmontarVista()
  estado.rota = modulo
  const minha = ++geracao
  const el = limpar(refs.vista)
  el.className = 'vista vista-' + modulo
  el.scrollTop = 0; window.scrollTo(0, 0)
  try {
    const mod = await MODULOS[modulo]()
    if (minha !== geracao) return
    const ctx = contexto()
    estado.vista = (await mod.montar(el, ctx, params)) || {}
    if (minha !== geracao) { estado.vista.destruir && estado.vista.destruir(); return }
  } catch (e) {
    console.error(e)
    if (minha !== geracao) return
    limpar(el).appendChild(h('div', { class: 'pagina' }, h('div', { class: 'vazio' }, h('div', { class: 'vazio-icone' }, icone('alerta', 22)), h('h3', { class: 'vazio-titulo' }, 'Esta página não abriu'), h('p', { class: 'vazio-texto' }, mensagemErro(e)), h('div', { class: 'vazio-accoes' }, botao('Tentar outra vez', { tipo: 'secundario', onclick: () => encaminhar() })))))
  }
}

function contexto() {
  const eu = dados.utilizador
  return {
    dados, config, demo: DEMO,
    site: estado.site,
    papel: estado.site.papel,
    ehAdmin: estado.site.papel === 'admin',
    eu,
    membros: estado.membros,
    navegar,
    actualizarContagem,
    actualizarSite: (novo) => {
      estado.site = { ...estado.site, ...novo }
      estado.sites = estado.sites.map((s) => (s.id === novo.id ? { ...s, ...novo } : s))
      aplicarTema(estado.site.cor)
      const nome = raiz.querySelector('.seletor-nome'); if (nome) nome.textContent = estado.site.nome
      const ponto = raiz.querySelector('.seletor-site .ponto-cor'); if (ponto) ponto.style.background = estado.site.cor
      const ln = raiz.querySelector('.lateral-marca-nome strong'); if (ln) ln.textContent = estado.site.nome
    },
    actualizarMembros: (lista) => { estado.membros = lista },
    rotuloMembro(id) {
      if (!id) return 'Sem responsável'
      if (eu && id === eu.id) return 'Você'
      return 'Membro ' + String(id).slice(0, 4).toUpperCase()
    },
  }
}
