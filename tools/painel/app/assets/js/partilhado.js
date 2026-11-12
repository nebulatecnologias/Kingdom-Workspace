// Peças usadas por vários módulos: enviar email, editar oportunidade, novo contacto, linha do tempo, etiquetas.
import { h, limpar, icone, botao, campo, gaveta, aviso, erro, confirmar, dialogo, fmtMT, fmtNumero, fmtRelativo, fmtDataHora, primeiroNome, TIPOS_ACT, ICONE_ACT, TIPOS_MSG, BANT, adiar, mensagemErro, rotuloOrigem } from './ui.js'

// ---------- Enviar email ----------
export function abrirEmail(ctx, { para = '', assunto = '', corpo = '', contacto_id, oportunidade_id, mensagem_id, nome, aoEnviar } = {}) {
  const site = ctx.site
  const assinatura = `\n\nCom os melhores cumprimentos,\n${site.nome_remetente || site.nome}`
  const iPara = h('input', { type: 'email', value: para, autocomplete: 'off', required: true })
  const iAssunto = h('input', { type: 'text', value: assunto, required: true })
  const iCorpo = h('textarea', { rows: 12 })
  iCorpo.value = corpo || `Olá${nome ? ' ' + primeiroNome(nome) : ''},\n\n${assinatura}`
  const zonaErro = h('div', { 'aria-live': 'polite' })
  const remetente = site.email_remetente ? `${site.nome_remetente || site.nome} <${site.email_remetente}>` : 'Ainda não configurado'
  const enviar = botao('Enviar', { tipo: 'primario', icone: 'enviar' })
  const mailto = () => `mailto:${encodeURIComponent(iPara.value.trim())}?subject=${encodeURIComponent(iAssunto.value)}&body=${encodeURIComponent(iCorpo.value)}`
  const g = gaveta({
    titulo: 'Enviar email', subtitulo: `De: ${remetente}`,
    conteudo: [campo('Para', iPara), campo('Assunto', iAssunto), campo('Mensagem', iCorpo), zonaErro],
    rodape: [enviar, botao('Cancelar', { onclick: () => g.fechar() }), h('span', { class: 'espaco' }), h('a', { class: 'btn btn-fantasma', href: '#', onclick: (e) => { e.preventDefault(); location.href = mailto() } }, icone('externo', 16), h('span', null, 'Abrir no meu email'))],
  })
  // posicionar o cursor depois da saudação
  setTimeout(() => { if (!corpo) { const p = iCorpo.value.indexOf('\n\n') + 2; iCorpo.focus(); iCorpo.setSelectionRange(p, p) } }, 60)
  enviar.addEventListener('click', async () => {
    limpar(zonaErro)
    const p = iPara.value.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p)) { iPara.setAttribute('aria-invalid', 'true'); zonaErro.appendChild(alerta('perigo', 'O endereço de email não parece válido.')); iPara.focus(); return }
    iPara.removeAttribute('aria-invalid')
    if (!iAssunto.value.trim()) { zonaErro.appendChild(alerta('perigo', 'Escreva um assunto.')); iAssunto.focus(); return }
    enviar.disabled = true; enviar.classList.add('a-carregar')
    const r = await ctx.dados.enviarEmail({ para: p, assunto: iAssunto.value.trim(), corpo: iCorpo.value, contacto_id, oportunidade_id, mensagem_id })
    enviar.disabled = false; enviar.classList.remove('a-carregar')
    if (r && r.erro) {
      const dominio = /dom[ií]nio|domain|n[ãa]o est[áa] configurado|not configured|remetente|sender|verify|verific/i.test(r.erro)
      zonaErro.appendChild(h('div', { class: 'alerta alerta-aviso', role: 'alert' }, icone('alerta', 18), h('div', { class: 'alerta-corpo' },
        h('strong', null, dominio ? 'O envio de email ainda não está configurado para este site.' : 'O email não foi enviado.'),
        h('span', null, dominio ? 'O domínio do remetente precisa de ser configurado pelo administrador técnico. Entretanto, pode enviar esta resposta a partir do seu email: o texto fica preenchido.' : `Detalhe: ${r.erro}. Pode tentar outra vez ou enviar a partir do seu email.`),
        h('div', { class: 'grupo-btn' }, h('a', { class: 'btn btn-secundario btn-peq', href: mailto() }, icone('externo', 16), h('span', null, 'Abrir no meu email'))))))
      return
    }
    aviso('Email enviado.', { tipo: 'sucesso' })
    g.fechar()
    aoEnviar && aoEnviar(r)
  })
  return g
}
function alerta(tipo, texto) { return h('div', { class: `alerta alerta-${tipo}`, role: 'alert' }, icone(tipo === 'perigo' ? 'alerta' : 'info', 18), h('span', null, texto)) }

// ---------- Motivo de perda ----------
const MOTIVOS = ['Preço', 'Sem orçamento', 'Escolheu outro fornecedor', 'Sem resposta', 'Adiou o projeto', 'Fora do nosso âmbito']
export function pedirMotivoPerda(inicial = '') {
  return new Promise((resolve) => {
    let valor = null
    const texto = h('textarea', { rows: 3, placeholder: 'Ex.: o cliente escolheu fazer internamente' }); texto.value = inicial || ''
    const chips = h('div', { class: 'motivos' }, MOTIVOS.map((m) => h('button', { type: 'button', class: 'opcao-chip', 'aria-pressed': 'false', onclick: (e) => { chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false')); e.currentTarget.setAttribute('aria-pressed', 'true'); texto.value = m; texto.focus() } }, m)))
    const msg = h('p', { class: 'form-erro', hidden: true }, 'Indique o motivo para aprendermos com as oportunidades perdidas.')
    const ok = h('button', { class: 'btn btn-primario', type: 'button', onclick: () => { if (!texto.value.trim()) { msg.hidden = false; texto.focus(); return } valor = texto.value.trim(); d.fechar() } }, 'Marcar como perdida')
    const d = dialogo({ titulo: 'Porque se perdeu esta oportunidade?', conteudo: [chips, campo('Motivo', texto), msg], botoes: [h('button', { class: 'btn btn-secundario', type: 'button', onclick: () => d.fechar() }, 'Cancelar'), ok], aoFechar: () => resolve(valor) })
    setTimeout(() => texto.focus(), 40)
  })
}

// ---------- Escolher contacto ----------
export function escolhaContacto(ctx, inicial, aoMudar) {
  let atual = inicial || null
  const raiz = h('div', { class: 'escolha-contacto' })
  function desenhar() {
    limpar(raiz)
    if (atual) {
      raiz.appendChild(h('div', { class: 'escolhido' },
        h('span', { class: 'avatar avatar-peq' }, (atual.nome || atual.email || '?').slice(0, 1).toUpperCase()),
        h('span', { class: 'textos' }, h('strong', null, atual.nome || atual.email), h('small', null, [atual.empresa, atual.email].filter(Boolean).join(' · '))),
        botao('', { icone: 'fechar', tipo: 'fantasma', tamanho: 'peq', rotulo: 'Remover contacto', onclick: () => { atual = null; aoMudar(null); desenhar(); raiz.querySelector('input')?.focus() } })))
      return
    }
    const input = h('input', { type: 'search', placeholder: 'Procurar por nome, email ou empresa', autocomplete: 'off', 'aria-label': 'Procurar contacto' })
    const opcoes = h('div', { class: 'opcoes', hidden: true, role: 'listbox' })
    const procurar = adiar(async () => {
      const t = input.value.trim()
      if (t.length < 2) { opcoes.hidden = true; return }
      try {
        const lista = await ctx.dados.pesquisaGlobal(t)
        limpar(opcoes)
        if (!lista.length) opcoes.appendChild(h('p', { class: 'pesquisa-nada' }, 'Nenhum contacto encontrado.'))
        lista.forEach((c) => opcoes.appendChild(h('button', { type: 'button', role: 'option', onclick: () => { atual = c; aoMudar(c); desenhar() } }, h('strong', null, c.nome || c.email), h('small', null, [c.empresa, c.email].filter(Boolean).join(' · ')))))
        opcoes.hidden = false
      } catch (e) { erro(e) }
    }, 200)
    input.addEventListener('input', procurar)
    input.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { const b = opcoes.querySelector('button'); if (b) { e.preventDefault(); b.focus() } } })
    opcoes.addEventListener('keydown', (e) => {
      const bs = [...opcoes.querySelectorAll('button')]; const i = bs.indexOf(document.activeElement)
      if (e.key === 'ArrowDown') { e.preventDefault(); bs[Math.min(i + 1, bs.length - 1)]?.focus() }
      if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) input.focus(); else bs[i - 1].focus() }
      if (e.key === 'Escape') { opcoes.hidden = true; input.focus() }
    })
    raiz.append(input, opcoes)
  }
  desenhar()
  return raiz
}

// ---------- Oportunidade (criar / editar) ----------
export async function abrirOportunidade(ctx, { id, inicial = {}, aoGuardar, aoApagar, origemTexto } = {}) {
  const { dados } = ctx
  let op, etapas, valores, contacto = null, mensagem = null
  try {
    ;[etapas, valores] = await Promise.all([dados.etapas(), dados.valoresDistintos()])
    if (id) {
      op = await dados.oportunidade(id)
      if (!op) { aviso('Esta oportunidade já não existe.', { tipo: 'erro' }); return }
    } else op = { titulo: '', servico: '', valor: null, moeda: 'MZN', responsavel: ctx.eu?.id || null, proxima_accao: '', proxima_data: null, bant: {}, etapa_id: (etapas.find((e) => e.tipo === 'aberta') || etapas[0])?.id, ...inicial }
    if (op.contacto_id) contacto = await dados.contacto(op.contacto_id)
    if (op.mensagem_id) mensagem = await dados.mensagem(op.mensagem_id)
  } catch (e) { erro(e, 'Não foi possível abrir a oportunidade'); return }

  const novo = !id
  let contactoId = op.contacto_id || null
  const iTitulo = h('input', { type: 'text', value: op.titulo || '', required: true, placeholder: 'Ex.: Plano de Negócios · Mabunda Logística' })
  const iEtapa = h('select', null, etapas.map((e) => h('option', { value: e.id, selected: e.id === op.etapa_id }, e.nome + (e.tipo === 'ganha' ? ' (ganha)' : e.tipo === 'perdida' ? ' (perdida)' : ''))))
  const listaServ = 'servicos-' + Math.random().toString(36).slice(2, 6)
  const iServico = h('input', { type: 'text', value: op.servico || '', list: listaServ, placeholder: 'Ex.: Plano de Negócios' })
  const dlServ = h('datalist', { id: listaServ }, valores.servicos.map((s) => h('option', { value: s })))
  const iValor = h('input', { type: 'number', min: '0', step: '1000', inputmode: 'numeric', value: op.valor ?? '', placeholder: '0' })
  const ajudaValor = h('p', { class: 'campo-ajuda' }, op.valor ? fmtMT(op.valor) : 'Valor estimado em meticais')
  iValor.addEventListener('input', () => { ajudaValor.textContent = iValor.value ? fmtMT(iValor.value) : 'Valor estimado em meticais' })
  const iResp = h('select', null, h('option', { value: '' }, 'Sem responsável'), ctx.membros.map((m) => h('option', { value: m.user_id, selected: m.user_id === op.responsavel }, ctx.rotuloMembro(m.user_id) + (m.papel === 'admin' ? ' · admin' : ''))))
  if (!op.responsavel) iResp.value = ''
  const iAccao = h('input', { type: 'text', value: op.proxima_accao || '', placeholder: 'Ex.: Ligar para marcar reunião' })
  const iData = h('input', { type: 'date', value: op.proxima_data || '' })
  const iMotivo = h('input', { type: 'text', value: op.motivo_perda || '' })
  const campoMotivo = campo('Motivo da perda', iMotivo)
  const bant = { ...(op.bant || {}) }
  const bantEd = h('div', { class: 'bant-editor' }, BANT.map(([k, rotulo, dica]) => {
    const v = bant[k]
    const caixa = h('input', { type: 'checkbox', checked: !!v && v !== 'false' })
    const texto = h('input', { type: 'text', value: typeof v === 'string' ? v : '', placeholder: dica, 'aria-label': `${rotulo}: detalhe` })
    caixa.addEventListener('change', () => { if (!caixa.checked) texto.value = ''; bant[k] = caixa.checked ? (texto.value.trim() || true) : false })
    texto.addEventListener('input', () => { if (texto.value.trim()) caixa.checked = true; bant[k] = texto.value.trim() || caixa.checked })
    return h('div', { class: 'bant-linha' }, h('label', { class: 'caixa-marcar' }, caixa, h('span', null, rotulo)), texto)
  }))
  const escolha = escolhaContacto(ctx, contacto, (c) => { contactoId = c ? c.id : null })
  const mostrarMotivo = () => { campoMotivo.hidden = etapas.find((e) => e.id === iEtapa.value)?.tipo !== 'perdida' }
  iEtapa.addEventListener('change', mostrarMotivo); mostrarMotivo()

  const ligacoes = h('div', { class: 'grupo-btn' },
    contactoId && !novo ? h('a', { class: 'btn btn-secundario btn-peq', href: '#/contactos/' + contactoId, onclick: () => g.fechar() }, icone('pessoa', 16), h('span', null, 'Abrir contacto')) : null,
    mensagem ? h('a', { class: 'btn btn-secundario btn-peq', href: '#/caixa/' + mensagem.id, onclick: () => g.fechar() }, icone('mensagem', 16), h('span', null, 'Mensagem de origem')) : null,
    contacto?.email && !novo ? botao('Enviar email', { tamanho: 'peq', icone: 'email', onclick: () => abrirEmail(ctx, { para: contacto.email, nome: contacto.nome, assunto: op.titulo, contacto_id: contacto.id, oportunidade_id: op.id }) }) : null)

  const historico = h('div')
  const conteudo = [
    ligacoes.childElementCount ? ligacoes : null,
    campo('Título', iTitulo),
    h('div', { class: 'campo' }, h('span', { class: 'rotulo' }, 'Contacto'), escolha),
    h('div', { class: 'campo-linha' }, campo('Etapa', iEtapa), campo('Responsável', iResp)),
    h('div', { class: 'campo-linha' }, campo('Serviço', iServico), h('div', { class: 'campo' }, h('label', { for: 'v' + listaServ }, 'Valor (MT)'), Object.assign(iValor, { id: 'v' + listaServ }), ajudaValor)),
    dlServ,
    campoMotivo,
    h('div', { class: 'campo-linha' }, campo('Próxima ação', iAccao), campo('Data', iData)),
    h('fieldset', { class: 'campo', style: { border: 0, padding: 0, margin: 0 } }, h('legend', { class: 'rotulo', style: { marginBottom: '8px' } }, 'Qualificação BANT'), bantEd),
    novo ? null : historico,
  ]
  const guardar = botao(novo ? 'Criar oportunidade' : 'Guardar', { tipo: 'primario' })
  const g = gaveta({
    titulo: novo ? 'Nova oportunidade' : op.titulo, subtitulo: novo ? null : `Criada ${fmtRelativo(op.criado_em)}${op.valor ? ' · ' + fmtMT(op.valor) : ''}`, largura: 'larga', conteudo,
    rodape: [guardar, botao('Cancelar', { onclick: () => g.fechar() }), h('span', { class: 'espaco' }), novo ? null : botao('Apagar', { tipo: 'perigo-suave', icone: 'apagar', onclick: async () => {
      if (!(await confirmar(`Apagar «${op.titulo}»? O histórico desta oportunidade também é apagado.`, { titulo: 'Apagar oportunidade', accao: 'Apagar', perigo: true }))) return
      try { await dados.apagarOportunidade(op.id); aviso('Oportunidade apagada.'); g.fechar(); aoApagar && aoApagar(op) } catch (e) { erro(e, 'Não foi possível apagar') }
    } })],
  })
  if (!novo) carregarHistorico()

  async function carregarHistorico() {
    limpar(historico).appendChild(h('h3', { class: 'seccao-titulo' }, 'Histórico'))
    const lista = h('div')
    historico.append(compositorNota(ctx, { contacto_id: contactoId, oportunidade_id: op.id, aoRegistar: () => carregarHistorico() }), lista)
    try {
      const acts = await dados.actividades({ oportunidade_id: op.id })
      lista.appendChild(linhaTempo(acts.map((a) => ({ ...a, origem: 'actividade' })), ctx, 'Ainda sem histórico. Registe uma nota ou chamada.'))
    } catch (e) { erro(e) }
  }

  guardar.addEventListener('click', async () => {
    const titulo = iTitulo.value.trim()
    if (!titulo) { iTitulo.setAttribute('aria-invalid', 'true'); iTitulo.focus(); aviso('Dê um título à oportunidade.', { tipo: 'erro' }); return }
    const etapaNova = etapas.find((e) => e.id === iEtapa.value)
    if (etapaNova.tipo === 'perdida' && !iMotivo.value.trim()) {
      const m = await pedirMotivoPerda(); if (!m) return
      iMotivo.value = m
    }
    const patch = {
      titulo, contacto_id: contactoId, servico: iServico.value.trim() || null, valor: iValor.value === '' ? null : Number(iValor.value),
      responsavel: iResp.value || null, proxima_accao: iAccao.value.trim() || null, proxima_data: iData.value || null, bant,
    }
    guardar.disabled = true; guardar.classList.add('a-carregar')
    try {
      let res
      if (novo) {
        res = await dados.criarOportunidade({ ...patch, etapa_id: etapaNova.id, mensagem_id: op.mensagem_id || null, motivo_perda: etapaNova.tipo === 'perdida' ? iMotivo.value.trim() : null }, { origemTexto })
        aviso('Oportunidade criada.', { tipo: 'sucesso' })
      } else {
        if (etapaNova.id !== op.etapa_id) await dados.moverOportunidade(op, etapaNova.id, op.ordem, { motivo_perda: iMotivo.value.trim() })
        else if (etapaNova.tipo === 'perdida') patch.motivo_perda = iMotivo.value.trim()
        res = await dados.actualizarOportunidade(op.id, patch)
        aviso('Alterações guardadas.', { tipo: 'sucesso' })
      }
      g.fechar()
      aoGuardar && aoGuardar(res)
    } catch (e) { erro(e, 'Não foi possível guardar'); guardar.disabled = false; guardar.classList.remove('a-carregar') }
  })
  return g
}

// ---------- Nota / chamada / reunião ----------
export function compositorNota(ctx, { contacto_id, oportunidade_id, aoRegistar }) {
  let tipo = 'nota'
  const texto = h('textarea', { rows: 3, placeholder: 'Escreva uma nota sobre este contacto…', 'aria-label': 'Texto da atividade' })
  const tipos = [['nota', 'Nota', 'Escreva uma nota sobre este contacto…'], ['chamada', 'Chamada', 'O que ficou combinado na chamada?'], ['reuniao', 'Reunião', 'Resumo da reunião e próximos passos']]
  const seg = h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Tipo de registo' }, tipos.map(([v, r, ph]) => h('button', { type: 'button', 'aria-pressed': String(v === tipo), onclick: (e) => { tipo = v; texto.placeholder = ph; seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); texto.focus() } }, icone(ICONE_ACT[v], 15), r)))
  const registar = botao('Registar', { tipo: 'secundario', tamanho: 'peq', onclick: async () => {
    if (!texto.value.trim()) { texto.focus(); return }
    registar.disabled = true
    try {
      await ctx.dados.registar({ tipo, texto: texto.value.trim(), contacto_id: contacto_id || null, oportunidade_id: oportunidade_id || null })
      texto.value = ''
      aviso({ nota: 'Nota registada.', chamada: 'Chamada registada.', reuniao: 'Reunião registada.' }[tipo], { tipo: 'sucesso' })
      aoRegistar && aoRegistar()
    } catch (e) { erro(e, 'Não foi possível registar') } finally { registar.disabled = false }
  } })
  texto.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) registar.click() })
  return h('div', { class: 'compositor' }, texto, h('div', { class: 'compositor-rodape' }, seg, registar))
}

// ---------- Linha do tempo ----------
export function linhaTempo(itens, ctx, textoVazio = 'Sem atividade registada.') {
  if (!itens.length) return h('p', { class: 'texto-suave', style: { padding: '12px 0' } }, textoVazio)
  return h('ol', { class: 'linha-tempo' }, itens.map((it) => {
    const tipo = it.origem === 'mensagem' ? 'mensagem' : it.tipo
    let titulo = TIPOS_ACT[tipo] || tipo
    let texto = it.texto
    let extra = null
    if (it.origem === 'mensagem') {
      titulo = `${TIPOS_MSG[it.tipo] || 'Mensagem'}${it.servico ? ' · ' + it.servico : ''}`
      texto = it.corpo || it.assunto
      extra = h('a', { href: '#/caixa/' + it.id, class: 'bloco-ligacao' }, 'Abrir na caixa', icone('direita', 14))
    }
    if (tipo === 'email' && it.dados && it.dados.assunto) texto = `«${it.dados.assunto}»${it.dados.para ? ' para ' + it.dados.para : ''}`
    const autor = it.origem === 'mensagem' ? 'Formulário do site' : it.autor ? ctx.rotuloMembro(it.autor) : 'Sistema'
    return h('li', { class: 't-' + tipo },
      h('span', { class: 'icone-redondo' }, icone(ICONE_ACT[tipo] || 'info', 15)),
      h('div', { style: { minWidth: 0 } },
        h('div', { class: 'cab' }, h('strong', null, titulo), h('span', { class: 'texto-fraco' }, autor), h('time', { datetime: it.criado_em, title: fmtDataHora(it.criado_em) }, fmtRelativo(it.criado_em))),
        texto ? h('p', { class: 'texto' }, texto) : null, extra))
  }))
}

// ---------- Etiquetas ----------
export function editorEtiquetas(valores, sugestoes, aoMudar, { desactivado = false } = {}) {
  let lista = [...(valores || [])]
  const id = 'et-' + Math.random().toString(36).slice(2, 6)
  const raiz = h('div', { class: 'editor-etiquetas', onclick: (e) => { if (e.target === raiz) raiz.querySelector('input')?.focus() } })
  function desenhar() {
    limpar(raiz)
    lista.forEach((t) => raiz.appendChild(h('span', { class: 'etiqueta-ed' }, t, desactivado ? null : h('button', { type: 'button', 'aria-label': `Remover etiqueta ${t}`, onclick: () => { lista = lista.filter((x) => x !== t); aoMudar(lista); desenhar(); raiz.querySelector('input')?.focus() } }, icone('fechar', 13)))))
    if (desactivado) return
    const input = h('input', { type: 'text', list: id, placeholder: lista.length ? 'Adicionar…' : 'Adicionar etiqueta e premir Enter', 'aria-label': 'Adicionar etiqueta' })
    input.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) { e.preventDefault(); adicionar(input.value) }
      else if (e.key === 'Backspace' && !input.value && lista.length) { lista = lista.slice(0, -1); aoMudar(lista); desenhar(); raiz.querySelector('input').focus() }
    })
    input.addEventListener('change', () => { if (sugestoes.includes(input.value.trim())) adicionar(input.value) })
    raiz.append(input, h('datalist', { id }, sugestoes.filter((s) => !lista.includes(s)).map((s) => h('option', { value: s }))))
  }
  function adicionar(v) {
    const t = v.trim().toLowerCase().replace(/\s+/g, '-').replace(/,/g, '')
    if (t && !lista.includes(t)) { lista = [...lista, t]; aoMudar(lista) }
    desenhar(); raiz.querySelector('input')?.focus()
  }
  desenhar()
  return raiz
}

// ---------- Novo contacto ----------
export async function abrirNovoContacto(ctx, aoCriar) {
  let valores = { origens: [], etiquetas: [], cidades: [] }
  try { valores = await ctx.dados.valoresDistintos() } catch {}
  const f = {}
  const mk = (k, tipo = 'text', extra = {}) => (f[k] = h('input', { type: tipo, ...extra }))
  let etiquetas = []
  const listaO = 'orig-' + Math.random().toString(36).slice(2, 6)
  const listaC = 'cid-' + Math.random().toString(36).slice(2, 6)
  const consent = h('input', { type: 'checkbox' })
  const zonaErro = h('div', { 'aria-live': 'polite' })
  const criar = botao('Criar contacto', { tipo: 'primario' })
  const g = gaveta({
    titulo: 'Novo contacto',
    conteudo: [
      campo('Nome', mk('nome', 'text', { autocomplete: 'off' })),
      h('div', { class: 'campo-linha' }, campo('Email', mk('email', 'email', { autocomplete: 'off' })), campo('Telefone', mk('telefone', 'tel', { placeholder: '+258 84 000 0000' }))),
      h('div', { class: 'campo-linha' }, campo('Empresa', mk('empresa')), campo('Cargo', mk('cargo'))),
      h('div', { class: 'campo-linha' }, campo('Cidade', mk('cidade', 'text', { list: listaC })), campo('Origem', mk('origem', 'text', { list: listaO, placeholder: 'Ex.: indicação, evento' }))),
      h('datalist', { id: listaO }, valores.origens.map((o) => h('option', { value: o }, rotuloOrigem(o)))),
      h('datalist', { id: listaC }, valores.cidades.map((o) => h('option', { value: o }))),
      h('div', { class: 'campo' }, h('span', { class: 'rotulo' }, 'Etiquetas'), editorEtiquetas([], valores.etiquetas, (l) => { etiquetas = l })),
      h('label', { class: 'caixa-marcar' }, consent, h('span', null, 'Aceitou receber comunicações por email')),
      zonaErro,
    ],
    rodape: [criar, botao('Cancelar', { onclick: () => g.fechar() })],
  })
  criar.addEventListener('click', async () => {
    limpar(zonaErro)
    const d = {}
    for (const k of Object.keys(f)) { const v = f[k].value.trim(); if (v) d[k] = k === 'email' ? v.toLowerCase() : v }
    if (!d.nome && !d.email) { zonaErro.appendChild(alerta('perigo', 'Indique pelo menos o nome ou o email.')); f.nome.focus(); return }
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) { zonaErro.appendChild(alerta('perigo', 'O email não parece válido.')); f.email.focus(); return }
    criar.disabled = true; criar.classList.add('a-carregar')
    try {
      const c = await ctx.dados.criarContacto({ ...d, etiquetas, consentimento: consent.checked, origem: d.origem || 'directo' })
      aviso('Contacto criado.', { tipo: 'sucesso' })
      g.fechar(); aoCriar && aoCriar(c)
    } catch (e) {
      criar.disabled = false; criar.classList.remove('a-carregar')
      zonaErro.appendChild(alerta('perigo', e.code === '23505' ? 'Já existe um contacto com este email.' : mensagemErro(e)))
    }
  })
}

export { fmtNumero }
