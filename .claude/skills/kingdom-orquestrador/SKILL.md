---
name: kingdom-orquestrador
description: Orquestra a produção de posts das marcas Kingdom (começando pela Kingdom Founders) entre Manus (referências), Claude (copy e design), ChatGPT (imagens) e o utilizador (aprovações), usando a base do Notion como quadro partilhado e a Google Drive como entrega. Use em cada execução agendada (rotina) e sempre que o utilizador pedir para "correr o fluxo", "ver o que está pendente", "avançar os posts" ou montar/ajustar o processo de ponta a ponta.
---

# Orquestrador de conteúdo Kingdom

As IAs não falam entre si. **O Notion é o quadro partilhado**: cada linha da base de conteúdos é um post, a coluna **Status** diz em que etapa está e a coluna **Responsável** diz quem tem a próxima ação. Cada agente só mexe nas linhas em que é o responsável, faz a sua parte, escreve a **Última Ação** e passa a linha ao seguinte. A Google Drive guarda os ficheiros (imagens geradas, PNG finais, legenda).

Regras de marca, voz, design e escrita: skill **kingdom-founders** (ler antes de escrever ou desenhar). Este ficheiro só define o processo.

## Marcas configuradas

| Marca | Base Notion (data source) | Pasta de produção (Drive) | Referências Manus (Drive) | Skill de marca |
|---|---|---|---|---|
| Kingdom Founders | `collection://0027e540-aab6-46d9-bfe7-7b20c5df80c7` (base `22a60e2fbe2b408d900a68bccda89351`) | "01. Produção de Posts" `1XfpV10TgNBYxBKspxRrwn8NmB5AZxvzO` | "REFERENCIAS - MANUS 2.0" `1nqqySy9i7FuLJWky5jMHo-qovqi6eHFP` | kingdom-founders |

Para replicar noutra marca: duplicar a base do Notion com as mesmas colunas, criar a pasta de produção, acrescentar uma linha aqui e criar a skill da marca.

## Papéis

| Agente | Faz | Lê | Escreve |
|---|---|---|---|
| **Manus** · pesquisador | Encontra referências alinhadas com os pilares | Notion (para não repetir) | Linhas novas no Notion (ou folha na pasta de referências) |
| **Claude · Copy** | Planeia (pilar, funil, série, formato, data), escreve a copy e o Prompt de Imagem | Notion, skill da marca | Claude Docs + colunas do Notion |
| **ChatGPT · Imagem** | Gera a imagem a partir do Prompt de Imagem | Notion | Ficheiro de imagem na Pasta do Post |
| **Claude · Design** | Monta o post (HTML → PNG), visão geral, exporta | Notion, Drive, repositório | Drive (visão geral, PNG, legenda) + Notion |
| **Utilizador** | Aprova copy e design, publica | Notion, Drive | Muda o Status; escreve Notas de Revisão |

## Máquina de estados

| Status | Responsável | O que acontece | Passa para |
|---|---|---|---|
| Brainstorming | Claude · Copy | Linha nova (do Manus ou do utilizador) sem Pilar. O Claude categoriza e agenda (regras da Linha Editorial). | Planeado |
| Planeado | Claude · Copy | Quando a Data de Publicação está a ≤ 10 dias: escreve a copy (modelo de meio de funil quando se aplica), o Prompt de Imagem e põe o link em Script. | Copy para Aprovar |
| Copy para Aprovar | **Utilizador** | Lê o documento do Script. Aprova ou pede alterações. | Copy Aprovada ou Rever Copy |
| Rever Copy | Claude · Copy | Aplica as Notas de Revisão no mesmo documento, limpa as notas. | Copy para Aprovar |
| Copy Aprovada | Claude · Design | Cria a Pasta do Post na Drive. Se o Prompt começa por "Sem imagem" segue direto para o design; senão entrega ao ChatGPT. | Imagem em Geração ou Imagem Pronta |
| Imagem em Geração | ChatGPT · Imagem | Gera a imagem e guarda-a na Pasta do Post com nome `imagem-capa.png` (ou `imagem-slideNN.png`). | Imagem Pronta |
| Imagem Pronta | Claude · Design | Monta o design com a imagem, gera a visão geral, envia-a para a Pasta do Post e põe o link em Visão Geral. | Design para Aprovar |
| Design para Aprovar | **Utilizador** | Vê a visão geral. Aprova ou pede alterações. | Design Aprovado ou Rever Design |
| Rever Design | Claude · Design | Aplica as Notas de Revisão, nova visão geral. | Design para Aprovar |
| Design Aprovado | Claude · Design | Exporta os PNG finais + `legenda.txt` para a Pasta do Post. | Pronto para Publicar |
| Pronto para Publicar | **Utilizador** | Baixa da Pasta do Post e publica (ou agenda). | Publicado |
| Publicado | — | Fim. | — |

As aprovações do utilizador são obrigatórias (regras da marca): nenhum agente salta "Copy para Aprovar" nem "Design para Aprovar", e ninguém publica nem marca "Publicado" além do utilizador.

## Regras de sincronização (todos os agentes)

1. **Só tocar nas linhas em que és o Responsável** e no Status que te pertence. Nunca editar colunas de outra etapa.
2. **Reserva antes de trabalhar:** escrever na Última Ação `EM CURSO · <agente> · <AAAA-MM-DD HH:MM>`; outro agente que veja `EM CURSO` com menos de 2 horas salta a linha. No fim, substituir por `<data> · <agente> · <o que fez>`.
3. **Passagem de testemunho:** mudar Status e Responsável na mesma atualização.
4. **Idempotência:** antes de criar algo (documento, pasta, ficheiro), verificar se já existe (link em Script, Pasta do Post, ficheiros na pasta). Repetir uma execução não pode duplicar nada.
5. **Erro ou falta de dados:** não inventar. Deixar o Status como está, Responsável = Utilizador e explicar na Última Ação (ex.: "Falta Resumo da Ideia", "Imagem não encontrada há 48 h").
6. **Datas** em hora de Maputo (UTC+2).

## Ciclo do Claude em cada execução

Correr por esta ordem; no máximo 3 copies e 3 designs por execução para caber no tempo da sessão.

0. **Importar referências do Manus** (se houver folhas novas na pasta de referências cujo título não comece por `IMPORTADO |`): criar uma linha por referência (Status Brainstorming, Responsável Claude · Copy, Data Criação = hoje) sem duplicar títulos/URLs já existentes; depois renomear a folha para `IMPORTADO | <título>`.
1. **Planear** as linhas Brainstorming sem Pilar (fluxo das referências na skill da marca).
2. **Escrever copy** das linhas Planeado com publicação nos próximos 10 dias (mais próximas primeiro): documento Claude Docs com Ficha, Slides/Arte, Legenda e Notas para o design; link em Script; Prompt de Imagem; Status Copy para Aprovar, Responsável Utilizador.
3. **Rever copy** (Rever Copy) a partir das Notas de Revisão; limpar as notas quando aplicadas.
4. **Copy Aprovada:** criar a Pasta do Post `AAAA-MM-DD · <título curto>` dentro da pasta de produção; link em Pasta do Post; seguir a tabela.
5. **Detetar imagens:** nas linhas Imagem em Geração, procurar ficheiros de imagem na Pasta do Post; se existirem, passar a Imagem Pronta (cobre o caso de o ChatGPT/utilizador não mudar o Status). Mais de 48 h sem imagem: avisar na Última Ação.
6. **Design** (Imagem Pronta ou Copy Aprovada sem imagem): descarregar a imagem da Drive, montar o post em `content/founders/semana-NN/index.html` com os modelos da marca, `node content/founders/render-posts.mjs semana-NN`, gerar a visão geral, rever o render, enviar a visão geral para a Pasta do Post, link em Visão Geral, Status Design para Aprovar, Responsável Utilizador. Commit e push do HTML/PNG.
7. **Rever design** a partir das Notas de Revisão.
8. **Exportar** (Design Aprovado): enviar os PNG finais e `legenda.txt` para a Pasta do Post; Status Pronto para Publicar, Responsável Utilizador.
9. **Resumo final** da execução (o que avançou, o que espera pelo utilizador, erros) na resposta da sessão.

Envio de ficheiros binários para a Drive: `python3 .claude/skills/kingdom-orquestrador/scripts/drive_upload.py <id-da-pasta> <ficheiros…>` (precisa das credenciais da secção seguinte). O conector da Drive serve para criar pastas, procurar e descarregar; não serve para enviar PNG.

## O que tem de existir para correr sozinho

| Peça | Para quê | Estado |
|---|---|---|
| Colunas e Status no Notion (Responsável, Notas de Revisão, Pasta do Post, Visão Geral, Última Ação, Prompt de Imagem) | Quadro de sincronização | Feito (14/10/2026) |
| Pasta "01. Produção de Posts" na Drive | Entrega | Feito |
| Rotina agendada do Claude (Claude Code na web) com os conectores Notion, Google Drive e Claude Docs | Claude corre o ciclo sem ninguém abrir o chat | Por criar (confirmar horários com o utilizador) |
| Credenciais OAuth da Google no ambiente: `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN` (âmbito `drive.file`) | Enviar PNG e visão geral para a Drive | Por configurar pelo utilizador |
| Fontes Aptos acessíveis à rotina | Render correto | Hoje vêm da Drive (pasta aptos-font) a cada sessão; o ciclo descarrega-as no passo 6 |
| Manus: tarefa agendada com as instruções de `agentes/manus.md` e acesso ao Notion (ou à pasta de referências) | Referências entram sozinhas | Por configurar no Manus |
| ChatGPT: projeto com as instruções de `agentes/chatgpt.md`, conector do Notion, e forma de guardar a imagem na Pasta do Post | Imagens | Por configurar; guardar na Drive pode exigir um passo manual (descarregar e arrastar para a pasta) |
