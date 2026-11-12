// Ficha de contacto: dados editáveis, etiquetas, consentimento, notas, oportunidades e linha do tempo.
import { h, limpar, icone, botao, campo, chip, esqueleto, vazio, aviso, erro, confirmar, fmtMT, fmtData, fmtRelativo, iniciais, rotuloOrigem, mensagemErro } from '../ui.js'
import { abrirEmail, abrirOportunidade, compositorNota, linhaTempo, editorEtiquetas } from '../partilhado.js'

export async function montar(el, ctx, params) {
  const { dados } = ctx
  const pagina = h('div', { class: 'pagina' }, h('a', { class: 'voltar', href: '#/contactos' }, icone('esquerda', 16), 'Contactos'), esqueleto(6))
  el.appendChild(pagina)
  let c, valores, etapas
  try {
    ;[c, valores, etapas] = await Promise.all([dados.contacto(params.id), dados.valoresDistintos(), dados.etapas()])
  } catch (e) { erro(e); return }
  limpar(pagina).appendChild(h('a', { class: 'voltar', href: '#/contactos' }, icone('esquerda', 16), 'Contactos'))
  if (!c) { pagina.appendChild(vazio({ icone: 'pessoa', titulo: 'Contacto não encontrado', texto: 'Pode ter sido apagado ou pertencer a outro site.', accoes: [h('a', { class: 'btn btn-secundario', href: '#/contactos' }, 'Voltar aos contactos')] })); return }

  const titulo = h('h1')
  const subt = h('p', { class: 'sub' })
  const avatar = h('span', { class: 'avatar' })
  function desenharCab() {
    titulo.textContent = c.nome || c.email || 'Sem nome'
    subt.textContent = [c.cargo, c.empresa].filter(Boolean).join(' · ') || c.email || ''
    avatar.textContent = iniciais(c.nome || c.email || '?')
  }
  desenharCab()
  pagina.appendChild(h('div', { class: 'pagina-cab' },
    h('div', { class: 'contacto-cab' }, avatar, h('div', null, titulo, subt)),
    h('div', { class: 'pagina-accoes' },
      c.email ? botao('Enviar email', { icone: 'email', onclick: () => abrirEmail(ctx, { para: c.email, nome: c.nome, contacto_id: c.id, aoEnviar: () => carregarTempo() }) }) : null,
      c.telefone ? h('a', { class: 'btn btn-secundario', href: 'tel:' + c.telefone.replace(/\s/g, '') }, icone('telefone', 18), h('span', null, 'Ligar')) : null,
      botao('Nova oportunidade', { tipo: 'primario', icone: 'mais', onclick: () => abrirOportunidade(ctx, { inicial: { contacto_id: c.id, titulo: c.empresa || c.nome || '' }, aoGuardar: () => { carregarOps(); carregarTempo() } }) }))))

  // ---- Dados editáveis ----
  const campos = {}
  const mk = (k, tipo = 'text', extra = {}) => { campos[k] = h('input', { type: tipo, value: c[k] || '', ...extra }); return campos[k] }
  let etiquetas = [...(c.etiquetas || [])]
  const consent = h('input', { type: 'checkbox', checked: !!c.consentimento })
  const notas = h('textarea', { rows: 4, placeholder: 'Notas internas sobre este contacto (não são enviadas ao cliente).' }); notas.value = c.notas || ''
  const estado = h('span', { class: 'estado-guardar', 'aria-live': 'polite' })
  const guardar = botao('Guardar alterações', { tipo: 'primario', disabled: true })
  const descartar = botao('Descartar', { tipo: 'fantasma', disabled: true, onclick: () => { for (const k in campos) campos[k].value = c[k] || ''; etiquetas = [...(c.etiquetas || [])]; consent.checked = !!c.consentimento; notas.value = c.notas || ''; limpar(etqCaixa).appendChild(criarEtq()); sujo(false) } })
  const etqCaixa = h('div')
  const criarEtq = () => editorEtiquetas(etiquetas, valores.etiquetas, (l) => { etiquetas = l; sujo(true) })
  etqCaixa.appendChild(criarEtq())
  const lc = 'cid-' + Math.random().toString(36).slice(2, 6)
  const lo = 'ori-' + Math.random().toString(36).slice(2, 6)
  function sujo(v) { guardar.disabled = !v; descartar.disabled = !v; estado.textContent = v ? 'Alterações por guardar' : '' }
  const utm = c.utm || {}
  const utmTexto = [utm.source && `fonte ${utm.source}`, utm.medium && `meio ${utm.medium}`, utm.campaign && `campanha ${utm.campaign}`].filter(Boolean).join(' · ')

  const form = h('form', { class: 'formulario', onsubmit: (e) => { e.preventDefault(); gravar() }, oninput: () => sujo(true), onchange: () => sujo(true) },
    campo('Nome', mk('nome')),
    h('div', { class: 'campo-linha' }, campo('Email', mk('email', 'email')), campo('Telefone', mk('telefone', 'tel'))),
    h('div', { class: 'campo-linha' }, campo('Empresa', mk('empresa')), campo('Cargo', mk('cargo'))),
    h('div', { class: 'campo-linha' }, campo('Cidade', mk('cidade', 'text', { list: lc })), campo('Origem', mk('origem', 'text', { list: lo }), { ajuda: utmTexto || null })),
    h('datalist', { id: lc }, valores.cidades.map((v) => h('option', { value: v }))),
    h('datalist', { id: lo }, valores.origens.map((v) => h('option', { value: v }, rotuloOrigem(v)))),
    h('div', { class: 'campo' }, h('span', { class: 'rotulo' }, 'Etiquetas'), etqCaixa),
    h('label', { class: 'interruptor' }, consent, h('span', null, 'Aceitou receber comunicações por email (consentimento)')),
    campo('Notas', notas),
    h('div', { class: 'formulario-rodape' }, estado, descartar, guardar),
    h('p', { class: 'campo-ajuda' }, `Criado a ${fmtData(c.criado_em)} · atualizado ${fmtRelativo(c.actualizado_em || c.criado_em)}`))
  guardar.type = 'submit'

  async function gravar() {
    const patch = { etiquetas, consentimento: consent.checked, notas: notas.value.trim() || null }
    for (const k in campos) patch[k] = campos[k].value.trim() || null
    if (patch.email) patch.email = patch.email.toLowerCase()
    if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email)) { campos.email.setAttribute('aria-invalid', 'true'); campos.email.focus(); aviso('O email não parece válido.', { tipo: 'erro' }); return }
    campos.email.removeAttribute('aria-invalid')
    guardar.disabled = true; guardar.classList.add('a-carregar')
    try {
      c = await dados.actualizarContacto(c.id, patch)
      sujo(false); desenharCab(); aviso('Contacto guardado.', { tipo: 'sucesso' })
    } catch (e) { guardar.disabled = false; aviso(e.code === '23505' ? 'Já existe outro contacto com este email.' : mensagemErro(e, 'Não foi possível guardar'), { tipo: 'erro' }) }
    finally { guardar.classList.remove('a-carregar') }
  }

  const opsCorpo = h('div')
  const tempoCorpo = h('div')
  pagina.appendChild(h('div', { class: 'grelha-contacto' },
    h('section', { class: 'bloco', 'aria-labelledby': 'h-dados' }, h('div', { class: 'bloco-cab' }, h('h2', { id: 'h-dados' }, 'Dados do contacto')), h('div', { class: 'bloco-corpo' }, form)),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 } },
      h('section', { class: 'bloco', 'aria-labelledby': 'h-ops' }, h('div', { class: 'bloco-cab' }, h('h2', { id: 'h-ops' }, 'Oportunidades')), opsCorpo),
      h('section', { class: 'bloco', 'aria-labelledby': 'h-tempo' }, h('div', { class: 'bloco-cab' }, h('h2', { id: 'h-tempo' }, 'Atividade')),
        h('div', { class: 'bloco-corpo' }, compositorNota(ctx, { contacto_id: c.id, aoRegistar: () => carregarTempo() }), tempoCorpo))),
  ))
  pagina.appendChild(h('div', { style: { marginTop: '28px', display: 'flex', justifyContent: 'flex-end' } }, botao('Apagar contacto', { tipo: 'perigo-suave', icone: 'apagar', onclick: async () => {
    if (!(await confirmar(`Apagar ${c.nome || c.email}? As notas e a atividade deste contacto também são apagadas. As mensagens e oportunidades ficam, sem contacto associado.`, { titulo: 'Apagar contacto', accao: 'Apagar', perigo: true }))) return
    try { await dados.apagarContacto(c.id); aviso('Contacto apagado.'); ctx.navegar('#/contactos') } catch (e) { erro(e, 'Não foi possível apagar') }
  } })))

  async function carregarOps() {
    limpar(opsCorpo).appendChild(esqueleto(2))
    try {
      const ops = await dados.oportunidadesDoContacto(c.id)
      limpar(opsCorpo)
      if (!ops.length) { opsCorpo.appendChild(h('div', { class: 'bloco-corpo' }, h('p', { class: 'texto-suave' }, 'Sem oportunidades. Crie uma quando houver interesse num serviço.'))); return }
      opsCorpo.appendChild(h('ul', { class: 'lista-simples' }, ops.map((o) => {
        const e = etapas.find((x) => x.id === o.etapa_id)
        return h('li', null, h('a', { class: 'op-mini', href: '#/funil/' + o.id },
          h('span', { class: 'titulo' }, o.titulo), h('span', { class: 'valor' }, o.valor ? fmtMT(o.valor) : '—'),
          h('span', { class: 'meta' }, h('span', { class: 'ponto-cor', style: { background: e?.cor || '#999' } }), e?.nome || 'Sem etapa', o.servico ? ' · ' + o.servico : '')))
      })))
    } catch (e) { erro(e) }
  }
  async function carregarTempo() {
    limpar(tempoCorpo).appendChild(esqueleto(3))
    try {
      const [acts, msgs] = await Promise.all([dados.actividades({ contacto_id: c.id }), dados.mensagensDoContacto(c.id)])
      const itens = [...acts.map((a) => ({ ...a, origem: 'actividade' })), ...msgs.map((m) => ({ ...m, origem: 'mensagem' }))].sort((a, b) => b.criado_em.localeCompare(a.criado_em))
      limpar(tempoCorpo).appendChild(linhaTempo(itens, ctx, 'Ainda sem atividade. Registe a primeira nota, chamada ou reunião.'))
    } catch (e) { erro(e) }
  }
  carregarOps(); carregarTempo()
  return { destruir() {} }
}
