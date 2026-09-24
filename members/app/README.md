# Kingdom Members: app

Área de membros da Kingdom: Next.js 16 (App Router), Supabase, Tailwind v4 com o design system Kingdom UI, e interface em 3 idiomas (inglês da África do Sul, português, espanhol).

Plano completo em `docs/kingdom-members/plano-desenvolvimento.md`. O protótipo de referência está em `members/prototype/`.

## Estrutura

| Caminho | O que é |
|---|---|
| `src/app/(member)` | Área do membro: biblioteca, produto, perfil |
| `src/app/(admin)` | Administração: visão geral, convites, membros, vitrine, integrações |
| `src/app/(auth)` | Entrar (link ou palavra-passe), convite, confirmar link, repor palavra-passe, pedir novo link |
| `src/components/shell` | `AppShell` (menu lateral + barra inferior no telemóvel) e `AuthShell` |
| `src/components/ui` | Botões, pills, logótipo, seletor de idioma |
| `src/styles/kingdom-ui.css` | Estilos do design system. Mantenha este ficheiro igual a `skills/kingdom-design-system/assets/kingdom-ui.css` |
| `src/i18n` | Resolução do idioma (perfil → cookie → navegador → inglês) e a ação que troca de idioma |
| `messages/{en,pt,es}.json` | Textos da interface. Um teste obriga os 3 ficheiros a terem as mesmas chaves |
| `src/lib/supabase` | Clientes Supabase: servidor (com sessão), browser e admin (service role, só no servidor) |
| `../supabase` | Configuração, migrações, seed e testes da base de dados |

## Correr localmente

```bash
cd members/app
cp .env.example .env.local   # preencher com as chaves do Supabase
npm install
npm run dev                  # http://localhost:3000
```

Sem chaves do Supabase a app arranca na mesma: as páginas mostram o layout vazio.

## Verificações

```bash
npm run lint
npm run typecheck
npm test            # traduções, idioma, formatação de rand
npm run build
npm run db:test     # schema + seed + regras de acesso num PostgreSQL temporário (precisa de PostgreSQL 15+ instalado)
```

O GitHub Actions (`.github/workflows/members.yml`) corre tudo isto em cada push que mexa em `members/`.

## Convites e entrada (fase 1)

- **Criar um convite à mão** (até o painel de administração existir):
  ```bash
  npm run invite:create -- --email ana@exemplo.co.za --name "Ana" --products noah,money --locale en
  ```
  O link é enviado por email e também aparece no terminal. `--ttl-days N` muda a validade (por omissão `INVITE_TTL_DAYS`, 7 dias).
- **Emails sem Resend:** sem `RESEND_API_KEY` (ou com `KM_DEV_MAILBOX=true`) os emails não saem. Ficam guardados na tabela `email_log` e aparecem em http://localhost:3000/dev/mailbox. Em produção, defina `RESEND_API_KEY` e `EMAIL_FROM` com um domínio verificado no Resend.
- **Links de uso único:** abrir o link não o gasta (os antivírus de email abrem os links antes da pessoa). O convite só é consumido quando a conta é criada. Os links de entrada por email pedem um clique num botão pelo mesmo motivo.
- **Testes de ponta a ponta:** `npm run e2e` precisa de um Supabase local (`npx supabase start` em `members/`) e das chaves dele em `.env.local`. O GitHub Actions corre-os em cada push.

## Produção

| Serviço | Onde |
|---|---|
| Site | Vercel, projeto `kingdom-members` (equipa Nebula Tecnologias): https://kingdom-members.vercel.app. Pasta `members/app`, funções em Londres (`lhr1`) |
| Base de dados e contas | Supabase, projeto `inaxsnghgzfaarjsbljh` (região `eu-west-2`, Londres) |
| Emails | Resend, domínio `kingdomcompny.com`, remetente `members@kingdomcompny.com`. O domínio é partilhado com outras apps: esta app usa uma chave própria só de envio (`Kingdom Members (Vercel)`) e não altera o domínio |

Variáveis no Vercel: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chave publicável), `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `INVITE_TTL_DAYS`, `SUPPORT_EMAIL`, `SUPPORT_WHATSAPP`, `CRON_SECRET`, `GATEWAY_WEBHOOK_SECRET`, `GATEWAY_ACCEPT_TEST_EVENTS` e `DISPUTE_SUSPENDS_ACCESS`. Depois de mudar uma variável, é preciso publicar de novo.

## Área do membro (fase 3)

- **Biblioteca** (`/library`): vitrine por secções, com filtros "Tudo", "A minha biblioteca" e "Desbloquear mais", pesquisa na barra de cima e "Continuar a ler". Os produtos aparecem comprados, grátis, bloqueados (com o preço) ou "em breve"; os escondidos nunca aparecem.
- **Produto** (`/products/[slug]`):
  - **Colorir:** páginas A4, download de cada página, download completo (quando há PDF) e colorir online.
  - **eBook, guia e apostila:** índice com o progresso, leitor online (`/read/[n]`), amostra grátis para quem não comprou, e download PDF/EPUB (quando há ficheiros).
- **Colorir online** (`/colour/[n]`): toque numa zona para a pintar; as cores ficam guardadas no dispositivo e o desenho pode ser descarregado em PNG. Funciona com as ilustrações de exemplo (SVG) e com qualquer imagem carregada (PNG, JPG ou SVG), pintada com um balde de tinta que pára nas linhas.
- **Downloads** (`/api/products/[id]/download`): o acesso é verificado com a sessão do membro antes de gerar um link do Supabase Storage válido por 60 segundos. Sem acesso, a resposta é 403, mesmo com o URL direto; sem sessão, é 401.
- **Cadeado** (`/api/checkout/[id]`): leva ao `checkout_url` do produto com o email, o nome, o idioma e o ID do membro, para o pagamento desbloquear esta conta. Sem `checkout_url`, mostra um aviso na página do produto.
- **Perfil** (`/profile`): nome, idioma (guardado no perfil e usado nos emails), palavra-passe, descarregar os dados (JSON) e apagar a conta (POPIA: apaga o perfil, o acesso, o progresso, os convites e o histórico de emails; os pedidos ficam, sem ligação à conta, por obrigação fiscal).
- **Ilustrações de exemplo:** `src/lib/art.ts` tem as ilustrações do protótipo. Um produto ou página usa-as com `builtin:<nome>` em `cover_path` / `lineart_path`; os produtos reais usam caminhos do bucket privado `products`.

## Administração (fase 4)

Só para contas com `role = admin` (ativas). Todas as ações ficam no registo (`audit_log`) e aparecem em **Atividade** (`/admin/activity`, o sino no topo).

- **Visão geral** (`/admin`): membros, convites pendentes e desbloqueios do mês (com vendas), com a evolução das últimas 5 semanas; o próximo convite a expirar com contagem decrescente e "Reenviar"; os convites à espera; a atividade recente.
- **Convites** (`/admin/invites`): filtros por estado, pesquisa, criar à mão ("Novo convite": email, nome, idioma, validade de 3/7/14 dias e produtos), reenviar, copiar um link novo (o anterior deixa de funcionar) e revogar. Se o email já tem conta, os produtos entram logo na biblioteca e a pessoa recebe o email "novo na sua biblioteca". Revogar retira os produtos dados à mão com esse convite enquanto ninguém os usa; compras nunca são tocadas.
- **Membros** (`/admin/members`): lista com pesquisa; na ficha de cada membro, ligar/desligar cada produto, ver as encomendas, enviar um link de entrada, desativar/reativar (bloqueia a entrada e esconde a biblioteca; as compras ficam) e repor a verificação em dois passos de outro admin.
- **Vitrine** (`/admin/showcase`): ordem dos produtos (arrastar, ou setas do teclado na pega), secção e visibilidade (visível, em breve, oculto) de cada produto, secções com nomes em EN/PT/ES, e pré-visualização da biblioteca.
- **Editor do produto** (`/admin/products/[id]`, novo em `/admin/products/new`):
  - **Detalhes:** tipo, secção, título, descrição e versículo por idioma, endereço web, cor de fundo e capa.
  - **Conteúdo:** ficheiros PDF/EPUB por idioma; páginas para colorir (PNG/JPG, com pré-visualizações geradas no browser) ou capítulos com texto em Markdown simples, tempo de leitura calculado e amostra grátis.
  - **Venda e acesso:** preço, pago/grátis, ID do produto no gateway, link de checkout e visibilidade. Um produto só pode ser apagado enquanto ninguém o tem.
  - Os ficheiros vão do browser diretamente para o bucket privado `products` com um link de carregamento de uso único; a app confirma que o ficheiro existe antes de o registar.
- **Integrações** (`/admin/integrations`): URL do webhook, segredo de assinatura (colar o que o gateway mostra; ao substituir, o anterior continua aceite 24 horas; "Mostrar" fica registado), eventos, "Enviar evento de teste" (assina um `integration.test` e envia-o ao próprio webhook), mapeamento dos produtos com os IDs em falta, produtos desconhecidos vistos em pagamentos recentes, e as últimas entregas.
- **Verificação em dois passos** (`/admin/security`): app autenticadora (TOTP). Com ela ativa, o admin passa por `/auth/verify` depois da palavra-passe, e a base de dados só o trata como admin numa sessão verificada (`is_admin()` exige `aal2`). Se um admin perder o telemóvel, outro admin repõe na ficha de membro; se for o único, apague o fator no painel do Supabase (Authentication → Users).

## Supabase local sem Docker

Para correr a app e os testes de ponta a ponta numa máquina sem Docker (como os ambientes do Claude Code na web):

```bash
members/supabase/lite/start.sh          # Postgres + auth (GoTrue) + API (PostgREST) em http://127.0.0.1:54321
cd members/app
set -a; . ./.env.lite; set +a
npm run build && npm run e2e            # ou npm run dev
members/supabase/lite/stop.sh
```

Não inclui o Storage: os testes dos downloads e dos carregamentos de ficheiros são saltados aqui e correm no CI, que usa o Supabase completo.

## Gateway de pagamento (fase 2)

- **Endpoint:** `POST /api/webhooks/gateway`. Em produção, registe `https://kingdom-members.vercel.app/api/webhooks/gateway` na aba "Integrações" do gateway e cole o segredo de assinatura (`whsec_…`) em **Admin → Integrações** (ou na variável `GATEWAY_WEBHOOK_SECRET` no Vercel, que também é aceite).
- **O que faz com cada evento:**

  | Evento | Efeito |
  |---|---|
  | `order.paid` | Dá acesso aos produtos, identificados pelo campo "ID do produto no gateway". Quem ainda não tem conta recebe o convite; quem já tem recebe o email "novo na sua biblioteca". Uma compra feita pelo cadeado (`metadata.member_user_id`) vai para a conta desse membro, mesmo com outro email no checkout |
  | `order.refunded` | Reembolso total: retira o acesso dessa compra. Reembolso parcial: mantém o acesso e fica registado |
  | `order.disputed` | Suspende o acesso dessa compra. Com `DISPUTE_SUSPENDS_ACCESS=false`, só o retira se a disputa for perdida |
  | `order.dispute_resolved` | `won`: devolve o acesso; `lost`: retira-o de vez |
  | `integration.test` | Só confirma a receção |

- **Garantias:**
  - assinatura HMAC-SHA256 verificada, com tolerância de 5 minutos;
  - o mesmo evento entregue duas vezes não repete nada;
  - uma compra reembolsada nunca volta a ser desbloqueada por um evento atrasado;
  - tudo fica registado em `webhook_events` e `audit_log`.
- **Testar sem pagar:**
  ```bash
  npm run webhook:simulate -- --type paid --email ana@exemplo.co.za --products prod_noah_ark --locale pt
  npm run webhook:simulate -- --type refunded --order <id devolvido acima> --email ana@exemplo.co.za
  ```
  O script assina o evento com `GATEWAY_WEBHOOK_SECRET`. Com `--url` envia para outro endereço, por exemplo o de produção.
- **Tarefas diárias** (Vercel Cron, protegidas por `CRON_SECRET`):
  - `/api/cron/expire-invites` marca os convites expirados e limpa os limites de tentativas;
  - `/api/cron/email-retry` volta a enviar os emails que falharam. Isto também acontece depois de cada webhook.

## Base de dados (Supabase)

- **Migrações:** `members/supabase/migrations/`. O workflow `.github/workflows/members-supabase-deploy.yml` aplica-as no projeto Supabase alojado sempre que mudam, e também desliga o registo público, fixa a validade dos links em 15 minutos e exige palavras-passe de 8 ou mais caracteres. Precisa de 3 segredos do repositório: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` e `SUPABASE_DB_PASSWORD`. A variável opcional `KM_SITE_URL` define o endereço do site e os redirecionamentos permitidos. À mão: `npx supabase link --project-ref <ref>` e depois `npx supabase db push`.
- **Dados de exemplo:** `members/supabase/seed.sql` é gerado a partir do protótipo com `npm run db:seed:generate`. Substituir pelos produtos reais antes do lançamento.
- **Contas:** só são criadas a partir de convites; o registo público está desligado em `config.toml`.
- **Primeiro administrador:** depois de criar a sua conta, corra no editor SQL:
  ```sql
  update public.profiles set role = 'admin' where email = 'o-seu-email@dominio.co.za';
  ```
