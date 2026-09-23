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
-- Library and outlines: listed products with ownership, outlines without content.
do $$
declare jonah uuid := (select id from public.products where slug = 'jonah');
begin
  assert (select count(*) from public.library_items('en')) = 10, 'library lists every product except hidden ones';
  assert (select owned from public.library_items('en') where slug = 'noah'), 'owned pack is owned';
  assert (select owned from public.library_items('en') where slug = 'verses'), 'free pack counts as owned';
  assert not (select owned from public.library_items('en') where slug = 'jonah'), 'locked pack is not owned';
  assert not (select owned from public.library_items('en') where slug = 'daniel'), 'coming-soon pack is not owned';
  assert (select title from public.library_items('pt') where slug = 'noah') <> (select title from public.library_items('en') where slug = 'noah'), 'titles translated';
  assert (select chapter_count from public.library_items('pt') where slug = 'money') = 9, 'chapter count per language';
  assert (select count(*) from public.product_outline((select id from public.products where slug = 'sermon'), 'en') where kind = 'chapter') = 7, 'locked guide shows its full contents list';
  assert (select count(*) from public.product_outline(jonah, 'pt') where kind = 'page') = 2, 'locked pack shows page titles';
  assert (select title from public.product_outline(jonah, 'pt') where "position" = 1) <> (select title from public.product_outline(jonah, 'en') where "position" = 1), 'page titles translated';
  assert (select count(*) from public.product_outline((select id from public.products where slug = 'easter'), 'en')) = 0, 'hidden product has no outline';
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

-- ---------------------------------------------------------------------------
-- Gateway webhooks (phase 2)
-- ---------------------------------------------------------------------------
create function pg_temp.ev(p_order text, p_email text, p_items text[] default '{}', p_extra jsonb default '{}')
returns jsonb language sql as $$
  select jsonb_build_object(
    'order', jsonb_build_object('id', p_order, 'reference', 'KG-' || p_order, 'amount', 14900, 'currency', 'ZAR', 'refunded_amount', 0),
    'customer', jsonb_build_object('email', p_email, 'name', 'Test Buyer'),
    'locale', 'pt',
    'items', coalesce((select jsonb_agg(jsonb_build_object('product_id', i, 'quantity', 1)) from unnest(p_items) i), '[]'::jsonb),
    'metadata', jsonb_build_object('member_user_id', null)
  ) || p_extra;
$$;

do $$
declare r jsonb; n int;
begin
  -- claim_webhook_event: new, duplicate, retry after an error, retry after a stale attempt
  assert public.claim_webhook_event('evt_1', 'order.paid', '{}') = 'new', 'first delivery is new';
  assert public.claim_webhook_event('evt_1', 'order.paid', '{}') = 'duplicate', 'second delivery is a duplicate while processing';
  update public.webhook_events set result = 'processed' where event_id = 'evt_1';
  assert public.claim_webhook_event('evt_1', 'order.paid', '{}') = 'duplicate', 'processed event is a duplicate';
  update public.webhook_events set result = 'error' where event_id = 'evt_1';
  assert public.claim_webhook_event('evt_1', 'order.paid', '{}') = 'retry', 'failed event can be retried';
  update public.webhook_events set received_at = now() - interval '10 minutes' where event_id = 'evt_1';
  assert public.claim_webhook_event('evt_1', 'order.paid', '{}') = 'retry', 'stale processing can be retried';

  -- order.paid for someone without an account: grant by email, report unknown products
  r := public.gateway_apply_event('order.paid', pg_temp.ev('ord_a', 'Buyer@Example.co.za', array['prod_jonah', 'prod_unknown']));
  assert r ->> 'status' = 'paid', 'order paid';
  assert r ->> 'user_id' is null, 'no account yet';
  assert r ->> 'email' = 'buyer@example.co.za', 'email lowercased';
  assert r ->> 'locale' = 'pt', 'checkout locale kept';
  assert jsonb_array_length(r -> 'granted') = 1, 'one product granted';
  assert r -> 'unmapped' = '["prod_unknown"]'::jsonb, 'unknown gateway product reported';
  assert (select count(*) from public.entitlements e join public.orders o on o.id = e.order_id
          where o.gateway_order_id = 'ord_a' and e.revoked_at is null) = 1, 'entitlement tied to the order';

  -- same order again: nothing new
  r := public.gateway_apply_event('order.paid', pg_temp.ev('ord_a', 'buyer@example.co.za', array['prod_jonah']));
  assert jsonb_array_length(r -> 'granted') = 0, 'replayed order grants nothing';
  assert (select count(*) from public.orders where gateway_order_id = 'ord_a') = 1, 'one order row';
  assert (select count(*) from public.entitlements where email = 'buyer@example.co.za' and revoked_at is null) = 1, 'still one entitlement';

  -- padlock purchase: member_user_id wins over a different checkout email
  r := public.gateway_apply_event('order.paid', pg_temp.ev('ord_b', 'other@example.co.za', array['prod_jonah'],
         '{"metadata":{"member_user_id":"00000000-0000-0000-0000-00000000000b"}}'));
  assert r ->> 'user_id' = '00000000-0000-0000-0000-00000000000b', 'granted to the member who clicked the padlock';
  assert r ->> 'email' = 'sipho@example.co.za', 'uses the member email';
  assert exists (select 1 from public.entitlements e join public.products p on p.id = e.product_id
                 where e.user_id = '00000000-0000-0000-0000-00000000000b' and p.slug = 'jonah' and e.revoked_at is null), 'sipho has jonah';

  -- full refund removes that order's access; a late order.paid does not bring it back
  r := public.gateway_apply_event('order.refunded', pg_temp.ev('ord_a', 'buyer@example.co.za', '{}',
         '{"order":{"id":"ord_a","amount":14900,"refunded_amount":14900,"full_refund":true}}'));
  assert r ->> 'status' = 'refunded', 'order refunded';
  assert (r ->> 'revoked')::int = 1, 'access revoked';
  assert (select revoked_reason from public.entitlements where email = 'buyer@example.co.za') = 'refund', 'reason recorded';
  r := public.gateway_apply_event('order.paid', pg_temp.ev('ord_a', 'buyer@example.co.za', array['prod_jonah']));
  assert r ->> 'status' = 'refunded' and jsonb_array_length(r -> 'granted') = 0, 'late order.paid ignored after refund';

  -- partial refund keeps access
  r := public.gateway_apply_event('order.refunded', pg_temp.ev('ord_b', 'other@example.co.za', '{}',
         '{"order":{"id":"ord_b","amount":14900,"refunded_amount":5000,"full_refund":false}}'));
  assert r ->> 'status' = 'partially_refunded' and (r ->> 'revoked')::int = 0, 'partial refund keeps access';

  -- dispute suspends; won restores; a second dispute lost revokes for good
  r := public.gateway_apply_event('order.paid', pg_temp.ev('ord_c', 'dispute@example.co.za', array['prod_creation']));
  r := public.gateway_apply_event('order.disputed', pg_temp.ev('ord_c', 'dispute@example.co.za'));
  assert r ->> 'status' = 'disputed' and (r ->> 'revoked')::int = 1, 'dispute suspends access';
  r := public.gateway_apply_event('order.dispute_resolved', pg_temp.ev('ord_c', 'dispute@example.co.za', '{}', '{"outcome":"won"}'));
  assert r ->> 'status' = 'paid' and (r ->> 'restored')::int = 1, 'won dispute restores access';
  r := public.gateway_apply_event('order.disputed', pg_temp.ev('ord_c', 'dispute@example.co.za'));
  r := public.gateway_apply_event('order.dispute_resolved', pg_temp.ev('ord_c', 'dispute@example.co.za', '{}', '{"outcome":"lost"}'));
  assert r ->> 'status' = 'dispute_lost', 'lost dispute';
  assert (select count(*) from public.entitlements where email = 'dispute@example.co.za' and revoked_at is null) = 0, 'no access after a lost dispute';
  assert (select revoked_reason from public.entitlements where email = 'dispute@example.co.za') = 'dispute_lost', 'lost reason recorded';

  -- dispute with suspension switched off keeps access
  r := public.gateway_apply_event('order.paid', pg_temp.ev('ord_d', 'keep@example.co.za', array['prod_creation']));
  r := public.gateway_apply_event('order.disputed', pg_temp.ev('ord_d', 'keep@example.co.za'), false);
  assert (r ->> 'revoked')::int = 0, 'no suspension when the policy is off';

  -- refund that arrives before the payment: the late payment never unlocks
  r := public.gateway_apply_event('order.refunded', pg_temp.ev('ord_e', 'early@example.co.za', '{}',
         '{"order":{"id":"ord_e","amount":14900,"refunded_amount":14900}}'));
  assert r ->> 'status' = 'refunded', 'refund inferred as full from the amounts';
  r := public.gateway_apply_event('order.paid', pg_temp.ev('ord_e', 'early@example.co.za', array['prod_creation']));
  assert jsonb_array_length(r -> 'granted') = 0, 'payment after refund grants nothing';

  -- every change is in the audit log
  assert (select count(*) from public.audit_log where action like 'gateway.order.%') >= 12, 'gateway events audited';

  -- bad input is rejected
  begin
    perform public.gateway_apply_event('order.paid', '{"order":{"id":"x"},"customer":{}}');
    raise exception 'missing email accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.gateway_apply_event('order.dispute_resolved', pg_temp.ev('ord_c', 'dispute@example.co.za'));
    raise exception 'dispute without outcome accepted';
  exception when invalid_parameter_value then null;
  end;

  -- expire_invites marks pending invites that ran out of time
  insert into public.invites (email, token_hash, expires_at, source) values ('late@example.co.za', sha256('tok-late'::bytea), now() - interval '1 hour', 'gateway');
  n := public.expire_invites();
  assert n >= 1, 'expired invites marked';
  assert (select status from public.invites where email = 'late@example.co.za') = 'expired', 'status is expired';
end $$;

-- Members cannot call the gateway functions.
begin;
set local role authenticated;
do $$ begin
  begin
    perform public.gateway_apply_event('order.paid', '{}');
    raise exception 'member executed gateway_apply_event';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.claim_webhook_event('x', 'y', '{}');
    raise exception 'member executed claim_webhook_event';
  exception when insufficient_privilege then null;
  end;
end $$;
rollback;

-- Visitors get nothing from the library functions.
begin;
set local role anon;
do $$ begin
  begin
    perform public.library_items('en');
    raise exception 'anon called library_items';
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
