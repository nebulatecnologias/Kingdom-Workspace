-- Home tab: panoramic banners the admin schedules for offers and news.
-- Members never read the table: home_banners() returns only the banners meant for them right now.

create type public.banner_audience as enum ('all', 'not_owner');

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  locale public.locale,                                   -- null: shown in every language
  title text not null check (char_length(title) between 1 and 120),  -- also the image's alt text
  body text check (char_length(body) <= 280),
  cta_label text check (char_length(cta_label) <= 40),
  link text check (link is null or link ~ '^(/($|[^/\\])|https://)'), -- a page of this site or an https address
  image_path text,                                        -- wide image (computer), in the products bucket
  image_mobile_path text,                                 -- taller image for phones; falls back to image_path
  audience public.banner_audience not null default 'all',
  product_id uuid references public.products(id) on delete cascade, -- 'not_owner': hidden from owners of this product
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_audience_product check (audience = 'all' or product_id is not null),
  constraint banners_dates check (ends_at is null or starts_at is null or ends_at > starts_at)
);
create index banners_product_id_idx on public.banners (product_id);

alter table public.banners enable row level security;
-- No policies on purpose: the admin works through the service role, members through home_banners().

create function public.home_banners(p_locale public.locale)
returns table (id uuid, title text, body text, cta_label text, link text, image_path text, image_mobile_path text)
language sql stable security definer set search_path = '' as $$
  select b.id, b.title, b.body, b.cta_label, b.link, b.image_path, b.image_mobile_path
  from public.banners b
  where auth.uid() is not null
    and b.active
    and (b.locale is null or b.locale = p_locale)
    and (b.starts_at is null or b.starts_at <= now())
    and (b.ends_at is null or b.ends_at > now())
    and (b.audience = 'all' or not public.has_access(b.product_id))
  order by b.sort_order, b.created_at desc
  limit 8;
$$;

revoke all on public.banners from anon, authenticated;
revoke execute on function public.home_banners(public.locale) from public, anon;
grant execute on function public.home_banners(public.locale) to authenticated, service_role;
