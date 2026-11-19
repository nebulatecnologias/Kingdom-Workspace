# Kingdom Ops — Plano de desenvolvimento (v2, decisões fechadas)

> App de agendamento de reuniões para a equipa, com pipeline Kanban por reunião, atas ligadas a cada reunião, pipelines personalizáveis (reuniões, vendas, projetos, campanhas, tarefas) e um dashboard da operação do escritório. Visual cinza/preto/branco ao estilo do Cal.com; mobile em primeiro lugar.
>
> **Estado:** decisões da secção 0 aprovadas pelo dono a 19/11/2026; protótipo clicável construído em `ops/prototype/`; design system em `ops/DESIGN.md`. O passo seguinte é a construção do app pelo Opus 5.5 em **5 horas** (secção 9), com o prompt da secção 12.

Referências:
- Produto (contexto para o Impeccable): `ops/PRODUCT.md`
- Protótipo: `ops/prototype/index.html` (fontes em `ops/prototype/src/`; `README.md` explica o mapeamento para o app)
- Design system: `ops/DESIGN.md` (+ `ops/.impeccable/design.json`)
- Modelo a reaproveitar: `members/app` (Next.js 16 + Supabase) e `skills/members-platform/references/11-gotchas.md`
- Referências visuais do utilizador: Cal.com (paleta e shell), ecrã "Good morning" com faixa semanal, app "Journey" (faixa de dias + lista do dia), app de equipa com avatares, dashboard Spotbank (só a estrutura em cartões; **não** o verde)

---

## 0. Decisões (fechadas)

| # | Decisão | Resultado |
|---|---|---|
| 1 | Nome e pasta | **Kingdom Ops**, em `ops/`. |
| 2 | Fonte | **Google Sans** em todo o app, via `next/font` (decisão do dono a 19/11; igual aos outros produtos Kingdom). |
| 3 | Cor | **Paleta Spotbank (decisão do dono a 19/11):** fundo cinza-esverdeado claro (`#f4f6ef`), cartões brancos com sombra suave, tinta escura (`#141a0f`) e **lima** (`#c9f243`, texto `#1b2a0c`) como única cor de destaque: botão primário, "+", separador/menu/chip ativo, dia selecionado, barras, interruptores e o cartão "A seguir" (gradiente lima). Estados continuam em **pontos de 8 px** + texto. Tokens em `ops/DESIGN.md`. |
| 4 | Quem vê o quê | **Toda a equipa vê tudo; a agenda e os pipelines filtram-se por pessoa.** Perfis `admin` e `member`. |
| 5 | Contas | O admin cria utilizadores com `npm run user:create` no MVP; convites por email na fase 2. Entrar com email + palavra-passe. |
| 6 | Idioma | **Só pt-PT**, sem next-intl. Os textos vêm do objeto `T` em `ops/prototype/src/app.js`. |
| 7 | Hospedagem | **Vercel + novo projeto Supabase.** Domínio a indicar. |
| 8 | WhatsApp | **Sem botão de WhatsApp no app** (decisão do dono a 19/11). O número de WhatsApp fica só como contacto no perfil da pessoa e da equipa. |
| 9 | Pipelines iniciais | O escritório gere **projetos, vendas, campanhas de marketing, tarefas e agendas**, por isso o seed traz cinco: **Reuniões** (Agendado → Em curso → Adiada → Cancelada → Concluída), **Vendas** (Lead → Contactado → Proposta → Negociação → Ganho / Perdido), **Projetos** (Kickoff → Em curso → Em revisão → Bloqueado → Entregue), **Campanhas** (Ideia → Planeamento → Em produção → No ar → Terminada), **Tarefas** (A fazer → Em curso → Bloqueada → Concluída). Modelo extra "Recrutamento" só como template. |
| 10 | Vários escritórios | Não. Um escritório = uma base de dados. |
| 11 | Payflow | Ignorado a pedido do dono; referências = Cal.com + imagens enviadas. |
| 12 | Campos da ata | Os da secção 6, confirmados no protótipo (`blankMinutes` em `app.js`). |
| 15 | Botões e vidro | Todos os botões são pílulas (raio 100 %; botões de ícone circulares) com sombra suave. Efeito de vidro (fundo translúcido + desfoque) na barra de separadores escura, na barra superior do telemóvel, no seletor de etapas fixo, na folha "Mover para" e nos avisos (referência do dono a 19/11). |
| 14 | Ícones dos pipelines | Cada pipeline tem um ícone (`pipelines.icon`, nomes lucide): calendário, alvo, pasta, megafone, lista. Aparece na barra lateral, nos chips de pipeline, nas linhas da Operação e nos modelos. |
| 13 | Início (dashboard) | Direção "painel de bolso": cartão **A seguir** (próxima reunião da equipa, com o botão Abrir), lista **Hoje**, lista **Operação** (uma linha por pipeline com contagens), e no desktop indicadores, barras por etapa e por pessoa, atas em falta. |

---

## 1. Âmbito: o que entra nas 5 horas

**Entra (MVP):**
- Entrar / sair; perfis da equipa (nome, função, foto, WhatsApp).
- Agenda: faixa semanal, lista do dia, filtro por pessoa, "Hoje".
- Reunião: criar/editar com data, hora, duração, local (presencial/online + morada ou link), pessoa (nome, cargo, telemóvel, email), empresa (nome, NUIT opcional, sector), assunto, responsável, participantes internos, notas.
- Pipeline Kanban por pipeline, com as 5 etapas das reuniões; mudar de etapa por arrastar (desktop) ou por folha "Mover para" (telemóvel). Adiar pede nova data; cancelar pede motivo. Histórico de etapas no cartão.
- Atas: separador próprio, lista, formulário estruturado, sempre ligada a **uma** reunião (uma ata por reunião), estado rascunho/final, vista de impressão/PDF do browser.
- Dashboard "Início": reuniões hoje e esta semana, por etapa, por pessoa, atas em falta, adiadas/canceladas nos últimos 30 dias, e (se existir) valor do pipeline de vendas por etapa.
- Cinco pipelines no seed (Reuniões, Vendas, Projetos, Campanhas, Tarefas) com o **mesmo** componente Kanban; etapas editáveis (nome, ordem, cor, regras) numa página simples de definições; criar pipeline a partir de modelo (função SQL + um botão, como no protótipo).
- Deploy em produção (Vercel + Supabase), com dados reais da equipa.

**Fica para a fase 2 (não cabe em 5 h):**
- Campos personalizados por pipeline ao estilo Pipefy (`pipeline_fields` + formulário dinâmico). No MVP o `kind` do pipeline decide os campos (reuniões / vendas / projetos / campanhas / tarefas), exatamente como `screenCardForm` no protótipo.
- Convites por email, notificações/lembretes, anexos nas atas, comentários, pesquisa global, Google Calendar, vários escritórios, exportação.

**Ordem de corte se o tempo apertar** (do primeiro a sair ao último): editor de etapas → vista de impressão da ata → arrastar no Kanban (fica só "Mover para") → dashboard reduzido a 4 números → pipeline de Vendas só em seed, sem campos próprios.

---

## 2. Arquitetura

| Camada | Escolha | Notas |
|---|---|---|
| App | **Next.js 16 (App Router) + TypeScript**, em `ops/app` | Copiar o esqueleto de `members/app` (layout, Supabase SSR, `proxy.ts`, ESLint, Vitest, Playwright) e **apagar** gateway, emails, i18n, leitor, loja. |
| Estilo | **Tailwind v4** com os tokens do protótipo (`ops/DESIGN.md` → `tailwind-theme.css`) | Classes utilitárias `bg-canvas`, `text-ink`, `border-line`, etc., iguais às do Kingdom UI mas com a escala cinza. |
| Fonte | **Google Sans via `next/font/google`** | Pesos 400/500/600/700; `letter-spacing: -0.02em` nos títulos. |
| Base de dados | **Supabase Postgres**, migrações SQL em `ops/supabase/migrations` | RLS em todas as tabelas; triggers para `updated_at`, histórico e para garantir que a ata pertence a uma reunião. |
| Autenticação | **Supabase Auth** (email + palavra-passe; recuperação por email do próprio Supabase) | Sem Resend no MVP. |
| Kanban | **@dnd-kit/core + @dnd-kit/sortable** no desktop; folha "Mover para" no telemóvel | Estado otimista + Server Action; se falhar, volta e mostra toast. |
| Formulários | **Server Actions + zod**; listas repetíveis (participantes, decisões, ações) com `useFieldArray`-style simples em React | Sem react-hook-form para poupar tempo, a não ser que o Opus já o tenha fluente. |
| Ícones | `lucide-react` 18 px, traço 1.8 | Como no Kingdom UI. |
| Hospedagem | **Vercel** (root `ops/app`) + Supabase | Preview por branch. |
| Testes (mínimo) | typecheck + lint; 1 teste de BD (RLS e regra "uma ata por reunião"); 1 E2E Playwright (entrar → criar reunião → mover etapa → criar ata) em 390 e 1440 | Capturas de ecrã dos ecrãs principais como evidência. |

Estrutura no repositório:

```
ops/
  PRODUCT.md            contexto de produto (Impeccable)
  DESIGN.md             design system gerado do protótipo
  prototype/            protótipo clicável (src/styles.css, data.js, app.js, build.mjs → index.html)
  app/                  Next.js
  supabase/             migrations/, seed.sql, tests/
docs/kingdom-ops/
  plano-desenvolvimento.md   este ficheiro (manter a secção 0 atual)
```

---

## 3. Modelo de dados

Um modelo genérico de pipelines desde o primeiro dia, para que "Vendas" e "Tarefas" sejam só dados e não código novo. Uma reunião **é um cartão** num pipeline de tipo `meetings`.

| Tabela | Campos principais | Notas |
|---|---|---|
| `profiles` | `id` (= auth.users.id), `full_name`, `role` (`admin`/`member`), `job_title`, `phone_whatsapp`, `avatar_url`, `color` (para o chip), `active`, `created_at` | Criada por trigger ao nascer o utilizador. |
| `pipelines` | `id`, `slug` (único), `name`, `kind` (`meetings`/`sales`/`projects`/`campaigns`/`tasks`/`custom`), `icon`, `position`, `created_by`, `archived_at` | `kind` decide os campos que o formulário mostra e os KPIs. |
| `pipeline_stages` | `id`, `pipeline_id`, `name`, `position`, `tone` (`neutral`/`info`/`warning`/`danger`/`success`), `is_done` (bool), `is_lost` (bool), `requires_note` (bool), `requires_reschedule` (bool) | Reuniões: Concluída `is_done`; Cancelada `is_lost` + `requires_note`; Adiada `requires_reschedule`. |
| `cards` | `id`, `pipeline_id`, `stage_id`, `title` (assunto), `owner_id` (responsável), `starts_at`, `ends_at`, `all_day`, `location_kind` (`in_person`/`online`/`phone`), `location` (morada ou link), `contact_name`, `contact_role`, `contact_phone`, `contact_email`, `company_name`, `company_tax_id`, `company_sector`, `value_cents` (vendas), `due_at` (tarefas), `description`, `fields` jsonb (extras futuros), `position` (ordem na coluna), `stage_changed_at`, `created_by`, `created_at`, `updated_at`, `archived_at` | Índices: (`pipeline_id`, `stage_id`, `position`), (`starts_at`), (`owner_id`, `starts_at`). |
| `card_participants` | `card_id`, `profile_id` | Membros internos que vão à reunião. Agenda por pessoa = `owner_id` **ou** participante. |
| `card_activity` | `id`, `card_id`, `actor_id`, `type` (`created`/`stage_changed`/`rescheduled`/`updated`/`minutes_created`/`minutes_finalized`), `from_stage_id`, `to_stage_id`, `note`, `at` | Escrito por trigger quando `stage_id` ou `starts_at` mudam. Alimenta o histórico do cartão e o dashboard. |
| `minutes` | `id`, `card_id` (**único**), `title`, `held_at`, `started_at`, `ended_at`, `location`, `attendees` jsonb `[{name, org, role, present}]`, `agenda` jsonb `[{topic, summary}]`, `decisions` jsonb `[{text}]`, `actions` jsonb `[{what, who, due, status}]`, `next_steps` text, `next_meeting_at`, `written_by`, `approved_by`, `status` (`draft`/`final`), `finalized_at`, `created_at`, `updated_at` | Trigger: o `card_id` tem de pertencer a um pipeline `kind = meetings`. Ao criar, pré-preenche a partir do cartão. |

**Regras de acesso (RLS):**
- Utilizador autenticado e `active`: lê tudo; cria e edita `cards`, `card_participants` e `minutes`; não apaga (arquiva).
- `admin` (função `is_admin()`): tudo o resto — `profiles`, `pipelines`, `pipeline_stages`, apagar.
- Apenas `final` para quem é `written_by`, `owner_id` do cartão ou admin.

**Funções SQL:**
- `move_card(card_id, stage_id, position, note, new_starts_at)`: numa transação, reordena a coluna, atualiza `stage_changed_at`, exige `note` se a etapa `requires_note`, exige `new_starts_at` se `requires_reschedule`, regista em `card_activity`.
- `create_pipeline_from_template(kind, name)`: insere pipeline + etapas a partir de um modelo em SQL (Reuniões/Vendas/Tarefas). Usada pelo seed; UI na fase 2.

---

## 4. Ecrãs e navegação

Shell igual ao Cal.com: barra lateral à esquerda no desktop (≥ 1024 px) com o conteúdo num painel branco arredondado sobre o cinza; no telemóvel, barra de separadores em baixo com **Início · Agenda · Pipeline · Atas · Equipa** e um botão "+" preto para criar reunião.

| Rota | Desktop | Telemóvel | Notas |
|---|---|---|---|
| `/login`, `/auth/reset` | Cartão centrado | Igual | Email + palavra-passe. |
| `/` Início | Grelha de cartões KPI + 2 gráficos de barras (por etapa, por pessoa) + lista "Atas em falta" + "Próximas 5 reuniões" | Saudação "Bom dia, Nome" + KPIs em 2 colunas + listas | Barras em CSS puro (sem biblioteca de gráficos). |
| `/agenda?date=&member=` | Faixa semanal (dias com ponto se há reunião), lista do dia agrupada por período (manhã/tarde), avatares da equipa como filtro | Igual às refs "Good morning"/"Journey": faixa de dias deslizável, dia selecionado em círculo preto, cartões da reunião com hora, pessoa, empresa, etapa | Também vista "Semana" em lista no desktop. |
| `/cards/new?pipeline=reunioes` | Folha lateral (drawer) | Página inteira | Campos por `kind`; ao gravar vai para "Agendado". |
| `/cards/[id]` | Cabeçalho (assunto, etapa em pill, responsável), 2 colunas: dados da pessoa/empresa + histórico; separadores **Detalhes · Ata** | Mesma informação em pilha; botão fixo "Mover para" | Separador Ata: cria ou abre a ata. |
| `/pipelines/[slug]` | Kanban com colunas por etapa, arrastar e largar, contador por coluna, filtro por pessoa | Controlo segmentado de etapas (deslizável) + lista; "Mover para" em folha inferior | Reuniões, Vendas e Tarefas usam o **mesmo** componente. |
| `/atas` | Tabela: reunião, data, empresa, estado, redigida por | Lista de cartões | Filtro rascunho/final; vazio: "Nenhuma ata. As atas nascem a partir de uma reunião concluída." |
| `/atas/new?card=` | Formulário por secções com listas repetíveis | Igual, uma secção por vez (acordeão) | Só a partir de um cartão; pré-preenchido. |
| `/atas/[id]` | Leitura limpa + "Imprimir / PDF" + "Marcar como final" | Igual | `/atas/[id]/print` sem shell. |
| `/team` | Grelha de perfis | Lista | Admin edita função/WhatsApp/ativo. |
| `/settings/pipelines/[slug]` | Lista de etapas: renomear, reordenar, cor, regras | Igual | Alvo de corte se faltar tempo. |

**Estados vazios, carregamento e erro** desenhados no protótipo para Agenda, Pipeline e Atas (o Impeccable exige).

---

## 5. Pipelines personalizáveis (como no Pipefy, mas em 5 h)

- **Hoje (MVP):** um pipeline = nome + tipo + etapas ordenadas com regras simples (concluída / perdida / exige nota / exige nova data). O tipo decide o formulário: `meetings` mostra data, hora, duração, local, pessoa, empresa, assunto, participantes; `sales` mostra empresa, pessoa, valor, data prevista de fecho; `projects` mostra cliente, pessoa de contacto, prazo de entrega; `campaigns` mostra canal, orçamento, lançamento; `tasks` mostra título, responsável, prazo, descrição. A agenda e as atas só olham para pipelines `meetings`. O dashboard conta por etapa em qualquer pipeline e soma `value_cents` em `sales`.
- **Fase 2:** `pipeline_fields` (`key`, `label`, `type` texto/número/data/escolha/pessoa, `required`, `position`) guardados em `cards.fields`; galeria de modelos ("Reuniões", "Vendas", "Tarefas", "Recrutamento", "Suporte") na interface; automatizações simples (ao entrar na etapa X, criar tarefa Y).

A coluna `fields jsonb` já existe no MVP para não precisar de migração destrutiva depois.

---

## 6. Ata — campos

Cabeçalho (pré-preenchido do cartão): título/assunto, reunião ligada, data, hora de início e fim, local, empresa, pessoa externa.

Corpo:
1. **Participantes** (lista): nome, organização, função, presente/ausente.
2. **Ordem de trabalhos / pauta** (lista): tópico + resumo da discussão.
3. **Decisões** (lista).
4. **Ações** (lista): o quê, quem (membro da equipa ou nome livre), prazo, estado (pendente/feita).
5. **Próximos passos** (texto) e **próxima reunião** (data, opcional).
6. **Redigida por** (automático), **aprovada por** (opcional), **estado** rascunho/final.

Regras: uma ata por reunião; criar a ata não muda a etapa, mas ao marcar como final sugere "Concluir reunião" se ainda não estiver concluída. "Atas em falta" no dashboard = reuniões concluídas sem ata final.

---

## 7. Dashboard "Início" — indicadores

| Indicador | Cálculo |
|---|---|
| Reuniões hoje / esta semana | `cards` em pipelines `meetings` por `starts_at`, exceto canceladas |
| Por etapa | contagem por `stage_id` (barras) |
| Por pessoa (próximos 7 dias) | `owner_id` ou participante |
| Atas em falta | `is_done` sem `minutes.status = final` |
| Adiadas / canceladas (30 dias) | `card_activity` tipo `stage_changed` para etapas `requires_reschedule` / `is_lost` |
| Taxa de conclusão (30 dias) | concluídas ÷ (concluídas + canceladas) |
| Vendas por etapa | soma `value_cents` por etapa do pipeline `sales` (aparece só se existir) |
| Próximas 5 reuniões | lista com atalho para o cartão |

Uma única consulta SQL (view `dashboard_summary`) para não multiplicar chamadas.

---

## 8. Design e protótipo (feito)

**Direção (final):** Operate mode (Impeccable). Fundo cinza-esverdeado claro, cartões brancos sem bordas com sombra suave e raio 20 px, tiles circulares; lima como única cor de destaque (botão primário, "+", seleções, barras, cartão "A seguir"); botões em pílula com sombra suave; vidro (desfoque translúcido) na barra de separadores escura, barra superior, seletor de etapas, folha e avisos; estados em pontos de 8 px + rótulo. Modo escuro existe nos tokens mas não foi revisto (artefacto publicado só em claro).

**Tokens** (versão final em `ops/DESIGN.md`): `ground #f4f6ef`, `panel #fafbf7`, `card #ffffff`, `surface #f2f5ec`, `line #e4e8dc`, `ink #141a0f`, `muted #5f6a57`, `accent #c9f243`, `accent-ink #1b2a0c`, `accent-soft #edfbcb`, `accent-deep #6f9d12`, `hero` (gradiente lima). Tipografia Google Sans: display 26/1.15/-0.02em 600, title 17/1.3 600, body 15/1.5 400, label 13.5 500, caption 12.5 400.

**O que foi feito:**
1. Skill UI: o proxy da sessão bloqueia o cal.com, por isso não houve extração automática; a paleta é a escala cinza do Cal.com (tokens acima), confirmada contra a captura enviada.
2. Impeccable: contexto (`ops/PRODUCT.md`), sorteio de estrutura (direção "painel de bolso" registada em `ops/.impeccable/surfaces/prototype.md`), construção, duas rondas de inspeção com capturas em 1440 e 390 (geradas por `node ops/prototype/tools/screenshots.mjs` em `ops/.impeccable/review/`, não versionadas), detector sem achados, revisão final por agente e `document` → `ops/DESIGN.md`.
3. Protótipo em **um ficheiro** (`ops/prototype/index.html`, gerado por `node ops/prototype/build.mjs` a partir de `src/`), com botão "Protótipo" para alternar desktop/telemóvel e saltar entre 23 ecrãs. Capturas de todos os ecrãs: `node ops/prototype/tools/screenshots.mjs`.

**Para o protótipo ser reaproveitado no front (pedido seu):**
- `src/styles.css`: tokens como CSS custom properties com os **mesmos nomes** que vão para o Tailwind; uma classe por componente (`.btn`, `.btn-primary`, `.card`, `.pill`, `.field`, `.week-strip`, `.day-chip`, `.kanban`, `.stage-col`, `.card-item`, `.sheet`, `.tabbar`, `.sidebar`, `.kpi`, `.bar`). Cada classe vira um componente React com o mesmo nome.
- `src/data.js`: dados de exemplo com **exatamente os nomes de campos do SQL** (secção 3): `cards.starts_at`, `contact_name`, `company_name`, `pipeline_stages.tone`, … O seed do Supabase nasce deste ficheiro.
- `src/app.js`: uma função por rota (`screenHome`, `screenAgenda`, `screenPipeline`, `screenCard`, `screenMinutesForm`, …) e componentes puros (`Pill(stage)`, `CardItem(card)`, `WeekStrip(date)`). Cada função corresponde a um `page.tsx`.
- Textos em pt-PT num único objeto `T` para o Opus os copiar para o app.

---

## 9. Plano das 5 horas (Opus 5.5)

Pré-requisitos antes de começar o relógio: protótipo aprovado (feito), `ops/DESIGN.md` (feito), projeto Supabase criado (feito, ver infraestrutura abaixo) (URL + chaves), projeto Vercel ligado ao repositório com root `ops/app`, lista da equipa (nome, função, email, WhatsApp de contacto).

| Bloco | Tempo | Entrega | Aceita-se quando |
|---|---|---|---|
**Infraestrutura criada a 19/11/2026:**

| Serviço | Dados |
|---|---|
| Supabase | Projeto **Kingdom Ops**, organização Nebula Tecnologias, ref `swisxnploerhnqymdheb`, URL `https://swisxnploerhnqymdheb.supabase.co`, região `eu-west-1`, Postgres 17. A palavra-passe da base de dados repõe-se em Project Settings → Database. |
| Vercel | Projeto **kingdom-ops** (equipa Nebula Tecnologias), ligado a `nebulatecnologias/Kingdom-Workspace`, framework Next.js, funções em `cpt1`, previews protegidos por login da Vercel. **Enquanto `ops/app` não existe**, o projeto está com root na raiz do repositório e com o comando de ignorar build `exit 0`, para não falhar em cada commit. **No bloco 0, o Opus define root `ops/app` e remove o comando de ignorar build** (Vercel MCP `update_project` com `rootDirectory: "ops/app"` e `commandForIgnoringBuildStep: null`, ou nas definições do projeto). |
| Variáveis no Vercel | `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` definidas em produção, preview e desenvolvimento. **Falta** `SUPABASE_SERVICE_ROLE_KEY` (o dono copia de Supabase → Project Settings → API keys → service_role e adiciona no Vercel; nunca em texto no chat). |

| **0. Fundação** | 0:00–0:40 | `ops/app` a partir do esqueleto de `members/app` sem gateway/emails/i18n; tokens e fonte de `ops/DESIGN.md`; `AppShell` (sidebar + tab bar) do protótipo; migração `0001_schema.sql` (secção 3) + RLS + triggers + `move_card` + `create_pipeline_from_template`; `seed.sql` gerado de `ops/prototype/src/data.js` (5 pipelines, 4 perfis, 32 cartões, 2 atas); login; script `user:create` | Entro no preview em 390 e 1440 e vejo o shell com a agenda vazia. |
| **1. Agenda + reunião** | 0:40–1:40 | Faixa semanal, lista do dia, filtro por pessoa; formulário criar/editar (zod + Server Action); página do cartão com dados, etapa e histórico | Crio uma reunião no telemóvel, aparece na agenda do dia certo e em "Agendado". |
| **2. Pipeline** | 1:40–2:30 | Kanban com dnd-kit no desktop; segmentado + "Mover para" no telemóvel (folha com stepper, campos inline para nova data / motivo, igual ao protótipo); histórico atualizado; mesmo componente para os 5 pipelines; seletor de pipeline em chips | Movo um cartão nos dois dispositivos; recarregar mantém; o histórico mostra quem e quando. |
| **3. Atas** | 2:30–3:30 | Lista, formulário por secções com listas repetíveis, pré-preenchimento, rascunho/final, separador "Ata" no cartão, vista de impressão | Crio a ata de uma reunião concluída no telemóvel, abro-a a partir do cartão, imprimo em PDF. |
| **4. Início + Equipa** | 3:30–4:10 | View `dashboard_summary`; KPIs, barras CSS, atas em falta, próximas reuniões; página da equipa; editor de etapas (se houver margem) | Os números batem certo com o seed. |
| **5. Produção** | 4:10–5:00 | Migrações e seed real no Supabase de produção; env vars; deploy; E2E smoke + capturas 390/1440; correções; README de 1 página com "como criar utilizador" | O URL de produção responde, a equipa entra e cria a primeira reunião real. |

Reserva: 10–15 min dentro do bloco 5. Se um bloco passar 15 min do limite, aplicar a ordem de corte da secção 1 **antes** de avançar.

Ritmo (herdado do Kingdom Library): migração + teste de BD antes do código que depende dela; `npm run typecheck && npx eslint src && npx vitest run` antes de cada push; commit por bloco; preview por branch; reportar em português o que mudou, o que foi verificado e o que fica para o dono.

---

## 10. Riscos

| Risco | Mitigação |
|---|---|
| Arrastar e largar consome tempo | dnd-kit só no desktop; o telemóvel usa sempre "Mover para". Se passar 20 min, cortar o arrastar. |
| Formulário da ata com listas repetíveis fica pesado | Componente genérico `RepeatableList` usado nas 4 listas; guardar como jsonb, sem tabelas filhas. |
| Supabase/Vercel por configurar | Criar os dois projetos **antes** de iniciar o relógio (secção 9, pré-requisitos). |
| Fuso horário | Guardar `timestamptz`; mostrar sempre em `Africa/Maputo` (fixo no MVP). |
| Protótipo e app divergem | Os nomes de classes, campos e ecrãs são iguais (secção 8); o `impeccable-finish-reviewer` compara o app com o protótipo no fim. |

---

## 11. Próximos passos

1. **Você:** abrir `ops/prototype/index.html` (ou o link do artefacto) no telemóvel e no desktop, percorrer os ecrãs pelo botão "Protótipo" e dizer o que muda. Ajustes ao protótipo são rápidos e evitam retrabalho no app.
2. **Você:** criar o projeto Supabase e o projeto Vercel (ou dar acesso para o fazer) e preparar a lista da equipa (nome, função, email, WhatsApp).
3. **Opus 5.5:** nova sessão com o prompt da secção 12, com o relógio de 5 horas.

---

## 12. Prompt de arranque para o Opus 5.5

```
Vais construir o Kingdom Ops, o app de gestão operacional do escritório (reuniões, pipelines Kanban, atas e dashboard), em 5 horas de relógio. Fala comigo em português; código, commits e comentários em inglês.

LÊ PRIMEIRO, por esta ordem:
1. docs/kingdom-ops/plano-desenvolvimento.md (todo: decisões fechadas, âmbito e ordem de corte, arquitetura, modelo de dados, ecrãs, campos da ata, dashboard, blocos de 5 horas).
2. ops/PRODUCT.md e ops/DESIGN.md (design system final: tokens, componentes, regras).
3. ops/prototype/README.md e ops/prototype/src/ (styles.css, data.js, app.js). O protótipo é a especificação visual e de dados: mesmos nomes de tokens, classes, campos (colunas SQL), textos (objeto T) e ecrãs (funções screen*). Corre `node ops/prototype/tools/screenshots.mjs` e abre ops/.impeccable/review/screens/ para ver cada ecrã em 1440 e 390.
4. skills/members-platform/references/11-gotchas.md (armadilhas já conhecidas desta stack).

DECISÕES FECHADAS (não reabrir):
- Stack: Next.js 16 App Router + TypeScript + Tailwind v4 + Supabase (Postgres, Auth) na Vercel, a partir do esqueleto de members/app sem gateway, emails nem i18n. Só pt-PT.
- Fonte: Google Sans em todo o app, via next/font/google (pesos 400/500/600/700).
- Cor: fundo #f4f6ef, cartões brancos com sombra suave, tinta #141a0f, lima #c9f243 (texto #1b2a0c) como única cor de destaque: botão primário, "+", item ativo do menu, separador/chip/dia selecionados, barras, interruptores e o cartão "A seguir" em gradiente lima. A barra lateral do desktop tem a cor do fundo. Estados em pontos de 8 px + texto.
- Forma: todos os botões em pílula (raio 100 %; botões de ícone circulares) com sombra suave; cartões com raio 20 px sem bordas; vidro (fundo translúcido + backdrop blur) na barra de separadores escura do telemóvel, na barra superior, no seletor de etapas fixo, na folha "Mover para" e nos avisos.
- Pipelines: cinco no seed (Reuniões, Vendas, Projetos, Campanhas, Tarefas), cada um com ícone lucide (calendar, target, briefcase, megaphone, check-square) na barra lateral, nos chips e nos modelos; mesmo componente Kanban para todos; o kind decide os campos do formulário.
- Sem botão de WhatsApp em lado nenhum; o número de WhatsApp é só contacto no perfil.
- Toda a equipa vê tudo; filtro por pessoa. Perfis admin e member. Contas criadas pelo admin com `npm run user:create`.

COMO TRABALHAR:
- Segue os blocos da secção 9 do plano com os tempos e critérios de aceitação. No fim de cada bloco: `npm run typecheck`, `npx eslint src`, `npx vitest run`, commit, push, preview na Vercel.
- Migração e teste de BD antes do código que depende dela. O seed.sql nasce de ops/prototype/src/data.js.
- Se um bloco passar 15 minutos do limite, aplica a ordem de corte da secção 1 e diz-me o que cortaste. Não acrescentes funcionalidades fora da secção 1.
- Reporta em português: o que mudou para mim, o que verificaste (testes, capturas 390 e 1440), o que decidiste por mim e o que fica para eu fazer.

INFRAESTRUTURA (já criada; ver secção 9 do plano):
- Supabase: projeto "Kingdom Ops", ref swisxnploerhnqymdheb, URL https://swisxnploerhnqymdheb.supabase.co, região eu-west-1. Usa o MCP do Supabase para aplicar migrações a este projeto.
- Vercel: projeto kingdom-ops (equipa Nebula Tecnologias), ligado ao repositório, região cpt1. Está temporariamente com root na raiz e com o comando de ignorar build `exit 0`: no bloco 0, assim que ops/app existir no ramo, define rootDirectory "ops/app" e remove o comando de ignorar build (Vercel MCP update_project). NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY já definidos; SUPABASE_SERVICE_ROLE_KEY é adicionada pelo dono nas variáveis do Vercel. Nunca imprimas chaves no chat.
- Equipa inicial (nome, função, email, WhatsApp de contacto): [colar aqui]

Começa pelo bloco 0: copia o esqueleto de members/app para ops/app, remove gateway, emails e i18n, aplica os tokens de ops/DESIGN.md e a Google Sans, escreve a migração 0001 com o modelo da secção 3 (profiles, pipelines, pipeline_stages, cards, card_participants, card_activity, minutes, RLS, triggers, move_card, create_pipeline_from_template) e o seed a partir de data.js.
```
