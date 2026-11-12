// Blog: lista de artigos com filtro por estado e pesquisa.
import { h, limpar, icone, botao, chip, esqueleto, vazio, erro, fmtData, fmtRelativo, semAcentos, adiar } from '../ui.js'

export async function montar(el, ctx) {
  const { dados } = ctx
  let artigos = []
  let estado = ''
  let q = ''
  const seg = h('div', { class: 'segmentado', role: 'group', 'aria-label': 'Estado' })
  const iPesq = h('input', { type: 'search', placeholder: 'Procurar por título ou categoria', 'aria-label': 'Procurar artigos' })
  const caixa = h('div', { class: 'bloco' }, esqueleto(4))
  el.appendChild(h('div', { class: 'pagina' },
    h('div', { class: 'pagina-cab' }, h('div', null, h('h1', null, 'Blog'), h('p', { class: 'sub' }, 'Artigos do site. Os publicados ficam disponíveis para a integração do blog.')),
      h('div', { class: 'pagina-accoes' }, botao('Novo artigo', { tipo: 'primario', icone: 'mais', onclick: () => ctx.navegar('#/blog/novo') }))),
    h('div', { class: 'filtros' }, seg, h('div', { class: 'pesq' }, icone('procurar', 16), iPesq)),
    caixa))
  iPesq.addEventListener('input', adiar(() => { q = iPesq.value.trim(); desenhar() }, 150))

  function desenharSeg() {
    const n = (e) => artigos.filter((a) => !e || a.estado === e).length
    limpar(seg)
    ;[['', 'Todos'], ['publicado', 'Publicados'], ['rascunho', 'Rascunhos']].forEach(([v, r]) => seg.appendChild(h('button', { type: 'button', 'aria-pressed': String(estado === v), onclick: () => { estado = v; desenharSeg(); desenhar() } }, r, h('span', { class: 'n' }, n(v)))))
  }
  function desenhar() {
    limpar(caixa)
    if (!artigos.length) {
      caixa.appendChild(vazio({ icone: 'blog', titulo: 'Ainda não há artigos', texto: 'Escreva em Markdown, veja a pré-visualização ao lado e publique quando estiver pronto. Os rascunhos guardam-se sozinhos enquanto escreve.', accoes: [botao('Escrever o primeiro artigo', { tipo: 'primario', icone: 'editar', onclick: () => ctx.navegar('#/blog/novo') })] }))
      return
    }
    const t = semAcentos(q)
    const lista = artigos.filter((a) => (!estado || a.estado === estado) && (!t || semAcentos([a.titulo, a.categoria, a.resumo].filter(Boolean).join(' ')).includes(t)))
    if (!lista.length) { caixa.appendChild(vazio({ icone: 'procurar', titulo: 'Nenhum artigo encontrado', texto: 'Experimente outro estado ou outra pesquisa.' })); return }
    caixa.appendChild(h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela' },
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'Título'), h('th', { scope: 'col', class: 'c-cat' }, 'Categoria'), h('th', { scope: 'col' }, 'Estado'), h('th', { scope: 'col', class: 'c-act' }, 'Atualizado'), h('th', { scope: 'col', class: 'c-pub' }, 'Publicado'))),
      h('tbody', null, lista.map((a) => h('tr', { class: 'artigo-linha' },
        h('td', null, h('a', { class: 'titulo', href: '#/blog/' + a.id }, a.titulo), a.resumo ? h('span', { class: 'resumo' }, a.resumo) : null),
        h('td', { class: 'c-cat' }, a.categoria || h('span', { class: 'texto-fraco' }, '—')),
        h('td', null, a.estado === 'publicado' ? chip('Publicado', { tom: 'sucesso', icone: 'certo' }) : chip('Rascunho', { tom: 'aviso', icone: 'editar' })),
        h('td', { class: 'data c-act' }, fmtRelativo(a.actualizado_em)),
        h('td', { class: 'data c-pub' }, a.publicado_em ? fmtData(a.publicado_em) : '—')))))))
  }
  try { artigos = await dados.artigos() } catch (e) { erro(e, 'Não foi possível carregar os artigos') }
  desenharSeg(); desenhar()
  return {}
}
