-- Kingdom Ops database tests: seed shape, RLS, stage rules, one minutes per meeting, history.
\set ON_ERROR_STOP 1
\o /dev/null
create or replace function pg_temp.ok(cond boolean, label text) returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'FAIL: %', label; end if;
  raise notice 'ok - %', label;
end $$;
create or replace function pg_temp.as_user(uid uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', uid::text, 'role', 'authenticated')::text, false);
$$;
create or replace function pg_temp.throws(sql text, expected text) returns boolean language plpgsql as $$
begin
  execute sql;
  return false;
exception when others then
  if position(expected in sqlerrm) = 0 then raise notice 'unexpected error: %', sqlerrm; return false; end if;
  return true;
end $$;

-- ids from the generator (md5 of 'kingdom-ops:<prototype id>')
\set admin '''7e7f5e8f-0000-0000-0000-000000000000'''
select pg_temp.ok((select count(*) from public.profiles) = 5, 'seed: five team profiles');
select pg_temp.ok((select count(*) from public.pipelines) = 5, 'seed: five pipelines');
select pg_temp.ok((select count(*) from public.cards) = 32, 'seed: 32 cards');
select pg_temp.ok((select count(*) from public.minutes) = 2, 'seed: two minutes');
select pg_temp.ok((select count(*) from public.card_activity) = 18, 'seed: history loaded without trigger duplicates');

-- helpers to find people and stages by name
create temp table ids as
select (select id from public.profiles where full_name = 'Shelton Douglas') as admin_id,
       (select id from public.profiles where full_name = 'Maria') as member_id,
       (select id from public.pipelines where slug = 'reunioes') as meetings_id,
       (select id from public.pipelines where slug = 'vendas') as sales_id,
       (select s.id from public.pipeline_stages s join public.pipelines p on p.id = s.pipeline_id where p.slug = 'reunioes' and s.name = 'Agendado') as agendado,
       (select s.id from public.pipeline_stages s join public.pipelines p on p.id = s.pipeline_id where p.slug = 'reunioes' and s.name = 'Cancelada') as cancelada,
       (select s.id from public.pipeline_stages s join public.pipelines p on p.id = s.pipeline_id where p.slug = 'reunioes' and s.name = 'Adiada') as adiada,
       (select s.id from public.pipeline_stages s join public.pipelines p on p.id = s.pipeline_id where p.slug = 'reunioes' and s.name = 'Concluída') as concluida,
       (select s.id from public.pipeline_stages s join public.pipelines p on p.id = s.pipeline_id where p.slug = 'vendas' and s.name = 'Lead') as lead;
grant select on ids to authenticated, anon;

-- A stranger who signed up by themselves: inactive, sees nothing.
insert into auth.users (id, email, raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000aa', 'stranger@example.com', '{"full_name":"Stranger"}');
select pg_temp.ok((select not active and role = 'member' from public.profiles where id = '00000000-0000-0000-0000-0000000000aa'), 'new auth user gets an inactive member profile');

set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000aa');
select pg_temp.ok((select count(*) from public.cards) = 0, 'inactive user reads no cards');
select pg_temp.ok((select count(*) from public.profiles) = 1, 'inactive user reads only their own profile');
select pg_temp.ok(pg_temp.throws($$update public.profiles set active = true where id = '00000000-0000-0000-0000-0000000000aa'$$, 'only_admin'), 'user cannot activate themselves');

-- Active member
select pg_temp.as_user((select member_id from ids));
select pg_temp.ok((select count(*) from public.cards) = 32, 'member reads every card');
select pg_temp.ok((select count(*) from public.profiles) = 6, 'member reads every profile (admins activate new ones)');
insert into public.cards (pipeline_id, title, owner_id, starts_at, ends_at, location_kind, location, contact_name, company_name)
values ((select meetings_id from ids), 'Teste de reunião', (select member_id from ids), '2026-11-25 10:00+02', '2026-11-25 11:00+02', 'online', 'https://meet.example', 'Cliente Teste', 'Empresa Teste');
create temp table t_card as select id from public.cards where title = 'Teste de reunião';
select pg_temp.ok((select stage_id from public.cards where title = 'Teste de reunião') = (select agendado from ids), 'new meeting lands in Agendado');
select pg_temp.ok((select count(*) from public.card_activity where card_id = (select id from public.cards where title = 'Teste de reunião') and type = 'created') = 1, 'creation is logged');
select pg_temp.ok(pg_temp.throws($$delete from public.cards where title = 'Teste de reunião'$$, '') or (select count(*) from public.cards where title = 'Teste de reunião') = 1, 'member cannot delete cards');
select pg_temp.ok(pg_temp.throws($$insert into public.pipelines (slug, name, kind) values ('x', 'X', 'custom')$$, 'row-level security'), 'member cannot create pipelines');
select pg_temp.ok(pg_temp.throws($$select public.create_pipeline_from_template('custom', 'Recrutamento')$$, 'only_admin'), 'member cannot create a pipeline from a template');

-- Stage rules
select pg_temp.ok(pg_temp.throws($$select public.move_card((select id from public.cards where title = 'Teste de reunião'), (select cancelada from ids))$$, 'note_required'), 'Cancelada asks for a reason');
select pg_temp.ok(pg_temp.throws($$select public.move_card((select id from public.cards where title = 'Teste de reunião'), (select adiada from ids))$$, 'reschedule_required'), 'Adiada asks for a new date');
select pg_temp.ok(pg_temp.throws($$select public.move_card((select id from public.cards where title = 'Teste de reunião'), (select lead from ids))$$, 'stage_not_in_pipeline'), 'cannot move to another pipeline''s stage');
select public.move_card((select id from public.cards where title = 'Teste de reunião'), (select adiada from ids), null, 'Cliente pediu', '2026-11-27 15:00+02');
select pg_temp.ok((select ends_at = '2026-11-27 16:00+02' from public.cards where title = 'Teste de reunião'), 'rescheduling keeps the duration');
select pg_temp.ok((select type = 'rescheduled' and note = 'Cliente pediu' and actor_id = (select member_id from ids) from public.card_activity where card_id = (select id from public.cards where title = 'Teste de reunião') order by at desc, type limit 1), 'reschedule logged with note and actor');
select public.move_card((select id from public.cards where title = 'Teste de reunião'), (select concluida from ids), 1);
select pg_temp.ok((select position = 1 from public.cards where title = 'Teste de reunião'), 'move to a position');
select pg_temp.ok(not exists (select 1 from (select position, row_number() over (order by position) as rn from public.cards where stage_id = (select concluida from ids)) x where position <> rn), 'target column renumbered 1..n');

-- Minutes: one per meeting, only for meetings
insert into public.minutes (card_id) values ((select id from public.cards where title = 'Teste de reunião'));
select pg_temp.ok((select title = 'Teste de reunião' and held_at = '2026-11-27' and jsonb_array_length(attendees) = 2 and written_by = (select member_id from ids) from public.minutes where card_id = (select id from public.cards where title = 'Teste de reunião')), 'minutes pre-filled from the meeting');
select pg_temp.ok(pg_temp.throws($$insert into public.minutes (card_id) values ((select id from public.cards where title = 'Teste de reunião'))$$, 'duplicate key'), 'one minutes per meeting');
select pg_temp.ok(pg_temp.throws($$insert into public.minutes (card_id) values ((select id from public.cards where pipeline_id = (select sales_id from ids) limit 1))$$, 'minutes_need_meeting'), 'minutes only for meetings');
update public.minutes set status = 'final' where card_id = (select id from public.cards where title = 'Teste de reunião');
select pg_temp.ok((select finalized_at is not null from public.minutes where card_id = (select id from public.cards where title = 'Teste de reunião')), 'author can finalise');
select pg_temp.ok((select count(*) from public.card_activity where card_id = (select id from public.cards where title = 'Teste de reunião') and type in ('minutes_created', 'minutes_finalized')) = 2, 'minutes history logged');
-- Someone else (not author/owner/admin) cannot finalise: Leonardo on Shelton's draft for c5? c5 draft is by Leonardo; use Maria on it.
select pg_temp.ok(pg_temp.throws($$update public.minutes set status = 'final' where status = 'draft' and written_by <> (select member_id from ids)$$, 'only_author_owner_or_admin'), 'others cannot finalise');

-- Admin
select pg_temp.as_user((select admin_id from ids));
select pg_temp.ok((select (public.create_pipeline_from_template('custom', 'Recrutamento')).slug = 'recrutamento'), 'admin creates a pipeline from a template');
select pg_temp.ok((select count(*) from public.pipeline_stages s join public.pipelines p on p.id = s.pipeline_id where p.slug = 'recrutamento') = 5, 'template stages copied');
select pg_temp.ok((select (public.create_pipeline_from_template('custom', 'Recrutamento')).slug = 'recrutamento-2'), 'slugs stay unique');
delete from public.cards where title = 'Teste de reunião';
select pg_temp.ok((select count(*) from public.cards where title = 'Teste de reunião') = 0, 'admin deletes cards');

-- Anonymous
reset role;
set role anon;
select pg_temp.ok(pg_temp.throws($$select count(*) from public.cards$$, 'permission denied') or (select count(*) from public.cards) = 0, 'anonymous reads nothing');
reset role;
\o
\echo 'all database tests passed'
