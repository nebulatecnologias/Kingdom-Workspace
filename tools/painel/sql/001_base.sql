-- Painel de gestão: estrutura base (multi-site). Todas as tabelas começam por painel_
-- para poderem viver ao lado de outro sistema no mesmo projecto Supabase.

create table if not exists public.painel_sites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nome text not null,
  dominio text,
  origens text[] not null default '{}',          -- domínios autorizados a enviar formulários
  chave text not null unique default encode(gen_random_bytes(18), 'hex'), -- chave pública da recolha
  cor text default '#2B2850',
  email_remetente text,                           -- ex.: contact@kingdomcompany.co.za
  nome_remetente text,
  criado_em timestamptz not null default now()
);

create table if not exists public.painel_membros (
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'comercial' check (papel in ('admin','comercial')),
  criado_em timestamptz not null default now(),
  primary key (site_id, user_id)
);

create table if not exists public.painel_contactos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  nome text,
  email text,
  telefone text,
  empresa text,
  cargo text,
  cidade text,
  origem text,                 -- google, instagram, directo, indicação...
  utm jsonb not null default '{}',
  etiquetas text[] not null default '{}',
  consentimento boolean not null default false,
  notas text,
  criado_em timestamptz not null default now(),
  actualizado_em timestamptz not null default now()
);
create unique index if not exists painel_contactos_email_uq on public.painel_contactos (site_id, lower(email)) where email is not null;
create index if not exists painel_contactos_site_idx on public.painel_contactos (site_id, criado_em desc);

create table if not exists public.painel_mensagens (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  contacto_id uuid references public.painel_contactos(id) on delete set null,
  tipo text not null default 'contacto' check (tipo in ('cotacao','avaliacao','contacto','newsletter','outro')),
  servico text,
  assunto text,
  corpo text,
  dados jsonb not null default '{}',
  pagina text,
  estado text not null default 'nova' check (estado in ('nova','lida','arquivada')),
  respondida_em timestamptz,
  criado_em timestamptz not null default now()
);
create index if not exists painel_mensagens_site_idx on public.painel_mensagens (site_id, criado_em desc);

create table if not exists public.painel_etapas (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  nome text not null,
  ordem int not null default 0,
  tipo text not null default 'aberta' check (tipo in ('aberta','ganha','perdida')),
  cor text
);

create table if not exists public.painel_oportunidades (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  contacto_id uuid references public.painel_contactos(id) on delete set null,
  etapa_id uuid references public.painel_etapas(id) on delete set null,
  titulo text not null,
  servico text,
  valor numeric(14,2),
  moeda text not null default 'MZN',
  responsavel uuid references auth.users(id) on delete set null,
  proxima_accao text,
  proxima_data date,
  bant jsonb not null default '{}',   -- {necessidade, autoridade, orcamento, prazo}
  ordem double precision not null default 0,
  mensagem_id uuid references public.painel_mensagens(id) on delete set null,
  motivo_perda text,
  criado_em timestamptz not null default now(),
  actualizado_em timestamptz not null default now(),
  fechado_em timestamptz
);
create index if not exists painel_oport_site_idx on public.painel_oportunidades (site_id, etapa_id, ordem);

create table if not exists public.painel_actividades (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  contacto_id uuid references public.painel_contactos(id) on delete cascade,
  oportunidade_id uuid references public.painel_oportunidades(id) on delete cascade,
  tipo text not null check (tipo in ('nota','email','chamada','reuniao','etapa','mensagem','sistema')),
  texto text,
  dados jsonb not null default '{}',
  autor uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index if not exists painel_activ_contacto_idx on public.painel_actividades (contacto_id, criado_em desc);
create index if not exists painel_activ_oport_idx on public.painel_actividades (oportunidade_id, criado_em desc);

create table if not exists public.painel_segmentos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  nome text not null,
  filtros jsonb not null default '{}',
  criado_em timestamptz not null default now()
);

create table if not exists public.painel_artigos (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  titulo text not null,
  resumo text,
  categoria text,
  ambito text,
  corpo_md text not null default '',
  capa_url text,
  seo_titulo text,
  seo_descricao text,
  estado text not null default 'rascunho' check (estado in ('rascunho','publicado')),
  publicado_em timestamptz,
  autor uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now(),
  actualizado_em timestamptz not null default now(),
  unique (site_id, slug)
);

-- Limite de envios por IP (só o servidor escreve)
create table if not exists public.painel_envios (
  id bigint generated always as identity primary key,
  site_id uuid references public.painel_sites(id) on delete cascade,
  ip_hash text not null,
  criado_em timestamptz not null default now()
);
create index if not exists painel_envios_ip_idx on public.painel_envios (ip_hash, criado_em desc);

-- actualizado_em automático
create or replace function public.painel_tocar() returns trigger language plpgsql set search_path = '' as $$
begin new.actualizado_em = now(); return new; end $$;
drop trigger if exists painel_contactos_tocar on public.painel_contactos;
create trigger painel_contactos_tocar before update on public.painel_contactos for each row execute function public.painel_tocar();
drop trigger if exists painel_oport_tocar on public.painel_oportunidades;
create trigger painel_oport_tocar before update on public.painel_oportunidades for each row execute function public.painel_tocar();
drop trigger if exists painel_artigos_tocar on public.painel_artigos;
create trigger painel_artigos_tocar before update on public.painel_artigos for each row execute function public.painel_tocar();

-- Permissões: só membros do site vêem e mexem nos dados desse site
create or replace function public.painel_membro(s uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.painel_membros m where m.site_id = s and m.user_id = (select auth.uid()))
$$;
create or replace function public.painel_admin(s uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.painel_membros m where m.site_id = s and m.user_id = (select auth.uid()) and m.papel = 'admin')
$$;
revoke execute on function public.painel_membro(uuid), public.painel_admin(uuid) from anon, public;
grant execute on function public.painel_membro(uuid), public.painel_admin(uuid) to authenticated;

alter table public.painel_sites enable row level security;
alter table public.painel_membros enable row level security;
alter table public.painel_contactos enable row level security;
alter table public.painel_mensagens enable row level security;
alter table public.painel_etapas enable row level security;
alter table public.painel_oportunidades enable row level security;
alter table public.painel_actividades enable row level security;
alter table public.painel_segmentos enable row level security;
alter table public.painel_artigos enable row level security;
alter table public.painel_envios enable row level security;  -- sem políticas: só o servidor

drop policy if exists painel_sites_ver on public.painel_sites;
create policy painel_sites_ver on public.painel_sites for select to authenticated using (public.painel_membro(id));
drop policy if exists painel_sites_editar on public.painel_sites;
create policy painel_sites_editar on public.painel_sites for update to authenticated using (public.painel_admin(id)) with check (public.painel_admin(id));

drop policy if exists painel_membros_ver on public.painel_membros;
create policy painel_membros_ver on public.painel_membros for select to authenticated using (public.painel_membro(site_id));
drop policy if exists painel_membros_gerir on public.painel_membros;
create policy painel_membros_gerir on public.painel_membros for all to authenticated using (public.painel_admin(site_id)) with check (public.painel_admin(site_id));

do $$
declare t text;
begin
  foreach t in array array['painel_contactos','painel_mensagens','painel_oportunidades','painel_actividades','painel_segmentos','painel_artigos'] loop
    execute format('drop policy if exists %1$s_membros on public.%1$s', t);
    execute format('create policy %1$s_membros on public.%1$s for all to authenticated using (public.painel_membro(site_id)) with check (public.painel_membro(site_id))', t);
  end loop;
end $$;

drop policy if exists painel_etapas_ver on public.painel_etapas;
create policy painel_etapas_ver on public.painel_etapas for select to authenticated using (public.painel_membro(site_id));
drop policy if exists painel_etapas_gerir on public.painel_etapas;
create policy painel_etapas_gerir on public.painel_etapas for all to authenticated using (public.painel_admin(site_id)) with check (public.painel_admin(site_id));

-- Artigos publicados podem ser lidos por qualquer um (para os sites os mostrarem no build)
drop policy if exists painel_artigos_publicos on public.painel_artigos;
create policy painel_artigos_publicos on public.painel_artigos for select to anon using (estado = 'publicado');

-- Etapas por defeito (processo comercial do playbook) para cada site novo
create or replace function public.painel_etapas_defeito() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.painel_etapas (site_id, nome, ordem, tipo, cor) values
    (new.id, 'Novo lead', 1, 'aberta', '#8A8FA8'),
    (new.id, 'Qualificação', 2, 'aberta', '#6C63D9'),
    (new.id, 'Reunião marcada', 3, 'aberta', '#3B82F6'),
    (new.id, 'Diagnóstico', 4, 'aberta', '#0EA5E9'),
    (new.id, 'Proposta', 5, 'aberta', '#F59E0B'),
    (new.id, 'Negociação', 6, 'aberta', '#F97316'),
    (new.id, 'Ganho', 7, 'ganha', '#16A34A'),
    (new.id, 'Perdido', 8, 'perdida', '#DC2626');
  return new;
end $$;
drop trigger if exists painel_sites_etapas on public.painel_sites;
create trigger painel_sites_etapas after insert on public.painel_sites for each row execute function public.painel_etapas_defeito();

-- Tempo real para a caixa de mensagens e o funil
do $$ begin
  begin alter publication supabase_realtime add table public.painel_mensagens; exception when others then null; end;
  begin alter publication supabase_realtime add table public.painel_oportunidades; exception when others then null; end;
end $$;

-- Funções de gatilho não ficam expostas na API
revoke execute on function public.painel_etapas_defeito() from anon, authenticated, public;
revoke execute on function public.painel_tocar() from anon, authenticated, public;
