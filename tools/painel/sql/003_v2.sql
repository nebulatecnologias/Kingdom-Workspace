-- Painel v2: análise do site, conversas (inbox + chat + email), tarefas, listas, regras de etapa.
-- Segue a especificação «CRM + Conversas» (Brevo), com tabelas prefixadas painel_ (projecto partilhado).

-- ---------- Utilitário: membro de um site (já existe painel_membro / painel_admin) ----------

-- ---------- 1. Agentes (presença para o chat) ----------
create table if not exists public.painel_agentes (
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  presenca text not null default 'offline' check (presenca in ('online','ausente','offline')),
  nome_exibicao text,
  visto_em timestamptz not null default now(),
  primary key (site_id, user_id)
);

-- ---------- 2. Definições do chat por site ----------
create table if not exists public.painel_chat_config (
  site_id uuid primary key references public.painel_sites(id) on delete cascade,
  activo boolean not null default true,
  cor text,                                   -- por defeito, a cor do site
  posicao text not null default 'direita' check (posicao in ('direita','esquerda')),
  saudacao text not null default 'Olá! Em que podemos ajudar?',
  mensagem_offline text not null default 'Neste momento não estamos online. Deixe o seu contacto e respondemos por email.',
  nome_equipa text,
  actualizado_em timestamptz not null default now()
);

-- ---------- 3. Visitantes, sessões e eventos (análise do site) ----------
create table if not exists public.painel_visitantes (          -- só existe com consentimento (identificador persistente)
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  contacto_id uuid references public.painel_contactos(id) on delete set null,
  criado_em timestamptz not null default now(),
  visto_em timestamptz not null default now(),
  primeira_origem text,
  primeira_utm jsonb not null default '{}',
  sessoes int not null default 0,
  paginas int not null default 0,
  banido boolean not null default false
);
create index if not exists painel_visitantes_site_idx on public.painel_visitantes (site_id, visto_em desc);

create table if not exists public.painel_sessoes (
  id uuid primary key,                                          -- gerado no browser (sessionStorage)
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  visitante_id uuid references public.painel_visitantes(id) on delete set null,
  hash_dia text not null,                                       -- anónimo: sha256(sal do dia + site + ip + browser)
  iniciada_em timestamptz not null default now(),
  visto_em timestamptz not null default now(),
  pagina_entrada text,
  pagina_actual text,
  referencia text,
  origem text not null default 'directo',                       -- canal: google, directo, instagram, facebook, linkedin, whatsapp, email, campanha, <domínio>
  utm jsonb not null default '{}',
  dispositivo text,                                             -- computador, telemovel, tablet
  navegador text,
  so text,
  idioma text,
  fuso text,
  pais text,
  paginas int not null default 0,
  converteu boolean not null default false
);
create index if not exists painel_sessoes_site_idx on public.painel_sessoes (site_id, iniciada_em desc);
create index if not exists painel_sessoes_vivo_idx on public.painel_sessoes (site_id, visto_em desc);

create table if not exists public.painel_eventos (
  id bigint generated always as identity primary key,
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  sessao_id uuid references public.painel_sessoes(id) on delete cascade,
  visitante_id uuid references public.painel_visitantes(id) on delete set null,
  tipo text not null check (tipo in ('pagina','clique','formulario','download','chat','outro')),
  nome text,                                                    -- ex.: cotacao, whatsapp, telefone, email, cta
  url text,
  titulo text,
  dados jsonb not null default '{}',
  criado_em timestamptz not null default now()
);
create index if not exists painel_eventos_site_idx on public.painel_eventos (site_id, criado_em desc);
create index if not exists painel_eventos_sessao_idx on public.painel_eventos (sessao_id, criado_em);

alter table public.painel_contactos add column if not exists responsavel uuid references auth.users(id) on delete set null;
alter table public.painel_contactos add column if not exists ultima_actividade_em timestamptz;

-- ---------- 4. Conversas (formulários, chat ao vivo e email) ----------
create table if not exists public.painel_conversas (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  canal text not null check (canal in ('formulario','chat','email')),
  estado text not null default 'aberta' check (estado in ('aberta','fechada')),
  contacto_id uuid references public.painel_contactos(id) on delete set null,
  visitante_id uuid references public.painel_visitantes(id) on delete set null,
  sessao_id uuid references public.painel_sessoes(id) on delete set null,
  responsavel uuid references auth.users(id) on delete set null,
  tipo_pedido text check (tipo_pedido in ('cotacao','avaliacao','contacto','newsletter','chat','outro')),
  servico text,
  assunto text,
  chave_publica uuid not null default gen_random_uuid(),       -- o widget só conhece esta chave
  token_email text not null unique default encode(gen_random_bytes(9), 'hex'), -- endereço de resposta c-<token>@...
  url_inicio text,
  ultima_em timestamptz,
  ultima_previa text,
  ultimo_autor text,
  nao_lidas int not null default 0,
  primeira_resposta_em timestamptz,
  avaliacao text check (avaliacao in ('boa','ma')),
  criado_em timestamptz not null default now(),
  fechada_em timestamptz,
  fechada_por uuid references auth.users(id) on delete set null
);
create index if not exists painel_conversas_inbox_idx on public.painel_conversas (site_id, estado, responsavel, ultima_em desc);
create index if not exists painel_conversas_chave_idx on public.painel_conversas (chave_publica);

create table if not exists public.painel_conversa_mensagens (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  conversa_id uuid not null references public.painel_conversas(id) on delete cascade,
  autor_tipo text not null check (autor_tipo in ('visitante','agente','sistema')),
  autor_id uuid references auth.users(id) on delete set null,
  interna boolean not null default false,                      -- comentário interno: nunca vai ao cliente
  corpo text,
  dados jsonb not null default '{}',                           -- campos do formulário, email (de, assunto, message-id)
  email_id text,
  estado_entrega text check (estado_entrega in ('pendente','enviado','falhou')),
  criado_em timestamptz not null default now()
);
create index if not exists painel_conv_msg_idx on public.painel_conversa_mensagens (conversa_id, criado_em);

-- Resumo da conversa, reabertura, não lidas, primeira resposta e linha do tempo
create or replace function public.painel_conv_msg_depois() returns trigger language plpgsql security definer set search_path = '' as $$
declare c public.painel_conversas;
begin
  if new.interna then return null; end if;
  update public.painel_conversas set
    ultima_em = new.criado_em,
    ultima_previa = left(coalesce(new.corpo, '[anexo]'), 140),
    ultimo_autor = new.autor_tipo,
    nao_lidas = case when new.autor_tipo = 'visitante' then nao_lidas + 1 when new.autor_tipo = 'agente' then 0 else nao_lidas end,
    primeira_resposta_em = case when new.autor_tipo = 'agente' and primeira_resposta_em is null then new.criado_em else primeira_resposta_em end,
    estado = case when new.autor_tipo = 'visitante' then 'aberta' else estado end,
    fechada_em = case when new.autor_tipo = 'visitante' then null else fechada_em end
  where id = new.conversa_id returning * into c;
  if c.contacto_id is not null then
    update public.painel_contactos set ultima_actividade_em = new.criado_em where id = c.contacto_id;
  end if;
  return null;
end $$;
drop trigger if exists painel_conv_msg_depois on public.painel_conversa_mensagens;
create trigger painel_conv_msg_depois after insert on public.painel_conversa_mensagens for each row execute function public.painel_conv_msg_depois();

create or replace function public.painel_conversa_historico() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.painel_actividades (site_id, contacto_id, tipo, texto, dados)
    values (new.site_id, new.contacto_id, 'mensagem', coalesce(new.assunto, 'Conversa iniciada'),
            jsonb_build_object('conversa_id', new.id, 'canal', new.canal, 'url', new.url_inicio));
  elsif new.estado = 'fechada' and old.estado = 'aberta' then
    new.fechada_em := coalesce(new.fechada_em, now());
    insert into public.painel_actividades (site_id, contacto_id, tipo, texto, dados, autor)
    values (new.site_id, new.contacto_id, 'sistema', 'Conversa fechada', jsonb_build_object('conversa_id', new.id), (select auth.uid()));
  end if;
  return new;
end $$;
drop trigger if exists painel_conversa_hist_ins on public.painel_conversas;
create trigger painel_conversa_hist_ins after insert on public.painel_conversas for each row execute function public.painel_conversa_historico();
drop trigger if exists painel_conversa_hist_upd on public.painel_conversas;
create trigger painel_conversa_hist_upd before update of estado on public.painel_conversas for each row execute function public.painel_conversa_historico();

-- ---------- 5. Negócios: probabilidade, regras de etapa, motivos de perda, histórico ----------
alter table public.painel_etapas add column if not exists probabilidade int check (probabilidade between 0 and 100);
alter table public.painel_etapas add column if not exists campos_obrigatorios text[] not null default '{}';

create table if not exists public.painel_motivos_perda (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  nome text not null,
  ordem int not null default 0
);

alter table public.painel_oportunidades add column if not exists data_fecho date;
alter table public.painel_oportunidades add column if not exists motivo_perda_id uuid references public.painel_motivos_perda(id) on delete set null;
alter table public.painel_oportunidades add column if not exists etapa_desde timestamptz not null default now();
alter table public.painel_oportunidades add column if not exists conversa_id uuid references public.painel_conversas(id) on delete set null;

create table if not exists public.painel_etapa_historico (
  id bigint generated always as identity primary key,
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  oportunidade_id uuid not null references public.painel_oportunidades(id) on delete cascade,
  de_etapa uuid references public.painel_etapas(id) on delete set null,
  para_etapa uuid references public.painel_etapas(id) on delete set null,
  por uuid references auth.users(id) on delete set null,
  em timestamptz not null default now(),
  segundos_anterior bigint
);
create index if not exists painel_etapa_hist_idx on public.painel_etapa_historico (oportunidade_id, em);

create or replace function public.painel_oport_antes() returns trigger language plpgsql set search_path = '' as $$
declare e public.painel_etapas; falta text[];
begin
  if tg_op = 'INSERT' or new.etapa_id is distinct from old.etapa_id then
    select * into e from public.painel_etapas where id = new.etapa_id;
    if e.id is not null then
      if e.site_id <> new.site_id then raise exception 'A etapa não pertence a este site'; end if;
      select array_agg(f) into falta from unnest(e.campos_obrigatorios) f
       where coalesce(to_jsonb(new) ->> f, '') = '';
      if falta is not null then
        raise exception 'Para mover para «%» falta preencher: %', e.nome,
          array_to_string(array(select case f when 'valor' then 'valor' when 'data_fecho' then 'data de fecho' when 'motivo_perda_id' then 'motivo de perda' else f end from unnest(falta) f), ', ')
          using errcode = 'P0001';
      end if;
      new.etapa_desde := now();
      new.fechado_em := case when e.tipo in ('ganha','perdida') then now() else null end;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists painel_oport_antes on public.painel_oportunidades;
create trigger painel_oport_antes before insert or update on public.painel_oportunidades for each row execute function public.painel_oport_antes();

create or replace function public.painel_oport_depois() returns trigger language plpgsql security definer set search_path = '' as $$
declare de uuid; secs bigint; n1 text; n2 text;
begin
  if tg_op = 'UPDATE' then
    if new.etapa_id is not distinct from old.etapa_id then return null; end if;
    de := old.etapa_id; secs := extract(epoch from now() - old.etapa_desde)::bigint;
  end if;
  insert into public.painel_etapa_historico (site_id, oportunidade_id, de_etapa, para_etapa, por, segundos_anterior)
  values (new.site_id, new.id, de, new.etapa_id, (select auth.uid()), secs);
  select nome into n1 from public.painel_etapas where id = de;
  select nome into n2 from public.painel_etapas where id = new.etapa_id;
  insert into public.painel_actividades (site_id, contacto_id, oportunidade_id, tipo, texto, autor, dados)
  values (new.site_id, new.contacto_id, new.id, 'etapa',
          case when tg_op = 'INSERT' then 'Negócio criado em «' || coalesce(n2, '?') || '»' else coalesce(n1, '?') || ' → ' || coalesce(n2, '?') end,
          (select auth.uid()), jsonb_build_object('de', de, 'para', new.etapa_id));
  return null;
end $$;
drop trigger if exists painel_oport_depois on public.painel_oportunidades;
create trigger painel_oport_depois after insert or update of etapa_id on public.painel_oportunidades for each row execute function public.painel_oport_depois();

-- ---------- 6. Tarefas ----------
create table if not exists public.painel_tarefas (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  tipo text not null default 'afazer' check (tipo in ('afazer','email','chamada','reuniao','prazo')),
  nome text not null,
  data_hora timestamptz not null,
  prioridade text not null default 'nenhuma' check (prioridade in ('nenhuma','baixa','media','alta')),
  notas text check (char_length(notas) <= 10000),
  responsavel uuid references auth.users(id) on delete set null,
  contacto_id uuid references public.painel_contactos(id) on delete cascade,
  oportunidade_id uuid references public.painel_oportunidades(id) on delete cascade,
  concluida_em timestamptz,
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index if not exists painel_tarefas_idx on public.painel_tarefas (site_id, concluida_em, data_hora);

-- ---------- 7. Listas (estáticas) ----------
create table if not exists public.painel_listas (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  nome varchar(255) not null,
  criado_em timestamptz not null default now()
);
create table if not exists public.painel_lista_membros (
  lista_id uuid not null references public.painel_listas(id) on delete cascade,
  contacto_id uuid not null references public.painel_contactos(id) on delete cascade,
  site_id uuid not null references public.painel_sites(id) on delete cascade,
  adicionado_em timestamptz not null default now(),
  primary key (lista_id, contacto_id)
);

-- ---------- 8. Actividades: novos tipos ----------
alter table public.painel_actividades drop constraint if exists painel_actividades_tipo_check;
alter table public.painel_actividades add constraint painel_actividades_tipo_check
  check (tipo in ('nota','email','chamada','reuniao','etapa','mensagem','sistema','tarefa','lista','web'));

-- ---------- 9. Segurança (RLS por site) ----------
do $$
declare t text;
begin
  foreach t in array array['painel_agentes','painel_chat_config','painel_visitantes','painel_sessoes','painel_eventos',
    'painel_conversas','painel_conversa_mensagens','painel_motivos_perda','painel_etapa_historico','painel_tarefas',
    'painel_listas','painel_lista_membros'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %1$s_membros on public.%1$s', t);
    execute format('create policy %1$s_membros on public.%1$s for all to authenticated using (public.painel_membro(site_id)) with check (public.painel_membro(site_id))', t);
  end loop;
end $$;

revoke execute on function public.painel_conv_msg_depois(), public.painel_conversa_historico(), public.painel_oport_antes(), public.painel_oport_depois() from anon, authenticated, public;

-- ---------- 10. Etapas e motivos por defeito (sites novos e existentes) ----------
create or replace function public.painel_etapas_defeito() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.painel_etapas (site_id, nome, ordem, tipo, cor, probabilidade, campos_obrigatorios) values
    (new.id, 'Novo lead', 1, 'aberta', '#8A8FA8', 10, '{}'),
    (new.id, 'Qualificação', 2, 'aberta', '#6C63D9', 20, '{}'),
    (new.id, 'Reunião marcada', 3, 'aberta', '#3B82F6', 40, '{}'),
    (new.id, 'Diagnóstico', 4, 'aberta', '#0EA5E9', 50, '{}'),
    (new.id, 'Proposta', 5, 'aberta', '#F59E0B', 60, '{valor}'),
    (new.id, 'Negociação', 6, 'aberta', '#F97316', 80, '{valor}'),
    (new.id, 'Ganho', 7, 'ganha', '#16A34A', 100, '{valor,data_fecho}'),
    (new.id, 'Perdido', 8, 'perdida', '#DC2626', 0, '{motivo_perda_id}');
  insert into public.painel_motivos_perda (site_id, nome, ordem) values
    (new.id, 'Preço', 1), (new.id, 'Escolheu outro fornecedor', 2), (new.id, 'Sem orçamento', 3),
    (new.id, 'Sem resposta', 4), (new.id, 'Adiou a decisão', 5);
  insert into public.painel_chat_config (site_id, nome_equipa) values (new.id, new.nome) on conflict do nothing;
  return new;
end $$;
revoke execute on function public.painel_etapas_defeito() from anon, authenticated, public;

update public.painel_etapas e set probabilidade = v.p, campos_obrigatorios = v.c
from (values ('Novo lead',10,'{}'::text[]),('Qualificação',20,'{}'),('Reunião marcada',40,'{}'),('Diagnóstico',50,'{}'),
             ('Proposta',60,'{valor}'),('Negociação',80,'{valor}'),('Ganho',100,'{valor,data_fecho}'),('Perdido',0,'{motivo_perda_id}')) v(n,p,c)
where e.nome = v.n and e.probabilidade is null;
insert into public.painel_motivos_perda (site_id, nome, ordem)
select s.id, m.n, m.o from public.painel_sites s,
  (values ('Preço',1),('Escolheu outro fornecedor',2),('Sem orçamento',3),('Sem resposta',4),('Adiou a decisão',5)) m(n,o)
where not exists (select 1 from public.painel_motivos_perda x where x.site_id = s.id);
insert into public.painel_chat_config (site_id, nome_equipa) select id, nome from public.painel_sites on conflict do nothing;

-- ---------- 11. Tempo real ----------
do $$ begin
  begin alter publication supabase_realtime add table public.painel_conversas; exception when others then null; end;
  begin alter publication supabase_realtime add table public.painel_conversa_mensagens; exception when others then null; end;
end $$;

-- ---------- 12. Análise do site (uma chamada devolve tudo para o dashboard) ----------
create or replace function public.painel_analise(p_site uuid, p_desde timestamptz, p_ate timestamptz)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare r jsonb; dur interval := p_ate - p_desde; antes_desde timestamptz := p_desde - (p_ate - p_desde);
begin
  if not public.painel_membro(p_site) then raise exception 'sem acesso'; end if;
  with s as (select * from public.painel_sessoes where site_id = p_site and iniciada_em >= p_desde and iniciada_em < p_ate),
       sa as (select * from public.painel_sessoes where site_id = p_site and iniciada_em >= antes_desde and iniciada_em < p_desde),
       ev as (select * from public.painel_eventos where site_id = p_site and criado_em >= p_desde and criado_em < p_ate),
       pv as (select * from ev where tipo = 'pagina'),
       pva as (select count(*) n from public.painel_eventos where site_id = p_site and tipo = 'pagina' and criado_em >= antes_desde and criado_em < p_desde)
  select jsonb_build_object(
    'totais', jsonb_build_object(
      'visitas', (select count(*) from s),
      'visitantes', (select count(distinct coalesce(visitante_id::text, hash_dia)) from s),
      'paginas', (select count(*) from pv),
      'duracao_media_s', (select coalesce(round(avg(extract(epoch from visto_em - iniciada_em))), 0) from s),
      'paginas_por_visita', (select coalesce(round(avg(paginas)::numeric, 2), 0) from s),
      'rejeicao_pct', (select coalesce(round(100.0 * count(*) filter (where paginas <= 1) / nullif(count(*), 0), 1), 0) from s),
      'conversoes', (select count(*) from s where converteu),
      'conversao_pct', (select coalesce(round(100.0 * count(*) filter (where converteu) / nullif(count(*), 0), 2), 0) from s)),
    'anterior', jsonb_build_object(
      'visitas', (select count(*) from sa),
      'visitantes', (select count(distinct coalesce(visitante_id::text, hash_dia)) from sa),
      'paginas', (select n from pva),
      'conversoes', (select count(*) from sa where converteu)),
    'serie', coalesce((select jsonb_agg(x order by x->>'dia') from (
        select jsonb_build_object('dia', to_char(d, 'YYYY-MM-DD'),
          'visitas', (select count(*) from s where (s.iniciada_em at time zone 'Africa/Maputo')::date = d::date),
          'visitantes', (select count(distinct coalesce(visitante_id::text, hash_dia)) from s where (s.iniciada_em at time zone 'Africa/Maputo')::date = d::date),
          'paginas', (select count(*) from pv where (pv.criado_em at time zone 'Africa/Maputo')::date = d::date)) x
        from generate_series((p_desde at time zone 'Africa/Maputo')::date, ((p_ate - interval '1 second') at time zone 'Africa/Maputo')::date, interval '1 day') d) q), '[]'),
    'origens', coalesce((select jsonb_agg(jsonb_build_object('origem', origem, 'visitas', n, 'conversoes', c) order by n desc)
        from (select origem, count(*) n, count(*) filter (where converteu) c from s group by origem) o), '[]'),
    'campanhas', coalesce((select jsonb_agg(jsonb_build_object('campanha', camp, 'origem', src, 'visitas', n) order by n desc)
        from (select utm->>'utm_campaign' camp, utm->>'utm_source' src, count(*) n from s where utm ? 'utm_campaign' group by 1, 2 limit 20) o), '[]'),
    'paginas_top', coalesce((select jsonb_agg(jsonb_build_object('url', url, 'titulo', titulo, 'vistas', n, 'visitantes', u) order by n desc)
        from (select url, max(titulo) titulo, count(*) n, count(distinct sessao_id) u from pv group by url order by count(*) desc limit 15) o), '[]'),
    'entradas', coalesce((select jsonb_agg(jsonb_build_object('url', pagina_entrada, 'visitas', n) order by n desc)
        from (select pagina_entrada, count(*) n from s group by 1 order by 2 desc limit 10) o), '[]'),
    'saidas', coalesce((select jsonb_agg(jsonb_build_object('url', pagina_actual, 'visitas', n) order by n desc)
        from (select pagina_actual, count(*) n from s group by 1 order by 2 desc limit 10) o), '[]'),
    'dispositivos', coalesce((select jsonb_agg(jsonb_build_object('nome', coalesce(dispositivo, 'desconhecido'), 'visitas', n) order by n desc)
        from (select dispositivo, count(*) n from s group by 1) o), '[]'),
    'navegadores', coalesce((select jsonb_agg(jsonb_build_object('nome', coalesce(navegador, 'desconhecido'), 'visitas', n) order by n desc)
        from (select navegador, count(*) n from s group by 1 order by 2 desc limit 8) o), '[]'),
    'paises', coalesce((select jsonb_agg(jsonb_build_object('nome', coalesce(pais, 'desconhecido'), 'visitas', n) order by n desc)
        from (select pais, count(*) n from s group by 1 order by 2 desc limit 10) o), '[]'),
    'accoes', coalesce((select jsonb_agg(jsonb_build_object('tipo', tipo, 'nome', nome, 'total', n, 'sessoes', u) order by n desc)
        from (select tipo, nome, count(*) n, count(distinct sessao_id) u from ev where tipo <> 'pagina' group by 1, 2 order by 3 desc limit 20) o), '[]'),
    'funil', jsonb_build_object(
      'visitas', (select count(*) from s),
      'viram_servico', (select count(distinct sessao_id) from pv where url ~ '^/(desenvolvimento-|assessoria|consultoria-|compliance-|treinamento-)'),
      'abriram_cotacao', (select count(distinct sessao_id) from pv where url like '/pedido-de-cotacao%'),
      'leads', (select count(*) from s where converteu)),
    'horas', coalesce((select jsonb_agg(jsonb_build_object('hora', h, 'visitas', n) order by h)
        from (select extract(hour from iniciada_em at time zone 'Africa/Maputo')::int h, count(*) n from s group by 1) o), '[]')
  ) into r;
  return r;
end $$;
revoke execute on function public.painel_analise(uuid, timestamptz, timestamptz) from anon, public;
grant execute on function public.painel_analise(uuid, timestamptz, timestamptz) to authenticated;

-- Visitantes no site agora (últimos 5 minutos)
create or replace function public.painel_ao_vivo(p_site uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.painel_membro(p_site) then raise exception 'sem acesso'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('sessao', s.id, 'visitante', s.visitante_id, 'pagina', s.pagina_actual,
      'origem', s.origem, 'dispositivo', s.dispositivo, 'navegador', s.navegador, 'pais', s.pais, 'paginas', s.paginas,
      'desde', s.iniciada_em, 'visto', s.visto_em,
      'contacto', (select jsonb_build_object('id', c.id, 'nome', c.nome, 'email', c.email) from public.painel_visitantes v join public.painel_contactos c on c.id = v.contacto_id where v.id = s.visitante_id),
      'em_conversa', exists (select 1 from public.painel_conversas k where k.sessao_id = s.id and k.estado = 'aberta' and k.canal = 'chat'))
    order by s.visto_em desc)
    from public.painel_sessoes s where s.site_id = p_site and s.visto_em > now() - interval '5 minutes'), '[]');
end $$;
revoke execute on function public.painel_ao_vivo(uuid) from anon, public;
grant execute on function public.painel_ao_vivo(uuid) to authenticated;

-- ---------- 13. Migrar as mensagens antigas para conversas ----------
insert into public.painel_conversas (site_id, canal, estado, contacto_id, tipo_pedido, servico, assunto, url_inicio, criado_em)
select m.site_id, 'formulario', case when m.estado = 'arquivada' then 'fechada' else 'aberta' end, m.contacto_id,
       case when m.tipo in ('cotacao','avaliacao','contacto','newsletter') then m.tipo else 'outro' end, m.servico, m.assunto, m.pagina, m.criado_em
from public.painel_mensagens m
where not exists (select 1 from public.painel_conversas c where c.site_id = m.site_id and c.criado_em = m.criado_em and c.assunto is not distinct from m.assunto);
insert into public.painel_conversa_mensagens (site_id, conversa_id, autor_tipo, corpo, dados, criado_em)
select c.site_id, c.id, 'visitante', m.corpo, m.dados, m.criado_em
from public.painel_mensagens m join public.painel_conversas c on c.site_id = m.site_id and c.criado_em = m.criado_em and c.assunto is not distinct from m.assunto
where not exists (select 1 from public.painel_conversa_mensagens x where x.conversa_id = c.id);
