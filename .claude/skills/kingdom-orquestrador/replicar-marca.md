# Replicar o fluxo de produção para outra marca Kingdom

Guia para montar noutra marca (ex.: Kingdom InCompany) o mesmo processo da Kingdom Founders: Manus pesquisa referências, Claude escreve copy e desenha, ChatGPT gera imagens, o utilizador aprova e publica, o Notion é o quadro partilhado e uma rotina corre o ciclo três vezes por dia.

A Founders é o modelo: copiar a **estrutura** (processo, ficheiros, colunas, regras de design que são de método) e decidir com o utilizador tudo o que é de **marca** (público, voz, pilares, cores, fontes, séries). Uma etapa de cada vez, cada uma aprovada antes da seguinte, como foi na Founders.

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

## O que se decide de novo com o utilizador (por esta ordem)

1. **Base estratégica:** o que a marca vende, para quem (avatar, dores, desejos), promessa, provas reais, arquétipo e voz, palavras a usar e a evitar, CTA de conversão. Fontes: site e materiais da marca, documentos que o utilizador enviar. Guardar como skill `.claude/skills/kingdom-<marca>/SKILL.md` com a mesma estrutura da `kingdom-founders` (Onde está tudo, Marca, Voz, Pilares, Visual, Linha editorial, Escrita, Processo, Histórico).
2. **Identidade visual:** cores, fontes, estilos de título, modelos de post. Se já existir um sistema da marca no repositório, partir dele. Gerar `content/brand/<marca>/brand.css` + modelos e validar com o utilizador.
3. **Linha editorial:** publicações por semana, dias, alternância de formatos, pilares (proporção), funil (topo/meio/fundo), séries fixas.
4. **Notion:** duplicar a base "Ideias de Conteúdo · Kingdom Founders" (mesmas colunas e Status) como "Ideias de Conteúdo · <Marca>", ajustar as opções de Pilar e Série, e pôr o data source na tabela "Marcas configuradas".
5. **Drive:** pasta da marca dentro de SOCIAL MEDIA, com a base estratégica e a linha editorial aprovadas e a pasta de referências do Manus (`REFERENCIAS - <MARCA>`).
6. **Agentes externos:** tarefa agendada no Manus e Projeto no ChatGPT com as instruções da marca.
7. **Rotina:** uma rotina própria para a marca (07:45, 12:45 e 17:45 de Maputo, ou o horário que o utilizador escolher), na sessão onde ele vai enviar as imagens e baixar os PNG dessa marca. Não reaproveitar a rotina da Founders.
8. **Primeira semana:** planear as referências, escrever as copies, desenhar e afinar o padrão visual com o utilizador; gravar cada decisão aprovada na skill da marca (como na Founders: capa, frases dos estáticos, densidade dos slides, equilíbrio do feed).

## Regras que valem para todas as marcas

- Nunca pedir tokens ou chaves no chat; fontes licenciadas fora do git.
- Aprovações do utilizador obrigatórias (copy e design); só o utilizador publica e marca "Publicado".
- Depoimentos só reais e autorizados; números só confirmados pelo utilizador.
- Nunca usar fotos que o utilizador não enviou: placeholder + prompt no Notion.
- Sem créditos ao autor das referências; sem identificadores de modelos em commits ou artefactos.
- Entrega de design: primeiro a visão geral, os PNG finais só depois da aprovação.
- Cada marca trabalha no seu ramo e na sua sessão, para não haver conflitos de push entre rotinas.
