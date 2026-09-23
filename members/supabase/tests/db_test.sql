-- Security and behaviour tests for the Kingdom Members schema. Runs after auth_stub.sql, migrations and seed.sql.
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Fixtures: two members and one admin (the trigger creates their profiles).
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'Thandi@Example.co.za', '{"full_name":"Thandi Mokoena","locale":"en","terms_accepted":"true"}'),
  ('00000000-0000-0000-0000-00000000000b', 'sipho@example.co.za', '{"full_name":"Sipho Nkosi","locale":"pt"}'),
  ('00000000-0000-0000-0000-0000000000ad', 'admin@example.co.za', '{"full_name":"Kingdom Admin"}');
update public.profiles set role = 'admin' where email = 'admin@example.co.za';

-- Entitlements granted by email before any account (as the webhook does), then linked.
insert into public.entitlements (email, product_id, source)
select 'thandi@example.co.za', id, 'order' from public.products where slug in ('noah', 'money');
insert into public.entitlements (email, product_id, source)
select 'sipho@example.co.za', id, 'manual' from public.products where slug = 'sermon';

do $$
declare n int;
begin
  -- profile trigger
  assert (select email from public.profiles where id = '00000000-0000-0000-0000-00000000000a') = 'thandi@example.co.za', 'profile email lowercased';
  assert (select locale from public.profiles where id = '00000000-0000-0000-0000-00000000000b') = 'pt', 'profile locale from metadata';
  assert (select terms_accepted_at is not null from public.profiles where id = '00000000-0000-0000-0000-00000000000a'), 'terms accepted recorded';
  -- link_entitlements
  n := public.link_entitlements('00000000-0000-0000-0000-00000000000a', 'THANDI@example.co.za');
  assert n = 2, 'two entitlements linked, got ' || n;
  perform public.link_entitlements('00000000-0000-0000-0000-00000000000b', 'sipho@example.co.za');
end $$;

-- Duplicate active entitlement is rejected.
do $$
begin
  begin
    insert into public.entitlements (email, product_id, source) select 'thandi@example.co.za', id, 'manual' from public.products where slug = 'noah';
    raise exception 'duplicate entitlement was accepted';
  exception when unique_violation then null;
  end;
end $$;

-- consume_invite: ok, used, expired, revoked, not_found.
insert into public.invites (email, token_hash, expires_at, source) values
  ('new@example.co.za', sha256('tok-ok'::bytea), now() + interval '7 days', 'gateway'),
  ('old@example.co.za', sha256('tok-old'::bytea), now() - interval '1 minute', 'gateway'),
  ('rev@example.co.za', sha256('tok-rev'::bytea), now() + interval '7 days', 'manual');
update public.invites set status = 'revoked', revoked_at = now() where email = 'rev@example.co.za';
do $$
begin
  assert (select result from public.consume_invite(sha256('tok-ok'::bytea))) = 'ok', 'first use ok';
  assert (select result from public.consume_invite(sha256('tok-ok'::bytea))) = 'used', 'second use rejected';
  assert (select result from public.consume_invite(sha256('tok-old'::bytea))) = 'expired', 'expired rejected';
  assert (select status from public.invites where email = 'old@example.co.za') = 'expired', 'expired status persisted';
  assert (select result from public.consume_invite(sha256('tok-rev'::bytea))) = 'revoked', 'revoked rejected';
  assert (select result from public.consume_invite(sha256('nope'::bytea))) = 'not_found', 'unknown token';
end $$;

-- ---------------------------------------------------------------------------
-- As member Thandi
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$
begin
  assert (select count(*) from public.entitlements) = 2, 'member sees only own entitlements';
  assert (select count(*) from public.profiles) = 1, 'member sees only own profile';
  assert not exists (select 1 from public.products where visibility = 'hidden'), 'hidden products invisible';
  assert exists (select 1 from public.products where slug = 'daniel'), 'coming-soon products listed';
  assert (select count(*) from public.product_chapters where product_id = (select id from public.products where slug = 'money')) = 27, 'owned book: all chapters in 3 languages';
  assert (select count(*) from public.product_chapters where product_id = (select id from public.products where slug = 'sermon')) = 3, 'locked guide: only the sample chapter per language';
  assert (select count(*) from public.product_pages where product_id = (select id from public.products where slug = 'verses')) > 0, 'free product pages readable';
  assert (select count(*) from public.product_pages where product_id = (select id from public.products where slug = 'jonah')) = 0, 'locked pack pages hidden';
  assert (select count(*) from public.invites) = 0, 'invites hidden from members';
  assert (select count(*) from public.webhook_events) = 0, 'webhook log hidden from members';
  assert (select count(*) from public.integration_secrets) = 0, 'secrets never readable';
end $$;
-- Member can save progress on owned content only.
insert into public.reading_progress (user_id, product_id, chapter_position)
select '00000000-0000-0000-0000-00000000000a', id, 3 from public.products where slug = 'money';
do $$
begin
  begin
    insert into public.reading_progress (user_id, product_id, chapter_position)
    select '00000000-0000-0000-0000-00000000000a', id, 1 from public.products where slug = 'sermon';
    raise exception 'progress on locked product was accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
-- Member may rename themselves but not promote themselves.
update public.profiles set full_name = 'Thandi M.' where id = '00000000-0000-0000-0000-00000000000a';
do $$
begin
  begin
    update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-00000000000a';
    raise exception 'member changed own role';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.consume_invite(sha256('tok-old'::bytea));
    raise exception 'member executed consume_invite';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.entitlements (user_id, email, product_id, source)
    select '00000000-0000-0000-0000-00000000000a', 'thandi@example.co.za', id, 'manual' from public.products where slug = 'jonah';
    raise exception 'member granted self an entitlement';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;

-- ---------------------------------------------------------------------------
-- As admin
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ad';
do $$
begin
  assert (select count(*) from public.profiles) = 3, 'admin sees all profiles';
  assert exists (select 1 from public.products where visibility = 'hidden'), 'admin sees hidden products';
  assert (select count(*) from public.invites) = 3, 'admin sees invites';
  assert (select count(*) from public.integration_secrets) = 0, 'secrets not readable even by admin via API';
end $$;
rollback;

-- ---------------------------------------------------------------------------
-- Deactivated member loses access; revoked entitlement removes access.
-- ---------------------------------------------------------------------------
update public.profiles set status = 'deactivated' where id = '00000000-0000-0000-0000-00000000000b';
update public.entitlements set revoked_at = now(), revoked_reason = 'refund'
where email = 'thandi@example.co.za' and product_id = (select id from public.products where slug = 'noah');
begin;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000b';
do $$ begin
  assert (select count(*) from public.product_chapters where product_id = (select id from public.products where slug = 'sermon')) = 3, 'deactivated member keeps only samples';
end $$;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  assert (select count(*) from public.product_pages where product_id = (select id from public.products where slug = 'noah')) = 0, 'refunded pack pages hidden';
end $$;
rollback;

-- Anonymous visitors read nothing.
begin;
set local role anon;
do $$ begin
  assert (select count(*) from public.products) = 0, 'anon sees no products';
  assert (select count(*) from public.profiles) = 0, 'anon sees no profiles';
end $$;
rollback;

-- Rate limiting: 3 hits allowed per window, the 4th is refused; other keys are independent.
do $$
begin
  assert public.hit_rate_limit('login:1.2.3.4', 3, 600), 'hit 1';
  assert public.hit_rate_limit('login:1.2.3.4', 3, 600), 'hit 2';
  assert public.hit_rate_limit('login:1.2.3.4', 3, 600), 'hit 3';
  assert not public.hit_rate_limit('login:1.2.3.4', 3, 600), 'hit 4 refused';
  assert public.hit_rate_limit('login:5.6.7.8', 3, 600), 'other key allowed';
  update public.rate_limits set window_start = now() - interval '11 minutes' where key = 'login:1.2.3.4';
  assert public.hit_rate_limit('login:1.2.3.4', 3, 600), 'new window allowed';
end $$;
begin;
set local role authenticated;
do $$ begin
  begin
    perform public.hit_rate_limit('x', 1, 60);
    raise exception 'member executed hit_rate_limit';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;

-- Grants: visitors cannot call the policy helpers; members can (RLS needs them); nobody calls the trigger function.
do $$ begin
  assert not has_function_privilege('anon', 'public.is_admin()', 'execute'), 'anon cannot call is_admin';
  assert not has_function_privilege('anon', 'public.has_access(uuid)', 'execute'), 'anon cannot call has_access';
  assert not has_function_privilege('anon', 'public.product_is_listed(uuid)', 'execute'), 'anon cannot call product_is_listed';
  assert has_function_privilege('authenticated', 'public.has_access(uuid)', 'execute'), 'members can call has_access';
  assert not has_function_privilege('authenticated', 'public.handle_new_user()', 'execute'), 'members cannot call handle_new_user';
end $$;

\echo 'All database tests passed'
