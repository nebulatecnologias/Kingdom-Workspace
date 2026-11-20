-- Kingdom Ops — migration 0003: rules and fixes from the functional test report of 20/11/2026.
-- Numbers (#n) refer to that report.

-- ---------------------------------------------------------------------------
-- #51 Access helpers leave the API schema. Policies reference them by OID, so they keep working;
-- the functions below that call them by name are recreated with the new schema.
-- ---------------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to authenticated;
alter function public.is_admin() set schema private;
alter function public.is_active_member() set schema private;

-- Small formatting helpers for the history (Africa/Maputo, pt-PT style).
create function private.txt(v text) returns text
language sql immutable set search_path = '' as $$ select coalesce(nullif(trim(v), ''), '—') $$;
create function private.fmt_ts(v timestamptz) returns text
language sql immutable set search_path = '' as $$ select coalesce(to_char(v at time zone 'Africa/Maputo', 'DD/MM/YYYY HH24:MI'), '—') $$;
create function private.fmt_day(v timestamptz) returns text
language sql immutable set search_path = '' as $$ select coalesce(to_char(v at time zone 'Africa/Maputo', 'DD/MM/YYYY'), '—') $$;
create function private.fmt_money(v bigint) returns text
language sql immutable set search_path = '' as $$
  select case when v is null then '—' else replace(to_char(v / 100, 'FM999,999,999,999,990'), ',', ' ') || ' MZN' end
$$;
create function private.person(p uuid) returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select full_name from public.profiles where id = p), '—')
$$;
revoke execute on function private.txt(text), private.fmt_ts(timestamptz), private.fmt_day(timestamptz), private.fmt_money(bigint), private.person(uuid) from public;

-- Profiles: anonymous visitors change nothing; members change only their own descriptive columns
-- (role and active stay guarded by guard_profile for non-admins).
revoke insert, update, delete, truncate on public.profiles from anon;
revoke update on public.profiles from authenticated;
grant update (full_name, job_title, phone_whatsapp, avatar_url, color, role, active) on public.profiles to authenticated;

create or replace function public.guard_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  if (select auth.uid()) is not null and not private.is_admin()
     and (new.role is distinct from old.role or new.active is distinct from old.active) then
    raise exception 'only_admin_can_change_role' using errcode = '42501';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- #4 A due date is a day. Store it at 12:00 Maputo so every source agrees (the app compares days).
-- ---------------------------------------------------------------------------
select set_config('ops.skip_activity', 'on', false);
update public.cards
   set due_at = (((due_at at time zone 'Africa/Maputo')::date + time '12:00') at time zone 'Africa/Maputo')
 where due_at is not null;
select set_config('ops.skip_activity', '', false);

-- ---------------------------------------------------------------------------
-- #33 A stage is open, done or lost — never done and lost. #32 Pipeline names are unique.
-- ---------------------------------------------------------------------------
update public.pipeline_stages set is_lost = false where is_done and is_lost;
alter table public.pipeline_stages add constraint stage_done_or_lost check (not (is_done and is_lost));

update public.pipelines p set name = p.name || ' ' || d.rn
  from (select id, row_number() over (partition by lower(name) order by created_at) as rn
          from public.pipelines where archived_at is null) d
 where d.id = p.id and d.rn > 1;
create unique index pipelines_name_unique on public.pipelines (lower(name)) where archived_at is null;

-- ---------------------------------------------------------------------------
-- #12 #49 History: stage names are kept as they were; each edit says what changed.
-- ---------------------------------------------------------------------------
alter table public.card_activity add column from_stage_name text, add column to_stage_name text, add column details text;
update public.card_activity a set from_stage_name = s.name from public.pipeline_stages s where s.id = a.from_stage_id;
update public.card_activity a set to_stage_name = s.name from public.pipeline_stages s where s.id = a.to_stage_id;
alter table public.card_activity drop constraint card_activity_type_check;
alter table public.card_activity add constraint card_activity_type_check check (type in (
  'created', 'stage_changed', 'rescheduled', 'updated', 'archived', 'restored', 'minutes_created', 'minutes_finalized', 'minutes_reopened'));

create or replace function public.cards_log_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_note text := nullif(current_setting('ops.move_note', true), '');
  v_uid uuid := (select auth.uid());
  v_tz text := 'Africa/Maputo';
  v_type text := 'updated';
  v_ch text[] := '{}';
  v_old_min int;
  v_new_min int;
  v_to public.pipeline_stages;
begin
  if coalesce(current_setting('ops.skip_activity', true), '') = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    insert into public.card_activity (card_id, actor_id, type, to_stage_id, to_stage_name)
    values (new.id, v_uid, 'created', new.stage_id, (select name from public.pipeline_stages where id = new.stage_id));
    return new;
  end if;

  if new.archived_at is distinct from old.archived_at then
    insert into public.card_activity (card_id, actor_id, type, note)
    values (new.id, v_uid, case when new.archived_at is null then 'restored' else 'archived' end, v_note);
    return new;
  end if;

  -- What changed, field by field.
  if new.starts_at is distinct from old.starts_at and old.starts_at is not null and new.starts_at is not null then
    if (new.starts_at at time zone v_tz)::date <> (old.starts_at at time zone v_tz)::date then
      v_type := 'rescheduled';
      v_ch := v_ch || ('Data: ' || private.fmt_ts(old.starts_at) || ' → ' || private.fmt_ts(new.starts_at));
    else
      v_ch := v_ch || ('Hora: ' || to_char(old.starts_at at time zone v_tz, 'HH24:MI') || ' → ' || to_char(new.starts_at at time zone v_tz, 'HH24:MI'));
    end if;
  end if;
  v_old_min := extract(epoch from (old.ends_at - old.starts_at))::int / 60;
  v_new_min := extract(epoch from (new.ends_at - new.starts_at))::int / 60;
  if v_old_min is distinct from v_new_min and v_old_min is not null and v_new_min is not null then
    v_ch := v_ch || ('Duração: ' || v_old_min || ' → ' || v_new_min || ' min');
  end if;
  if new.title is distinct from old.title then v_ch := v_ch || ('Título: ' || private.txt(old.title) || ' → ' || private.txt(new.title)); end if;
  if new.owner_id is distinct from old.owner_id then v_ch := v_ch || ('Responsável: ' || private.person(old.owner_id) || ' → ' || private.person(new.owner_id)); end if;
  if new.location_kind is distinct from old.location_kind or new.location is distinct from old.location then
    v_ch := v_ch || ('Local: ' || private.txt(case new.location_kind when 'online' then 'Online' when 'phone' then 'Chamada' when 'in_person' then 'Presencial' end
                     || case when new.location_kind <> 'phone' and coalesce(new.location, '') <> '' then ' · ' || new.location else '' end));
  end if;
  if new.contact_name is distinct from old.contact_name then v_ch := v_ch || ('Pessoa: ' || private.txt(old.contact_name) || ' → ' || private.txt(new.contact_name)); end if;
  if new.contact_role is distinct from old.contact_role then v_ch := v_ch || ('Cargo: ' || private.txt(old.contact_role) || ' → ' || private.txt(new.contact_role)); end if;
  if new.contact_phone is distinct from old.contact_phone then v_ch := v_ch || ('Telemóvel: ' || private.txt(old.contact_phone) || ' → ' || private.txt(new.contact_phone)); end if;
  if new.contact_email is distinct from old.contact_email then v_ch := v_ch || ('Email: ' || private.txt(old.contact_email) || ' → ' || private.txt(new.contact_email)); end if;
  if new.company_name is distinct from old.company_name then v_ch := v_ch || ('Empresa: ' || private.txt(old.company_name) || ' → ' || private.txt(new.company_name)); end if;
  if new.company_sector is distinct from old.company_sector then v_ch := v_ch || ('Sector: ' || private.txt(old.company_sector) || ' → ' || private.txt(new.company_sector)); end if;
  if new.value_cents is distinct from old.value_cents then v_ch := v_ch || ('Valor: ' || private.fmt_money(old.value_cents) || ' → ' || private.fmt_money(new.value_cents)); end if;
  if new.due_at is distinct from old.due_at then v_ch := v_ch || ('Prazo: ' || private.fmt_day(old.due_at) || ' → ' || private.fmt_day(new.due_at)); end if;
  if new.description is distinct from old.description then v_ch := v_ch || 'Descrição alterada'::text; end if;
  if (new.fields ->> 'channel') is distinct from (old.fields ->> 'channel') then
    v_ch := v_ch || ('Canal: ' || private.txt(old.fields ->> 'channel') || ' → ' || private.txt(new.fields ->> 'channel'));
  end if;

  if new.stage_id is distinct from old.stage_id then
    select * into v_to from public.pipeline_stages where id = new.stage_id;
    insert into public.card_activity (card_id, actor_id, type, from_stage_id, to_stage_id, from_stage_name, to_stage_name, note, details)
    values (new.id, v_uid, case when v_to.requires_reschedule then 'rescheduled' else 'stage_changed' end,
            old.stage_id, new.stage_id, (select name from public.pipeline_stages where id = old.stage_id), v_to.name,
            v_note, nullif(array_to_string(v_ch, ' · '), ''));
  elsif cardinality(v_ch) > 0 then
    insert into public.card_activity (card_id, actor_id, type, note, details)
    values (new.id, v_uid, v_type, v_note, array_to_string(v_ch, ' · '));
  end if;
  return new;
end $$;
revoke execute on function public.cards_log_activity() from public, anon, authenticated;

-- Participants added or removed after the card was created are part of the history too.
create function public.participants_log_activity() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_card uuid := coalesce(new.card_id, old.card_id);
  v_created timestamptz;
begin
  if coalesce(current_setting('ops.skip_activity', true), '') = 'on' then
    return null;
  end if;
  select created_at into v_created from public.cards where id = v_card;
  if v_created is null or v_created > now() - interval '30 seconds' then
    return null;
  end if;
  insert into public.card_activity (card_id, actor_id, type, details)
  values (v_card, (select auth.uid()), 'updated',
          case when tg_op = 'INSERT' then 'Participante adicionado: ' else 'Participante removido: ' end
          || private.person(coalesce(new.profile_id, old.profile_id)));
  return null;
end $$;
create trigger participants_log_activity after insert or delete on public.card_participants
  for each row execute function public.participants_log_activity();
revoke execute on function public.participants_log_activity() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- #1 #42 Archiving a card: its owner, its author or an admin.
-- ---------------------------------------------------------------------------
create or replace function public.cards_before_write() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' then
    if new.stage_id is null then
      select id into new.stage_id from public.pipeline_stages
       where pipeline_id = new.pipeline_id order by position limit 1;
    end if;
    new.created_by := coalesce(new.created_by, v_uid);
    if new.position = 0 then
      select coalesce(max(position), 0) + 1 into new.position from public.cards where stage_id = new.stage_id;
    end if;
  else
    if new.stage_id is distinct from old.stage_id then
      new.stage_changed_at := now();
    end if;
    if new.archived_at is distinct from old.archived_at and v_uid is not null
       and not (private.is_admin() or v_uid = old.owner_id or v_uid = old.created_by) then
      raise exception 'only_owner_or_admin_can_archive' using errcode = '42501';
    end if;
  end if;
  if not exists (select 1 from public.pipeline_stages where id = new.stage_id and pipeline_id = new.pipeline_id) then
    raise exception 'stage_not_in_pipeline' using errcode = '23514';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- #6 #8 #35 #40 #48 Stage rules when moving a card.
-- ---------------------------------------------------------------------------
create or replace function public.move_card(
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
  s_from public.pipeline_stages;
  v_kind text;
  v_tz text := 'Africa/Maputo';
  v_duration interval;
  v_pos int;
  v_from uuid;
begin
  if (select auth.uid()) is not null and not private.is_active_member() then
    raise exception 'not_allowed' using errcode = '42501';
  end if;
  select * into c from public.cards where id = p_card_id for update;
  if not found then raise exception 'card_not_found' using errcode = 'P0002'; end if;
  select * into s from public.pipeline_stages where id = p_stage_id;
  if not found or s.pipeline_id <> c.pipeline_id then
    raise exception 'stage_not_in_pipeline' using errcode = '23514';
  end if;
  select * into s_from from public.pipeline_stages where id = c.stage_id;
  select kind into v_kind from public.pipelines where id = c.pipeline_id;

  if s.id <> c.stage_id then
    if s.requires_note and coalesce(trim(p_note), '') = '' then
      raise exception 'note_required' using errcode = '23514';
    end if;
    if s.requires_reschedule then
      if p_new_starts_at is null then
        raise exception 'reschedule_required' using errcode = '23514';
      end if;
      if (p_new_starts_at at time zone v_tz)::date < (now() at time zone v_tz)::date then
        raise exception 'reschedule_past' using errcode = '23514';
      end if;
    end if;
    -- A lost card (e.g. Cancelada, Perdido) goes back to an open stage before it can be done.
    if s_from.is_lost and s.is_done then
      raise exception 'reopen_first' using errcode = '23514';
    end if;
    -- A meeting is not under way or done before it starts (15 minutes of slack).
    if v_kind = 'meetings' and c.starts_at is not null and c.starts_at > now() + interval '15 minutes'
       and (s.is_done or (not s.is_lost and not s.requires_reschedule
            and s.position > (select min(position) from public.pipeline_stages where pipeline_id = s.pipeline_id))) then
      raise exception 'meeting_not_started' using errcode = '23514';
    end if;
    if v_kind = 'sales' and s.is_done and coalesce(c.value_cents, 0) = 0 then
      raise exception 'value_required' using errcode = '23514';
    end if;
    if v_kind = 'campaigns' and (s.is_done or s.tone = 'success') and c.due_at is null then
      raise exception 'launch_date_required' using errcode = '23514';
    end if;
  end if;

  v_from := c.stage_id;
  v_pos := coalesce(p_position, (select coalesce(max(position), 0) + 1 from public.cards where stage_id = s.id and id <> c.id));
  update public.cards set position = position + 1
   where stage_id = s.id and id <> c.id and position >= v_pos;

  perform set_config('ops.move_note', coalesce(p_note, ''), true);
  v_duration := case when c.starts_at is not null and c.ends_at is not null then c.ends_at - c.starts_at end;
  update public.cards
     set stage_id = s.id,
         position = v_pos,
         starts_at = case when v_kind = 'meetings' then coalesce(p_new_starts_at, starts_at) else starts_at end,
         ends_at = case when v_kind = 'meetings' and p_new_starts_at is not null and v_duration is not null then p_new_starts_at + v_duration else ends_at end,
         -- #35 outside meetings, the date asked by the stage becomes the card's due date.
         due_at = case when v_kind <> 'meetings' and p_new_starts_at is not null
                       then (((p_new_starts_at at time zone v_tz)::date + time '12:00') at time zone v_tz) else due_at end
   where id = c.id
   returning * into c;
  perform set_config('ops.move_note', '', true);

  update public.cards t set position = r.rn
    from (select id, row_number() over (partition by stage_id order by position, created_at) as rn
            from public.cards where stage_id in (s.id, v_from)) r
   where t.id = r.id and t.position <> r.rn;
  select * into c from public.cards where id = p_card_id;
  return c;
end $$;

-- ---------------------------------------------------------------------------
-- #32 Pipelines from a template need a name of their own.
-- ---------------------------------------------------------------------------
create or replace function public.create_pipeline_from_template(p_kind text, p_name text default null) returns public.pipelines
language plpgsql set search_path = '' as $$
declare
  t jsonb := public.pipeline_template(p_kind);
  p public.pipelines;
  v_slug text;
  v_name text;
  st jsonb;
  i int := 0;
begin
  if (select auth.uid()) is not null and not private.is_admin() then
    raise exception 'only_admin' using errcode = '42501';
  end if;
  if t is null then raise exception 'unknown_template' using errcode = '22023'; end if;
  v_name := coalesce(nullif(trim(p_name), ''), t ->> 'name');
  if exists (select 1 from public.pipelines where lower(name) = lower(v_name) and archived_at is null) then
    raise exception 'pipeline_name_taken' using errcode = '23505';
  end if;
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
-- #9 #10 #29 #42 #43 Minutes: a final ata is complete and locked (admins may still correct it).
-- ---------------------------------------------------------------------------
create or replace function public.minutes_before_write() returns trigger
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
    new.location := coalesce(new.location, case c.location_kind
      when 'online' then 'Online' || case when coalesce(c.location, '') <> '' then ' · ' || c.location else '' end
      when 'phone' then 'Chamada' else c.location end);
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
    if old.status = 'final' and v_uid is not null and not private.is_admin() then
      raise exception 'minutes_final_locked' using errcode = '42501';
    end if;
  end if;
  if new.started_at is not null and new.ended_at is not null and new.ended_at <= new.started_at then
    raise exception 'minutes_time_order' using errcode = '23514';
  end if;
  if new.status = 'final' and (tg_op = 'INSERT' or old.status <> 'final') then
    if v_uid is not null and not (v_uid = new.written_by or v_uid = c.owner_id or private.is_admin()) then
      raise exception 'only_author_owner_or_admin_can_finalize' using errcode = '42501';
    end if;
    new.finalized_at := coalesce(new.finalized_at, now());
  end if;
  if new.status = 'final' then
    if new.approved_by is null
       or not exists (select 1 from jsonb_array_elements(new.agenda) e where coalesce(trim(e ->> 'topic'), '') <> '') then
      raise exception 'minutes_incomplete' using errcode = '23514';
    end if;
  elsif new.status = 'draft' then
    new.finalized_at := null;
  end if;
  return new;
end $$;

create or replace function public.minutes_log_activity() returns trigger
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
  elsif tg_op = 'UPDATE' and old.status = 'final' and new.status = 'draft' then
    insert into public.card_activity (card_id, actor_id, type) values (new.card_id, (select auth.uid()), 'minutes_reopened');
  end if;
  return new;
end $$;
revoke execute on function public.minutes_log_activity() from public, anon, authenticated;

-- #1 Whoever wrote a draft may delete it (admins may delete any ata).
create policy minutes_delete_own_draft on public.minutes for delete to authenticated
  using (written_by = (select auth.uid()) and status = 'draft' and (select private.is_active_member()));
