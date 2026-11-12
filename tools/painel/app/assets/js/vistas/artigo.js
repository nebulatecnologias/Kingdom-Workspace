// Editor de artigo: título, endereço automático, resumo, Markdown com barra e pré-visualização, SEO, autosave e publicação.
import { h, limpar, icone, botao, campo, chip, aviso, erro, confirmar, vazio, esqueleto, slugify, adiar, fmtData, fmtRelativo, mensagemErro } from '../ui.js'

const MARKED = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js'
const PURIFY = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.es.mjs'
let bibliotecas = null
function carregarBibliotecas() {
  if (!bibliotecas) bibliotecas = Promise.all([import(MARKED), import(PURIFY)]).then(([m, p]) => ({ marked: m.marked, purificar: p.default })).catch((e) => { bibliotecas = null; throw e })
  return bibliotecas
}

export async function montar(el, ctx, params) {
  const { dados } = ctx
  const novo = params.id === 'novo'
  const pagina = h('div', { class: 'pagina' }, esqueleto(6))
  el.appendChild(pagina)
  let a
  try {
    a = novo ? { titulo: '', slug: '', resumo: '', categoria: '', ambito: '', corpo_md: '', capa_url: '', seo_titulo: '', seo_descricao: '', estado: 'rascunho' } : await dados.artigo(params.id)
  } catch (e) { erro(e); return }
  limpar(pagina)
  if (!a) { pagina.appendChild(vazio({ icone: 'blog', titulo: 'Artigo não encontrado', texto: 'Pode ter sido apagado ou pertencer a outro site.', accoes: [h('a', { class: 'btn btn-secundario', href: '#/blog' }, 'Voltar ao blog')] })); return }
  carregarBibliotecas().catch(() => {})
  let existentes = []
  dados.artigos().then((l) => { existentes = l; preencherListas() }).catch(() => {})

  let slugManual = !!a.slug && a.slug !== slugify(a.titulo || '')
  let sujo = false
  let aGuardar = false
  let guardadoEm = a.actualizado_em || null

  // ---- Controlos ----
  const iTitulo = h('textarea', { class: 'titulo-artigo', rows: 1, placeholder: 'Título do artigo', 'aria-label': 'Título' }); iTitulo.value = a.titulo || ''
  const ajustarTitulo = () => { iTitulo.style.height = 'auto'; iTitulo.style.height = iTitulo.scrollHeight + 'px' }
  iTitulo.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); iResumo?.focus() } })
  const iResumo = h('textarea', { class: 'resumo-artigo', rows: 2, placeholder: 'Resumo em uma ou duas frases (aparece na lista do blog)', 'aria-label': 'Resumo' }); iResumo.value = a.resumo || ''
  const iSlug = h('input', { type: 'text', value: a.slug || '', spellcheck: 'false', autocapitalize: 'off' })
  const iCategoria = h('input', { type: 'text', value: a.categoria || '', list: 'lista-cat' })
  const iAmbito = h('input', { type: 'text', value: a.ambito || '', list: 'lista-amb' })
  const dlCat = h('datalist', { id: 'lista-cat' }), dlAmb = h('datalist', { id: 'lista-amb' })
  const iCapa = h('input', { type: 'url', value: a.capa_url || '', placeholder: 'https://…' })
  const capaPre = h('div', { class: 'capa-pre' })
  const iSeoT = h('input', { type: 'text', value: a.seo_titulo || '', maxlength: '120' })
  const iSeoD = h('textarea', { rows: 3, maxlength: '320' }); iSeoD.value = a.seo_descricao || ''
  const contT = h('span', { class: 'contador' }), contD = h('span', { class: 'contador' })
  const serp = h('div', { class: 'serp', 'aria-label': 'Pré-visualização no Google' })
  const texto = h('textarea', { class: 'md-texto', spellcheck: 'true', 'aria-label': 'Corpo do artigo em Markdown', placeholder: 'Escreva aqui. Use ## para subtítulos, - para listas, **negrito** e _itálico_.' }); texto.value = a.corpo_md || ''
  const prosa = h('div', { class: 'prosa', 'aria-live': 'off' })
  const estadoEl = h('span', { class: 'estado-guardar', 'aria-live': 'polite' })
  const chipEstado = h('span')
  const accoes = h('div', { class: 'grupo-btn' })
  const notaPub = h('div', { 'aria-live': 'polite' })

  function preencherListas() {
    const u = (k) => [...new Set(existentes.map((x) => x[k]).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'pt'))
    limpar(dlCat).append(...u('categoria').map((v) => h('option', { value: v })))
    limpar(dlAmb).append(...u('ambito').map((v) => h('option', { value: v })), ...(!u('ambito').includes(ctx.site.nome) ? [h('option', { value: ctx.site.nome })] : []))
  }

  // ---- Barra Markdown ----
  function envolver(antes, depois = antes, exemplo = 'texto') {
    const { selectionStart: i, selectionEnd: f, value } = texto
    const sel = value.slice(i, f) || exemplo
    texto.focus()
    texto.setRangeText(antes + sel + depois, i, f, 'end')
    texto.setSelectionRange(i + antes.length, i + antes.length + sel.length)
    texto.dispatchEvent(new Event('input', { bubbles: true }))
  }
  function prefixar(prefixo) {
    const { selectionStart: i, selectionEnd: f, value } = texto
    const ini = value.lastIndexOf('\n', i - 1) + 1
    const fimL = value.indexOf('\n', f); const fim = fimL === -1 ? value.length : fimL
    const bloco = value.slice(ini, fim)
    const linhas = bloco.split('\n')
    const todas = linhas.every((l) => l.startsWith(prefixo))
    const novo = linhas.map((l) => (todas ? l.slice(prefixo.length) : prefixo + l.replace(/^(#{1,6} |- |> )/, ''))).join('\n')
    texto.focus()
    texto.setRangeText(novo, ini, fim, 'select')
    texto.dispatchEvent(new Event('input', { bubbles: true }))
  }
  function ligacao() {
    const { selectionStart: i, selectionEnd: f, value } = texto
    const sel = value.slice(i, f) || 'texto da ligação'
    const ins = `[${sel}](https://)`
    texto.focus(); texto.setRangeText(ins, i, f, 'end')
    const p = i + sel.length + 3
    texto.setSelectionRange(p, p + 8)
    texto.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const bt = (ic, rot, fn, atalho) => botao('', { icone: ic, tipo: 'fantasma', tamanho: 'peq', rotulo: rot + (atalho ? ` (${atalho})` : ''), onclick: fn })
  const barra = h('div', { class: 'md-barra', role: 'toolbar', 'aria-label': 'Formatação' },
    bt('negrito', 'Negrito', () => envolver('**'), 'Ctrl+B'), bt('italico', 'Itálico', () => envolver('_'), 'Ctrl+I'), h('span', { class: 'sep' }),
    bt('titulo', 'Subtítulo', () => prefixar('## ')), bt('lista', 'Lista', () => prefixar('- ')), bt('citacao', 'Citação', () => prefixar('> ')), bt('ligacao', 'Ligação', ligacao, 'Ctrl+K'),
    h('span', { class: 'rot' }, 'Markdown'))
  texto.addEventListener('keydown', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return
    const k = e.key.toLowerCase()
    if (k === 'b') { e.preventDefault(); envolver('**') }
    else if (k === 'i') { e.preventDefault(); envolver('_') }
    else if (k === 'k') { e.preventDefault(); ligacao() }
  })

  // ---- Pré-visualizações ----
  const desenharPrevia = adiar(async () => {
    if (!texto.value.trim()) { limpar(prosa).appendChild(h('p', { class: 'prosa-vazia' }, 'A pré-visualização aparece aqui enquanto escreve.')); return }
    try {
      const { marked, purificar } = await carregarBibliotecas()
      prosa.innerHTML = purificar.sanitize(marked.parse(texto.value, { gfm: true, breaks: false }), { USE_PROFILES: { html: true } })
      prosa.querySelectorAll('a').forEach((x) => { x.target = '_blank'; x.rel = 'noopener noreferrer' })
    } catch { limpar(prosa).appendChild(h('p', { class: 'prosa-vazia' }, 'A pré-visualização não carregou (sem ligação à internet?). O texto continua a ser guardado.')) }
  }, 120)
  function desenharSeo() {
    const t = iSeoT.value, d = iSeoD.value
    contT.textContent = `${t.length}/60`; contT.classList.toggle('excede', t.length > 60)
    contD.textContent = `${d.length}/155`; contD.classList.toggle('excede', d.length > 155)
    const dom = (ctx.site.dominio || 'o-seu-site.co.za').replace(/^https?:\/\//, '')
    limpar(serp).append(h('div', { class: 'url' }, `${dom} › blog › ${iSlug.value || 'endereco-do-artigo'}`), h('div', { class: 't' }, t || iTitulo.value || 'Título do artigo'), h('div', { class: 'd' }, d || iResumo.value || 'A descrição que aparece no Google. Se ficar vazia, usamos o resumo.'))
  }
  function desenharCapa() {
    const u = iCapa.value.trim()
    if (/^https?:\/\//.test(u)) { capaPre.style.backgroundImage = `url("${u.replace(/"/g, '%22')}")`; capaPre.textContent = ''; capaPre.classList.add('com-imagem') }
    else { capaPre.style.backgroundImage = ''; capaPre.classList.remove('com-imagem'); capaPre.textContent = 'Sem imagem de capa. Tamanho recomendado: 1200 × 630.' }
  }

  // ---- Estado e ações ----
  function desenharEstado() {
    const pub = a.estado === 'publicado'
    limpar(chipEstado).appendChild(pub ? chip('Publicado', { tom: 'sucesso', icone: 'certo' }) : chip('Rascunho', { tom: 'aviso', icone: 'editar' }))
    if (aGuardar) estadoEl.textContent = 'A guardar…'
    else if (sujo) estadoEl.textContent = pub ? 'Alterações por guardar' : (iTitulo.value.trim() ? 'A guardar em breve…' : 'Escreva um título para guardar o rascunho')
    else if (guardadoEm && a.id) estadoEl.textContent = `Guardado ${fmtRelativo(guardadoEm)}`
    else estadoEl.textContent = 'Novo artigo'
    limpar(accoes)
    if (pub) {
      accoes.append(
        botao('Voltar a rascunho', { onclick: () => mudarEstado('rascunho') }),
        botao('Guardar alterações', { tipo: 'primario', icone: 'certo', disabled: !sujo, onclick: () => guardar({ forcar: true }) }))
    } else {
      accoes.append(botao('Publicar', { tipo: 'primario', icone: 'enviar', onclick: () => mudarEstado('publicado') }))
    }
    limpar(notaPub)
    if (pub) notaPub.appendChild(h('div', { class: 'alerta alerta-info' }, icone('info', 18), h('span', null, `Publicado a ${fmtData(a.publicado_em)}. O artigo fica disponível para o site; a publicação no site é feita pela integração do blog.`)))
  }
  const relogio = setInterval(() => { if (!sujo && !aGuardar) desenharEstado() }, 30000)

  function recolher() {
    return {
      titulo: iTitulo.value.trim(), slug: iSlug.value.trim(), resumo: iResumo.value.trim() || null, categoria: iCategoria.value.trim() || null, ambito: iAmbito.value.trim() || null,
      corpo_md: texto.value, capa_url: iCapa.value.trim() || null, seo_titulo: iSeoT.value.trim() || null, seo_descricao: iSeoD.value.trim() || null,
    }
  }
  async function guardar({ forcar = false } = {}) {
    if (aGuardar) { guardarDepois = true; return false }
    const d = recolher()
    if (!d.titulo) { desenharEstado(); return false }
    if (!d.slug) { d.slug = slugify(d.titulo); iSlug.value = d.slug }
    if (!/^[a-z0-9-]+$/.test(d.slug)) { iSlug.setAttribute('aria-invalid', 'true'); aviso('O endereço só pode ter letras minúsculas sem acentos, números e hífenes.', { tipo: 'erro' }); return false }
    iSlug.removeAttribute('aria-invalid')
    if (a.estado === 'publicado' && !forcar) return false
    aGuardar = true; desenharEstado()
    try {
      if (!a.id) {
        let tentativa = 0, criado = null
        while (!criado) {
          try { criado = await dados.criarArtigo({ ...d, estado: 'rascunho' }) } catch (e) {
            if (e.code === '23505' && !slugManual && tentativa < 5) { tentativa++; d.slug = `${slugify(d.titulo)}-${tentativa + 1}`; iSlug.value = d.slug } else throw e
          }
        }
        a = criado
        history.replaceState(null, '', location.pathname + location.search + '#/blog/' + a.id)
      } else {
        a = await dados.actualizarArtigo(a.id, d)
      }
      guardadoEm = a.actualizado_em || new Date().toISOString()
      sujo = false
      return true
    } catch (e) {
      aviso(e.code === '23505' ? 'Já existe um artigo com este endereço. Mude o endereço (slug).' : mensagemErro(e, 'Não foi possível guardar'), { tipo: 'erro' })
      if (e.code === '23505') iSlug.setAttribute('aria-invalid', 'true')
      return false
    } finally {
      aGuardar = false; desenharEstado()
      if (guardarDepois) { guardarDepois = false; if (sujo) autoGuardar() }
    }
  }
  let guardarDepois = false
  const autoGuardar = adiar(() => { if (a.estado !== 'publicado') guardar() }, 1200)

  async function mudarEstado(estado) {
    if (estado === 'publicado') {
      const d = recolher()
      const falta = []
      if (!d.titulo) falta.push('título')
      if (!d.corpo_md.trim()) falta.push('texto')
      if (falta.length) { aviso(`Para publicar falta o ${falta.join(' e o ')}.`, { tipo: 'erro' }); (d.titulo ? texto : iTitulo).focus(); return }
      if (!(await confirmar('O artigo fica disponível para o site; a publicação no site é feita pela integração do blog.', { titulo: 'Publicar artigo?', accao: 'Publicar' }))) return
    } else if (!(await confirmar('O artigo deixa de estar disponível para o site até voltar a ser publicado.', { titulo: 'Voltar a rascunho?', accao: 'Voltar a rascunho' }))) return
    autoGuardar.cancelar()
    const anterior = a.estado
    a.estado = 'rascunho' // guardar o conteúdo primeiro
    const ok = await guardar({ forcar: true })
    if (!ok) { a.estado = anterior; desenharEstado(); return }
    try {
      a = await dados.actualizarArtigo(a.id, { estado, publicado_em: estado === 'publicado' ? new Date().toISOString() : null })
      guardadoEm = a.actualizado_em
      aviso(estado === 'publicado' ? 'Artigo publicado. Fica disponível para o site; a publicação no site é feita pela integração do blog.' : 'O artigo voltou a rascunho.', { tipo: 'sucesso', duracao: 7000 })
    } catch (e) { a.estado = anterior; erro(e, 'Não foi possível mudar o estado') }
    desenharEstado()
  }

  function mudou() { sujo = true; desenharEstado(); autoGuardar() }
  iTitulo.addEventListener('input', () => { iTitulo.value = iTitulo.value.replace(/\n/g, ' '); ajustarTitulo(); if (!slugManual) iSlug.value = slugify(iTitulo.value); desenharSeo(); mudou() })
  iSlug.addEventListener('input', () => { const p = iSlug.selectionStart; iSlug.value = iSlug.value.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]/g, ''); iSlug.setSelectionRange(p, p); slugManual = !!iSlug.value && iSlug.value !== slugify(iTitulo.value); desenharSeo(); mudou() })
  iResumo.addEventListener('input', () => { desenharSeo(); mudou() })
  for (const x of [iCategoria, iAmbito]) x.addEventListener('input', mudou)
  iCapa.addEventListener('input', () => { desenharCapa(); mudou() })
  iSeoT.addEventListener('input', () => { desenharSeo(); mudou() })
  iSeoD.addEventListener('input', () => { desenharSeo(); mudou() })
  texto.addEventListener('input', () => { desenharPrevia(); mudou() })
  const atalhoGuardar = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); autoGuardar.cancelar(); guardar({ forcar: true }) } }
  document.addEventListener('keydown', atalhoGuardar)
  const antesDeSair = (e) => { if (sujo) { e.preventDefault(); e.returnValue = '' } }
  window.addEventListener('beforeunload', antesDeSair)

  // ---- Montagem ----
  pagina.append(
    h('div', { class: 'editor-cab' },
      h('a', { class: 'voltar', href: '#/blog', style: { margin: 0 } }, icone('esquerda', 16), 'Blog'),
      chipEstado, estadoEl, h('span', { class: 'espaco' }), accoes),
    notaPub,
    iTitulo, iResumo,
    h('section', { class: 'bloco editor-md', 'aria-label': 'Texto do artigo' },
      h('div', { class: 'md-escrever' }, barra, texto),
      h('div', { class: 'md-pre' }, h('div', { class: 'md-pre-cab' }, icone('olho', 16), h('span', { style: { marginLeft: '6px' } }, 'Pré-visualização')), prosa)),
    h('div', { class: 'grelha-meta' },
      h('section', { class: 'bloco', 'aria-labelledby': 'h-det' }, h('div', { class: 'bloco-cab' }, h('h2', { id: 'h-det' }, 'Detalhes')),
        h('div', { class: 'bloco-corpo formulario' },
          h('div', { class: 'campo' }, h('label', { for: 'a-slug' }, 'Endereço (slug)'), h('div', { class: 'prefixo' }, h('span', null, '/blog/'), Object.assign(iSlug, { id: 'a-slug' })), h('p', { class: 'campo-ajuda' }, 'Criado a partir do título. Depois de publicar, evite mudar: as ligações antigas deixam de funcionar.')),
          h('div', { class: 'campo-linha' }, campo('Categoria', iCategoria), campo('Âmbito', iAmbito, { ajuda: 'Por exemplo, a marca ou a área a que o artigo pertence.' })),
          dlCat, dlAmb,
          campo('Imagem de capa (URL)', iCapa), capaPre,
          a.id || !novo ? h('div', { style: { paddingTop: '6px' } }, botao('Apagar artigo', { tipo: 'perigo-suave', icone: 'apagar', tamanho: 'peq', onclick: apagar })) : null)),
      h('section', { class: 'bloco', 'aria-labelledby': 'h-seo' }, h('div', { class: 'bloco-cab' }, h('h2', { id: 'h-seo' }, 'SEO'), h('span', { class: 'sub' }, 'Como aparece no Google')),
        h('div', { class: 'bloco-corpo formulario' },
          h('div', { class: 'campo' }, h('div', { class: 'campo-cab' }, h('label', { for: 'a-seot' }, 'Título SEO'), contT), Object.assign(iSeoT, { id: 'a-seot', placeholder: 'Se ficar vazio, usamos o título' })),
          h('div', { class: 'campo' }, h('div', { class: 'campo-cab' }, h('label', { for: 'a-seod' }, 'Descrição SEO'), contD), Object.assign(iSeoD, { id: 'a-seod', placeholder: 'Se ficar vazia, usamos o resumo' })),
          serp))))

  async function apagar() {
    if (!a.id) { ctx.navegar('#/blog'); return }
    if (!(await confirmar(`Apagar «${a.titulo}»? Esta ação não se pode desfazer.`, { titulo: 'Apagar artigo', accao: 'Apagar', perigo: true }))) return
    try { await dados.apagarArtigo(a.id); sujo = false; aviso('Artigo apagado.'); ctx.navegar('#/blog') } catch (e) { erro(e, 'Não foi possível apagar') }
  }

  desenharEstado(); desenharSeo(); desenharCapa(); desenharPrevia.ja(); requestAnimationFrame(ajustarTitulo)
  if (novo) setTimeout(() => iTitulo.focus(), 50)

  return {
    destruir() {
      clearInterval(relogio)
      document.removeEventListener('keydown', atalhoGuardar)
      window.removeEventListener('beforeunload', antesDeSair)
      if (sujo && a.estado !== 'publicado' && iTitulo.value.trim()) { autoGuardar.cancelar(); guardar() }
      else if (sujo && a.estado === 'publicado') aviso('Saiu sem guardar as alterações ao artigo publicado.', { tipo: 'erro' })
    },
  }
}
