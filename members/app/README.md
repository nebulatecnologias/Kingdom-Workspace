# Kingdom Members: app

Área de membros da Kingdom: Next.js 16 (App Router), Supabase, Tailwind v4 com o design system Kingdom UI, e interface em 3 idiomas (inglês da África do Sul, português, espanhol).

Plano completo em `docs/kingdom-members/plano-desenvolvimento.md`. O protótipo de referência está em `members/prototype/`.

## Estrutura

| Caminho | O que é |
|---|---|
| `src/app/(member)` | Área do membro: biblioteca, produto, perfil |
| `src/app/(admin)` | Administração: visão geral, convites, membros, vitrine, integrações |
| `src/app/(auth)` | Entrar, convite, links expirados |
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

## Base de dados (Supabase)

- **Migrações:** `members/supabase/migrations/`. Aplicar com `npx supabase db push`, depois de `npx supabase link --project-ref <ref>`.
- **Dados de exemplo:** `members/supabase/seed.sql` é gerado a partir do protótipo com `npm run db:seed:generate`. Substituir pelos produtos reais antes do lançamento.
- **Contas:** só são criadas a partir de convites; o registo público está desligado em `config.toml`.
- **Primeiro administrador:** depois de criar a sua conta, corra no editor SQL:
  ```sql
  update public.profiles set role = 'admin' where email = 'o-seu-email@dominio.co.za';
  ```
