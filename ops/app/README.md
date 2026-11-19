# Kingdom Ops

Reuniões, pipelines Kanban, atas e painel do escritório Kingdom. Next.js 16 + Supabase, na Vercel (projeto `kingdom-ops`, raiz `ops/app`, região `cpt1`). Só pt-PT. Plano: `docs/kingdom-ops/plano-desenvolvimento.md`; design: `ops/DESIGN.md`; protótipo: `ops/prototype/`.

## Criar ou ativar uma conta (admin)

Precisa da chave secreta do Supabase em `ops/app/.env.local` (`vercel env pull .env.local`, ou copie de Supabase → Project Settings → API keys).

```bash
cd ops/app
npm install
npm run user:create -- --email maria@kingdom.co.mz --name "Maria" --password "uma-palavra-passe-forte" \
  --role member --job "Assistente Comercial / Vendedora" --whatsapp "+258 84 000 0000"
```

- Se já existir um perfil com o mesmo `--name` (a equipa vem do seed com emails provisórios), essa conta recebe o email e a palavra-passe reais. Senão, cria uma conta nova.
- `--role admin` para quem gere a equipa, as etapas e os pipelines.
- A pessoa entra em `/login`. "Esqueci a palavra-passe" envia o link de recuperação do Supabase.
- Contas criadas noutro sítio (por exemplo, registo direto no Supabase) ficam **inativas** e não veem nada até um admin as ativar em Equipa.

## Desenvolver

```bash
cp .env.example .env.local   # URL + publishable key (+ secret key para user:create)
npm run dev
npm run typecheck && npx eslint src && npx vitest run   # antes de cada push
npm run db:test              # migrações + seed + 34 testes de BD num Postgres local
npm run db:seed:generate     # regenera ops/supabase/seed.sql a partir de ops/prototype/src/data.js
BASE_URL=http://localhost:3000 E2E_EMAIL=… E2E_PASSWORD=… npx playwright test --trace off   # 390 e 1440
```

## Base de dados

- Migrações em `ops/supabase/migrations` (aplicadas ao projeto `swisxnploerhnqymdheb` pelo MCP do Supabase).
- Dados de exemplo (cartões, histórico, atas): `ops/supabase/scripts/clear-demo.sql` apaga-os e mantém a equipa e os 5 pipelines.
- Regras: toda a equipa ativa lê tudo; cria e edita cartões e atas; só admins apagam e mudam pipelines/etapas. Uma ata por reunião; só quem a redigiu, o responsável da reunião ou um admin a marca como final.
