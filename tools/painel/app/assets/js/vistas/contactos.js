// Contactos: tabela com pesquisa, filtros, ordenação, paginação, seleção em massa, importação e exportação CSV.
import { h, limpar, icone, botao, campo, chip, esqueleto, vazio, aviso, erro, gaveta, dialogo, abrirMenu, fmtData, fmtNumero, rotuloOrigem, adiar, paraCSV, descarregar, lerCSV, semAcentos, hojeISO, mensagemErro } from '../ui.js'
import { abrirNovoContacto } from '../partilhado.js'
import { descreverFiltros } from '../filtros.js'

const POR_PAGINA = 50
const COLUNAS_CSV = [
  { chave: 'nome' }, { chave: 'email' }, { chave: 'telefone' }, { chave: 'empresa' }, { chave: 'cargo' }, { chave: 'cidade' }, { chave: 'origem' },
  { chave: 'etiquetas', valor: (c) => (c.etiquetas || []).join('|') }, { chave: 'consentimento', valor: (c) => (c.consentimento ? 'sim' : 'não') },
  { chave: 'criado_em', valor: (c) => (c.criado_em || '').slice(0, 10) },
]

export async function montar(el, ctx, params) {
  const { dados } = ctx
  const q = params.query
  const f = { pesquisa: q.get('q') || '', origem: q.get('origem') || '', etiqueta: q.get('etiqueta') || '', servico: '', desde: '', ate: '' }
  let ordem = 'criado_em', asc = false, pagina = 1
  let total = 0, linhas = []
  const sel = new Set()
  let segmento = null, listaSegmento = null
  let valores = { origens: [], etiquetas: [], servicosPedidos: [] }

  const sub = h('p', { class: 'sub' })
  const faixa = h('div')
  const iPesq = h('input', { type: 'search', placeholder: 'Procurar contactos', 'aria-label': 'Procurar contactos', value: f.pesquisa })
  const sOrigem = h('select', { 'aria-label': 'Origem' })
  const sEtiq = h('select', { 'aria-label': 'Etiqueta' })
  const sServ = h('select', { 'aria-label': 'Serviço pedido' })
  const iDesde = h('input', { type: 'date', 'aria-label': 'Criado desde', title: 'Criado desde', max: hojeISO() })
  const iAte = h('input', { type: 'date', 'aria-label': 'Criado até', title: 'Criado até', max: hojeISO() })
  const limparF = botao('Limpar', { tipo: 'fantasma', tamanho: 'peq', icone: 'fechar', onclick: () => { Object.assign(f, { pesquisa: '', origem: '', etiqueta: '', servico: '', desde: '', ate: '' }); iPesq.value = ''; sOrigem.value = ''; sEtiq.value = ''; sServ.value = ''; iDesde.value = ''; iAte.value = ''; pagina = 1; carregar() } })
  const filtros = h('div', { class: 'filtros' }, h('div', { class: 'pesq' }, icone('procurar', 16), iPesq), sOrigem, sEtiq, sServ,
    h('label', { class: 'visualmente-oculto', for: 'f-desde' }, 'Criado desde'), Object.assign(iDesde, { id: 'f-desde' }),
    h('label', { class: 'visualmente-oculto', for: 'f-ate' }, 'Criado até'), Object.assign(iAte, { id: 'f-ate' }), limparF)
  const massa = h('div', { class: 'barra-massa', hidden: true, role: 'region', 'aria-label': 'Ações para os contactos selecionados' })
  const tabelaCaixa = h('div', { class: 'bloco' })
  el.appendChild(h('div', { class: 'pagina' },
    h('div', { class: 'pagina-cab' },
      h('div', null, h('h1', null, 'Contactos'), sub),
      h('div', { class: 'pagina-accoes' },
        botao('Importar CSV', { icone: 'importar', onclick: () => abrirImportar() }),
        botao('Exportar CSV', { icone: 'exportar', onclick: () => exportar() }),
        botao('Novo contacto', { tipo: 'primario', icone: 'mais', onclick: () => abrirNovoContacto(ctx, (c) => ctx.navegar('#/contactos/' + c.id)) }))),
    faixa, filtros, massa, tabelaCaixa))

  const aoPesquisar = adiar(() => { f.pesquisa = iPesq.value.trim(); pagina = 1; carregar() }, 250)
  iPesq.addEventListener('input', aoPesquisar)
  for (const [elx, k] of [[sOrigem, 'origem'], [sEtiq, 'etiqueta'], [sServ, 'servico'], [iDesde, 'desde'], [iAte, 'ate']]) elx.addEventListener('change', () => { f[k] = elx.value; pagina = 1; carregar() })

  async function prepararFiltros() {
    try { valores = await dados.valoresDistintos() } catch {}
    limpar(sOrigem).append(h('option', { value: '' }, 'Todas as origens'), ...valores.origens.map((o) => h('option', { value: o, selected: o === f.origem }, rotuloOrigem(o))))
    limpar(sEtiq).append(h('option', { value: '' }, 'Todas as etiquetas'), ...valores.etiquetas.map((o) => h('option', { value: o, selected: o === f.etiqueta }, o)))
    limpar(sServ).append(h('option', { value: '' }, 'Qualquer serviço'), ...valores.servicosPedidos.map((o) => h('option', { value: o }, o)))
  }

  async function prepararSegmento() {
    const sid = q.get('segmento')
    limpar(faixa)
    if (!sid) { segmento = null; listaSegmento = null; filtros.hidden = false; return }
    try {
      segmento = await dados.segmento(sid)
      if (!segmento) { aviso('Este segmento já não existe.', { tipo: 'erro' }); ctx.navegar('#/contactos', { substituir: true }); return }
      listaSegmento = await dados.avaliarSegmento(segmento.filtros)
      faixa.appendChild(h('div', { class: 'faixa' }, icone('segmentos', 18), h('span', null, 'Segmento ', h('strong', null, segmento.nome), ` · ${fmtNumero(listaSegmento.length)} contactos`),
        h('span', { class: 'chips' }, descreverFiltros(segmento.filtros).map((t) => chip(t, { tom: 'marca' }))), h('span', { class: 'espaco' }),
        h('a', { class: 'btn btn-secundario btn-peq', href: '#/segmentos/' + segmento.id }, icone('editar', 16), h('span', null, 'Editar segmento')),
        h('a', { class: 'btn btn-fantasma btn-peq', href: '#/contactos' }, icone('fechar', 16), h('span', null, 'Ver todos'))))
      // dentro de um segmento só fica a pesquisa
      ;[sOrigem, sEtiq, sServ, iDesde, iAte, limparF].forEach((x) => { x.hidden = true })
    } catch (e) { erro(e, 'Não foi possível abrir o segmento') }
  }

  async function carregar() {
    limpar(tabelaCaixa).appendChild(esqueleto(8))
    try {
      if (listaSegmento) {
        let l = listaSegmento
        if (f.pesquisa) { const t = semAcentos(f.pesquisa); l = l.filter((c) => semAcentos([c.nome, c.email, c.empresa, c.telefone].filter(Boolean).join(' ')).includes(t)) }
        l = [...l].sort((a, b) => (asc ? 1 : -1) * String(a[ordem] ?? '').localeCompare(String(b[ordem] ?? ''), 'pt', { sensitivity: 'base' }))
        total = l.length
        linhas = l.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
      } else {
        const r = await dados.contactos({ ...f, ordem, asc, pagina, porPagina: POR_PAGINA })
        total = r.total; linhas = r.linhas
      }
      sub.textContent = `${fmtNumero(total)} ${total === 1 ? 'contacto' : 'contactos'}${listaSegmento ? ' neste segmento' : (f.pesquisa || f.origem || f.etiqueta || f.servico || f.desde || f.ate) ? ' com estes filtros' : ''}`
      limparF.hidden = !!listaSegmento || !(f.pesquisa || f.origem || f.etiqueta || f.servico || f.desde || f.ate)
      desenharTabela()
    } catch (e) { erro(e, 'Não foi possível carregar os contactos'); limpar(tabelaCaixa) }
  }

  function cabecalho(rotulo, chave, extra = '') {
    if (!chave) return h('th', { class: extra, scope: 'col' }, rotulo)
    const activo = ordem === chave
    return h('th', { class: extra, scope: 'col', 'aria-sort': activo ? (asc ? 'ascending' : 'descending') : null },
      h('button', { type: 'button', onclick: () => { if (ordem === chave) asc = !asc; else { ordem = chave; asc = chave !== 'criado_em' } pagina = 1; carregar() } }, rotulo, activo ? icone(asc ? 'cima' : 'baixo', 14) : null))
  }

  function desenharTabela() {
    limpar(tabelaCaixa)
    if (!linhas.length) {
      const filtrado = f.pesquisa || f.origem || f.etiqueta || f.servico || f.desde || f.ate || listaSegmento
      tabelaCaixa.appendChild(filtrado
        ? vazio({ icone: 'procurar', titulo: 'Nenhum contacto encontrado', texto: listaSegmento ? 'Nenhum contacto cumpre as regras deste segmento.' : 'Experimente outra pesquisa ou limpe os filtros.', accoes: listaSegmento ? null : [botao('Limpar filtros', { onclick: () => limparF.click() })] })
        : vazio({ icone: 'contactos', titulo: 'Ainda não há contactos', texto: 'Os contactos são criados automaticamente quando alguém preenche um formulário do site. Também pode importar uma lista em CSV ou criar um à mão.', accoes: [botao('Importar CSV', { icone: 'importar', onclick: () => abrirImportar() }), botao('Novo contacto', { tipo: 'primario', icone: 'mais', onclick: () => abrirNovoContacto(ctx, (c) => ctx.navegar('#/contactos/' + c.id)) })] }))
      actualizarMassa(); return
    }
    const todos = h('input', { type: 'checkbox', 'aria-label': 'Selecionar todos nesta página', checked: linhas.every((c) => sel.has(c.id)) })
    todos.indeterminate = !todos.checked && linhas.some((c) => sel.has(c.id))
    todos.addEventListener('change', () => { linhas.forEach((c) => (todos.checked ? sel.add(c.id) : sel.delete(c.id))); desenharTabela() })
    const corpo = h('tbody')
    for (const c of linhas) {
      const caixa = h('input', { type: 'checkbox', 'aria-label': `Selecionar ${c.nome || c.email}`, checked: sel.has(c.id) })
      const tr = h('tr', { class: sel.has(c.id) ? 'seleccionada' : '' },
        h('td', { class: 'col-sel' }, caixa),
        h('td', { class: 'c-nome' }, h('a', { class: 'principal-cel', href: '#/contactos/' + c.id }, c.nome || c.email || 'Sem nome'), c.nome && c.email ? h('span', { class: 'secundario-cel' }, c.email) : null),
        h('td', { class: 'c-empresa' }, c.empresa ? h('span', { style: { display: 'block' } }, c.empresa) : h('span', { class: 'texto-fraco' }, '—'), c.cargo ? h('span', { class: 'secundario-cel' }, c.cargo) : null),
        h('td', { class: 'c-tel num', style: { whiteSpace: 'nowrap' } }, c.telefone || h('span', { class: 'texto-fraco' }, '—')),
        h('td', { class: 'c-cidade' }, c.cidade || h('span', { class: 'texto-fraco' }, '—')),
        h('td', { class: 'c-origem' }, rotuloOrigem(c.origem)),
        h('td', { class: 'c-etiquetas' }, (c.etiquetas || []).length ? h('span', { class: 'chips' }, (c.etiquetas || []).slice(0, 3).map((t) => chip(t, { tom: 'marca' })), c.etiquetas.length > 3 ? chip('+' + (c.etiquetas.length - 3)) : null) : null),
        h('td', { class: 'c-data data' }, fmtData(c.criado_em, { curta: true })))
      caixa.addEventListener('change', () => { if (caixa.checked) sel.add(c.id); else sel.delete(c.id); tr.classList.toggle('seleccionada', caixa.checked); todos.checked = linhas.every((x) => sel.has(x.id)); todos.indeterminate = !todos.checked && linhas.some((x) => sel.has(x.id)); actualizarMassa() })
      corpo.appendChild(tr)
    }
    const paginas = Math.max(1, Math.ceil(total / POR_PAGINA))
    tabelaCaixa.append(
      h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela tabela-contactos' },
        h('thead', null, h('tr', null, h('th', { class: 'col-sel', scope: 'col' }, todos), cabecalho('Nome', 'nome'), cabecalho('Empresa', 'empresa'), cabecalho('Telefone'), cabecalho('Cidade', 'cidade'), cabecalho('Origem', 'origem'), cabecalho('Etiquetas'), cabecalho('Criado', 'criado_em'))),
        corpo)),
      h('div', { class: 'paginacao' },
        h('span', null, `${fmtNumero((pagina - 1) * POR_PAGINA + 1)}–${fmtNumero(Math.min(pagina * POR_PAGINA, total))} de ${fmtNumero(total)}`),
        h('div', { class: 'grupo-btn' },
          botao('Anterior', { tamanho: 'peq', icone: 'esquerda', disabled: pagina <= 1, onclick: () => { pagina--; carregar(); window.scrollTo(0, 0) } }),
          botao('Seguinte', { tamanho: 'peq', disabled: pagina >= paginas, onclick: () => { pagina++; carregar(); window.scrollTo(0, 0) } }))))
    actualizarMassa()
  }

  function actualizarMassa() {
    limpar(massa)
    massa.hidden = !sel.size
    if (!sel.size) return
    massa.append(h('strong', null, `${fmtNumero(sel.size)} ${sel.size === 1 ? 'selecionado' : 'selecionados'}`),
      botao('Adicionar etiqueta', { tipo: 'fantasma', tamanho: 'peq', icone: 'etiqueta', onclick: () => pedirEtiqueta() }),
      botao('Remover etiqueta', { tipo: 'fantasma', tamanho: 'peq', icone: 'fechar', onclick: (e) => menuRemover(e.currentTarget) }),
      botao('Exportar', { tipo: 'fantasma', tamanho: 'peq', icone: 'exportar', onclick: () => exportar([...sel]) }),
      h('span', { style: { flex: 1 } }),
      botao('Limpar seleção', { tipo: 'fantasma', tamanho: 'peq', onclick: () => { sel.clear(); desenharTabela() } }))
  }

  function pedirEtiqueta() {
    const lid = 'et-m-' + Math.random().toString(36).slice(2, 6)
    const input = h('input', { type: 'text', list: lid, placeholder: 'Ex.: evento-2026' })
    const ok = h('button', { class: 'btn btn-primario', type: 'button', onclick: async () => {
      const t = input.value.trim().toLowerCase().replace(/\s+/g, '-')
      if (!t) { input.focus(); return }
      ok.disabled = true
      try { const n = await dados.etiquetar([...sel], t, 'adicionar'); d.fechar(); aviso(`Etiqueta «${t}» adicionada a ${n} ${n === 1 ? 'contacto' : 'contactos'}.`, { tipo: 'sucesso' }); await prepararFiltros(); await recarregarSegmento(); carregar() } catch (e) { erro(e); ok.disabled = false }
    } }, 'Adicionar')
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok.click() })
    const d = dialogo({ titulo: `Adicionar etiqueta a ${sel.size} ${sel.size === 1 ? 'contacto' : 'contactos'}`, conteudo: [campo('Etiqueta', input), h('datalist', { id: lid }, valores.etiquetas.map((v) => h('option', { value: v })))], botoes: [h('button', { class: 'btn btn-secundario', type: 'button', onclick: () => d.fechar() }, 'Cancelar'), ok] })
    setTimeout(() => input.focus(), 40)
  }
  async function menuRemover(ancora) {
    const nosSel = new Set()
    const fonte = listaSegmento || (await dados.todosContactos())
    fonte.filter((c) => sel.has(c.id)).forEach((c) => (c.etiquetas || []).forEach((t) => nosSel.add(t)))
    if (!nosSel.size) { aviso('Os contactos selecionados não têm etiquetas.'); return }
    abrirMenu(ancora, [{ cabecalho: 'Remover dos selecionados' }, ...[...nosSel].sort().map((t) => ({ texto: t, icone: 'etiqueta', fazer: async () => {
      try { const n = await dados.etiquetar([...sel], t, 'remover'); aviso(`Etiqueta «${t}» removida de ${n} ${n === 1 ? 'contacto' : 'contactos'}.`, { tipo: 'sucesso' }); await prepararFiltros(); await recarregarSegmento(); carregar() } catch (e) { erro(e) }
    } }))])
  }
  async function recarregarSegmento() { if (segmento) { dados.esquecerCache(); listaSegmento = await dados.avaliarSegmento(segmento.filtros) } }

  async function exportar(ids) {
    try {
      let lista
      if (ids) lista = (listaSegmento || (await dados.todosContactos())).filter((c) => ids.includes(c.id))
      else if (listaSegmento) lista = listaSegmento
      else {
        lista = []
        for (let p = 1; ; p++) { const r = await dados.contactos({ ...f, ordem, asc, pagina: p, porPagina: 1000 }); lista = lista.concat(r.linhas); if (r.linhas.length < 1000) break }
      }
      if (!lista.length) { aviso('Não há contactos para exportar.'); return }
      const nome = `contactos-${ctx.site.slug}${segmento ? '-' + segmento.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}-${hojeISO()}.csv`
      descarregar(nome, paraCSV(lista, COLUNAS_CSV))
      aviso(`${fmtNumero(lista.length)} contactos exportados.`, { tipo: 'sucesso' })
    } catch (e) { erro(e, 'Não foi possível exportar') }
  }

  function abrirImportar() {
    const CAMPOS = [['nome', 'Nome', ['nome', 'name', 'nome completo', 'full name']], ['email', 'Email', ['email', 'e-mail', 'correio', 'mail']], ['telefone', 'Telefone', ['telefone', 'telemovel', 'telemóvel', 'phone', 'celular', 'contacto', 'whatsapp']], ['empresa', 'Empresa', ['empresa', 'company', 'organizacao', 'organização']], ['cargo', 'Cargo', ['cargo', 'funcao', 'função', 'title', 'job title']], ['cidade', 'Cidade', ['cidade', 'city', 'localidade', 'provincia', 'província']], ['origem', 'Origem', ['origem', 'source', 'fonte']], ['etiquetas', 'Etiquetas', ['etiquetas', 'tags', 'etiqueta', 'tag']]]
    let csv = null
    const ficheiro = h('input', { type: 'file', accept: '.csv,text/csv', id: 'imp-ficheiro' })
    const zona = h('div', { class: 'formulario' })
    const importar = botao('Importar', { tipo: 'primario', disabled: true })
    const g = gaveta({ titulo: 'Importar contactos', subtitulo: 'Ficheiro CSV com uma linha de cabeçalho. Os contactos com um email que já existe são atualizados.', largura: 'larga',
      conteudo: [campo('Ficheiro CSV', ficheiro, { ajuda: 'Separador vírgula ou ponto e vírgula. Etiquetas separadas por | ou ;.' }), zona],
      rodape: [importar, botao('Cancelar', { onclick: () => g.fechar() })] })
    const mapa = {}
    ficheiro.addEventListener('change', async () => {
      limpar(zona); importar.disabled = true
      const fx = ficheiro.files[0]; if (!fx) return
      if (fx.size > 5 * 1024 * 1024) { zona.appendChild(h('div', { class: 'alerta alerta-perigo' }, icone('alerta', 18), 'O ficheiro tem mais de 5 MB. Divida-o em partes mais pequenas.')); return }
      csv = lerCSV(await fx.text())
      if (!csv.colunas.length || !csv.linhas.length) { zona.appendChild(h('div', { class: 'alerta alerta-perigo' }, icone('alerta', 18), 'Não encontrámos linhas neste ficheiro.')); return }
      const norm = (s) => semAcentos(s).replace(/[_-]+/g, ' ').trim()
      const linhasMapa = CAMPOS.map(([k, rotulo, sin]) => {
        const auto = csv.colunas.findIndex((c) => sin.map(norm).includes(norm(c)))
        mapa[k] = auto
        const s = h('select', { 'aria-label': `Coluna para ${rotulo}` }, h('option', { value: '-1' }, 'Não importar'), csv.colunas.map((c, i) => h('option', { value: i, selected: i === auto }, c || `Coluna ${i + 1}`)))
        s.addEventListener('change', () => { mapa[k] = Number(s.value); previa() })
        return h('tr', null, h('td', null, h('strong', null, rotulo)), h('td', null, s))
      })
      const previaEl = h('div')
      zona.append(h('p', { class: 'texto-suave' }, `${fmtNumero(csv.linhas.length)} linhas encontradas. Confirme que coluna corresponde a cada campo.`),
        h('div', { class: 'bloco' }, h('table', { class: 'tabela' }, h('thead', null, h('tr', null, h('th', null, 'Campo do painel'), h('th', null, 'Coluna do ficheiro'))), h('tbody', null, linhasMapa))),
        h('h3', { class: 'seccao-titulo' }, 'Pré-visualização'), previaEl)
      function previa() {
        limpar(previaEl)
        const amostra = csv.linhas.slice(0, 5).map(converter)
        previaEl.appendChild(h('div', { class: 'bloco tabela-caixa' }, h('table', { class: 'tabela' }, h('thead', null, h('tr', null, CAMPOS.filter(([k]) => mapa[k] >= 0).map(([, r]) => h('th', null, r)))), h('tbody', null, amostra.map((l) => h('tr', null, CAMPOS.filter(([k]) => mapa[k] >= 0).map(([k]) => h('td', null, Array.isArray(l[k]) ? l[k].join(', ') : l[k] || '—'))))))))
        const semId = mapa.email < 0 && mapa.nome < 0
        importar.disabled = semId
        importar.querySelector('span').textContent = `Importar ${fmtNumero(csv.linhas.length)} ${csv.linhas.length === 1 ? 'linha' : 'linhas'}`
        if (semId) previaEl.appendChild(h('p', { class: 'form-erro' }, 'Escolha pelo menos a coluna do email ou do nome.'))
      }
      previa()
    })
    function converter(l) {
      const o = {}
      for (const [k] of CAMPOS) {
        if (mapa[k] == null || mapa[k] < 0) continue
        const v = (l[mapa[k]] || '').trim()
        o[k] = k === 'etiquetas' ? v.split(/[|;,]/).map((x) => x.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean) : v
      }
      return o
    }
    importar.addEventListener('click', async () => {
      importar.disabled = true; importar.classList.add('a-carregar')
      try {
        const r = await dados.importarContactos(csv.linhas.map(converter))
        g.fechar()
        aviso(`Importação concluída: ${r.inseridos} novos, ${r.actualizados} atualizados${r.ignorados ? `, ${r.ignorados} ignorados (sem email nem nome, ou repetidos)` : ''}.`, { tipo: 'sucesso', duracao: 8000 })
        await prepararFiltros(); pagina = 1; carregar()
      } catch (e) { importar.disabled = false; importar.classList.remove('a-carregar'); limpar(zona).appendChild(h('div', { class: 'alerta alerta-perigo' }, icone('alerta', 18), mensagemErro(e, 'A importação falhou'))) }
    })
  }

  await Promise.all([prepararFiltros(), prepararSegmento()])
  await carregar()
  if (q.get('novo') === '1') history.replaceState(null, '', location.pathname + location.search + '#/contactos')
  if (q.get('novo') === '1') abrirNovoContacto(ctx, (c) => ctx.navegar('#/contactos/' + c.id))
  return {}
}
