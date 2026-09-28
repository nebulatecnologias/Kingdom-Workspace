-- Kingdom Members: initial schema.
-- Tables, enums, row-level security, helper functions and triggers.
-- Writes that change access (entitlements, invites, orders) happen only on the server with the service role;
-- members can read their own data and write only their profile basics and reading progress.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.locale as enum ('en', 'pt', 'es');
create type public.user_role as enum ('member', 'admin');
create type public.account_status as enum ('active', 'deactivated');
create type public.product_type as enum ('colouring', 'book', 'guide', 'workbook');
create type public.product_access as enum ('paid', 'free');
create type public.product_visibility as enum ('visible', 'soon', 'hidden');
create type public.entitlement_source as enum ('order', 'manual', 'free');
create type public.invite_status as enum ('sent', 'opened', 'accepted', 'expired', 'revoked');
create type public.invite_source as enum ('gateway', 'manual');
create type public.order_status as enum ('paid', 'refunded', 'partially_refunded', 'disputed', 'dispute_lost');
create type public.webhook_result as enum ('processed', 'duplicate', 'rejected', 'error');
create type public.email_status as enum ('queued', 'sent', 'failed');
create type public.file_format as enum ('pdf', 'epub');

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique check (email = lower(email)),
  full_name text not null default '',
  locale public.locale not null default 'en',
  role public.user_role not null default 'member',
  status public.account_status not null default 'active',
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.section_translations (
  section_id uuid not null references public.sections (id) on delete cascade,
  locale public.locale not null,
  name text not null,
  primary key (section_id, locale)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  type public.product_type not null,
  section_id uuid references public.sections (id) on delete set null,
  gateway_product_id text unique,
  price_cents int not null default 0 check (price_cents >= 0),
  currency char(3) not null default 'ZAR',
  access public.product_access not null default 'paid',
  visibility public.product_visibility not null default 'hidden',
  sort_order int not null default 0,
  cover_path text,
  field_colour text,
  page_count int check (page_count is null or page_count >= 0),
  free_sample boolean not null default false,
  checkout_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_translations (
  product_id uuid not null references public.products (id) on delete cascade,
  locale public.locale not null,
  title text not null,
  description text not null default '',
  verse text,
  verse_ref text,
  primary key (product_id, locale)
);

-- Printable pages (colouring packs, workbooks). locale null = same file for every language.
create table public.product_pages (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  locale public.locale,
  position int not null check (position > 0),
  title text not null default '',
  pdf_path text,
  preview_path text,
  lineart_path text,
  unique nulls not distinct (product_id, locale, position)
);

-- Chapters / steps for the online reader (eBooks, guides).
create table public.product_chapters (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  locale public.locale not null,
  position int not null check (position > 0),
  title text not null,
  body_html text not null default '',
  minutes int check (minutes is null or minutes >= 0),
  is_sample boolean not null default false,
  unique (product_id, locale, position)
);

-- Complete downloads per language.
create table public.product_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  locale public.locale not null,
  format public.file_format not null,
  path text not null,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  unique (product_id, locale, format)
);

-- ---------------------------------------------------------------------------
-- Sales and access
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  gateway_order_id text not null unique,
  reference text,
  email text not null check (email = lower(email)),
  user_id uuid references public.profiles (id) on delete set null,
  amount_cents int not null default 0,
  currency char(3) not null default 'ZAR',
  refunded_cents int not null default 0,
  status public.order_status not null,
  locale public.locale not null default 'en',
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_email_idx on public.orders (email);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Access to a product. Created with the buyer's email; linked to the account when it exists.
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  email text not null check (email = lower(email)),
  product_id uuid not null references public.products (id) on delete cascade,
  source public.entitlement_source not null,
  order_id uuid references public.orders (id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text
);
create unique index entitlements_active_key on public.entitlements (email, product_id) where revoked_at is null;
create index entitlements_user_idx on public.entitlements (user_id) where revoked_at is null;

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  full_name text not null default '',
  locale public.locale not null default 'en',
  token_hash bytea not null unique,
  product_ids uuid[] not null default '{}',
  status public.invite_status not null default 'sent',
  expires_at timestamptz not null,
  opened_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  source public.invite_source not null,
  order_id uuid references public.orders (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index invites_email_idx on public.invites (email);
create index invites_pending_idx on public.invites (expires_at) where status in ('sent', 'opened');

create table public.reading_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  chapter_position int not null check (chapter_position > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create trigger reading_progress_updated_at before update on public.reading_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Integrations, email and audit
-- ---------------------------------------------------------------------------
create table public.webhook_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now(),
  signature_ok boolean not null,
  result public.webhook_result not null,
  error text,
  payload jsonb
);
create index webhook_events_received_idx on public.webhook_events (received_at desc);

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  locale public.locale not null default 'en',
  status public.email_status not null default 'queued',
  provider_id text,
  attempts int not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index email_log_retry_idx on public.email_log (next_attempt_at) where status = 'failed';

create table public.integration_secrets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  secret_current text not null,
  secret_previous text,
  previous_valid_until timestamptz,
  updated_at timestamptz not null default now()
);
create trigger integration_secrets_updated_at before update on public.integration_secrets
  for each row execute function public.set_updated_at();

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  meta jsonb,
  at timestamptz not null default now()
);
create index audit_log_at_idx on public.audit_log (at desc);

-- ---------------------------------------------------------------------------
-- Helper functions (used by RLS policies)
-- ---------------------------------------------------------------------------
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- True when the signed-in member may open a product: an active entitlement, or a visible free product.
create function public.has_access(p_product_id uuid) returns boolean
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
  );
$$;

create function public.product_is_listed(p_product_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.products where id = p_product_id and visibility <> 'hidden');
$$;

-- ---------------------------------------------------------------------------
-- New auth user -> profile
-- ---------------------------------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_locale public.locale;
begin
  v_locale := case new.raw_user_meta_data ->> 'locale' when 'pt' then 'pt' when 'es' then 'es' else 'en' end;
  insert into public.profiles (id, email, full_name, locale, terms_accepted_at)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_locale,
    case when (new.raw_user_meta_data ->> 'terms_accepted') = 'true' then now() end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Server-only operations (service role)
-- ---------------------------------------------------------------------------

-- Consume a single-use invite atomically. Opening the link does NOT call this: only creating the account does,
-- because mail scanners pre-open links. Returns a result code instead of raising, so an 'expired' mark sticks.
create function public.consume_invite(p_token_hash bytea)
returns table (result text, invite_id uuid, email text, full_name text, locale public.locale, product_ids uuid[])
language plpgsql security definer set search_path = '' as $$
declare
  v public.invites%rowtype;
begin
  select * into v from public.invites i where i.token_hash = p_token_hash for update;
  if not found then
    return query select 'not_found'::text, null::uuid, null::text, null::text, null::public.locale, null::uuid[];
    return;
  end if;
  if v.status = 'accepted' then
    return query select 'used'::text, v.id, v.email, v.full_name, v.locale, v.product_ids;
    return;
  end if;
  if v.status = 'revoked' then
    return query select 'revoked'::text, v.id, v.email, v.full_name, v.locale, v.product_ids;
    return;
  end if;
  if v.status = 'expired' or v.expires_at <= now() then
    update public.invites set status = 'expired' where id = v.id and status <> 'expired';
    return query select 'expired'::text, v.id, v.email, v.full_name, v.locale, v.product_ids;
    return;
  end if;
  update public.invites set status = 'accepted', accepted_at = now() where id = v.id;
  return query select 'ok'::text, v.id, v.email, v.full_name, v.locale, v.product_ids;
end;
$$;

-- Attach entitlements that were granted by email before the account existed.
create function public.link_entitlements(p_user_id uuid, p_email text) returns int
language plpgsql security definer set search_path = '' as $$
declare
  n int;
begin
  update public.entitlements set user_id = p_user_id
  where email = lower(p_email) and user_id is null;
  get diagnostics n = row_count;
  update public.orders set user_id = p_user_id where email = lower(p_email) and user_id is null;
  return n;
end;
$$;

revoke execute on function public.consume_invite(bytea) from public, anon, authenticated;
revoke execute on function public.link_entitlements(uuid, text) from public, anon, authenticated;
grant execute on function public.consume_invite(bytea) to service_role;
grant execute on function public.link_entitlements(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sections enable row level security;
alter table public.section_translations enable row level security;
alter table public.products enable row level security;
alter table public.product_translations enable row level security;
alter table public.product_pages enable row level security;
alter table public.product_chapters enable row level security;
alter table public.product_files enable row level security;
alter table public.orders enable row level security;
alter table public.entitlements enable row level security;
alter table public.invites enable row level security;
alter table public.reading_progress enable row level security;
alter table public.webhook_events enable row level security;
alter table public.email_log enable row level security;
alter table public.integration_secrets enable row level security;
alter table public.audit_log enable row level security;

-- Profiles: read own (admins read all); members may change only their name and language.
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (full_name, locale) on public.profiles to authenticated;

-- Catalogue: listed items are public to signed-in members; hidden items only to admins.
create policy sections_select on public.sections for select to authenticated using (true);
create policy section_translations_select on public.section_translations for select to authenticated using (true);
create policy products_select on public.products for select to authenticated
  using (visibility <> 'hidden' or public.is_admin());
create policy product_translations_select on public.product_translations for select to authenticated
  using (public.product_is_listed(product_id) or public.is_admin());
create policy product_pages_select on public.product_pages for select to authenticated
  using (public.has_access(product_id) or public.is_admin());
create policy product_files_select on public.product_files for select to authenticated
  using (public.has_access(product_id) or public.is_admin());
create policy product_chapters_select on public.product_chapters for select to authenticated
  using (
    public.has_access(product_id)
    or public.is_admin()
    or (is_sample and public.product_is_listed(product_id)
        and exists (select 1 from public.products p where p.id = product_id and p.free_sample))
  );

-- Own purchases and access; admins see everything.
create policy orders_select on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy entitlements_select on public.entitlements for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Reading progress: fully owned by the member.
create policy reading_progress_select on public.reading_progress for select to authenticated
  using (user_id = auth.uid());
create policy reading_progress_insert on public.reading_progress for insert to authenticated
  with check (user_id = auth.uid() and public.has_access(product_id));
create policy reading_progress_update on public.reading_progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Admin-only reads. Writes go through the service role.
create policy invites_admin_select on public.invites for select to authenticated using (public.is_admin());
create policy webhook_events_admin_select on public.webhook_events for select to authenticated using (public.is_admin());
create policy email_log_admin_select on public.email_log for select to authenticated using (public.is_admin());
create policy audit_log_admin_select on public.audit_log for select to authenticated using (public.is_admin());
-- integration_secrets: no policy at all -> never readable through the API; the server reads it with the service role.

-- ---------------------------------------------------------------------------
-- Storage: private bucket for product files (only when running on Supabase)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public) values ('products', 'products', false)
    on conflict (id) do nothing;
  end if;
end;
$$;
