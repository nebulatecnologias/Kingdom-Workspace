-- Kingdom Ops — migration 0001: schema, row-level security, triggers and functions.
-- Model: docs/kingdom-ops/plano-desenvolvimento.md §3. A meeting is a card in a pipeline of kind 'meetings'.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'member' check (role in ('admin', 'member')),
  job_title text,
  phone_whatsapp text,
  avatar_url text,
  color text,
  -- New accounts start inactive: an admin (npm run user:create) activates them. Self sign-ups see nothing.
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  kind text not null check (kind in ('meetings', 'sales', 'projects', 'campaigns', 'tasks', 'custom')),
  icon text not null default 'kanban',
  position int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines (id) on delete cascade,
  name text not null,
  position int not null default 0,
  tone text not null default 'neutral' check (tone in ('neutral', 'info', 'warning', 'danger', 'success')),
  is_done boolean not null default false,
  is_lost boolean not null default false,
  requires_note boolean not null default false,
  requires_reschedule boolean not null default false
);
create index pipeline_stages_pipeline_idx on public.pipeline_stages (pipeline_id, position);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references public.pipelines (id) on delete cascade,
  stage_id uuid not null references public.pipeline_stages (id),
  title text not null check (length(trim(title)) > 0),
  owner_id uuid references public.profiles (id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  all_day boolean not null default false,
  location_kind text check (location_kind in ('in_person', 'online', 'phone')),
  location text,
  contact_name text,
  contact_role text,
  contact_phone text,
  contact_email text,
  company_name text,
  company_tax_id text,
  company_sector text,
  value_cents bigint check (value_cents is null or value_cents >= 0),
  due_at timestamptz,
  description text,
  fields jsonb not null default '{}'::jsonb,
  position int not null default 0,
  stage_changed_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
create index cards_board_idx on public.cards (pipeline_id, stage_id, position);
create index cards_starts_idx on public.cards (starts_at);
create index cards_owner_starts_idx on public.cards (owner_id, starts_at);
create index cards_stage_idx on public.cards (stage_id);

create table public.card_participants (
  card_id uuid not null references public.cards (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (card_id, profile_id)
);
create index card_participants_profile_idx on public.card_participants (profile_id);

create table public.card_activity (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in ('created', 'stage_changed', 'rescheduled', 'updated', 'minutes_created', 'minutes_finalized')),
  from_stage_id uuid references public.pipeline_stages (id) on delete set null,
  to_stage_id uuid references public.pipeline_stages (id) on delete set null,
  note text,
  at timestamptz not null default now()
);
create index card_activity_card_idx on public.card_activity (card_id, at desc);
create index card_activity_at_idx on public.card_activity (at);

create table public.minutes (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null unique references public.cards (id) on delete cascade,
  title text,
  held_at date,
  started_at time,
  ended_at time,
  location text,
  attendees jsonb not null default '[]'::jsonb,
  agenda jsonb not null default '[]'::jsonb,
  decisions jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  next_steps text,
  next_meeting_at timestamptz,
  written_by uuid references public.profiles (id) on delete set null,
  approved_by uuid references public.profiles (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'final')),
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index minutes_written_by_idx on public.minutes (written_by);
create index minutes_approved_by_idx on public.minutes (approved_by);
create index pipelines_created_by_idx on public.pipelines (created_by);
create index cards_created_by_idx on public.cards (created_by);
create index card_activity_actor_idx on public.card_activity (actor_id);
create index card_activity_from_idx on public.card_activity (from_stage_id);
create index card_activity_to_idx on public.card_activity (to_stage_id);

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create function public.is_active_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and active)
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and active and role = 'admin')
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- New auth user -> inactive member profile. Role and activation are set by the admin script.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Members may edit their own name/contact, never their role or activation.
create function public.guard_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is not null and not public.is_admin()
     and (new.role is distinct from old.role or new.active is distinct from old.active) then
    raise exception 'only_admin_can_change_role' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile();

-- Cards: default stage, stage must belong to the pipeline, defaults for author and position.
create function public.cards_before_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.stage_id is null then
      select id into new.stage_id from public.pipeline_stages
       where pipeline_id = new.pipeline_id order by position limit 1;
    end if;
    new.created_by := coalesce(new.created_by, (select auth.uid()));
    if new.position = 0 then
      select coalesce(max(position), 0) + 1 into new.position from public.cards where stage_id = new.stage_id;
    end if;
  elsif new.stage_id is distinct from old.stage_id then
    new.stage_changed_at := now();
  end if;
  if not exists (select 1 from public.pipeline_stages where id = new.stage_id and pipeline_id = new.pipeline_id) then
    raise exception 'stage_not_in_pipeline' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger cards_before_write before insert or update on public.cards
  for each row execute function public.cards_before_write();
create trigger cards_updated_at before update on public.cards
  for each row execute function public.set_updated_at();

-- History: every creation, stage change and new date is logged. move_card passes its note through
-- the transaction-local setting ops.move_note. The seed sets ops.skip_activity to load history as is.
create function public.cards_log_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_note text := nullif(current_setting('ops.move_note', true), '');
  v_type text;
begin
  if coalesce(current_setting('ops.skip_activity', true), '') = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    insert into public.card_activity (card_id, actor_id, type, to_stage_id)
    values (new.id, (select auth.uid()), 'created', new.stage_id);
    return new;
  end if;
  if new.stage_id is distinct from old.stage_id or new.starts_at is distinct from old.starts_at then
    v_type := case
      when new.starts_at is distinct from old.starts_at and old.starts_at is not null then 'rescheduled'
      else 'stage_changed' end;
    if new.stage_id is not distinct from old.stage_id and new.starts_at is distinct from old.starts_at and old.starts_at is null then
      return new;
    end if;
    insert into public.card_activity (card_id, actor_id, type, from_stage_id, to_stage_id, note)
    values (new.id, (select auth.uid()), v_type,
            case when new.stage_id is distinct from old.stage_id then old.stage_id end,
            case when new.stage_id is distinct from old.stage_id then new.stage_id end,
            v_note);
  elsif (to_jsonb(new) - array['position', 'stage_changed_at', 'updated_at'])
        is distinct from (to_jsonb(old) - array['position', 'stage_changed_at', 'updated_at']) then
    insert into public.card_activity (card_id, actor_id, type) values (new.id, (select auth.uid()), 'updated');
  end if;
  return new;
end $$;
create trigger cards_log_activity after insert or update on public.cards
  for each row execute function public.cards_log_activity();

-- Minutes: only for meetings; pre-filled from the card; finalisation rules.
create function public.minutes_before_write() returns trigger
language plpgsql set search_path = '' as $$
declare
  c public.cards;
  v_kind text;
  v_uid uuid := (select auth.uid());
begin
  select * into c from public.cards where id = new.card_id;
  select kind into v_kind from public.pipelines where id = c.pipeline_id;
  if v_kind is distinct from 'meetings' then
    raise exception 'minutes_need_meeting' using errcode = '23514';
  end if;
  if tg_op = 'INSERT' then
    new.written_by := coalesce(new.written_by, v_uid);
    new.title := coalesce(nullif(new.title, ''), c.title);
    if c.starts_at is not null then
      new.held_at := coalesce(new.held_at, (c.starts_at at time zone 'Africa/Maputo')::date);
      new.started_at := coalesce(new.started_at, (c.starts_at at time zone 'Africa/Maputo')::time);
    end if;
    if c.ends_at is not null then
      new.ended_at := coalesce(new.ended_at, (c.ends_at at time zone 'Africa/Maputo')::time);
    end if;
    new.location := coalesce(new.location, case c.location_kind when 'online' then 'Online' when 'phone' then 'Chamada' else c.location end);
    if new.attendees = '[]'::jsonb then
      new.attendees := (
        select coalesce(jsonb_agg(a), '[]'::jsonb) from (
          select jsonb_build_object('name', c.contact_name, 'org', coalesce(c.company_name, ''), 'role', coalesce(c.contact_role, ''), 'present', true) as a
           where coalesce(c.contact_name, '') <> ''
          union all
          select jsonb_build_object('name', p.full_name, 'org', 'Kingdom', 'role', coalesce(p.job_title, ''), 'present', true)
            from public.profiles p
           where p.id = c.owner_id
              or p.id in (select profile_id from public.card_participants where card_id = c.id)
        ) s
      );
    end if;
  else
    new.card_id := old.card_id;
  end if;
  if new.status = 'final' and (tg_op = 'INSERT' or old.status <> 'final') then
    if v_uid is not null and not (v_uid = new.written_by or v_uid = c.owner_id or public.is_admin()) then
      raise exception 'only_author_owner_or_admin_can_finalize' using errcode = '42501';
    end if;
    new.finalized_at := coalesce(new.finalized_at, now());
  elsif new.status = 'draft' then
    new.finalized_at := null;
  end if;
  return new;
end $$;
create trigger minutes_before_write before insert or update on public.minutes
  for each row execute function public.minutes_before_write();
create trigger minutes_updated_at before update on public.minutes
  for each row execute function public.set_updated_at();

create function public.minutes_log_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(current_setting('ops.skip_activity', true), '') = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    insert into public.card_activity (card_id, actor_id, type) values (new.card_id, (select auth.uid()), 'minutes_created');
  end if;
  if new.status = 'final' and (tg_op = 'INSERT' or old.status <> 'final') then
    insert into public.card_activity (card_id, actor_id, type) values (new.card_id, (select auth.uid()), 'minutes_finalized');
  end if;
  return new;
end $$;
create trigger minutes_log_activity after insert or update on public.minutes
  for each row execute function public.minutes_log_activity();

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------
-- Moves a card to a stage (and position), enforcing the stage rules, and renumbers both columns.
create function public.move_card(
  p_card_id uuid,
  p_stage_id uuid,
  p_position int default null,
  p_note text default null,
  p_new_starts_at timestamptz default null
) returns public.cards
language plpgsql set search_path = '' as $$
declare
  c public.cards;
  s public.pipeline_stages;
  v_duration interval;
  v_pos int;
  v_from uuid;
begin
  if (select auth.uid()) is not null and not public.is_active_member() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  select * into c from public.cards where id = p_card_id for update;
  if not found then raise exception 'card_not_found' using errcode = 'P0002'; end if;
  select * into s from public.pipeline_stages where id = p_stage_id;
  if not found or s.pipeline_id <> c.pipeline_id then
    raise exception 'stage_not_in_pipeline' using errcode = '23514';
  end if;
  if s.id <> c.stage_id and s.requires_note and coalesce(trim(p_note), '') = '' then
    raise exception 'note_required' using errcode = '23514';
  end if;
  if s.id <> c.stage_id and s.requires_reschedule and p_new_starts_at is null then
    raise exception 'reschedule_required' using errcode = '23514';
  end if;

  v_from := c.stage_id;
  v_pos := coalesce(p_position, (select coalesce(max(position), 0) + 1 from public.cards where stage_id = s.id and id <> c.id));
  -- Make room in the target column.
  update public.cards set position = position + 1
   where stage_id = s.id and id <> c.id and position >= v_pos;

  perform set_config('ops.move_note', coalesce(p_note, ''), true);
  v_duration := case when c.starts_at is not null and c.ends_at is not null then c.ends_at - c.starts_at end;
  update public.cards
     set stage_id = s.id,
         position = v_pos,
         starts_at = coalesce(p_new_starts_at, starts_at),
         ends_at = case when p_new_starts_at is not null and v_duration is not null then p_new_starts_at + v_duration else ends_at end
   where id = c.id
   returning * into c;
  perform set_config('ops.move_note', '', true);

  -- Renumber the source and target columns 1..n.
  update public.cards t set position = r.rn
    from (select id, row_number() over (partition by stage_id order by position, created_at) as rn
            from public.cards where stage_id in (s.id, v_from)) r
   where t.id = r.id and t.position <> r.rn;
  select * into c from public.cards where id = p_card_id;
  return c;
end $$;

-- Templates for new pipelines (data, not code). Stage spec: name, tone, done, lost, note, reschedule.
create function public.pipeline_template(p_kind text) returns jsonb
language sql immutable set search_path = '' as $$
  select case p_kind
    when 'meetings' then '{"name":"Reuniões","icon":"calendar","stages":[["Agendado","neutral",false,false,false,false],["Em curso","info",false,false,false,false],["Adiada","warning",false,false,false,true],["Cancelada","danger",false,true,true,false],["Concluída","success",true,false,false,false]]}'
    when 'sales' then '{"name":"Vendas","icon":"target","stages":[["Lead","neutral",false,false,false,false],["Contactado","neutral",false,false,false,false],["Proposta","info",false,false,false,false],["Negociação","warning",false,false,false,false],["Ganho","success",true,false,false,false],["Perdido","danger",false,true,true,false]]}'
    when 'projects' then '{"name":"Projetos","icon":"briefcase","stages":[["Kickoff","neutral",false,false,false,false],["Em curso","info",false,false,false,false],["Em revisão","info",false,false,false,false],["Bloqueado","warning",false,false,true,false],["Entregue","success",true,false,false,false]]}'
    when 'campaigns' then '{"name":"Campanhas","icon":"megaphone","stages":[["Ideia","neutral",false,false,false,false],["Planeamento","neutral",false,false,false,false],["Em produção","info",false,false,false,false],["No ar","success",false,false,false,false],["Terminada","neutral",true,false,false,false]]}'
    when 'tasks' then '{"name":"Tarefas","icon":"check-square","stages":[["A fazer","neutral",false,false,false,false],["Em curso","info",false,false,false,false],["Bloqueada","warning",false,false,true,false],["Concluída","success",true,false,false,false]]}'
    when 'custom' then '{"name":"Recrutamento","icon":"users","stages":[["Candidatura","neutral",false,false,false,false],["Entrevista","info",false,false,false,false],["Proposta","warning",false,false,false,false],["Contratado","success",true,false,false,false],["Recusado","danger",false,true,true,false]]}'
  end::jsonb
$$;

create function public.slugify(p_text text) returns text
language sql immutable set search_path = '' as $$
  select trim(both '-' from regexp_replace(
    translate(lower(p_text), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn'),
    '[^a-z0-9]+', '-', 'g'))
$$;

create function public.create_pipeline_from_template(p_kind text, p_name text default null) returns public.pipelines
language plpgsql set search_path = '' as $$
declare
  t jsonb := public.pipeline_template(p_kind);
  p public.pipelines;
  v_slug text;
  v_name text;
  st jsonb;
  i int := 0;
begin
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'only_admin' using errcode = '42501';
  end if;
  if t is null then raise exception 'unknown_template' using errcode = '22023'; end if;
  v_name := coalesce(nullif(trim(p_name), ''), t ->> 'name');
  v_slug := public.slugify(v_name);
  if v_slug = '' then v_slug := 'pipeline'; end if;
  while exists (select 1 from public.pipelines where slug = v_slug) loop
    i := i + 1;
    v_slug := public.slugify(v_name) || '-' || (i + 1);
  end loop;
  insert into public.pipelines (slug, name, kind, icon, position, created_by)
  values (v_slug, v_name, p_kind, t ->> 'icon',
          (select coalesce(max(position), 0) + 1 from public.pipelines), (select auth.uid()))
  returning * into p;
  i := 0;
  for st in select * from jsonb_array_elements(t -> 'stages') loop
    i := i + 1;
    insert into public.pipeline_stages (pipeline_id, name, position, tone, is_done, is_lost, requires_note, requires_reschedule)
    values (p.id, st ->> 0, i, st ->> 1, (st ->> 2)::boolean, (st ->> 3)::boolean, (st ->> 4)::boolean, (st ->> 5)::boolean);
  end loop;
  return p;
end $$;

-- ---------------------------------------------------------------------------
-- Row-level security: the whole (active) team reads everything; admins manage structure and delete.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.pipelines enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.cards enable row level security;
alter table public.card_participants enable row level security;
alter table public.card_activity enable row level security;
alter table public.minutes enable row level security;

create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_active_member()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_admin_insert on public.profiles for insert to authenticated with check ((select public.is_admin()));
create policy profiles_admin_delete on public.profiles for delete to authenticated using ((select public.is_admin()));

create policy pipelines_read on public.pipelines for select to authenticated using ((select public.is_active_member()));
create policy pipelines_admin_insert on public.pipelines for insert to authenticated with check ((select public.is_admin()));
create policy pipelines_admin_update on public.pipelines for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy pipelines_admin_delete on public.pipelines for delete to authenticated using ((select public.is_admin()));

create policy stages_read on public.pipeline_stages for select to authenticated using ((select public.is_active_member()));
create policy stages_admin_insert on public.pipeline_stages for insert to authenticated with check ((select public.is_admin()));
create policy stages_admin_update on public.pipeline_stages for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy stages_admin_delete on public.pipeline_stages for delete to authenticated using ((select public.is_admin()));

create policy cards_read on public.cards for select to authenticated using ((select public.is_active_member()));
create policy cards_insert on public.cards for insert to authenticated with check ((select public.is_active_member()));
create policy cards_update on public.cards for update to authenticated using ((select public.is_active_member())) with check ((select public.is_active_member()));
create policy cards_admin_delete on public.cards for delete to authenticated using ((select public.is_admin()));

create policy participants_read on public.card_participants for select to authenticated using ((select public.is_active_member()));
create policy participants_insert on public.card_participants for insert to authenticated with check ((select public.is_active_member()));
create policy participants_delete on public.card_participants for delete to authenticated using ((select public.is_active_member()));

-- Activity is written only by the security-definer triggers.
create policy activity_read on public.card_activity for select to authenticated using ((select public.is_active_member()));

create policy minutes_read on public.minutes for select to authenticated using ((select public.is_active_member()));
create policy minutes_insert on public.minutes for insert to authenticated with check ((select public.is_active_member()));
create policy minutes_update on public.minutes for update to authenticated using ((select public.is_active_member())) with check ((select public.is_active_member()));
create policy minutes_admin_delete on public.minutes for delete to authenticated using ((select public.is_admin()));

-- Functions: nothing for anonymous visitors.
revoke execute on function public.move_card(uuid, uuid, int, text, timestamptz) from public, anon;
revoke execute on function public.create_pipeline_from_template(text, text) from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_active_member() from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.move_card(uuid, uuid, int, text, timestamptz) to authenticated;
grant execute on function public.create_pipeline_from_template(text, text) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_member() to authenticated;
