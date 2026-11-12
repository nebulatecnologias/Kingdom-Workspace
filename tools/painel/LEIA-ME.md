# Painel de gestão

Painel para sites de empresas de serviços: caixa de mensagens do site, contactos (CRM), segmentos,
funil em Kanban, blog e definições. Um só código serve vários sites: cada registo pertence a um site
(`painel_sites`) e cada utilizador só vê os sites de que é membro (`painel_membros`).

## Peças

| Pasta | O que é |
|---|---|
| `sql/001_base.sql` | Tabelas `painel_*`, permissões (RLS por site) e as 8 etapas do funil criadas para cada site novo |
| `funcoes/painel-recolher` | Função do Supabase que recebe os formulários (sem login; valida a chave do site, a origem, uma armadilha para robôs e um limite de 6 envios por IP em 10 minutos) |
| `funcoes/painel-email` | Função que envia emails a partir do painel, via Resend, e regista-os na ficha do contacto |
| `recolha/recolha.js` | Peça que cada site inclui para enviar formulários e guardar a origem do lead (UTM, referência, página de entrada) |
| `app/` | A aplicação do painel (estática, publicada na Vercel). `app/assets/js/config.js` tem o endereço e a chave pública do Supabase |

## Instalação actual (Kingdom e DT)

- Supabase: projecto **Payflow Platform** (`epqfotzxrcyligwpauwk`), tabelas com o prefixo `painel_`, ao lado das do Payflow, sem as tocar.
- Painel: `painel.kingdomcompany.co.za` (projecto Vercel `kingdom-painel`).
- Sites: `kingdom-company` e `dt-company` em `painel_sites`. Os dois sites incluem `/assets/painel-recolha.js`.
- Segredo das funções: `PAINEL_RESEND_API_KEY` (chave da Resend com acesso de envio). Os domínios de envio
  `kingdomcompany.co.za` e `dtcompany.co.za` têm de estar verificados na Resend.

## Ligar um site novo ao painel

1. Criar o site (o gatilho cria as etapas do funil):
   ```sql
   insert into painel_sites (slug, nome, dominio, origens, cor, email_remetente, nome_remetente)
   values ('cliente-x', 'Cliente X', 'www.clientex.co.mz',
           array['https://www.clientex.co.mz', 'https://clientex.co.mz'], '#123456',
           'geral@clientex.co.mz', 'Cliente X')
   returning chave;
   ```
2. Dar acesso a quem vai usar o painel (a conta tem de existir no Supabase Auth):
   ```sql
   insert into painel_membros (site_id, user_id, papel)
   select s.id, u.id, 'admin' from painel_sites s, auth.users u
   where s.slug = 'cliente-x' and lower(u.email) = lower('pessoa@clientex.co.mz');
   ```
3. Copiar `recolha/recolha.js` para o site (ex.: `/assets/painel-recolha.js`) e incluí-lo antes do script do site:
   ```html
   <script src="/assets/painel-recolha.js?v=1" data-site="CHAVE" data-api="https://<projecto>.supabase.co/functions/v1/painel-recolher" defer></script>
   ```
4. Nos formulários, ou se põe `data-painel="cotacao|avaliacao|contacto|newsletter"` no `<form>` (envio automático,
   com os eventos `painel:enviado` e `painel:erro`), ou se chama `window.Painel.enviar({...})` no código do site,
   mantendo o email como alternativa quando o envio falha (é o que fazem a Kingdom e a DT).
5. Para enviar emails do painel: adicionar o domínio do cliente na Resend, pedir ao cliente os registos DNS e verificar.

## Instalar para um cliente com dados separados

Para um cliente cujos dados não devem ficar no mesmo projecto: criar um projecto Supabase só para ele,
correr `sql/001_base.sql`, publicar as duas funções (`painel-recolher` sem verificação de JWT, `painel-email` com),
definir o segredo `PAINEL_RESEND_API_KEY`, e publicar `app/` noutro projecto Vercel com o `config.js` desse cliente.
