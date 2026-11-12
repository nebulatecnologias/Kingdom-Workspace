// Filtros de segmento: a mesma lógica serve a pré-visualização, a lista de contactos e a exportação.
import { rotuloOrigem, fmtData } from './ui.js'

export function filtrosVazios() {
  return { origens: [], etiquetas: [], etiquetas_modo: 'qualquer', cidades: [], consentimento: null, criado_de: '', criado_ate: '', oportunidade_aberta: null, servicos: [] }
}
export function normalizarFiltros(f = {}) { return { ...filtrosVazios(), ...(f || {}) } }

// ctx: { abertas: Set<contacto_id>, servicos: Map<contacto_id, Set<servico>> }
export function aplicarFiltros(contactos, filtros, ctx) {
  const f = normalizarFiltros(filtros)
  const de = f.criado_de ? f.criado_de : null
  const ate = f.criado_ate ? f.criado_ate + 'T23:59:59.999Z' : null
  return contactos.filter((c) => {
    if (f.origens.length && !f.origens.includes(c.origem || '')) return false
    if (f.etiquetas.length) {
      const tem = (c.etiquetas || [])
      const ok = f.etiquetas_modo === 'todas' ? f.etiquetas.every((e) => tem.includes(e)) : f.etiquetas.some((e) => tem.includes(e))
      if (!ok) return false
    }
    if (f.cidades.length && !f.cidades.includes(c.cidade || '')) return false
    if (f.consentimento === true && !c.consentimento) return false
    if (f.consentimento === false && c.consentimento) return false
    if (de && (c.criado_em || '') < de) return false
    if (ate && (c.criado_em || '') > ate) return false
    if (f.oportunidade_aberta === true && !ctx.abertas.has(c.id)) return false
    if (f.oportunidade_aberta === false && ctx.abertas.has(c.id)) return false
    if (f.servicos.length) {
      const s = ctx.servicos.get(c.id)
      if (!s || !f.servicos.some((x) => s.has(x))) return false
    }
    return true
  })
}

export function descreverFiltros(filtros) {
  const f = normalizarFiltros(filtros)
  const p = []
  if (f.origens.length) p.push('Origem: ' + f.origens.map(rotuloOrigem).join(', '))
  if (f.etiquetas.length) p.push((f.etiquetas_modo === 'todas' ? 'Todas as etiquetas: ' : 'Etiqueta: ') + f.etiquetas.join(', '))
  if (f.cidades.length) p.push('Cidade: ' + f.cidades.join(', '))
  if (f.consentimento === true) p.push('Com consentimento')
  if (f.consentimento === false) p.push('Sem consentimento')
  if (f.criado_de && f.criado_ate) p.push(`Criado entre ${fmtData(f.criado_de)} e ${fmtData(f.criado_ate)}`)
  else if (f.criado_de) p.push(`Criado desde ${fmtData(f.criado_de)}`)
  else if (f.criado_ate) p.push(`Criado até ${fmtData(f.criado_ate)}`)
  if (f.oportunidade_aberta === true) p.push('Com oportunidade aberta')
  if (f.oportunidade_aberta === false) p.push('Sem oportunidade aberta')
  if (f.servicos.length) p.push('Pediu: ' + f.servicos.join(', '))
  return p
}
