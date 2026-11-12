// Definições: dados do site, código de integração, etapas do funil e membros. Só administradores alteram.
import { h, limpar, icone, botao, campo, chip, esqueleto, aviso, erro, confirmar, copiar, fmtData, fmtNumero, mensagemErro } from '../ui.js'

const HOST = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/
const limparDominio = (v) => v.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/:\d+$/, '')

export async function montar(el, ctx) {
  const { dados } = ctx
  const admin = ctx.ehAdmin
  const pagina = h('div', { class: 'pagina pagina-estreita' },
    h('div', { class: 'pagina-cab' }, h('div', null, h('h1', null, 'Definições'), h('p', { class: 'sub' }, `${ctx.site.nome} · ${admin ? 'é administrador deste site' : 'acesso de leitura'}`))))
  el.appendChild(pagina)
  if (!admin) pagina.appendChild(h('div', { class: 'alerta alerta-neutro', style: { marginBottom: '20px' } }, icone('escudo', 18), h('span', null, 'Só os administradores podem alterar estas definições. O seu papel neste site é Comercial: pode consultar tudo, incluindo o código de integração.')))
  const seccoes = h('div', { class: 'def-seccoes' })
  pagina.appendChild(seccoes)
  seccoes.append(seccaoSite(ctx), seccaoCodigo(ctx))
  const blocoEtapas = h('section', { class: 'bloco', 'aria-labelledby': 'h-etapas' })
  const blocoMembros = h('section', { class: 'bloco', 'aria-labelledby': 'h-membros' })
  seccoes.append(blocoEtapas, blocoMembros)
  seccaoEtapas(ctx, blocoEtapas)
  seccaoMembros(ctx, blocoMembros)
  return {}
}

function seccaoSite(ctx) {
  const { dados } = ctx
  const admin = ctx.ehAdmin
  let site = { ...ctx.site }
  let origens = [...(site.origens || [])]
  const dis = !admin
  const iNome = h('input', { type: 'text', value: site.nome || '', disabled: dis, required: true })
  const iDominio = h('input', { type: 'text', value: site.dominio || '', disabled: dis, placeholder: 'exemplo.co.za', spellcheck: 'false' })
  const iEmail = h('input', { type: 'email', value: site.email_remetente || '', disabled: dis, placeholder: 'contact@exemplo.co.za' })
  const iNomeRem = h('input', { type: 'text', value: site.nome_remetente || '', disabled: dis, placeholder: site.nome })
  const iCor = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(site.cor || '') ? site.cor : '#2B2850', disabled: dis, 'aria-label': 'Escolher cor' })
  const iCorTxt = h('input', { type: 'text', value: (site.cor || '#2B2850').toUpperCase(), disabled: dis, 'aria-label': 'Cor em hexadecimal', maxlength: '7', spellcheck: 'false' })
  iCor.addEventListener('input', () => { iCorTxt.value = iCor.value.toUpperCase(); sujo() })
  iCorTxt.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(iCorTxt.value)) iCor.value = iCorTxt.value; sujo() })
  const listaOrig = h('div', { class: 'lista-origens' })
  const iNovaOrigem = h('input', { type: 'text', placeholder: 'www.exemplo.co.za', 'aria-label': 'Novo domínio autorizado', spellcheck: 'false', disabled: dis })
  const addOrigem = botao('Adicionar', { icone: 'mais', disabled: dis, onclick: () => {
    const v = limparDominio(iNovaOrigem.value)
    if (!HOST.test(v)) { iNovaOrigem.setAttribute('aria-invalid', 'true'); aviso('Escreva só o domínio, por exemplo www.exemplo.co.za.', { tipo: 'erro' }); return }
    iNovaOrigem.removeAttribute('aria-invalid')
    if (!origens.includes(v)) origens.push(v)
    iNovaOrigem.value = ''; desenharOrigens(); sujo(); iNovaOrigem.focus()
  } })
  iNovaOrigem.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addOrigem.click() } })
  function desenharOrigens() {
    limpar(listaOrig)
    if (!origens.length) listaOrig.appendChild(h('p', { class: 'alerta alerta-aviso' }, icone('alerta', 18), h('span', null, 'Sem domínios autorizados, os formulários do site são recusados.')))
    origens.forEach((o) => listaOrig.appendChild(h('div', { class: 'origem-linha' }, icone('globo', 16), h('span', null, o), admin ? botao('', { icone: 'fechar', tipo: 'fantasma', tamanho: 'peq', rotulo: `Remover ${o}`, onclick: () => { origens = origens.filter((x) => x !== o); desenharOrigens(); sujo() } }) : null)))
  }
  desenharOrigens()
  const estado = h('span', { class: 'estado-guardar', 'aria-live': 'polite' })
  const guardar = botao('Guardar', { tipo: 'primario', disabled: true })
  function sujo() { if (!admin) return; guardar.disabled = false; estado.textContent = 'Alterações por guardar' }
  for (const x of [iNome, iDominio, iEmail, iNomeRem]) x.addEventListener('input', sujo)
  guardar.addEventListener('click', async () => {
    const patch = { nome: iNome.value.trim(), dominio: limparDominio(iDominio.value) || null, email_remetente: iEmail.value.trim().toLowerCase() || null, nome_remetente: iNomeRem.value.trim() || null, cor: iCorTxt.value.trim().toUpperCase(), origens }
    if (!patch.nome) { iNome.setAttribute('aria-invalid', 'true'); iNome.focus(); aviso('O site precisa de um nome.', { tipo: 'erro' }); return }
    if (patch.dominio && !HOST.test(patch.dominio)) { iDominio.setAttribute('aria-invalid', 'true'); iDominio.focus(); aviso('O domínio não parece válido.', { tipo: 'erro' }); return }
    if (patch.email_remetente && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.email_remetente)) { iEmail.setAttribute('aria-invalid', 'true'); iEmail.focus(); aviso('O email remetente não parece válido.', { tipo: 'erro' }); return }
    if (!/^#[0-9A-F]{6}$/.test(patch.cor)) { iCorTxt.setAttribute('aria-invalid', 'true'); iCorTxt.focus(); aviso('A cor deve ter o formato #RRGGBB.', { tipo: 'erro' }); return }
    ;[iNome, iDominio, iEmail, iCorTxt].forEach((x) => x.removeAttribute('aria-invalid'))
    guardar.disabled = true; guardar.classList.add('a-carregar')
    try {
      site = await dados.actualizarSite(patch)
      ctx.actualizarSite(site)
      estado.textContent = ''
      aviso('Definições do site guardadas.', { tipo: 'sucesso' })
    } catch (e) { guardar.disabled = false; aviso(mensagemErro(e, 'Não foi possível guardar'), { tipo: 'erro' }) }
    finally { guardar.classList.remove('a-carregar') }
  })
  return h('section', { class: 'bloco', 'aria-labelledby': 'h-site' },
    h('div', { class: 'bloco-cab' }, h('h2', { id: 'h-site' }, 'Site')),
    h('div', { class: 'bloco-corpo formulario' },
      h('div', { class: 'campo-linha' }, campo('Nome', iNome), campo('Domínio principal', iDominio)),
      h('div', { class: 'campo' }, h('span', { class: 'rotulo' }, 'Origens autorizadas'), h('p', { class: 'campo-ajuda' }, 'Domínios de onde os formulários podem enviar mensagens. Inclua a versão com e sem www, se o site usar as duas.'), listaOrig, admin ? h('div', { class: 'adicionar-linha' }, iNovaOrigem, addOrigem) : null),
      h('div', { class: 'campo-linha' }, campo('Email remetente', iEmail, { ajuda: 'Endereço usado nas respostas enviadas pelo painel. O domínio tem de estar verificado no serviço de email.' }), campo('Nome do remetente', iNomeRem)),
      h('div', { class: 'campo' }, h('label', { for: 'cor-site' }, 'Cor do painel'), h('div', { class: 'cor-linha' }, Object.assign(iCor, { id: 'cor-site' }), iCorTxt), h('p', { class: 'campo-ajuda' }, 'Usada na barra lateral e nos destaques deste site.')),
      admin ? h('div', { class: 'formulario-rodape' }, estado, guardar) : null))
}

function seccaoCodigo(ctx) {
  const snippet = `<script src="https://painel.kingdomcompany.co.za/recolha.js" data-site="${ctx.site.chave}" defer></script>`
  return h('section', { class: 'bloco', 'aria-labelledby': 'h-codigo' },
    h('div', { class: 'bloco-cab' }, h('h2', { id: 'h-codigo' }, 'Código de integração')),
    h('div', { class: 'bloco-corpo formulario' },
      h('p', { class: 'texto-suave' }, 'Cole este código antes de </body> em todas as páginas do site com formulários. Os envios chegam à Caixa de mensagens e criam ou atualizam o contacto. Só são aceites envios dos domínios autorizados acima.'),
      h('pre', { class: 'codigo', tabindex: '0', 'aria-label': 'Código de integração' }, snippet),
      h('div', { class: 'grupo-btn' }, botao('Copiar código', { icone: 'copiar', tipo: 'primario', onclick: async () => aviso((await copiar(snippet)) ? 'Código copiado. Cole-o no site antes de </body>.' : 'Não foi possível copiar. Selecione o texto e copie à mão.', { tipo: 'sucesso' }) })),
      h('p', { class: 'campo-ajuda' }, `Chave pública deste site: ${ctx.site.chave}. Não é secreta: identifica o site, e o servidor confirma o domínio de cada envio.`)))
}

async function seccaoEtapas(ctx, bloco) {
  const { dados } = ctx
  const admin = ctx.ehAdmin
  let etapas = [], contagem = new Map()
  const lista = h('div')
  bloco.append(h('div', { class: 'bloco-cab' }, h('div', null, h('h2', { id: 'h-etapas' }, 'Etapas do funil'), h('p', { class: 'sub' }, 'A ordem aqui é a ordem das colunas no funil.')), admin ? botao('Adicionar etapa', { icone: 'mais', tamanho: 'peq', onclick: adicionar }) : null), lista)
  lista.appendChild(esqueleto(4))
  async function carregar() {
    try {
      ;[etapas] = await Promise.all([dados.etapas()])
      const ops = await dados.oportunidades()
      contagem = new Map(); ops.forEach((o) => contagem.set(o.etapa_id, (contagem.get(o.etapa_id) || 0) + 1))
      etapas = [...etapas]
      desenhar()
    } catch (e) { erro(e) }
  }
  function desenhar() {
    limpar(lista)
    etapas.forEach((e, i) => {
      const n = contagem.get(e.id) || 0
      const nome = h('input', { type: 'text', value: e.nome, disabled: !admin, 'aria-label': `Nome da etapa ${i + 1}` })
      const cor = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(e.cor || '') ? e.cor : '#8A8FA8', disabled: !admin, 'aria-label': `Cor de ${e.nome}` })
      const tipo = h('select', { disabled: !admin, 'aria-label': `Tipo de ${e.nome}`, class: 'tipo' }, [['aberta', 'Aberta'], ['ganha', 'Ganha'], ['perdida', 'Perdida']].map(([v, r]) => h('option', { value: v, selected: e.tipo === v }, r)))
      nome.addEventListener('change', () => { const v = nome.value.trim(); if (!v) { nome.value = e.nome; return } actualizar(e, { nome: v }) })
      cor.addEventListener('change', () => actualizar(e, { cor: cor.value }))
      tipo.addEventListener('change', () => actualizar(e, { tipo: tipo.value }))
      lista.appendChild(h('div', { class: 'etapa-linha' },
        h('div', { class: 'ordem-btns' },
          botao('', { icone: 'subir', tipo: 'fantasma', tamanho: 'peq', rotulo: `Subir ${e.nome}`, disabled: !admin || i === 0, onclick: () => trocar(i, i - 1) }),
          botao('', { icone: 'descer', tipo: 'fantasma', tamanho: 'peq', rotulo: `Descer ${e.nome}`, disabled: !admin || i === etapas.length - 1, onclick: () => trocar(i, i + 1) })),
        cor, nome, tipo,
        h('span', { class: 'n' }, n ? `${fmtNumero(n)} ${n === 1 ? 'oportunidade' : 'oportunidades'}` : 'Vazia'),
        admin ? botao('', { icone: 'apagar', tipo: 'fantasma', tamanho: 'peq', rotulo: n ? `${e.nome} tem oportunidades: mova-as antes de apagar` : `Apagar ${e.nome}`, disabled: n > 0, onclick: () => apagar(e) }) : h('span')))
    })
    if (!etapas.length) lista.appendChild(h('p', { class: 'bloco-corpo texto-suave' }, 'Ainda sem etapas.'))
  }
  async function actualizar(e, patch) {
    try { const novo = await dados.actualizarEtapa(e.id, patch); Object.assign(e, novo); aviso('Etapa atualizada.', { tipo: 'sucesso' }) } catch (err) { erro(err, 'Não foi possível atualizar a etapa'); desenhar() }
  }
  async function trocar(i, j) {
    const a = etapas[i], b = etapas[j]
    const oa = a.ordem, ob = b.ordem === oa ? oa + (j > i ? 1 : -1) : b.ordem
    etapas[i] = b; etapas[j] = a; desenhar()
    lista.querySelectorAll('.etapa-linha')[j]?.querySelector(j > i ? '[aria-label^="Descer"]' : '[aria-label^="Subir"]')?.focus()
    try { await Promise.all([dados.actualizarEtapa(a.id, { ordem: ob }), dados.actualizarEtapa(b.id, { ordem: oa })]); a.ordem = ob; b.ordem = oa } catch (err) { erro(err, 'Não foi possível reordenar'); carregar() }
  }
  async function adicionar() {
    const max = etapas.reduce((m, e) => Math.max(m, e.ordem), 0)
    try { await dados.criarEtapa({ nome: 'Nova etapa', ordem: max + 1, tipo: 'aberta', cor: '#8A8FA8' }); await carregar(); const ultima = lista.querySelectorAll('.etapa-linha input[type=text]'); const i = ultima[ultima.length - 1]; i?.focus(); i?.select(); aviso('Etapa adicionada. Dê-lhe um nome e use as setas para a pôr no lugar certo.') } catch (e) { erro(e, 'Não foi possível adicionar') }
  }
  async function apagar(e) {
    if (!(await confirmar(`Apagar a etapa «${e.nome}»?`, { titulo: 'Apagar etapa', accao: 'Apagar', perigo: true }))) return
    try { await dados.apagarEtapa(e.id); aviso('Etapa apagada.'); carregar() } catch (err) { erro(err, 'Não foi possível apagar') }
  }
  carregar()
}

async function seccaoMembros(ctx, bloco) {
  const { dados } = ctx
  const admin = ctx.ehAdmin
  const corpo = h('div')
  bloco.append(h('div', { class: 'bloco-cab' }, h('div', null, h('h2', { id: 'h-membros' }, 'Membros'), h('p', { class: 'sub' }, 'Para adicionar pessoas, peça ao administrador técnico do painel.'))), corpo)
  corpo.appendChild(esqueleto(2))
  let membros = []
  async function carregar() {
    try { membros = await dados.membros(); ctx.actualizarMembros(membros); desenhar() } catch (e) { erro(e) }
  }
  function desenhar() {
    limpar(corpo)
    corpo.appendChild(h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela' },
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Membro'), h('th', { scope: 'col' }, 'Papel'), h('th', { scope: 'col' }, 'Desde'), h('th', { scope: 'col' }, h('span', { class: 'visualmente-oculto' }, 'Ações')))),
      h('tbody', null, membros.map((m) => {
        const eu = m.user_id === ctx.eu?.id
        const papel = admin && !eu
          ? h('select', { 'aria-label': `Papel de ${ctx.rotuloMembro(m.user_id)}`, style: { width: 'auto', minWidth: '150px' }, onchange: async (e) => {
            const v = e.currentTarget.value
            try { await dados.alterarPapel(m.user_id, v); m.papel = v; aviso('Papel atualizado.', { tipo: 'sucesso' }) } catch (err) { erro(err, 'Não foi possível alterar o papel'); e.currentTarget.value = m.papel }
          } }, h('option', { value: 'admin', selected: m.papel === 'admin' }, 'Administrador'), h('option', { value: 'comercial', selected: m.papel === 'comercial' }, 'Comercial'))
          : chip(m.papel === 'admin' ? 'Administrador' : 'Comercial', { tom: m.papel === 'admin' ? 'marca' : 'neutro' })
        return h('tr', null,
          h('td', null, h('strong', { style: { display: 'block' } }, eu ? `Você (${ctx.eu.email})` : ctx.rotuloMembro(m.user_id)), h('span', { class: 'membro-id' }, m.user_id)),
          h('td', null, papel),
          h('td', { class: 'data' }, fmtData(m.criado_em)),
          h('td', { style: { textAlign: 'right' } }, admin && !eu ? botao('', { icone: 'apagar', tipo: 'fantasma', tamanho: 'peq', rotulo: `Remover ${ctx.rotuloMembro(m.user_id)}`, onclick: async () => {
            if (!(await confirmar('Remover este membro do painel deste site? Deixa de ver mensagens, contactos e oportunidades.', { titulo: 'Remover membro', accao: 'Remover', perigo: true }))) return
            try { await dados.removerMembro(m.user_id); aviso('Membro removido.'); carregar() } catch (err) { erro(err, 'Não foi possível remover') }
          } }) : null))
      })))))
  }
  carregar()
}
