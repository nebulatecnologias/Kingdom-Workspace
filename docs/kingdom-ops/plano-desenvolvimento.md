# Kingdom Ops — Plano de desenvolvimento (v1, para aprovar)

> App de agendamento de reuniões para a equipa, com pipeline Kanban por reunião, atas ligadas a cada reunião, pipelines personalizáveis (reuniões, vendas, tarefas) e um dashboard da operação do escritório. Visual cinza/preto/branco ao estilo do Cal.com; mobile em primeiro lugar.
>
> **Como vai ser usado:** 1) aprovar as decisões da secção 0; 2) construir o protótipo clicável nesta sessão (Skill UI + Impeccable); 3) entregar protótipo + `DESIGN.md` + este plano ao Opus 5.5 para construir o app em **5 horas** (secção 9).

Referências:
- Produto (contexto para o Impeccable): `ops/PRODUCT.md`
- Protótipo (a criar): `ops/prototype/`
- Design system (gerado a partir do protótipo): `ops/DESIGN.md` + `ops/prototype/tailwind-theme.css`
- Modelo a reaproveitar: `members/app` (Next.js 16 + Supabase) e `skills/members-platform/references/11-gotchas.md`
- Referências visuais do utilizador: Cal.com (paleta e shell), ecrã "Good morning" com faixa semanal, app "Journey" (faixa de dias + lista do dia), app de equipa com avatares, dashboard Spotbank (só a estrutura em cartões; **não** o verde)

---

## 0. Decisões a confirmar (o valor a negrito é o que assumo se não disser nada)

| # | Decisão | Proposta |
|---|---|---|
| 1 | Nome e pasta | **Kingdom Ops**, em `ops/` (como `members/`). Mudar o nome custa 2 minutos; a pasta fica. |
| 2 | Fonte | **Inter** (é a do Cal.com; livre, via `next/font`). Alternativa: Google Sans, para ficar igual aos outros produtos Kingdom. |
| 3 | Cor | Cinza, preto e branco (escala `gray` do Cal.com). Estados com **ponto de 8 px em verde / âmbar / vermelho dessaturados** (como o ponto verde do Cal.com). Alternativa: 100 % monocromático, estado só por texto. |
| 4 | Quem vê o quê | **Toda a equipa vê todas as reuniões e pipelines; a agenda filtra-se por pessoa** (avatares no topo). Perfis: `admin` (gere equipa e pipelines) e `membro`. |
| 5 | Contas | **O admin cria os utilizadores com um script no MVP** (`npm run user:create`); convites por email ficam para a fase 2. Entrar com email + palavra-passe; "esqueci a palavra-passe" incluído. |
| 6 | Idioma | **Só português (pt-PT)**. Sem next-intl: poupa ~40 min. |
| 7 | Hospedagem | **Vercel + novo projeto Supabase** (mesma receita do Kingdom Library). Domínio a indicar (ex.: `ops.kingdomcompany.com`). |
| 8 | WhatsApp | **Botão "Enviar por WhatsApp"** na reunião e na ata, que abre o WhatsApp com o texto já escrito no formato que a equipa usa hoje. Preciso de **um exemplo da mensagem atual** para copiar o formato e garantir que o formulário tem os mesmos campos. |
| 9 | Pipelines iniciais | **Reuniões** (Agendado → Em curso → Adiada → Cancelada → Concluída), **Vendas** (Lead → Contactado → Proposta → Negociação → Ganho / Perdido), **Tarefas** (A fazer → Em curso → Bloqueada → Concluída). Os três nascem no seed; a equipa pode renomear/ordenar etapas. |
| 10 | Vários escritórios | **Não** (um só escritório = uma base de dados). Multi-empresa é fase 2. |
| 11 | Payflow | Não está neste repositório. **Envie o URL** (ou capturas do mobile) para o Skill UI extrair os padrões; sem isso uso só o Cal.com e as imagens enviadas. |
| 12 | Campos da ata | Lista na secção 6. Confirmar ou acrescentar. |

---

## 1. Âmbito: o que entra nas 5 horas

**Entra (MVP):**
- Entrar / sair; perfis da equipa (nome, função, foto, WhatsApp).
- Agenda: faixa semanal, lista do dia, filtro por pessoa, "Hoje".
- Reunião: criar/editar com data, hora, duração, local (presencial/online + morada ou link), pessoa (nome, cargo, telemóvel, email), empresa (nome, NUIT opcional, sector), assunto, responsável, participantes internos, notas. Partilhar por WhatsApp.
- Pipeline Kanban por pipeline, com as 5 etapas das reuniões; mudar de etapa por arrastar (desktop) ou por folha "Mover para" (telemóvel). Adiar pede nova data; cancelar pede motivo. Histórico de etapas no cartão.
- Atas: separador próprio, lista, formulário estruturado, sempre ligada a **uma** reunião (uma ata por reunião), estado rascunho/final, vista de impressão/PDF do browser, partilha por WhatsApp.
- Dashboard "Início": reuniões hoje e esta semana, por etapa, por pessoa, atas em falta, adiadas/canceladas nos últimos 30 dias, e (se existir) valor do pipeline de vendas por etapa.
- Três pipelines no seed; etapas editáveis (nome, ordem, cor) numa página simples de definições.
- Deploy em produção (Vercel + Supabase), com dados reais da equipa.

**Fica para a fase 2 (não cabe em 5 h):**
- Campos personalizados por pipeline ao estilo Pipefy (`pipeline_fields` + formulário dinâmico). No MVP o `kind` do pipeline decide os campos (reuniões / vendas / tarefas).
- Criar pipeline novo a partir de modelo na interface (no MVP é por seed/SQL).
- Convites por email, notificações/lembretes, anexos nas atas, comentários, pesquisa global, Google Calendar, vários escritórios, exportação.

**Ordem de corte se o tempo apertar** (do primeiro a sair ao último): editor de etapas → vista de impressão da ata → arrastar no Kanban (fica só "Mover para") → dashboard reduzido a 4 números → pipeline de Vendas só em seed, sem campos próprios.

---

## 2. Arquitetura

| Camada | Escolha | Notas |
|---|---|---|
| App | **Next.js 16 (App Router) + TypeScript**, em `ops/app` | Copiar o esqueleto de `members/app` (layout, Supabase SSR, `proxy.ts`, ESLint, Vitest, Playwright) e **apagar** gateway, emails, i18n, leitor, loja. |
| Estilo | **Tailwind v4** com os tokens do protótipo (`ops/DESIGN.md` → `tailwind-theme.css`) | Classes utilitárias `bg-canvas`, `text-ink`, `border-line`, etc., iguais às do Kingdom UI mas com a escala cinza. |
| Fonte | **Inter via `next/font/google`** | Pesos 400/500/600; `letter-spacing: -0.02em` nos títulos. |
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
| `pipelines` | `id`, `slug` (único), `name`, `kind` (`meetings`/`sales`/`tasks`/`custom`), `icon`, `position`, `created_by`, `archived_at` | `kind` decide os campos que o formulário mostra e os KPIs. |
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
| `/cards/[id]` | Cabeçalho (assunto, etapa em pill, responsável), 2 colunas: dados da pessoa/empresa + histórico; separadores **Detalhes · Ata** | Mesma informação em pilha; botão fixo "Mover para" | Botão "Enviar por WhatsApp". Separador Ata: cria ou abre a ata. |
| `/pipelines/[slug]` | Kanban com colunas por etapa, arrastar e largar, contador por coluna, filtro por pessoa | Controlo segmentado de etapas (deslizável) + lista; "Mover para" em folha inferior | Reuniões, Vendas e Tarefas usam o **mesmo** componente. |
| `/atas` | Tabela: reunião, data, empresa, estado, redigida por | Lista de cartões | Filtro rascunho/final; vazio: "Nenhuma ata. As atas nascem a partir de uma reunião concluída." |
| `/atas/new?card=` | Formulário por secções com listas repetíveis | Igual, uma secção por vez (acordeão) | Só a partir de um cartão; pré-preenchido. |
| `/atas/[id]` | Leitura limpa + "Imprimir / PDF" + "Marcar como final" | Igual | `/atas/[id]/print` sem shell. |
| `/team` | Grelha de perfis | Lista | Admin edita função/WhatsApp/ativo. |
| `/settings/pipelines/[slug]` | Lista de etapas: renomear, reordenar, cor, regras | Igual | Alvo de corte se faltar tempo. |

**Estados vazios, carregamento e erro** desenhados no protótipo para Agenda, Pipeline e Atas (o Impeccable exige).

---

## 5. Pipelines personalizáveis (como no Pipefy, mas em 5 h)

- **Hoje (MVP):** um pipeline = nome + tipo + etapas ordenadas com regras simples (concluída / perdida / exige nota / exige nova data). O tipo decide o formulário: `meetings` mostra data, hora, local, pessoa, empresa, assunto; `sales` mostra empresa, pessoa, valor, data prevista de fecho; `tasks` mostra título, responsável, prazo, descrição. A agenda e as atas só olham para pipelines `meetings`. O dashboard conta por etapa em qualquer pipeline e soma `value_cents` em `sales`.
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

## 8. Design e protótipo (passo seguinte, nesta sessão)

**Direção:** Operate mode (Impeccable). Cinza, preto e branco; superfícies brancas com borda `gray-200` e raio 12–16 px sobre canvas `gray-50/100`; texto `gray-900` / `gray-600` / `gray-400`; botão primário preto, pill; foco em anel `gray-900`. Hierarquia por peso e espaço, não por cor. Estados: ponto 8 px (verde `#15803d`, âmbar `#b45309`, vermelho `#b91c1c`, azul `#1d4ed8`) + rótulo; nada mais colorido. Modo escuro: `gray-950` canvas, `gray-900` superfícies (barato de incluir nos tokens; ligar se sobrar tempo).

**Tokens iniciais** (a afinar com o Skill UI): `canvas #f3f4f6`, `surface #ffffff`, `sunken #f9fafb`, `line #e5e7eb`, `line-strong #d1d5db`, `ink #111827`, `ink-2 #374151`, `muted #6b7280`, `faint #9ca3af`, `inverted #111827`, `on-inverted #ffffff`. Tipografia Inter: display 28/1.15/-0.02em 600, title 17/1.3 600, body 15/1.5 400, label 13.5 500, caption 12.5 400.

**Processo:**
1. `npx skillui --url https://cal.com` (+ URL do Payflow, se o enviar) → `ops/design-refs/` com tokens e capturas, só como referência (não entra no app).
2. Impeccable `init` (lê `ops/PRODUCT.md`) → `shape` (plano UX de cada ecrã, mobile primeiro) → construir o protótipo → `critique` + `audit` → `document` (gera `ops/DESIGN.md`) → `extract` (`tailwind-theme.css`).
3. Protótipo em **um ficheiro** (`ops/prototype/index.html`, gerado por `build.mjs` a partir de `src/`), com mapa de ecrãs e alternância desktop/telemóvel.

**Para o protótipo ser reaproveitado no front (pedido seu):**
- `src/styles.css`: tokens como CSS custom properties com os **mesmos nomes** que vão para o Tailwind; uma classe por componente (`.btn`, `.btn-primary`, `.card`, `.pill`, `.field`, `.week-strip`, `.day-chip`, `.kanban`, `.stage-col`, `.card-item`, `.sheet`, `.tabbar`, `.sidebar`, `.kpi`, `.bar`). Cada classe vira um componente React com o mesmo nome.
- `src/data.js`: dados de exemplo com **exatamente os nomes de campos do SQL** (secção 3): `cards.starts_at`, `contact_name`, `company_name`, `pipeline_stages.tone`, … O seed do Supabase nasce deste ficheiro.
- `src/app.js`: uma função por rota (`screenHome`, `screenAgenda`, `screenPipeline`, `screenCard`, `screenMinutesForm`, …) e componentes puros (`Pill(stage)`, `CardItem(card)`, `WeekStrip(date)`). Cada função corresponde a um `page.tsx`.
- Textos em pt-PT num único objeto `T` para o Opus os copiar para o app.

---

## 9. Plano das 5 horas (Opus 5.5)

Pré-requisitos antes de começar o relógio: protótipo aprovado, `ops/DESIGN.md`, projeto Supabase criado (URL + chaves), projeto Vercel ligado ao repositório com root `ops/app`, lista da equipa (nome, função, email, WhatsApp), exemplo de mensagem WhatsApp.

| Bloco | Tempo | Entrega | Aceita-se quando |
|---|---|---|---|
| **0. Fundação** | 0:00–0:40 | `ops/app` a partir do esqueleto de `members/app` sem gateway/emails/i18n; tokens e fonte; `AppShell` (sidebar + tab bar) do protótipo; migração `0001_schema.sql` (secção 3) + RLS + triggers + `move_card`; `seed.sql` (3 pipelines, perfis, 15 cartões, 2 atas); login; script `user:create` | Entro no preview em 390 e 1440 e vejo o shell com a agenda vazia. |
| **1. Agenda + reunião** | 0:40–1:40 | Faixa semanal, lista do dia, filtro por pessoa; formulário criar/editar (zod + Server Action); página do cartão com dados, etapa e histórico; "Enviar por WhatsApp" | Crio uma reunião no telemóvel, aparece na agenda do dia certo e em "Agendado". |
| **2. Pipeline** | 1:40–2:30 | Kanban com dnd-kit no desktop; segmentado + "Mover para" no telemóvel; adiar pede data, cancelar pede motivo; histórico atualizado; mesmo componente para Vendas e Tarefas | Movo um cartão nos dois dispositivos; recarregar mantém; o histórico mostra quem e quando. |
| **3. Atas** | 2:30–3:30 | Lista, formulário por secções com listas repetíveis, pré-preenchimento, rascunho/final, separador "Ata" no cartão, vista de impressão, partilha WhatsApp | Crio a ata de uma reunião concluída no telemóvel, abro-a a partir do cartão, imprimo em PDF. |
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

1. **Você:** responder à secção 0 (basta "ok" para os defaults), enviar o exemplo de mensagem WhatsApp e, se possível, o URL do Payflow.
2. **Eu (Fable), nesta sessão:** Skill UI → Impeccable → protótipo clicável em `ops/prototype/`, `ops/DESIGN.md`, atualização da secção 0 com as decisões tomadas.
3. **Você:** criar o projeto Supabase e o projeto Vercel (ou dar-me acesso para o fazer) e preparar a lista da equipa.
4. **Opus 5.5:** nova sessão com o prompt da secção 12.

---

## 12. Prompt de arranque para o Opus 5.5

```
Vais construir o Kingdom Ops em 5 horas. Lê, por esta ordem: docs/kingdom-ops/plano-desenvolvimento.md (todo), ops/PRODUCT.md, ops/DESIGN.md, ops/prototype/src/ (styles.css, data.js, app.js) e skills/members-platform/references/11-gotchas.md. O protótipo é a especificação visual e de dados: mesmos nomes de classes, campos e ecrãs.

Segue os blocos da secção 9 do plano, com os tempos e critérios de aceitação. No fim de cada bloco: typecheck, lint, testes, commit, push, preview. Se um bloco passar 15 minutos do limite, aplica a ordem de corte da secção 1 e diz-me o que cortaste. Não acrescentes funcionalidades fora da secção 1.

Começa pelo bloco 0: copia o esqueleto de members/app para ops/app, remove gateway, emails e i18n, aplica os tokens de ops/DESIGN.md e escreve a migração 0001 com o modelo da secção 3. Credenciais do Supabase e Vercel: [colar aqui]. Equipa inicial: [colar aqui]. Exemplo da mensagem WhatsApp: [colar aqui].

Fala comigo em português; código, commits e comentários em inglês.
```
