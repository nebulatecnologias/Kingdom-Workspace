-- The monthly plan: R75 a month, first 30 days free, charged by the gateway. While a member's plan is
-- active, every visible product in the library is open to them (today's and future ones), and they get the
-- monthly picks email. Also: three more welcome questions.

create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired');

create table public.plans (
  code text primary key check (code ~ '^[a-z0-9_]{2,40}$'),
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'ZAR',
  trial_days int not null default 0 check (trial_days between 0 and 90),
  gateway_plan_id text unique check (gateway_plan_id is null or char_length(gateway_plan_id) between 1 and 200),
  checkout_url text check (checkout_url is null or checkout_url ~ '^https://'),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
-- Off until an admin links it to the gateway (plan ID and checkout link) in Integrations.
insert into public.plans (code, price_cents, trial_days, active) values ('all_access', 7500, 30, false);

-- One row per gateway subscription, kept up to date by subscription.* webhooks (latest snapshot wins).
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  email text not null check (email = lower(email)),
  plan_code text not null references public.plans (code),
  gateway_subscription_id text not null unique check (char_length(gateway_subscription_id) between 1 and 200),
  status public.subscription_status not null,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  -- Access stops after this moment: the end of the trial or paid month (plus 3 days while a payment is
  -- being retried). If a renewal webhook never arrives, access still ends on its own.
  access_until timestamptz,
  manage_url text check (manage_url is null or manage_url ~ '^https://'),
  gateway_updated_at timestamptz not null,
  trial_reminder_sent_at timestamptz,
  started_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);
create index subscriptions_email_idx on public.subscriptions (email);
create index subscriptions_plan_idx on public.subscriptions (plan_code);

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
-- No policies on purpose: the server reads and writes these with the service role.
revoke all on public.plans, public.subscriptions from anon, authenticated;

-- True while this member (an active account) has a plan that still gives access.
create function public.plan_active(p_user_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_user_id is not null and exists (
    select 1 from public.subscriptions s
    join public.profiles p on p.id = s.user_id
    where s.user_id = p_user_id and p.status = 'active'
      and s.status <> 'expired' and s.access_until > now()
  );
$$;
revoke execute on function public.plan_active(uuid) from public, anon, authenticated;
grant execute on function public.plan_active(uuid) to service_role;

-- Access now also comes from the plan: every visible product (not "coming soon", not hidden).
create or replace function public.has_access(p_product_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.entitlements e
    join public.profiles p on p.id = e.user_id
    where e.product_id = p_product_id and e.user_id = auth.uid()
      and e.revoked_at is null and p.status = 'active'
  ) or exists (
    select 1 from public.products pr
    where pr.id = p_product_id and pr.access = 'free' and pr.visibility = 'visible'
      and auth.uid() is not null
  ) or (
    public.plan_active(auth.uid())
    and exists (select 1 from public.products pr where pr.id = p_product_id and pr.visibility = 'visible')
  );
$$;

-- Subscriptions bought before the account existed are linked when it is created, like purchases.
create or replace function public.link_entitlements(p_user_id uuid, p_email text) returns int
language plpgsql security definer set search_path = '' as $$
declare
  n int;
begin
  update public.entitlements set user_id = p_user_id
  where email = lower(p_email) and user_id is null;
  get diagnostics n = row_count;
  update public.orders set user_id = p_user_id where email = lower(p_email) and user_id is null;
  update public.subscriptions set user_id = p_user_id where email = lower(p_email) and user_id is null;
  return n;
end;
$$;

/**
 * Applies a subscription.* event: data.subscription is the gateway's full, current view of the subscription.
 * Older snapshots than the one stored are ignored, so events may arrive in any order or twice.
 * Raises 22023 for data that can never be applied (unknown plan, missing fields).
 */
create function public.gateway_apply_subscription(p_data jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s jsonb := p_data -> 'subscription';
  v_gid text := s ->> 'id';
  v_status public.subscription_status;
  v_plan text;
  v_email text := lower(nullif(btrim(p_data -> 'customer' ->> 'email'), ''));
  v_member uuid;
  v_user uuid;
  v_updated timestamptz;
  v_trial timestamptz := nullif(s ->> 'trial_end', '')::timestamptz;
  v_period timestamptz := nullif(s ->> 'current_period_end', '')::timestamptz;
  v_until timestamptz;
  v_row public.subscriptions;
  v_existing public.subscriptions;
begin
  if v_gid is null or v_email is null or (s ->> 'status') is null or (s ->> 'plan_id') is null then
    raise exception 'subscription.id, subscription.status, subscription.plan_id and customer.email are required' using errcode = '22023';
  end if;
  if (s ->> 'status') not in ('trialing', 'active', 'past_due', 'canceled', 'expired') then
    raise exception 'unknown subscription status %', s ->> 'status' using errcode = '22023';
  end if;
  v_status := (s ->> 'status')::public.subscription_status;
  select code into v_plan from public.plans where gateway_plan_id = s ->> 'plan_id';
  if v_plan is null then
    raise exception 'unknown plan %: set the gateway plan ID in Integrations', s ->> 'plan_id' using errcode = '22023';
  end if;
  v_updated := coalesce(nullif(s ->> 'updated_at', '')::timestamptz, now());

  -- The member who started the checkout, else the account with this email.
  begin
    v_member := nullif(p_data -> 'metadata' ->> 'member_user_id', '')::uuid;
  exception when invalid_text_representation then
    v_member := null;
  end;
  select id into v_user from public.profiles where id = v_member;
  if v_user is null then
    select id into v_user from public.profiles where email = v_email;
  end if;

  v_until := case v_status
    when 'trialing' then coalesce(v_trial, v_period)
    when 'active' then v_period + interval '3 days'
    when 'past_due' then v_period + interval '3 days'
    when 'canceled' then case when coalesce((s ->> 'cancel_at_period_end')::boolean, false) then v_period else now() end
    else now()
  end;

  select * into v_existing from public.subscriptions where gateway_subscription_id = v_gid for update;
  if found and v_existing.gateway_updated_at > v_updated then
    return jsonb_build_object('subscription_id', v_existing.id, 'user_id', v_existing.user_id, 'status', v_existing.status, 'stale', true, 'new', false);
  end if;

  insert into public.subscriptions as t (
    user_id, email, plan_code, gateway_subscription_id, status, trial_ends_at, current_period_end,
    cancel_at_period_end, canceled_at, access_until, manage_url, gateway_updated_at
  ) values (
    v_user, v_email, v_plan, v_gid, v_status, v_trial, v_period,
    coalesce((s ->> 'cancel_at_period_end')::boolean, false), nullif(s ->> 'canceled_at', '')::timestamptz,
    v_until, case when (s ->> 'manage_url') ~ '^https://' then s ->> 'manage_url' end, v_updated
  )
  on conflict (gateway_subscription_id) do update set
    user_id = coalesce(t.user_id, excluded.user_id),
    email = excluded.email,
    plan_code = excluded.plan_code,
    status = excluded.status,
    trial_ends_at = excluded.trial_ends_at,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    canceled_at = excluded.canceled_at,
    access_until = excluded.access_until,
    manage_url = coalesce(excluded.manage_url, t.manage_url),
    gateway_updated_at = excluded.gateway_updated_at,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'subscription_id', v_row.id, 'user_id', v_row.user_id, 'email', v_row.email, 'status', v_row.status,
    'trial_ends_at', v_row.trial_ends_at, 'access_until', v_row.access_until, 'stale', false,
    'new', v_existing.id is null, 'started_email_sent', v_row.started_email_sent_at is not null
  );
end;
$$;
revoke execute on function public.gateway_apply_subscription(jsonb) from public, anon, authenticated;
grant execute on function public.gateway_apply_subscription(jsonb) to service_role;

-- The monthly picks are part of the plan now: only members with an active plan are due.
create function public.curation_due(p_month timestamptz, p_limit int default 40)
returns table (user_id uuid, spheres public.sphere[], token uuid, email text, full_name text, locale public.locale)
language sql stable security definer set search_path = '' as $$
  select c.user_id, c.spheres, c.token, p.email, p.full_name, p.locale
  from public.curation_subscriptions c
  join public.profiles p on p.id = c.user_id
  where c.unsubscribed_at is null
    and c.subscribed_at < p_month
    and (c.last_sent_at is null or c.last_sent_at < p_month)
    and public.plan_active(c.user_id)
  order by c.last_sent_at nulls first
  limit greatest(1, least(p_limit, 200));
$$;
revoke execute on function public.curation_due(timestamptz, int) from public, anon, authenticated;
grant execute on function public.curation_due(timestamptz, int) to service_role;

-- A subscriber has everything: the picks mark it as theirs.
create or replace function public.curation_picks(p_user_id uuid, p_limit int default 4)
returns table (product_id uuid, slug text, owned boolean)
language sql stable security definer set search_path = '' as $$
  with sub as (
    select s.spheres from public.curation_subscriptions s where s.user_id = p_user_id and s.unsubscribed_at is null
  ), sent as (
    select distinct unnest(c.product_ids) as id from public.curation_sends c where c.user_id = p_user_id
  ), picks as (
    select p.id, p.slug, p.sort_order,
      (p.access = 'free' or public.plan_active(p_user_id) or exists (
        select 1 from public.entitlements e where e.user_id = p_user_id and e.product_id = p.id and e.revoked_at is null
      )) as owned,
      exists (select 1 from sent where sent.id = p.id) as suggested
    from public.products p, sub
    where p.visibility = 'visible' and p.spheres && sub.spheres
  )
  select picks.id, picks.slug, picks.owned from picks
  order by picks.owned, picks.suggested, picks.sort_order, picks.id
  limit greatest(1, least(p_limit, 8));
$$;

-- Three more welcome questions (version 2): where they are in their faith, time with God each day,
-- and who they use the resources with.
alter table public.onboarding_responses
  add column faith_stage text check (faith_stage in ('exploring', 'new', 'growing', 'mature')),
  add column daily_time text check (daily_time in ('lt10', '10_30', '30_60', 'gt60')),
  add column study_with text[] not null default '{}'
    check (study_with <@ array['alone', 'spouse', 'children', 'group', 'ministry']);
