// Camada de dados: todas as chamadas ao Supabase passam por aqui.
// Recebe um cliente com a interface do supabase-js v2 (o verdadeiro, ou o de demonstração em demo.js).
// Todas as consultas são filtradas pelo site atual (site_id); as políticas RLS fazem o resto.
import { aplicarFiltros } from './filtros.js'

const limpaPesquisa = (s) => String(s || '').replace(/[,()%*\\]/g, ' ').trim().slice(0, 80)

export function criarDados(sb, { demo = false } = {}) {
  let siteId = null
  let eu = null
  let cache = {}

  const ok = (r) => { if (r.error) throw r.error; return r.data }
  // Atualizações que a RLS recusa não dão erro: devolvem zero linhas. Tratamos isso como falta de permissão.
  const umaLinha = (r) => {
    const d = ok(r)
    const linha = Array.isArray(d) ? d[0] : d
    if (!linha) { const e = new Error('Não tem permissão para esta ação neste painel.'); e.code = '42501'; throw e }
    return linha
  }
  const exigeSite = () => { if (!siteId) throw new Error('Nenhum site selecionado.') }
  const esquecer = (...chaves) => { for (const k of chaves) delete cache[k] }

  async function todasAsLinhas(construir, passo = 1000) {
    let de = 0; let res = []
    for (;;) {
      const d = ok(await construir().range(de, de + passo - 1))
      res = res.concat(d)
      if (d.length < passo) break
      de += passo
    }
    return res
  }
  async function porIds(tabela, ids, colunas = '*') {
    const unicos = [...new Set(ids.filter(Boolean))]
    let res = []
    for (let i = 0; i < unicos.length; i += 100) {
      res = res.concat(ok(await sb.from(tabela).select(colunas).eq('site_id', siteId).in('id', unicos.slice(i, i + 100))))
    }
    return res
  }

  const api = {
    demo,
    get siteId() { return siteId },
    get utilizador() { return eu },

    // ---------- Sessão ----------
    async sessao() {
      const { data, error } = await sb.auth.getSession()
      if (error) throw error
      eu = data.session ? data.session.user : null
      return data.session
    },
    async entrar(email, palavra) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: palavra })
      if (error) throw error
      eu = data.user
      return data
    },
    async sair() { try { await sb.auth.signOut() } finally { eu = null; siteId = null; cache = {} } },
    aoMudarSessao(cb) {
      const { data } = sb.auth.onAuthStateChange((evento, sessao) => cb(evento, sessao))
      return () => data && data.subscription && data.subscription.unsubscribe()
    },

    // ---------- Sites e membros ----------
    async sites() {
      // O projeto Supabase é partilhado com outro produto: nem todo o utilizador autenticado é membro de um painel.
      const membros = ok(await sb.from('painel_membros').select('site_id, papel').eq('user_id', eu.id))
      if (!membros.length) return []
      const sites = ok(await sb.from('painel_sites').select('*').in('id', membros.map((m) => m.site_id)).order('nome'))
      return sites.map((s) => ({ ...s, papel: (membros.find((m) => m.site_id === s.id) || {}).papel || 'comercial' }))
    },
    usarSite(id) { siteId = id; cache = {} },
    async actualizarSite(patch) {
      exigeSite()
      return umaLinha(await sb.from('painel_sites').update(patch).eq('id', siteId).select())
    },
    async membros() {
      exigeSite()
      return ok(await sb.from('painel_membros').select('*').eq('site_id', siteId).order('criado_em'))
    },
    async alterarPapel(userId, papel) {
      exigeSite()
      return umaLinha(await sb.from('painel_membros').update({ papel }).eq('site_id', siteId).eq('user_id', userId).select())
    },
    async removerMembro(userId) {
      exigeSite()
      ok(await sb.from('painel_membros').delete().eq('site_id', siteId).eq('user_id', userId))
    },

    // ---------- Etapas do funil ----------
    async etapas() {
      exigeSite()
      if (!cache.etapas) cache.etapas = ok(await sb.from('painel_etapas').select('*').eq('site_id', siteId).order('ordem'))
      return cache.etapas
    },
    async criarEtapa(d) {
      exigeSite(); esquecer('etapas')
      return umaLinha(await sb.from('painel_etapas').insert({ site_id: siteId, ...d }).select())
    },
    async actualizarEtapa(id, patch) {
      exigeSite(); esquecer('etapas')
      return umaLinha(await sb.from('painel_etapas').update(patch).eq('site_id', siteId).eq('id', id).select())
    },
    async apagarEtapa(id) {
      exigeSite(); esquecer('etapas')
      const r = await sb.from('painel_oportunidades').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('etapa_id', id)
      if (r.error) throw r.error
      if (r.count > 0) throw new Error('Esta etapa ainda tem oportunidades. Mova-as antes de apagar.')
      ok(await sb.from('painel_etapas').delete().eq('site_id', siteId).eq('id', id))
    },

    // ---------- Contactos ----------
    async contactos({ pesquisa, origem, etiqueta, servico, desde, ate, ordem = 'criado_em', asc = false, pagina = 1, porPagina = 50 } = {}) {
      exigeSite()
      let ids = null
      if (servico) {
        const m = ok(await sb.from('painel_mensagens').select('contacto_id').eq('site_id', siteId).eq('servico', servico))
        ids = [...new Set(m.map((x) => x.contacto_id).filter(Boolean))]
        if (!ids.length) return { linhas: [], total: 0 }
      }
      let q = sb.from('painel_contactos').select('*', { count: 'exact' }).eq('site_id', siteId)
      const t = limpaPesquisa(pesquisa)
      if (t) q = q.or(`nome.ilike.%${t}%,email.ilike.%${t}%,empresa.ilike.%${t}%,telefone.ilike.%${t}%`)
      if (origem) q = q.eq('origem', origem)
      if (etiqueta) q = q.contains('etiquetas', [etiqueta])
      if (desde) q = q.gte('criado_em', desde)
      if (ate) q = q.lte('criado_em', ate + 'T23:59:59.999Z')
      if (ids) q = q.in('id', ids.slice(0, 300))
      q = q.order(ordem, { ascending: asc, nullsFirst: false })
      if (ordem !== 'criado_em') q = q.order('criado_em', { ascending: false })
      const r = await q.range((pagina - 1) * porPagina, pagina * porPagina - 1)
      if (r.error) throw r.error
      return { linhas: r.data, total: r.count ?? r.data.length }
    },
    async todosContactos() {
      exigeSite()
      if (!cache.contactos) cache.contactos = await todasAsLinhas(() => sb.from('painel_contactos').select('*').eq('site_id', siteId).order('criado_em', { ascending: false }))
      return cache.contactos
    },
    async mapaContactos() {
      const lista = await api.todosContactos()
      return new Map(lista.map((c) => [c.id, c]))
    },
    async contacto(id) {
      exigeSite()
      return ok(await sb.from('painel_contactos').select('*').eq('site_id', siteId).eq('id', id).maybeSingle())
    },
    async criarContacto(d) {
      exigeSite(); esquecer('contactos', 'valores')
      return umaLinha(await sb.from('painel_contactos').insert({ site_id: siteId, ...d }).select())
    },
    async actualizarContacto(id, patch) {
      exigeSite(); esquecer('contactos', 'valores')
      return umaLinha(await sb.from('painel_contactos').update(patch).eq('site_id', siteId).eq('id', id).select())
    },
    async apagarContacto(id) {
      exigeSite(); esquecer('contactos', 'valores')
      ok(await sb.from('painel_contactos').delete().eq('site_id', siteId).eq('id', id))
    },
    async etiquetar(ids, etiqueta, accao = 'adicionar') {
      exigeSite()
      const alvo = (await porIds('painel_contactos', ids, 'id, etiquetas'))
      let alterados = 0
      for (let i = 0; i < alvo.length; i += 10) {
        await Promise.all(alvo.slice(i, i + 10).map(async (c) => {
          const atual = c.etiquetas || []
          const nova = accao === 'adicionar' ? [...new Set([...atual, etiqueta])] : atual.filter((e) => e !== etiqueta)
          if (nova.length === atual.length && nova.every((e, j) => e === atual[j])) return
          ok(await sb.from('painel_contactos').update({ etiquetas: nova }).eq('site_id', siteId).eq('id', c.id))
          alterados++
        }))
      }
      esquecer('contactos', 'valores')
      return alterados
    },
    // Importação: insere novos e atualiza existentes pelo email (sem distinção de maiúsculas).
    async importarContactos(linhas) {
      exigeSite()
      const existentes = await api.todosContactos()
      const porEmail = new Map(existentes.filter((c) => c.email).map((c) => [c.email.toLowerCase(), c]))
      const novos = []; const actualizar = []; let ignorados = 0
      const vistos = new Set()
      for (const l of linhas) {
        const email = (l.email || '').trim().toLowerCase()
        if (!email && !l.nome) { ignorados++; continue }
        if (email && vistos.has(email)) { ignorados++; continue }
        if (email) vistos.add(email)
        const dados = {}
        for (const k of ['nome', 'telefone', 'empresa', 'cargo', 'cidade', 'origem']) if (l[k] && String(l[k]).trim()) dados[k] = String(l[k]).trim()
        const etiquetas = l.etiquetas || []
        const atual = email ? porEmail.get(email) : null
        if (atual) {
          if (etiquetas.length) dados.etiquetas = [...new Set([...(atual.etiquetas || []), ...etiquetas])]
          if (Object.keys(dados).length) actualizar.push({ id: atual.id, dados })
          else ignorados++
        } else {
          novos.push({ site_id: siteId, email: email || null, etiquetas, ...dados })
        }
      }
      for (let i = 0; i < novos.length; i += 200) ok(await sb.from('painel_contactos').insert(novos.slice(i, i + 200)))
      for (let i = 0; i < actualizar.length; i += 10) {
        await Promise.all(actualizar.slice(i, i + 10).map(async (u) => ok(await sb.from('painel_contactos').update(u.dados).eq('site_id', siteId).eq('id', u.id))))
      }
      esquecer('contactos', 'valores')
      return { inseridos: novos.length, actualizados: actualizar.length, ignorados }
    },
    async pesquisaGlobal(texto) {
      exigeSite()
      const t = limpaPesquisa(texto)
      if (t.length < 2) return []
      return ok(await sb.from('painel_contactos').select('id, nome, email, empresa, cidade').eq('site_id', siteId)
        .or(`nome.ilike.%${t}%,email.ilike.%${t}%,empresa.ilike.%${t}%`).order('nome').limit(8))
    },
    async valoresDistintos() {
      exigeSite()
      if (cache.valores) return cache.valores
      const [cs, ms, ops] = await Promise.all([
        api.todosContactos(),
        todasAsLinhas(() => sb.from('painel_mensagens').select('servico').eq('site_id', siteId).not('servico', 'is', null)),
        api.oportunidades(),
      ])
      const ord = (s) => [...s].filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt'))
      cache.valores = {
        origens: ord(new Set(cs.map((c) => c.origem))),
        etiquetas: ord(new Set(cs.flatMap((c) => c.etiquetas || []))),
        cidades: ord(new Set(cs.map((c) => c.cidade))),
        servicos: ord(new Set([...ms.map((m) => m.servico), ...ops.map((o) => o.servico)])),
        servicosPedidos: ord(new Set(ms.map((m) => m.servico))),
      }
      return cache.valores
    },

    // ---------- Mensagens ----------
    async mensagens({ estado, tipo, servico } = {}) {
      exigeSite()
      let q = sb.from('painel_mensagens').select('*').eq('site_id', siteId)
      if (estado === 'caixa') q = q.neq('estado', 'arquivada')
      else if (estado) q = q.eq('estado', estado)
      if (tipo) q = q.eq('tipo', tipo)
      if (servico) q = q.eq('servico', servico)
      return ok(await q.order('criado_em', { ascending: false }).limit(500))
    },
    async mensagensDesde(iso) {
      exigeSite()
      return todasAsLinhas(() => sb.from('painel_mensagens').select('id, tipo, servico, estado, criado_em, contacto_id').eq('site_id', siteId).gte('criado_em', iso).order('criado_em', { ascending: false }))
    },
    async mensagensDoContacto(contactoId) {
      exigeSite()
      return ok(await sb.from('painel_mensagens').select('*').eq('site_id', siteId).eq('contacto_id', contactoId).order('criado_em', { ascending: false }))
    },
    async mensagem(id) {
      exigeSite()
      return ok(await sb.from('painel_mensagens').select('*').eq('site_id', siteId).eq('id', id).maybeSingle())
    },
    async actualizarMensagem(id, patch) {
      exigeSite()
      return umaLinha(await sb.from('painel_mensagens').update(patch).eq('site_id', siteId).eq('id', id).select())
    },
    async contagemPorLer() {
      if (!siteId) return 0
      const r = await sb.from('painel_mensagens').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('estado', 'nova')
      if (r.error) throw r.error
      return r.count || 0
    },

    // ---------- Oportunidades ----------
    async oportunidades() {
      exigeSite()
      return todasAsLinhas(() => sb.from('painel_oportunidades').select('*').eq('site_id', siteId).order('ordem', { ascending: true }))
    },
    async oportunidade(id) {
      exigeSite()
      return ok(await sb.from('painel_oportunidades').select('*').eq('site_id', siteId).eq('id', id).maybeSingle())
    },
    async oportunidadesDoContacto(contactoId) {
      exigeSite()
      return ok(await sb.from('painel_oportunidades').select('*').eq('site_id', siteId).eq('contacto_id', contactoId).order('criado_em', { ascending: false }))
    },
    async criarOportunidade(d, { origemTexto } = {}) {
      exigeSite(); esquecer('valores')
      const etapas = await api.etapas()
      const etapa = etapas.find((e) => e.id === d.etapa_id) || etapas.find((e) => e.tipo === 'aberta') || etapas[0]
      const naEtapa = ok(await sb.from('painel_oportunidades').select('ordem').eq('site_id', siteId).eq('etapa_id', etapa.id).order('ordem', { ascending: true }).limit(1))
      const ordem = naEtapa.length ? naEtapa[0].ordem - 1 : 0
      const op = umaLinha(await sb.from('painel_oportunidades').insert({ site_id: siteId, ordem, ...d, etapa_id: etapa.id, fechado_em: etapa.tipo === 'aberta' ? null : new Date().toISOString() }).select())
      await api.registar({ tipo: 'sistema', texto: origemTexto || `Oportunidade criada em ${etapa.nome}`, contacto_id: op.contacto_id, oportunidade_id: op.id })
      return op
    },
    async actualizarOportunidade(id, patch) {
      exigeSite(); esquecer('valores')
      return umaLinha(await sb.from('painel_oportunidades').update(patch).eq('site_id', siteId).eq('id', id).select())
    },
    async moverOportunidade(op, etapaId, ordem, { motivo_perda } = {}) {
      exigeSite()
      const etapas = await api.etapas()
      const de = etapas.find((e) => e.id === op.etapa_id)
      const para = etapas.find((e) => e.id === etapaId)
      const patch = { etapa_id: etapaId, ordem }
      if (de?.id !== para.id) {
        patch.fechado_em = para.tipo === 'aberta' ? null : new Date().toISOString()
        if (para.tipo === 'perdida') patch.motivo_perda = motivo_perda || null
        else if (de?.tipo === 'perdida') patch.motivo_perda = null
      }
      const nova = await api.actualizarOportunidade(op.id, patch)
      if (de?.id !== para.id) {
        await api.registar({
          tipo: 'etapa', texto: `${de ? de.nome : 'Sem etapa'} → ${para.nome}${para.tipo === 'perdida' && motivo_perda ? ` (motivo: ${motivo_perda})` : ''}`,
          dados: { de: de?.id || null, para: para.id }, contacto_id: op.contacto_id, oportunidade_id: op.id,
        })
      }
      return nova
    },
    async apagarOportunidade(id) {
      exigeSite(); esquecer('valores')
      ok(await sb.from('painel_oportunidades').delete().eq('site_id', siteId).eq('id', id))
    },

    // ---------- Atividades ----------
    async actividades({ contacto_id, oportunidade_id } = {}) {
      exigeSite()
      let q = sb.from('painel_actividades').select('*').eq('site_id', siteId)
      if (contacto_id) q = q.eq('contacto_id', contacto_id)
      if (oportunidade_id) q = q.eq('oportunidade_id', oportunidade_id)
      return ok(await q.order('criado_em', { ascending: false }).limit(200))
    },
    async registar(d) {
      exigeSite()
      return umaLinha(await sb.from('painel_actividades').insert({ site_id: siteId, autor: eu ? eu.id : null, dados: {}, ...d }).select())
    },

    // ---------- Segmentos ----------
    async segmentos() {
      exigeSite()
      return ok(await sb.from('painel_segmentos').select('*').eq('site_id', siteId).order('nome'))
    },
    async segmento(id) {
      exigeSite()
      return ok(await sb.from('painel_segmentos').select('*').eq('site_id', siteId).eq('id', id).maybeSingle())
    },
    async criarSegmento(d) {
      exigeSite()
      return umaLinha(await sb.from('painel_segmentos').insert({ site_id: siteId, ...d }).select())
    },
    async actualizarSegmento(id, patch) {
      exigeSite()
      return umaLinha(await sb.from('painel_segmentos').update(patch).eq('site_id', siteId).eq('id', id).select())
    },
    async apagarSegmento(id) {
      exigeSite()
      ok(await sb.from('painel_segmentos').delete().eq('site_id', siteId).eq('id', id))
    },
    async contextoSegmentos() {
      exigeSite()
      const [etapas, ops, ms] = await Promise.all([
        api.etapas(),
        api.oportunidades(),
        todasAsLinhas(() => sb.from('painel_mensagens').select('contacto_id, servico').eq('site_id', siteId).not('servico', 'is', null)),
      ])
      const abertasIds = new Set(etapas.filter((e) => e.tipo === 'aberta').map((e) => e.id))
      const abertas = new Set(ops.filter((o) => abertasIds.has(o.etapa_id) && o.contacto_id).map((o) => o.contacto_id))
      const servicos = new Map()
      for (const m of ms) {
        if (!m.contacto_id) continue
        if (!servicos.has(m.contacto_id)) servicos.set(m.contacto_id, new Set())
        servicos.get(m.contacto_id).add(m.servico)
      }
      return { abertas, servicos }
    },
    async avaliarSegmento(filtros) {
      const [cs, ctx] = await Promise.all([api.todosContactos(), api.contextoSegmentos()])
      return aplicarFiltros(cs, filtros, ctx)
    },

    // ---------- Artigos ----------
    async artigos() {
      exigeSite()
      return ok(await sb.from('painel_artigos').select('id, slug, titulo, resumo, categoria, ambito, estado, publicado_em, criado_em, actualizado_em, capa_url').eq('site_id', siteId).order('actualizado_em', { ascending: false }))
    },
    async artigo(id) {
      exigeSite()
      return ok(await sb.from('painel_artigos').select('*').eq('site_id', siteId).eq('id', id).maybeSingle())
    },
    async criarArtigo(d) {
      exigeSite()
      return umaLinha(await sb.from('painel_artigos').insert({ site_id: siteId, autor: eu ? eu.id : null, ...d }).select())
    },
    async actualizarArtigo(id, patch) {
      exigeSite()
      return umaLinha(await sb.from('painel_artigos').update(patch).eq('site_id', siteId).eq('id', id).select())
    },
    async apagarArtigo(id) {
      exigeSite()
      ok(await sb.from('painel_artigos').delete().eq('site_id', siteId).eq('id', id))
    },

    // ---------- Email (função painel-email) ----------
    async enviarEmail({ para, assunto, corpo, contacto_id, oportunidade_id, mensagem_id }) {
      exigeSite()
      const body = { site_id: siteId, para, assunto, corpo }
      if (contacto_id) body.contacto_id = contacto_id
      if (oportunidade_id) body.oportunidade_id = oportunidade_id
      if (mensagem_id) body.mensagem_id = mensagem_id
      try {
        const { data, error } = await sb.functions.invoke('painel-email', { body })
        if (error) {
          let msg = error.message || 'Falha no envio'
          try { const j = await error.context.json(); if (j && (j.erro || j.error)) msg = j.erro || j.error } catch {}
          return { erro: msg }
        }
        if (data && data.erro) return { erro: data.erro }
        return data || { ok: true }
      } catch (e) {
        return { erro: e.message || String(e) }
      }
    },

    // ---------- Tempo real ----------
    subscrever(tabela, cb) {
      if (!siteId) return () => {}
      const canal = sb.channel(`painel-${tabela}-${siteId}-${Math.random().toString(36).slice(2, 7)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tabela, filter: `site_id=eq.${siteId}` }, (p) => cb(p))
        .subscribe()
      return () => { try { sb.removeChannel(canal) } catch {} }
    },
    esquecerCache() { cache = {} },
  }
  return api
}
