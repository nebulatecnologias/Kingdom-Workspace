# Kingdom Members — Plano de desenvolvimento

Referências:
- Produto: `members/PRODUCT.md`
- Design system: `members/DESIGN.md`
- Protótipo: `members/prototype/`
- Contrato com o gateway: `docs/kingdom-members/prompt-gateway-paystack.md`

---

## 1. Arquitetura

| Camada | Escolha | Notas |
|---|---|---|
| App | **Next.js (App Router) + TypeScript** | Server Components e Server Actions; runtime Node nas rotas de webhook |
| Estilo | **Tailwind v4** | Tokens copiados de `members/DESIGN.md` (CSS custom properties, tema claro e escuro) |
| Fonte | **Google Sans via `next/font`** | Alojada no próprio site, sem pedidos ao Google em runtime |
| Idiomas | **next-intl** (`en` por defeito = en-ZA, `pt`, `es`) | O idioma vem do perfil; antes do login usa cookie ou `Accept-Language`. URLs sem prefixo de idioma |
| Base de dados | **Supabase Postgres** | Migrações SQL versionadas; RLS em todas as tabelas |
| Autenticação | **Supabase Auth** (email + palavra-passe, e link por email) | Os links por email são gerados no servidor (`admin.generateLink`) e enviados pela Resend, com modelos traduzidos |
| Ficheiros | **Supabase Storage**, bucket privado `products` | Downloads por URL assinada de 60 s, só depois de verificar o direito de acesso |
| Email | **Resend + React Email** | 1 componente por email × 3 idiomas; domínio com SPF, DKIM e DMARC |
| Alojamento | **Vercel (Pro)** | Região de funções o mais perto possível da África do Sul (confirmar `cpt1`); Vercel Cron para retries |
| Observabilidade | Sentry + logs Vercel | Alertas quando o webhook falha ou há assinaturas rejeitadas |

Estrutura no repositório:

```
members/
  app/            Next.js (src/app, src/lib, src/emails, src/i18n)
  supabase/       migrations/, seed.sql, config.toml
  prototype/      protótipo clicável (referência visual)
  PRODUCT.md  DESIGN.md
```

---

## 2. Modelo de dados

| Tabela | Campos principais | Notas |
|---|---|---|
| `profiles` | `id` (= auth.users.id), `full_name`, `email`, `locale`, `role` (`member`/`admin`), `status` (`active`/`deactivated`), `terms_accepted_at`, `created_at`, `last_seen_at` | Criada por trigger quando nasce um utilizador |
| `sections` | `id`, `slug`, `sort_order`; `section_translations` (`section_id`, `locale`, `name`) | Secções da vitrine (ex.: Para crianças, Para pregadores, Vida cristã) |
| `products` | `id`, `slug`, `type` (`colouring`/`book`/`guide`/`workbook`, extensível), `section_id`, `gateway_product_id` (único), `price_cents`, `currency` (`ZAR`), `access` (`paid`/`free`), `visibility` (`visible`/`soon`/`hidden`), `sort_order`, `cover_path`, `field_colour`, `page_count`, `free_sample` (bool) | Controla a vitrine; o `type` decide a página e o leitor |
| `product_translations` | `product_id`, `locale`, `title`, `description`, `verse`, `verse_ref` | PK (`product_id`, `locale`); se faltar uma tradução, usa `en` |
| `product_pages` | `id`, `product_id`, `position`, `locale` (nulo = todos), `pdf_path`, `preview_path`, `lineart_path`, `title` por idioma | Packs de colorir e apostilas: uma página por linha |
| `product_chapters` | `id`, `product_id`, `locale`, `position`, `title`, `body_html`, `minutes`, `is_sample` | eBooks e guias: capítulos/passos para o leitor online |
| `product_files` | `product_id`, `locale`, `format` (`pdf`/`epub`), `path`, `size_bytes` | Downloads completos |
| `reading_progress` | `user_id`, `product_id`, `chapter_position`, `updated_at` | "Continuar a ler" e estados lido/a ler |
| `entitlements` | `id`, `user_id` (nulo até existir conta), `email`, `product_id`, `source` (`order`/`manual`/`free`), `order_id`, `granted_at`, `revoked_at`, `revoked_reason` | Único ativo por (utilizador ou email, produto) |
| `invites` | `id`, `email`, `full_name`, `locale`, `token_hash` (único), `product_ids[]`, `status` (`sent`/`opened`/`accepted`/`expired`/`revoked`), `expires_at`, `opened_at`, `accepted_at`, `source` (`gateway`/`manual`), `order_id`, `created_by` | O token em claro nunca é guardado |
| `orders` | `id`, `gateway_order_id` (único), `reference`, `email`, `user_id`, `amount_cents`, `currency`, `refunded_cents`, `status` (`paid`/`refunded`/`partially_refunded`/`disputed`/`dispute_lost`), `locale`, `raw` jsonb | Espelho das vendas do gateway |
| `webhook_events` | `event_id` (PK), `type`, `received_at`, `signature_ok`, `result` (`processed`/`duplicate`/`rejected`/`error`), `error`, `payload` jsonb | Idempotência e log de entregas |
| `email_log` | `id`, `to`, `template`, `locale`, `status`, `provider_id`, `attempts`, `next_attempt_at` | Um cron reenvia as falhas |
| `integration_secrets` | `id`, `name`, `secret_current`, `secret_previous`, `previous_valid_until` | Rotação com 24 h de graça |
| `audit_log` | `id`, `actor_id`, `action`, `target_type`, `target_id`, `meta`, `at` | Todas as ações do admin |

**Regras de acesso (RLS):**
- O membro lê o próprio perfil, os seus direitos de acesso, a sua leitura e os produtos cuja `visibility` ≠ `hidden`. Os capítulos só são legíveis com direito de acesso ou quando `is_sample` = verdadeiro.
- As escritas sensíveis passam só por Server Actions com service role.
- O admin é validado pela função `is_admin()`.

**Funções SQL:**
- `consume_invite(token_hash)`: `SELECT … FOR UPDATE`, valida o estado e a data, marca como aceite; atómica.
- `link_entitlements(user_id, email)`: associa à conta os direitos de acesso que foram criados só com email.

---

## 3. Fluxos críticos

### 3.1 Compra → convite → conta
1. O gateway envia `order.paid` para `POST /api/webhooks/gateway`.
2. O recetor:
   - lê o corpo cru;
   - valida `X-Kingdom-Signature` (`t=…,v1=…`; HMAC-SHA256 de `"<t>.<body>"`; tolerância de 5 min; aceita o segredo anterior durante a rotação);
   - insere em `webhook_events`. Se o `event_id` já existir, responde 200 com `duplicate`.
3. Grava ou atualiza o pedido e converte cada `items[].product_id` em produto através de `products.gateway_product_id`.
4. Com o produto identificado:
   - Se `metadata.member_user_id` existir, ou se já houver perfil com esse email: dá acesso e envia o email "novo na sua biblioteca".
   - Caso contrário: cria direitos de acesso só com o email, cria (ou atualiza) o convite pendente desse email e envia o convite no `locale` do checkout.
5. Responde 200 depressa. Se o envio do email falhar, o erro fica em `email_log` para retry; nunca faz falhar o webhook.

### 3.2 Aceitar convite
- **Abrir o link.** `GET /invite/[token]` calcula o hash, confirma que o convite está válido, marca `opened_at` e mostra o formulário. Abrir **não** consome o convite, porque os scanners de email abrem os links antes do cliente.
- **Submeter o formulário.** A Server Action:
  - chama `consume_invite`;
  - cria o utilizador (`admin.createUser`, `email_confirm: true`, palavra-passe opcional);
  - chama `link_entitlements`;
  - abre sessão (com palavra-passe: `signInWithPassword`; sem palavra-passe: `generateLink` + `verifyOtp` no servidor);
  - redireciona para `/library?welcome=1`.
- **Links inválidos.** Um convite expirado mostra `/invite/expired`; um já usado mostra `/invite/used`. Ambos têm o formulário "enviar novo link".

### 3.3 Entrar
- **Link por email.** `requestLink(email)` responde sempre com a mesma mensagem (não revela se a conta existe). Se a conta existir, `generateLink('magiclink')` gera o link e a Resend envia o email no idioma do perfil. A rota `/auth/confirm` chama `verifyOtp` com o `token_hash`.
- **Palavra-passe.** `signInWithPassword`. "Esqueci a palavra-passe" usa `generateLink('recovery')` e o nosso email traduzido; `/auth/reset` define a nova.
- **"Pedir novo link"** (página pública). Se houver direitos de acesso sem conta para o email, gera um convite novo e revoga o anterior. Se houver conta, envia um link de entrada. A resposta é sempre a mesma.

### 3.4 Produto bloqueado → pagamento → desbloqueio
1. O cadeado aponta para `GET /api/checkout/[productId]`. Essa rota redireciona para o `checkout_url` do produto, com `email`, `name`, `locale`, `ref=<user_id>` e `return_url=/purchase/return?product=…`.
2. `/purchase/return` mostra "a confirmar pagamento…" e consulta o direito de acesso durante até 60 s. Quando o webhook chega, abre o produto. Se não chegar, mostra "vai receber um email quando confirmarmos".

### 3.5 Reembolsos e disputas
- `order.refunded` com `full_refund: true` → revoga os direitos de acesso dessa venda (`revoked_reason: refund`).
- Reembolso parcial → regista e sinaliza ao admin (decisão pendente: revogar ou não).
- `order.disputed` → suspende o acesso (configurável).
- `order.dispute_resolved` com `won` → repõe; com `lost` → revoga.

### 3.6 Downloads, leitura e colorir online
- **Leitor online** (eBooks, guias): capítulos em HTML guardados em `product_chapters` e servidos pelo servidor só a quem tem acesso (ou só o capítulo de amostra). Guarda o progresso em `reading_progress`. Tamanho de letra ajustável; funciona bem no telemóvel.
- `GET /api/products/[id]/download?format=&page=` confirma o direito de acesso e redireciona para uma URL assinada de 60 s.
- **Colorir online.** A pintura por regiões funciona com line art em **SVG** (como no protótipo) ou com **PNG + flood fill em canvas**. Decidir o formato das artes: com PNG funciona com qualquer desenho.
- **Marca d'água com o email do comprador** (fase posterior): pdf-lib no servidor, com cache.

---

## 4. Rotas

**Públicas**
- `/login`, `/auth/confirm`, `/auth/reset`
- `/invite/[token]`, `/invite/expired`, `/invite/used`, `/access`
- `/legal/terms`, `/legal/privacy`

**Membro**
- `/library`, `/products/[slug]`, `/products/[slug]/read/[chapter]`, `/products/[slug]/colour/[page]`
- `/purchase/return`, `/profile`

**Admin**
- `/admin`, `/admin/invites`, `/admin/members`, `/admin/members/[id]`
- `/admin/showcase`, `/admin/sections`, `/admin/products/[id]`, `/admin/integrations`, `/admin/settings`

**API**
- `/api/webhooks/gateway`
- `/api/checkout/[productId]`
- `/api/products/[id]/download`
- `/api/cron/email-retry`, `/api/cron/expire-invites`

---

## 5. Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URLs nos emails e redirects |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Só no servidor |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | Envio de emails |
| `GATEWAY_WEBHOOK_SECRET` | Semente inicial; depois fica em `integration_secrets` |
| `GATEWAY_CHECKOUT_BASE_URL`, `CHECKOUT_RETURN_ALLOWLIST` | Checkout de produtos bloqueados |
| `INVITE_TTL_DAYS` | Validade dos convites (7 por defeito) |
| `CRON_SECRET` | Protege as rotas de cron |
| `SENTRY_DSN` | Monitorização |
| `SUPPORT_WHATSAPP`, `SUPPORT_EMAIL` | Ajuda |

---

## 6. Fases

Em cada fase: mensagens de commit claras, testes a passar e revisão antes de avançar.

### Fase 0 — Fundação
- Criar o projeto `members/app` (Next.js, TS, ESLint, Prettier).
- Tailwind com os tokens do DESIGN.md; Google Sans via `next/font`.
- next-intl com os ficheiros `en`, `pt`, `es` (migrar o `i18n.js` do protótipo) e um teste que falha se faltarem chaves.
- Supabase: projeto de staging e de produção; CLI local; primeira migração com todas as tabelas, RLS e funções; seed com os produtos de exemplo (colorir, eBook, guia, apostila) e as 3 secções.
- Vercel: projeto, variáveis de ambiente, previews por branch.
- Resend: domínio verificado (SPF, DKIM, DMARC).
- CI no GitHub Actions: lint, typecheck, testes unitários, testes de BD e E2E nos previews.
- **Critério de aceite:** a app corre localmente e em preview com o layout base (sidebar, top bar, tab bar) igual ao protótipo.

### Fase 1 — Autenticação e convites
- Componentes base: botões, pills, cards, inputs, seletor de idioma, toasts, diálogos e drawers.
- Fluxos 3.2 e 3.3 completos, incluindo os estados de erro.
- Emails traduzidos: convite, link de entrada, reposição de palavra-passe.
- Middleware de proteção de `/library`, `/profile` e `/admin`, com a verificação de função no servidor.
- Rate limit em entrar, pedir link e aceitar convite.
- **Critério de aceite:** um convite criado no seed leva à conta e à biblioteca. O link não funciona uma segunda vez e expira na data certa. O login funciona por link e por palavra-passe nos 3 idiomas.

### Fase 2 — Integração com o gateway
- Recetor do webhook (3.1) com assinatura, idempotência e tratamento de `order.*` e `integration.test`.
- Reembolsos e disputas (3.5).
- `email_log` com retry por cron; cron que marca convites expirados.
- Testes de contrato com os payloads de exemplo do gateway; script `simulate-webhook` para desenvolvimento.
- **Critério de aceite:** um `order.paid` simulado gera convite e email. Enviar o mesmo evento 2× não duplica nada. Uma assinatura inválida é rejeitada e registada. Um reembolso total retira o acesso.
- **Dependência:** o gateway a enviar eventos no formato do contrato (pode avançar em paralelo com a Fase 3).

### Fase 3 — Área do membro
- Biblioteca: vitrine por secções, filtros, produtos com e sem acesso, "continuar a ler".
- Página do produto por tipo:
  - Colorir: páginas, download individual e completo, colorir online.
  - eBook/guia/apostila: índice, leitor online com progresso, amostra grátis, download PDF/EPUB.
- Perfil: nome, idioma, palavra-passe, exportar e apagar dados (POPIA).
- Ajuda com WhatsApp e email.
- **Critério de aceite:** o fluxo do protótipo reproduzido com dados reais. Os downloads só funcionam para quem tem acesso (testado também com URL direta). Lighthouse mobile ≥ 90 em performance e acessibilidade.

### Fase 4 — Admin
- Visão geral: KPIs reais, próximo convite a expirar, feed de atividade.
- Convites: lista, filtros, criar manualmente, reenviar, copiar link (gera um token novo), revogar.
- Membros: lista, detalhe, dar e retirar produtos, enviar link de entrada, desativar.
- Vitrine: arrastar para ordenar, visibilidade, acesso, pré-visualização.
- Secções: criar, renomear (3 idiomas) e ordenar.
- Editor do produto: tipo, secção, traduções, conteúdo por tipo (páginas com pré-visualizações geradas, ou ficheiros PDF/EPUB + capítulos + amostra grátis), preço, ID do gateway, link de checkout.
- Integrações: URL, segredo (mostrar e rodar), mapeamento de produtos, log de entregas, evento de teste.
- Todas as ações ficam em `audit_log`. Recomendado: 2FA (TOTP) para contas admin.
- **Critério de aceite:** o admin gere tudo sem mexer na BD, e cada ação aparece no registo.

### Fase 5 — Checkout de produtos bloqueados
- Fluxo 3.4 completo, com email "novo na sua biblioteca".
- **Critério de aceite:** num pagamento de teste do Paystack (modo test) iniciado pelo cadeado, o produto desbloqueia na conta certa, mesmo que o email do checkout seja diferente.

### Fase 6 — Qualidade e lançamento
- Revisão de segurança (RLS, service role, headers CSP, rate limits, uploads).
- Acessibilidade AA, incluindo a decisão sobre o contraste do laranja.
- Testes E2E (Playwright) dos 5 fluxos críticos, em telemóvel e desktop.
- Performance em rede 3G.
- Documentos: política de privacidade, termos, Information Officer (POPIA).
- Backups (PITR) e monitorização com alertas.
- Runbook de suporte: reenviar convite, corrigir email, dar acesso manual.
- Soft launch com uma compra real em modo live, depois o lançamento.

### Depois do lançamento (backlog)
- Marca d'água nos PDFs; PWA com acesso offline aos produtos descarregados.
- Novos tipos de produto: áudio (pregações), vídeo-aulas, planos de leitura.
- Notificações por WhatsApp.
- Integração com email marketing (mesmos eventos).
- Analytics de produtos mais vistos e desbloqueados; cupões e bundles; subscrição mensal.

---

## 7. Testes

- **Unitários:**
  - assinatura HMAC (válida, inválida, fora da janela, segredo anterior);
  - geração e hash de tokens;
  - mapeamento de produtos;
  - formatação ZAR e datas por idioma;
  - paridade das chaves de tradução.
- **Base de dados:**
  - políticas RLS (o membro não lê o que não é dele);
  - `consume_invite` com 2 pedidos em simultâneo (só um ganha).
- **E2E:**
  1. compra → convite → conta → biblioteca;
  2. entrar por link;
  3. link expirado → novo link;
  4. produto bloqueado → pagamento → desbloqueio;
  5. reembolso → acesso retirado.

---

## 8. Decisões pendentes

1. Domínio de produção (ex.: `members.<marca>.co.za`) e endereço remetente dos emails.
2. Região do Supabase (confirmar a mais próxima da África do Sul disponível) e plano (Free → Pro para backups PITR).
3. Reembolso parcial: retirar ou manter o acesso?
4. Disputa aberta: suspender já ou só se a disputa for perdida?
5. Validade do convite: 7 dias?
6. ~~Formato das artes para colorir online: SVG ou PNG.~~ **Resolvido na fase 3:** o estúdio aceita os dois. As ilustrações SVG com zonas pintam-se zona a zona; qualquer imagem (PNG, JPG ou SVG) pinta-se com um balde de tinta que pára nas linhas.
6b. Formato dos livros: capítulos em texto (Word/Google Docs → leitor online + PDF/EPUB gerados) ou só PDF pronto (mais simples, sem leitor com progresso). **Resolvido na fase 3:** a app suporta os dois. Um produto pode ter capítulos para o leitor online (com progresso e amostra) e/ou ficheiros PDF/EPUB para descarregar.
7. Contraste do laranja dos botões: manter fiel à referência ou escurecer para AA.
8. Número de WhatsApp de suporte e email de ajuda.
9. ~~Mais do que um administrador? Exigir 2FA no admin?~~ **Resolvido na fase 4:** pode haver vários administradores. A verificação em dois passos (app autenticadora) é opcional mas recomendada no painel; quando está ativa, é exigida para entrar no admin e para a base de dados reconhecer a sessão como admin.
10. Quem envia o recibo de pagamento: o gateway (recomendado) ou a área de membros.
