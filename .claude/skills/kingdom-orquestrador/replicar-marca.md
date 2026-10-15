# Replicar o fluxo de produção para outra marca Kingdom

Guia para montar noutra marca (ex.: Kingdom InCompany) o mesmo processo da Kingdom Founders: Manus pesquisa referências, Claude escreve copy e desenha, ChatGPT gera imagens, o utilizador aprova e publica, o Notion é o quadro partilhado e uma rotina corre o ciclo três vezes por dia.

A Founders é o modelo: copiar a **estrutura** (processo, ficheiros, colunas, regras de design que são de método) e construir de raiz, com o utilizador, tudo o que é de **marca**, começando pelo Brand Book. Uma etapa de cada vez, cada uma aprovada antes da seguinte, como foi na Founders.

## O que se reaproveita tal como está

| Peça | Onde | Notas |
|---|---|---|
| Máquina de estados, papéis, regras de sincronização e ciclo da rotina | `kingdom-orquestrador/SKILL.md` | Acrescentar a marca à tabela "Marcas configuradas"; o resto vale para todas |
| Instruções do Manus e do ChatGPT | `kingdom-orquestrador/agentes/` | Copiar para `agentes/<marca>-manus.md` e `agentes/<marca>-chatgpt.md` e trocar marca, base do Notion, pilares e direção visual |
| Render HTML → PNG | `content/founders/render-posts.mjs` | Copiar para `content/<marca>/` (só muda o caminho) |
| Maquete da grelha do feed | `content/founders/grelha/` | Copiar e esvaziar `POSTS`; publicar como artefacto novo |
| Modelo de copy de meio de funil (10 slides, pontes, arco) | `kingdom-founders/modelo-meio-de-funil.md` | É método, não marca: adaptar só o exemplo |
| Regras de design dos carrosséis (foto a cada 3 slides, ≥30% de elementos visuais, máx. 3 slides claros, limites de caracteres nos 3 primeiros, variar componentes) | `kingdom-founders/SKILL.md`, secção Visual | Manter; as cores e fontes mudam |
| Formato dos documentos de copy (Ficha, Slides/Arte, Legenda, Notas para o design) | Claude Docs | Igual |

## O que se constrói de raiz, a partir do Brand Book (por esta ordem)

Decisão do utilizador (15/10/2026): cada marca nova começa **da base**, pelo desenvolvimento do Brand Book, exatamente como a Founders. Materiais que já existam da marca (sites, one pagers, sistemas de design antigos, documentos de regras de negócio) são **fontes de pesquisa**, não atalhos: nada passa para a marca nova sem ser apresentado e aprovado nesta sequência.

1. **Pesquisa e base estratégica.** Ler o que existe da marca (site, ofertas, preços, quem entrega, provas reais) e perguntar o que falta. Propor e aprovar: o que a marca vende, oferta e CTA de conversão, a pessoa ou equipa por trás, metodologia, avatar (dores, desejos, bloqueios), para quem é e para quem não é, promessa central e frases-assinatura, arquétipo e tom de voz, palavras a usar e a evitar, pilares de conteúdo (proporção). Gravar como documento "Base Estratégica | <Marca> | v1.0" na Drive.
2. **Identidade visual.** Propor e aprovar: logótipo/símbolo e usos, cores (com papel de cada uma), tipografia (títulos, corpo, palavra de destaque), anatomia do post 1080×1350 (margens, número, zonas de texto e foto), estilos de título, direção de fotografia e de imagens geradas por IA, grelha do feed. Gerar `content/brand/<marca>/brand.css` (tokens e fontes) e os modelos de post (`templates.html` → PNG).
3. **Brand Book.** Montar `content/brand/<marca>/brand-book.html` → PDF com a mesma estrutura do da Founders (`content/brand/founders/brand-book.html`, 27 páginas): capa, índice, a marca, a pessoa por trás, oferta, metodologia, avatar, para quem não é, promessa, arquétipo, tom de voz, palavras e expressões, pilares de conteúdo, o símbolo, usos, cores, tipografia, anatomia do post, fotografia, grelha do feed, modelos por estilo, perfil no Instagram (bio e destaques), fazer e não fazer, checklist antes de publicar. Enviar a visão geral das páginas para aprovação; o PDF final vai para a Drive.
4. **Skill da marca.** Com o Brand Book aprovado, criar `.claude/skills/kingdom-<marca>/SKILL.md` com a estrutura da `kingdom-founders` (Onde está tudo, Marca, Voz, Pilares, Visual, Linha editorial, Escrita, Processo, Histórico) e o modelo de copy adaptado.
5. **Linha editorial.** Publicações por semana, dias, alternância de formatos, proporção dos pilares, funil (topo/meio/fundo), séries fixas. Documento "APROVADO | Linha Editorial | <Marca> | v1.0" na Drive.
6. **Notion.** Duplicar a base "Ideias de Conteúdo · Kingdom Founders" (mesmas colunas e Status) como "Ideias de Conteúdo · <Marca>", ajustar as opções de Pilar e Série, e pôr o data source na tabela "Marcas configuradas".
7. **Drive.** Pasta da marca dentro de SOCIAL MEDIA, com a base estratégica, o Brand Book, a linha editorial e a pasta de referências do Manus (`REFERENCIAS - <MARCA>`).
8. **Agentes externos.** Tarefa agendada no Manus e Projeto no ChatGPT com as instruções da marca.
9. **Rotina.** Uma rotina própria para a marca, na sessão onde o utilizador vai enviar as imagens e baixar os PNG dessa marca. Não reaproveitar a rotina da Founders.
10. **Primeira semana.** Planear as referências, escrever as copies, desenhar e afinar o padrão visual com o utilizador; gravar cada decisão aprovada na skill da marca (como na Founders: capa, frases dos estáticos, densidade dos slides, equilíbrio do feed).

## Regras que valem para todas as marcas

- Nunca pedir tokens ou chaves no chat; fontes licenciadas fora do git.
- Aprovações do utilizador obrigatórias (copy e design); só o utilizador publica e marca "Publicado".
- Depoimentos só reais e autorizados; números só confirmados pelo utilizador.
- Nunca usar fotos que o utilizador não enviou: placeholder + prompt no Notion.
- Sem créditos ao autor das referências; sem identificadores de modelos em commits ou artefactos.
- Entrega de design: primeiro a visão geral, os PNG finais só depois da aprovação.
- Cada marca trabalha no seu ramo e na sua sessão, para não haver conflitos de push entre rotinas.
