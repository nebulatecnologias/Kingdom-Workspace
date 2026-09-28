-- Welcome questionnaire, the member's answer history (admin only) and the automatic monthly curation email.

-- The six spheres of Christian life used for challenges, curation and product tags.
create type public.sphere as enum (
  'peace_rest', 'prayer_intimacy', 'family_relationships', 'money_stewardship', 'purpose_calling', 'growth_transformation'
);

-- Admins tag products with spheres; the monthly email picks from products tagged with the member's spheres.
alter table public.products add column spheres public.sphere[] not null default '{}';

-- Set when the member answers the questionnaire (skipping leaves it empty, so Home keeps offering it). Members read it (own profile) but cannot write it:
-- their update grant stays limited to full_name and locale.
alter table public.profiles add column onboarded_at timestamptz;

-- Every answer is kept, newest last, so the admin sees how a member's needs change. Never shown to members.
create table public.onboarding_responses (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  quiz_version int not null default 1,
  skipped boolean not null default false,
  content_types text[] not null default '{}'
    check (content_types <@ array['colouring', 'books', 'guides', 'kits', 'courses', 'audio']),
  challenges public.sphere[] not null default '{}',
  curation_opt_in boolean not null default false,
  curation_spheres public.sphere[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint onboarding_curation_spheres check (not curation_opt_in or cardinality(curation_spheres) > 0)
);
create index onboarding_responses_user_idx on public.onboarding_responses (user_id, created_at desc);

-- Who receives the monthly email and on which spheres. The token is the one-click unsubscribe link.
create table public.curation_subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  spheres public.sphere[] not null check (cardinality(spheres) > 0),
  token uuid not null unique default gen_random_uuid(),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  last_sent_at timestamptz
);

-- One row per member per month: what was sent, so next month suggests something new.
create table public.curation_sends (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  month date not null,
  product_ids uuid[] not null default '{}',
  status text not null check (status in ('sent', 'failed', 'empty')),
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

alter table public.onboarding_responses enable row level security;
alter table public.curation_subscriptions enable row level security;
alter table public.curation_sends enable row level security;
-- No policies on purpose: only the server (service role) reads and writes these tables.
revoke all on public.onboarding_responses, public.curation_subscriptions, public.curation_sends from anon, authenticated;

-- Up to p_limit visible products for this month's email: tagged with the member's spheres, the ones they
-- don't have yet first, then ones never suggested before, then showcase order.
create function public.curation_picks(p_user_id uuid, p_limit int default 4)
returns table (product_id uuid, slug text, owned boolean)
language sql stable security definer set search_path = '' as $$
  with sub as (
    select s.spheres from public.curation_subscriptions s where s.user_id = p_user_id and s.unsubscribed_at is null
  ), sent as (
    select distinct unnest(c.product_ids) as id from public.curation_sends c where c.user_id = p_user_id
  ), picks as (
    select p.id, p.slug, p.sort_order,
      (p.access = 'free' or exists (
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
revoke execute on function public.curation_picks(uuid, int) from public, anon, authenticated;
grant execute on function public.curation_picks(uuid, int) to service_role;
