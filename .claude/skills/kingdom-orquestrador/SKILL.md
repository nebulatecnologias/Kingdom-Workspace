---
name: kingdom-orquestrador
description: Orquestra a produção de posts das marcas Kingdom (começando pela Kingdom Founders) entre Manus (referências), Claude (copy e design), ChatGPT (imagens) e o utilizador (aprovações), usando a base do Notion como quadro partilhado; as imagens e os PNG finais passam pelo chat do Claude. Use em cada execução agendada (rotina) e sempre que o utilizador pedir para "correr o fluxo", "ver o que está pendente", "avançar os posts" ou montar/ajustar o processo de ponta a ponta.
---

# Orquestrador de conteúdo Kingdom

As IAs não falam entre si. **O Notion é o quadro partilhado**: cada linha da base de conteúdos é um post, a coluna **Status** diz em que etapa está e a coluna **Responsável** diz quem tem a próxima ação. Cada agente só mexe nas linhas em que é o responsável, faz a sua parte, escreve a **Última Ação** e passa a linha ao seguinte. **Sem Drive para imagens** (decisão do utilizador, 14/10/2026): o ChatGPT gera a imagem e avisa o utilizador; o utilizador envia-a ao Claude no chat; o Claude entrega a visão geral e os PNG finais no chat, onde o utilizador os baixa.

Regras de marca, voz, design e escrita: skill **kingdom-founders** (ler antes de escrever ou desenhar). Este ficheiro só define o processo.

## Marcas configuradas

| Marca | Base Notion (data source) | Referências Manus (Drive) | Skill de marca |
|---|---|---|---|
| Kingdom Founders | `collection://0027e540-aab6-46d9-bfe7-7b20c5df80c7` (base `22a60e2fbe2b408d900a68bccda89351`) | "REFERENCIAS - MANUS 2.0" `1nqqySy9i7FuLJWky5jMHo-qovqi6eHFP` | kingdom-founders |

Para replicar noutra marca: duplicar a base do Notion com as mesmas colunas, acrescentar uma linha aqui e criar a skill da marca.

## Papéis

| Agente | Faz | Lê | Escreve |
|---|---|---|---|
| **Manus** · pesquisador | Encontra referências alinhadas com os pilares | Notion (para não repetir) | Linhas novas no Notion (ou folha na pasta de referências) |
| **Claude · Copy** | Planeia (pilar, funil, série, formato, data), escreve a copy e o Prompt de Imagem | Notion, skill da marca | Claude Docs + colunas do Notion |
| **ChatGPT · Imagem** | Gera a imagem a partir do Prompt de Imagem e avisa o utilizador | Notion | Imagem na conversa do ChatGPT; Notion (Status) se tiver escrita |
| **Claude · Design** | Monta o post (HTML → PNG), visão geral, exporta | Notion, imagens recebidas no chat, repositório | Visão geral e PNG no chat + Notion |
| **Utilizador** | Leva a imagem do ChatGPT ao Claude, aprova copy e design, baixa e publica | Notion, ChatGPT, chat do Claude | Muda o Status; escreve Notas de Revisão; envia imagens |

## Máquina de estados

| Status | Responsável | O que acontece | Passa para |
|---|---|---|---|
| Brainstorming | Claude · Copy | Linha nova (do Manus ou do utilizador) sem Pilar. O Claude categoriza e agenda (regras da Linha Editorial). | Planeado |
| Planeado | Claude · Copy | Quando a Data de Publicação está a ≤ 10 dias: escreve a copy (modelo de meio de funil quando se aplica), o Prompt de Imagem e põe o link em Script. | Copy para Aprovar |
| Copy para Aprovar | **Utilizador** | Lê o documento do Script. Aprova ou pede alterações. | Copy Aprovada ou Rever Copy |
| Rever Copy | Claude · Copy | Aplica as Notas de Revisão no mesmo documento, limpa as notas. | Copy para Aprovar |
| Copy Aprovada | Claude · Design | Se o Prompt começa por "Sem imagem" segue direto para o design; senão entrega ao ChatGPT. | Imagem em Geração ou Design para Aprovar |
| Imagem em Geração | ChatGPT · Imagem → Utilizador | O ChatGPT gera a imagem e avisa o utilizador (Responsável passa a Utilizador). O utilizador baixa-a no ChatGPT e envia-a ao Claude no chat, indicando o post. | Imagem Pronta (o Claude marca ao receber) |
| Imagem Pronta | Claude · Design | Monta o design com a imagem, envia a visão geral no chat e põe o link da sessão em Visão Geral. | Design para Aprovar |
| Design para Aprovar | **Utilizador** | Vê a visão geral. Aprova ou pede alterações. | Design Aprovado ou Rever Design |
| Rever Design | Claude · Design | Aplica as Notas de Revisão, nova visão geral. | Design para Aprovar |
| Design Aprovado | Claude · Design | Envia os PNG finais e a legenda no chat para o utilizador baixar. | Pronto para Publicar |
| Pronto para Publicar | **Utilizador** | Baixa os PNG no chat do Claude e publica (ou agenda). | Publicado |
| Publicado | — | Fim. | — |

As aprovações do utilizador são obrigatórias (regras da marca): nenhum agente salta "Copy para Aprovar" nem "Design para Aprovar", e ninguém publica nem marca "Publicado" além do utilizador.

## Regras de sincronização (todos os agentes)

1. **Só tocar nas linhas em que és o Responsável** e no Status que te pertence. Nunca editar colunas de outra etapa.
2. **Reserva antes de trabalhar:** escrever na Última Ação `EM CURSO · <agente> · <AAAA-MM-DD HH:MM>`; outro agente que veja `EM CURSO` com menos de 2 horas salta a linha. No fim, substituir por `<data> · <agente> · <o que fez>`.
3. **Passagem de testemunho:** mudar Status e Responsável na mesma atualização.
4. **Idempotência:** antes de criar algo (documento, design), verificar se já existe (link em Script, `content/<marca>/semana-NN/`). Repetir uma execução não pode duplicar nada.
5. **Erro ou falta de dados:** não inventar. Deixar o Status como está, Responsável = Utilizador e explicar na Última Ação (ex.: "Falta Resumo da Ideia", "Imagem gerada há 48 h e ainda não recebida").
6. **Datas** em hora de Maputo (UTC+2).

## Ciclo do Claude em cada execução

Correr por esta ordem; no máximo 3 copies e 3 designs por execução para caber no tempo da sessão.

0. **Importar referências do Manus** (se houver folhas novas na pasta de referências cujo título não comece por `IMPORTADO |`): criar uma linha por referência (Status Brainstorming, Responsável Claude · Copy, Data Criação = hoje) sem duplicar títulos/URLs já existentes; depois renomear a folha para `IMPORTADO | <título>`.
   Na importação, saltar referências sem utilidade para a marca (lifestyle/ostentação, vídeos sem conteúdo verificável segundo a própria nota do Manus, temas fora dos pilares) e dizer no resumo quais e porquê. Se uma célula vier cortada na leitura, importar só a parte completa e anotar na Última Ação.
1. **Planear** as linhas Brainstorming sem Pilar (fluxo das referências na skill da marca). Agendar a continuação do calendário (sem sobrepor datas já ocupadas); o que não couber nas próximas semanas fica no **banco**: Status Brainstorming com Pilar, Categoria e Assunto preenchidos, sem data, Última Ação "… Banco (sem data)". Linhas do banco não são replaneadas automaticamente; entram no calendário quando houver vagas do mesmo pilar. Se faltarem referências de um pilar para manter a proporção (ex.: Espiritualidade), deixar essas datas livres e pedir referências desse pilar ao Manus no resumo.
2. **Escrever copy** das linhas Planeado com publicação nos próximos 10 dias (mais próximas primeiro): documento Claude Docs com Ficha, Slides/Arte, Legenda e Notas para o design; link em Script; Prompt de Imagem; Status Copy para Aprovar, Responsável Utilizador.
3. **Rever copy** (Rever Copy) a partir das Notas de Revisão; limpar as notas quando aplicadas.
4. **Copy Aprovada:** se o Prompt de Imagem começa por "Sem imagem", fazer já o design (passo 6); senão Status Imagem em Geração, Responsável ChatGPT · Imagem.
5. **Imagens recebidas:** quando o utilizador enviar uma imagem no chat (a dizer de que post é), guardá-la em `content/<marca>/semana-NN/img/` e marcar a linha como Imagem Pronta, Responsável Claude · Design. Linhas em Imagem em Geração há mais de 48 h: lembrar o utilizador no resumo.
6. **Design** (Imagem Pronta ou Copy Aprovada sem imagem): montar o post em `content/founders/semana-NN/index.html` com os modelos da marca (fontes Aptos descarregadas da Drive, pasta aptos-font), `node content/founders/render-posts.mjs semana-NN`, gerar e rever a visão geral, **enviar só a visão geral no chat**, link da sessão em Visão Geral, Status Design para Aprovar, Responsável Utilizador. Commit e push do HTML/PNG.
7. **Rever design** a partir das Notas de Revisão (nova visão geral no chat).
8. **Entregar** (Design Aprovado): enviar no chat os PNG finais (1080×1350, por ordem) e a legenda; Status Pronto para Publicar, Responsável Utilizador.
8b. **Grelha do feed:** depois de entregar PNG finais ou de planear posts novos, atualizar a maquete `content/founders/grelha/index.html` (miniatura 432×540 em `grelha/img/`, entrada em `POSTS` com o fundo `photo`/`dark`/`light`) e republicá-la no mesmo artefacto (https://claude.ai/artifact/8v6fjKWCQiGscdyWvHd8ku). Escolher o fundo dos estáticos para manter o padrão em xadrez: cada linha mistura foto, preto e branco.
9. **Resumo final** da execução (o que avançou, o que espera pelo utilizador, erros) na resposta da sessão.

## O que tem de existir para correr sozinho

| Peça | Para quê | Estado |
|---|---|---|
| Colunas e Status no Notion (Responsável, Notas de Revisão, Visão Geral, Última Ação, Prompt de Imagem) | Quadro de sincronização | Feito (14/10/2026) |
| Rotina agendada do Claude: "Kingdom Founders · ciclo de produção de posts" (`trig_019piDHZEnaYnspK6vDZPJah`), 07:45, 12:45 e 17:45 de Maputo, todos os dias, na sessão principal do utilizador (`session_01RgmbLLVHoJT5B4GNygU6zs`, ramo `claude/inspiring-planck-n6uxg2`) | Claude corre o ciclo sozinho e responde no mesmo chat onde o utilizador envia imagens e baixa os PNG | Feito (14/10/2026) |
| Manus: tarefa agendada com `agentes/manus.md` e acesso ao Notion (ou à pasta de referências) | Referências entram sozinhas | Por configurar no Manus |
| ChatGPT: projeto com `agentes/chatgpt.md` e conector do Notion | Gera as imagens pendentes e avisa | Por configurar no ChatGPT |

Passos que continuam manuais, por decisão do utilizador: levar a imagem do ChatGPT para o chat do Claude, aprovar copy e design, baixar os PNG e publicar.
