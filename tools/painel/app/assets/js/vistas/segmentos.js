// Segmentos: construtor de filtros com contagem ao vivo, pré-visualização, guardar, mudar nome, apagar, exportar.
import { h, limpar, icone, botao, campo, esqueleto, vazio, aviso, erro, confirmar, fmtNumero, rotuloOrigem, adiar, paraCSV, descarregar, hojeISO, iniciais } from '../ui.js'
import { filtrosVazios, normalizarFiltros, aplicarFiltros, descreverFiltros } from '../filtros.js'

export async function montar(el, ctx, params) {
  const { dados } = ctx
  let segmentos = [], contactos = [], contexto = null, valores = null
  let actual = null // segmento aberto
  let f = filtrosVazios()

  const listaEl = h('nav', { class: 'lista-segmentos', 'aria-label': 'Segmentos guardados' })
  const construtor = h('div', { class: 'construtor' })
  const iNome = h('input', { type: 'text', placeholder: 'Ex.: Leads quentes de Maputo', maxlength: '80' })
  const contagem = h('div', { class: 'contagem-viva', 'aria-live': 'polite' })
  const resumo = h('div', { class: 'resumo-filtros' })
  const previa = h('ul', { class: 'pre-lista' })
  const accoes = h('div', { class: 'grupo-btn' })
  const tituloEd = h('h2', { id: 'h-constr' }, 'Novo segmento')

  el.appendChild(h('div', { class: 'pagina' },
    h('div', { class: 'pagina-cab' }, h('div', null, h('h1', null, 'Segmentos'), h('p', { class: 'sub' }, 'Grupos de contactos definidos por regras. A lista atualiza-se sozinha quando chegam contactos novos.')),
      h('div', { class: 'pagina-accoes' }, botao('Novo segmento', { icone: 'mais', onclick: () => ctx.navegar('#/segmentos') }))),
    h('div', { class: 'grelha-segmentos' },
      h('section', { class: 'bloco', 'aria-label': 'Segmentos guardados' }, h('div', { class: 'bloco-cab' }, h('h2', null, 'Guardados')), listaEl),
      h('section', { class: 'bloco', 'aria-labelledby': 'h-constr' },
        h('div', { class: 'bloco-cab' }, tituloEd),
        h('div', { class: 'regra' }, h('label', { class: 'rotulo', for: 'seg-nome' }, 'Nome'), h('div', { class: 'controlos' }, Object.assign(iNome, { id: 'seg-nome' }))),
        construtor,
        h('div', { class: 'bloco-corpo', style: { borderTop: '1px solid var(--linha)' } }, accoes)),
      h('section', { class: 'bloco seg-pre', 'aria-label': 'Resultado' },
        h('div', { class: 'bloco-corpo' }, contagem, resumo),
        h('div', { style: { borderTop: '1px solid var(--linha)' } }, previa)))))

  async function carregarTudo() {
    limpar(construtor).appendChild(esqueleto(5))
    try {
      ;[segmentos, contactos, contexto, valores] = await Promise.all([dados.segmentos(), dados.todosContactos(), dados.contextoSegmentos(), dados.valoresDistintos()])
    } catch (e) { erro(e, 'Não foi possível carregar os segmentos'); return }
  }
  function desenharLista() {
    limpar(listaEl)
    if (!segmentos.length) { listaEl.appendChild(h('p', { class: 'texto-suave', style: { padding: '10px' } }, 'Ainda sem segmentos guardados. Defina as regras ao lado e guarde.')); return }
    for (const s of segmentos) {
      const n = aplicarFiltros(contactos, s.filtros, contexto).length
      listaEl.appendChild(h('a', { class: 'seg-item' + (actual?.id === s.id ? ' activo' : ''), href: '#/segmentos/' + s.id, 'aria-current': actual?.id === s.id ? 'page' : null }, h('span', null, s.nome), h('span', { class: 'n' }, fmtNumero(n))))
    }
  }

  // ---- construtor ----
  function opcoes(lista, chave, rotulo = (x) => x) {
    if (!lista.length) return h('p', { class: 'texto-fraco' }, 'Ainda não há valores.')
    return h('div', { class: 'opcoes-chip', role: 'group' }, lista.map((v) => h('button', { type: 'button', class: 'opcao-chip', 'aria-pressed': String(f[chave].includes(v)), onclick: (e) => {
      f[chave] = f[chave].includes(v) ? f[chave].filter((x) => x !== v) : [...f[chave], v]
      e.currentTarget.setAttribute('aria-pressed', String(f[chave].includes(v))); mudou()
    } }, rotulo(v))))
  }
  function triplo(chave, rotulos) {
    const seg = h('div', { class: 'segmentado', role: 'group' })
    const desenhar = () => { limpar(seg); [[null, rotulos[0]], [true, rotulos[1]], [false, rotulos[2]]].forEach(([v, r]) => seg.appendChild(h('button', { type: 'button', 'aria-pressed': String(f[chave] === v), onclick: () => { f[chave] = v; desenhar(); mudou() } }, r))) }
    desenhar(); return seg
  }
  function regra(rotulo, ...controlos) { return h('div', { class: 'regra' }, h('span', { class: 'rotulo' }, rotulo), h('div', { class: 'controlos' }, controlos)) }
  function desenharConstrutor() {
    limpar(construtor)
    const modo = h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Como combinar etiquetas' })
    const desenharModo = () => { limpar(modo); [['qualquer', 'Qualquer uma'], ['todas', 'Todas']].forEach(([v, r]) => modo.appendChild(h('button', { type: 'button', 'aria-pressed': String(f.etiquetas_modo === v), onclick: () => { f.etiquetas_modo = v; desenharModo(); mudou() } }, r))) }
    desenharModo()
    const de = h('input', { type: 'date', value: f.criado_de, 'aria-label': 'Criado desde' })
    const ate = h('input', { type: 'date', value: f.criado_ate, 'aria-label': 'Criado até' })
    de.addEventListener('change', () => { f.criado_de = de.value; mudou() })
    ate.addEventListener('change', () => { f.criado_ate = ate.value; mudou() })
    construtor.append(
      regra('Origem', opcoes(valores.origens, 'origens', rotuloOrigem)),
      regra('Etiquetas', opcoes(valores.etiquetas, 'etiquetas'), f.etiquetas.length > 1 || valores.etiquetas.length ? h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, h('span', { class: 'texto-suave', style: { fontSize: '13px' } }, 'Com'), modo, h('span', { class: 'texto-suave', style: { fontSize: '13px' } }, 'as etiquetas escolhidas')) : null),
      regra('Cidade', opcoes(valores.cidades, 'cidades')),
      regra('Consentimento', triplo('consentimento', ['Indiferente', 'Com consentimento', 'Sem consentimento'])),
      regra('Criado entre', h('div', { class: 'campo-linha' }, de, ate)),
      regra('Oportunidade aberta', triplo('oportunidade_aberta', ['Indiferente', 'Tem', 'Não tem'])),
      regra('Serviço pedido', opcoes(valores.servicosPedidos, 'servicos')))
  }
  const mudou = adiar(() => { actualizarResultado(); desenharAccoes() }, 120)

  let resultado = []
  function actualizarResultado() {
    resultado = aplicarFiltros(contactos, f, contexto)
    limpar(contagem).append(h('strong', null, fmtNumero(resultado.length)), h('span', null, resultado.length === 1 ? 'contacto' : 'contactos'))
    const d = descreverFiltros(f)
    limpar(resumo).append(...(d.length ? d.map((t) => h('span', { class: 'chip chip-marca' }, t)) : [h('span', { class: 'texto-fraco' }, 'Sem regras: inclui todos os contactos.')]))
    limpar(previa)
    if (!resultado.length) { previa.appendChild(h('li', null, vazio({ icone: 'procurar', titulo: 'Nenhum contacto', texto: 'Alivie uma das regras para incluir mais contactos.' }))); return }
    resultado.slice(0, 8).forEach((c) => previa.appendChild(h('li', null, h('a', { href: '#/contactos/' + c.id }, h('span', { class: 'avatar avatar-peq' }, iniciais(c.nome || c.email)), h('span', { class: 'textos' }, h('strong', null, c.nome || c.email), h('small', null, [c.empresa, c.cidade].filter(Boolean).join(' · ') || c.email))))))
    if (resultado.length > 8) previa.appendChild(h('li', { class: 'texto-fraco', style: { padding: '10px 18px 14px', fontSize: '13px' } }, `e mais ${fmtNumero(resultado.length - 8)}`))
  }

  function alterado() { return !actual || actual.nome !== iNome.value.trim() || JSON.stringify(normalizarFiltros(actual.filtros)) !== JSON.stringify(f) }
  function desenharAccoes() {
    limpar(accoes)
    const guardar = botao(actual ? 'Guardar alterações' : 'Guardar segmento', { tipo: 'primario', icone: 'certo', disabled: actual && !alterado(), onclick: async () => {
      const nome = iNome.value.trim()
      if (!nome) { iNome.setAttribute('aria-invalid', 'true'); iNome.focus(); aviso('Dê um nome ao segmento.', { tipo: 'erro' }); return }
      iNome.removeAttribute('aria-invalid')
      guardar.disabled = true
      try {
        if (actual) { actual = await dados.actualizarSegmento(actual.id, { nome, filtros: f }); segmentos = segmentos.map((s) => (s.id === actual.id ? actual : s)); aviso('Segmento atualizado.', { tipo: 'sucesso' }); desenharLista(); desenharAccoes() }
        else { const s = await dados.criarSegmento({ nome, filtros: f }); segmentos = [...segmentos, s].sort((a, b) => a.nome.localeCompare(b.nome, 'pt')); aviso('Segmento guardado.', { tipo: 'sucesso' }); ctx.navegar('#/segmentos/' + s.id) }
      } catch (e) { erro(e, 'Não foi possível guardar'); guardar.disabled = false }
    } })
    accoes.append(guardar,
      actual ? h('a', { class: 'btn btn-secundario', href: '#/contactos?segmento=' + actual.id }, icone('contactos', 18), h('span', null, 'Ver contactos')) : null,
      botao('Exportar CSV', { icone: 'exportar', disabled: !resultado.length, onclick: () => {
        const nome = `segmento-${(iNome.value.trim() || 'sem-nome').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}-${hojeISO()}.csv`
        descarregar(nome, paraCSV(resultado, [{ chave: 'nome' }, { chave: 'email' }, { chave: 'telefone' }, { chave: 'empresa' }, { chave: 'cargo' }, { chave: 'cidade' }, { chave: 'origem' }, { chave: 'etiquetas', valor: (c) => (c.etiquetas || []).join('|') }, { chave: 'consentimento', valor: (c) => (c.consentimento ? 'sim' : 'não') }]))
        aviso(`${fmtNumero(resultado.length)} contactos exportados.`, { tipo: 'sucesso' })
      } }),
      h('span', { style: { flex: 1 } }),
      actual ? botao('Apagar', { tipo: 'perigo-suave', icone: 'apagar', onclick: async () => {
        if (!(await confirmar(`Apagar o segmento «${actual.nome}»? Os contactos não são apagados.`, { titulo: 'Apagar segmento', accao: 'Apagar', perigo: true }))) return
        try { await dados.apagarSegmento(actual.id); segmentos = segmentos.filter((s) => s.id !== actual.id); aviso('Segmento apagado.'); ctx.navegar('#/segmentos') } catch (e) { erro(e) }
      } }) : null)
  }
  iNome.addEventListener('input', () => desenharAccoes())

  function abrir(id) {
    actual = id ? segmentos.find((s) => s.id === id) || null : null
    if (id && !actual) aviso('Este segmento já não existe.', { tipo: 'erro' })
    f = actual ? JSON.parse(JSON.stringify(normalizarFiltros(actual.filtros))) : filtrosVazios()
    iNome.value = actual ? actual.nome : ''
    tituloEd.textContent = actual ? 'Editar segmento' : 'Novo segmento'
    desenharLista(); desenharConstrutor(); actualizarResultado(); desenharAccoes()
  }

  await carregarTudo()
  if (!valores) return {}
  abrir(params.id)
  return { aoMudar(p) { abrir(p.id) } }
}
