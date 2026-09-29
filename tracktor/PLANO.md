# Tracktor — plano de desenvolvimento

> Escrito a 29/09/2026. Vem do documento «KBOS — Arquitetura» e das decisões do
> Shelton registadas no `PLANO.md` do `kingdom-dashboard` (secção «O Payflow no KBOS»).

---

## COMEÇA POR AQUI

Numa sessão nova, lê **este ficheiro** e o `CLAUDE.md` do `kingdom-dashboard`. O registo
no fim diz onde se parou. As regras de lá valem aqui sem excepção: testes só com os dados
do Shelton, HTML/CSS/JS sem compilação, commits assinados `Claude <noreply@anthropic.com>`,
dinheiro escrito `MZ 1 500,00`, tratamento por «você».

---

## Onde estamos

- Existe o **protótipo** navegável (`tracktor/index.html`, commit `16a15b0`) com dados de
  exemplo, e o `DESIGN.md` (o design system da Kingdom Library, em azul).
- Do lado do Payflow, **o Tracktor já é esperado**: `oportunidades.origem` aceita
  `'tracktor'` com a referência em `origem_ref`; o `order.paid` leva `data.attribution`
  (primeiro e último toque); a compra já vai para a Meta e para o TikTok pelo servidor.
- Decidido pelo Shelton: **a Kingdom Training entra primeiro**; o Tracktor **será vendido a
  outras empresas daqui a cerca de 3 meses**; a IA chama-se **Business Advisor** e vive no
  Dashboard; cada aplicação tem o seu email e WhatsApp de apoio.

**Ordem pedida pelo Shelton a 29/09/2026:** primeiro a **publicação de posts** e a **caixa
de conversas** (Meta, WhatsApp, TikTok); depois o resto.

---

## O que já existe nas outras três aplicações e serve aqui

A regra: **não se reescreve o que já está provado em produção.** O Tracktor copia o molde,
ou chama a peça que já existe.

### No Payflow e na base (`kingdom-dashboard`)

| O que existe | Onde | Como o Tracktor o usa |
|---|---|---|
| Login, `utilizadores` e acesso por área (`privado.tenho_acesso('pipeline')`, `'agenda'`…) | Supabase Auth + migrações | Áreas novas: `publicacoes`, `conversas`, `leads`, `campanhas`. A entrada e o recuperar do Payflow (`entrar.css`) servem de molde |
| O cofre (`vault.create_secret`) e a regra «o token escreve-se pelo painel e nunca volta a sair» | `integracao_segredos`, `pixeis` (`20260927112000_conversoes.sql`) | Os tokens da Meta, do WhatsApp e do TikTok guardam-se assim |
| O relógio: `pg_cron` a cada minuto + `pg_net` + segredo no Vault | `webhooks-entregar`, `conversoes-enviar` | O publicador corre da mesma maneira, a cada minuto |
| Reclamar uma linha antes de a tratar, para nada sair duas vezes | `20260924131000_reclamar_nao_duplica.sql`, `conversoes-enviar` | Cada publicação e cada mensagem enviada é reclamada antes de sair |
| Verificação de assinatura HMAC de quem nos chama | `paystack-webhook`, `_shared/webhooks.ts` (WebCrypto, corre em Deno e em Node) | A mesma técnica verifica o `X-Hub-Signature-256` da Meta e a assinatura do TikTok |
| Tempo real no ecrã | passo 2; `20260927102000_marcacoes_tempo_real.sql` | A caixa de conversas mostra mensagens novas sem recarregar |
| Eventos, webhooks de saída e API `/v1` | passos 7 e 8; `_shared/api.ts` | `lead.opportunity_created` entra no Payflow; `deal.stage_changed` e `order.paid` voltam |
| Oportunidades, responsáveis e etapas | `20260926120000_oportunidades.sql`, `oportunidades_equipa()` | O botão «Enviar para o pipeline» cria a oportunidade com `origem = 'tracktor'`. A lista de responsáveis é a mesma função |
| Atribuição: formato do toque, `toque_limpo`, `leads.primeiro_toque`, `pedido_sinais` | `20260927110000_atribuicao.sql`, `…111000_atribuicao_pessoa.sql` | O script de rastreio do Tracktor grava o toque no mesmo formato. Um lead e uma venda falam a mesma língua |
| Conversões pelo servidor (Meta Conversions API, TikTok Events API), com hash SHA-256 | `_shared/conversoes.ts`, `conversoes-enviar`, tabela `pixeis` | Não se refaz. Mais tarde, o evento `Lead` usa o mesmo formato e a mesma fila |
| Marcações: disponibilidades, horas livres, reserva de 15 min, eventos gratuitos sem pagamento | passo 17 (`20260927101000_marcacoes.sql`) | «Marcar reunião» na caixa e nos formulários usa a agenda do Payflow. Não se constrói outra |
| Emails pela Resend com um molde só | `_shared/carta.ts`, `cartas.ts` | Avisos à equipa: ligação expirada, publicação falhada, lead quente, conversa sem resposta |
| Telefone com indicativo (+258, +27) | checkout | Base para juntar contactos repetidos |
| O formulário de aplicação e a leitura da origem (`MARCA`, `canalMedido()`), e `registar_candidatura` | `payflow/aplicacao.html` + base | Passa para o Tracktor na fase 3, com a mesma função de gravação |
| Testes no repositório e CI (Playwright, simuladores, provas SQL) | `testes/`, `.github/workflows` | O Tracktor tem os seus casos no mesmo corredor, com simuladores da Meta e do WhatsApp |
| Painel partido «um módulo por ecrã, um endereço por ecrã, gavetas com endereço» | passo 6 do Payflow | A estrutura do código do Tracktor |
| Importar leads de uma folha, com regras para os campos | `integrations/google-sheets-leads` | Importador de leads antigos |

### No Dashboard (`painel.html`)

| O que existe | Como o Tracktor o usa |
|---|---|
| Tabela `campanhas` (id, nome, canal) e `leads.campanha_id` | O Tracktor passa a ser o dono das campanhas: adopta esta tabela em vez de criar outra |
| Investimento das campanhas lançado no fluxo de caixa | O fluxo de caixa continua a guardar o que se pagou; o Tracktor lê o gasto real das APIs de anúncios. As duas contas comparam-se, não se somam |
| O ecrã Marketing | Passa a mostrar o resumo que o Tracktor manda (`metrics.daily`) |
| `leads` com qualificação, origem e etapa (o pipeline antigo) | O ecrã de Leads do Tracktor substitui-o; o pipeline antigo já está a ir para o Payflow (passo 11) |
| `tarefas_equipa` | «Lembrar-me de voltar a falar» numa conversa cria uma tarefa no Dashboard |
| `importar.html` | Molde do importador de CSV |

### Na Academy (`nebula`)

| O que existe | Como o Tracktor o usa |
|---|---|
| Carregar ficheiros para o Storage e ler por link assinado (capas, banners) | Biblioteca de imagens e vídeos das publicações |
| Inscrições e acessos de cada aluno | Na caixa, quem escreve aparece como «Aluno de Founders» e a conversa vai para a fila de apoio |
| Comunidades (grupos de WhatsApp e Telegram por programa) | Não entram na caixa: são grupos, não conversas. Ficam na Academy |
| Molde de email (`emails/carta.js`) e correcções de acessibilidade | Referência para os ecrãs e avisos |

---

## O que as plataformas deixam fazer

Confirmar cada linha na documentação oficial no dia em que o passo começar: as regras da
Meta e do TikTok mudam várias vezes por ano.

| Canal | Publicar | Mensagens diretas | Comentários | Condição |
|---|---|---|---|---|
| Facebook (Página) | sim | sim (Messenger) | sim | App da Meta com revisão das permissões |
| Instagram (conta profissional ligada a uma Página) | sim: imagem, carrossel, reel, story | sim | sim | Idem. A imagem tem de estar num endereço público (link assinado do Storage). Limite diário de publicações por API, lido em `content_publishing_limit` |
| WhatsApp Business | — | sim | — | WhatsApp Cloud API, um número registado, nome aprovado. Fora da janela de 24 h só com modelos aprovados, pagos por mensagem |
| TikTok | sim, mas **só privado até a app passar a auditoria** | **não conte com isto**: a API existe só para parceiros e mercados escolhidos | sim, na conta de empresa | App no TikTok for Developers e na TikTok API for Business |

**Janela de 24 horas.** No Messenger e no Instagram só se responde livremente até 24 h
depois da última mensagem da pessoa. A etiqueta «agente humano» estende para 7 dias, se a
permissão for aprovada. No WhatsApp, fora da janela, só com modelos aprovados.

**O que isto obriga, logo no primeiro dia** (o caminho crítico é o calendário das
plataformas, não o código):

- [ ] Verificação da empresa no Business Manager da Meta
- [ ] App da Meta, com política de privacidade pública e o endereço de pedido de apagamento de dados
- [ ] Contas do Instagram em modo profissional e ligadas às Páginas certas
- [ ] Número de WhatsApp escolhido (ver «Por decidir») e nome de exibição
- [ ] App no TikTok for Developers e pedido de auditoria da Content Posting API
- [ ] Método de pagamento na conta de WhatsApp Business, para os modelos

**Como se anda sem esperar pela revisão.** Uma app da Meta em acesso normal já funciona
com as contas de quem tem papel na app. Tudo se constrói e prova com as contas do Shelton
e da equipa; a revisão serve para abrir ao público (quem escreve à Página) e, mais tarde,
a outras empresas. O vídeo que a revisão pede grava-se com a funcionalidade já pronta.

---

## As fases

Os dias são de trabalho, como no plano do Payflow. **Pronto quando** é a prova que fecha o
passo; sem ela o passo não está feito.

### Fase 0 — Fundação (~5 dias)

| # | passo | dias | o quê | pronto quando |
|---|---|---|---|---|
| 0.1 | Pedidos às plataformas | 0,5 | a lista acima; começa no dia 1 porque demora semanas | todos os pedidos submetidos, com data |
| 0.2 | Casa do código | 1,5 | pasta, projecto no Vercel, `tracktor.kingdomcompny.com`, esquema `tracktor` na base, áreas de acesso novas, entrada e recuperar no molde do Payflow | o Shelton entra e vê a aplicação vazia com o menu do protótipo |
| 0.3 | Testes e CI | 1 | casos no corredor de `testes/`; simuladores de webhooks da Meta e do WhatsApp | CI verde, com um caso que falha de propósito |
| 0.4 | Ligar contas | 2 | login da Meta para empresas; lista de Páginas, Instagram e números; tokens no cofre; renovação e aviso de expiração; tabela `contas_sociais` | a Página e o Instagram da Kingdom Training aparecem ligados, e o token não aparece em lado nenhum do browser |

### Fase 1 — Publicação (~14 dias)

**O modelo.** `publicacoes` (texto, estado, agendada_para, campanha, quem criou, quem
aprovou) → `publicacao_destinos` (uma linha por conta: estado, texto próprio, id na rede,
link, erro, tentativas) → `media` (Storage). Estados: rascunho → para aprovar → agendada →
a publicar → publicada | falhou.

| # | passo | dias | o quê | pronto quando |
|---|---|---|---|---|
| 1.1 | Biblioteca de media | 2 | carregar imagem e vídeo para o Storage (molde da Academy), validar formato, proporção, tamanho e duração por rede **antes** de agendar | um vídeo que o Instagram recusaria é recusado no Tracktor, com o motivo |
| 1.2 | Compositor e calendário | 3 | os ecrãs do protótipo com dados reais: semana, mês, texto por rede, pré-visualização, UTM nos links, melhor horário | uma publicação para Facebook e Instagram fica agendada e aparece no calendário |
| 1.3 | Publicador | 4 | relógio a cada minuto; reclama os destinos vencidos; Facebook (foto, vídeo, texto) e Instagram (imagem, carrossel, reel, story; contentor → estado → publicar); repetição com espera crescente; erros classificados (token, formato, limite) | 20 publicações de teste saem à hora certa na conta de teste, nenhuma duas vezes, e uma falha de propósito fica «Falhou» com o motivo e o botão que resolve |
| 1.4 | Aprovações e avisos | 1 | quem aprova por unidade; email à equipa quando falha ou uma ligação expira (`carta.ts`) | uma publicação «para aprovar» só sai depois de aprovada |
| 1.5 | Resultados por publicação | 2 | alcance, interações e cliques lidos uma vez por dia nas 4 semanas seguintes | o cartão de uma publicação mostra os números dela |
| 1.6 | TikTok | 2 | ligar conta; publicar como privado enquanto não há auditoria; ligar o público quando ela chegar | um vídeo de teste chega à conta do TikTok |

### Fase 2 — Caixa de conversas (~16 dias)

**O modelo.** `conversas` (canal, conta, contacto na rede, lead, responsável, fila, estado,
não lidas, janela aberta até) → `mensagens` (direcção, autor, tipo, corpo, ficheiro, id na
rede, estado: enviada, entregue, lida, falhou). Mais `respostas_guardadas` e notas internas.

| # | passo | dias | o quê | pronto quando |
|---|---|---|---|---|
| 2.1 | Receber da Meta | 3 | uma Edge Function para os webhooks (verificação do token, assinatura, idempotência pelo id da mensagem): Messenger, Instagram (DM e comentários), comentários da Página | uma DM de teste ao Instagram aparece na base em menos de 5 s, e o mesmo webhook repetido não a duplica |
| 2.2 | WhatsApp | 3 | Cloud API: número, webhooks, estados de entrega; **copiar os ficheiros recebidos para o Storage** (os links do WhatsApp expiram); modelos aprovados | uma conversa de teste com o número do Shelton, com texto, foto e áudio |
| 2.3 | O ecrã | 4 | a caixa do protótipo com dados reais, em tempo real: filtros, filas «Vendas» e «Apoio», atribuir a alguém, notas, respostas guardadas, mensagens por ler no menu | duas pessoas da equipa vêem a mesma conversa mudar sem recarregar |
| 2.4 | Responder dentro das regras | 2 | janela de 24 h visível na conversa; fora dela, modelo (WhatsApp) ou etiqueta «agente humano» (Meta); nunca um envio que a rede vá recusar | fora da janela, o botão pede um modelo em vez de falhar |
| 2.5 | Comentários do TikTok | 2 | ler e responder aos comentários dos vídeos da conta | um comentário de teste é respondido a partir do Tracktor |
| 2.6 | Quem é esta pessoa | 2 | ligar a conversa a um lead (criar ou encontrar pelo telefone e email); mostrar se já é aluno (Academy) ou cliente (Payflow); «Marcar reunião» pela agenda do Payflow | uma conversa com um contacto novo cria um lead com a origem certa |

### Fase 3 — Leads, qualificação e formulários (~13 dias)

| # | passo | dias | o quê | pronto quando |
|---|---|---|---|---|
| 3.1 | Ecrã de Leads | 4 | lista e quadro do protótipo sobre a tabela `leads` que já existe; score pelas regras; automações | um lead de teste passa de Novo a Qualificado sozinho quando responde ao formulário |
| 3.2 | Formulários | 4 | construtor; migrar o `aplicacao.html` e a `registar_candidatura`; o endereço antigo reencaminha | uma aplicação feita no endereço antigo cai no Tracktor com o score e o UTM |
| 3.3 | Leads de anúncios | 2 | formulários de anúncio da Meta e do TikTok entram como leads | um lead de teste de um anúncio aparece em menos de 1 minuto |
| 3.4 | Importar | 1 | CSV e a folha do Google (molde do `google-sheets-leads`) | a folha do Founders 5.0 importada sem repetidos |
| 3.5 | Contactos únicos | 2 | juntar repetidos pelo telefone e email; consentimento guardado. **Espera pela tabela `pessoas` do núcleo** | a pessoa de teste do Shelton aparece uma só vez |

### Fase 4 — A ponte com o Payflow (~4 dias)

| # | passo | dias | o quê | pronto quando |
|---|---|---|---|---|
| 4.1 | Enviar para o pipeline | 2 | `lead.opportunity_created` cria a oportunidade (`origem = 'tracktor'`, `origem_ref` = id do lead), com a nota e o responsável; `deal.stage_changed` volta e mostra a etapa no lead | uma oportunidade de teste nasce no quadro do Payflow a partir do Tracktor |
| 4.2 | A venda volta | 1 | `order.paid` com `data.attribution` passa o lead a Cliente e soma a receita à campanha | a venda de teste do Shelton aparece na campanha certa |
| 4.3 | Script de rastreio | 1 | o toque gravado no mesmo formato da atribuição do Payflow, nos sites e nos formulários | o primeiro toque do lead e o da venda são o mesmo |

### Fase 5 — Campanhas e métricas (~13 dias)

| # | passo | dias | o quê | pronto quando |
|---|---|---|---|---|
| 5.1 | Campanhas | 3 | adoptar a tabela `campanhas` do Dashboard; UTM com a regra da casa; links curtos | uma campanha de teste gera os links e junta publicações, leads e vendas |
| 5.2 | Gasto dos anúncios | 3 | leitura diária da Meta e do TikTok; comparação com o fluxo de caixa | o custo por lead de uma campanha real bate com o gestor de anúncios |
| 5.3 | Métricas e visão geral | 3 | os ecrãs do protótipo com dados reais, sempre por unidade | a visão geral da Kingdom Training com números reais |
| 5.4 | Resumo diário | 1 | `metrics.daily` para o Dashboard e para o Business Advisor | o ecrã Marketing do Dashboard lê o Tracktor |
| 5.5 | LinkedIn | 3 | publicar e ler comentários da Página (com a aprovação da LinkedIn) | uma publicação de teste na Página da Kingdom Company |

### Fase 6 — Para vender a outras empresas

Por detalhar quando a fase 3 fechar: a fronteira de cada cliente (a mesma do Payflow, passo
9), onboarding de uma empresa nova, planos e cobrança pelo próprio Payflow.

---

## Soma e capacidade

| Fase | Dias |
|---|---|
| 0 · Fundação | ~5 |
| 1 · Publicação | ~14 |
| 2 · Caixa de conversas | ~16 |
| 3 · Leads e formulários | ~13 |
| 4 · Ponte com o Payflow | ~4 |
| 5 · Campanhas e métricas | ~13 |
| **Até ao Tracktor completo para a Kingdom** | **~65** |

A promessa de vender em ~3 meses é apertada: são ~65 dias de trabalho só para a Kingdom,
antes da fase 6. E a auditoria de 29/09 deixou **cinco bloqueios na abertura do Payflow**.
Proposta: o **0.1 começa já** (só custa pedidos), o resto da fase 0 e a fase 1 começam
quando esses bloqueios fecharem.

---

## Riscos

- **A revisão da Meta demora ou recusa.** Mitigação: construir e provar com contas que têm
  papel na app; submeter com o vídeo da funcionalidade já pronta.
- **O TikTok não abre mensagens diretas.** Mitigação: o Tracktor só promete comentários no
  TikTok; as mensagens diretas ficam fora até haver API.
- **Trocar o número de WhatsApp para a API tira-o da app no telemóvel** (a menos que a
  coexistência esteja disponível para o número). Mitigação: decidir antes do 2.2 e testar
  com um número novo.
- **Tokens que expiram em silêncio.** Mitigação: renovação automática, estado «Requer
  atenção» e email no próprio dia (0.4, 1.4).
- **Contas repetidas enquanto não há `pessoas`.** Mitigação: 2.6 procura pelo telefone e
  email; o 3.5 junta quando o núcleo existir.
- **Publicar duas vezes.** Mitigação: reclamar antes de publicar, guardar o id da rede, e
  um teste que corre o publicador duas vezes ao mesmo tempo.

---

## Por decidir

- [ ] **Onde vive o código.** Proposta: pasta `tracktor/` no `kingdom-dashboard`, como o
      `payflow/`, com as migrações na mesma `supabase/migrations`. É a mesma base e o
      Tracktor escreve em tabelas do Payflow; um só histórico de migrações evita que as
      duas discordem. A alternativa é um repositório próprio, como a Academy.
- [ ] **Endereço:** `tracktor.kingdomcompny.com`?
- [ ] **Número de WhatsApp da caixa:** o número actual do formulário (+258 85 690 7063),
      com coexistência se a Meta a permitir, ou um número novo?
- [ ] **Quem aprova publicações** em cada unidade, ou se a Kingdom Training começa sem
      aprovação.
- [ ] **LinkedIn na fase 1** (a Kingdom Company vende B2B por lá) ou na fase 5, como está.

---

## REGISTO — onde se parou

| # | passo | estado | quando | commit |
|---|---|---|---|---|
| — | Protótipo navegável e `DESIGN.md` | **feito** | 25/09/2026 | `16a15b0` |
| — | Este plano | **escrito**, à espera das decisões acima | 29/09/2026 | — |
| 0.1 | Pedidos às plataformas | por começar | — | — |
