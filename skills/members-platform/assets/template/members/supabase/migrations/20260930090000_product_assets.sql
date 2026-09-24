-- Kits: a product can carry any number of materials (PDFs, eBooks, images, audio, a ZIP of everything).
-- product_assets replaces product_files, which held one PDF/EPUB per language. Access does not change:
-- whoever owns the product gets every material, so a kit bought through the gateway opens all of it at
-- once and a refund closes all of it.

alter type public.product_type add value if not exists 'kit';
create type public.asset_kind as enum ('pdf', 'epub', 'image', 'audio', 'zip');

create table public.product_assets (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- null = the same file for every language
  locale public.locale,
  position int not null check (position > 0),
  title text not null default '' check (char_length(title) <= 150),
  kind public.asset_kind not null,
  path text not null,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  duration_seconds int check (duration_seconds is null or duration_seconds >= 0),
  created_at timestamptz not null default now()
);
create index product_assets_product_idx on public.product_assets (product_id, position);

alter table public.product_assets enable row level security;
create policy product_assets_select on public.product_assets for select to authenticated
  using (public.has_access(product_id) or public.is_admin());

-- Existing downloads become the product's first materials.
insert into public.product_assets (product_id, locale, position, kind, path, size_bytes)
select product_id, locale,
  row_number() over (partition by product_id order by locale, format)::int,
  format::text::public.asset_kind, path, size_bytes
from public.product_files;

drop table public.product_files;

-- Which language's materials a member sees: their own when the product has any, otherwise English.
-- Materials without a language are shown to everyone.
create function public.asset_locale(p_product_id uuid, p_locale public.locale) returns public.locale
language sql stable security definer set search_path = '' as $$
  select case when exists (select 1 from public.product_assets where product_id = p_product_id and locale = p_locale)
              then p_locale else 'en'::public.locale end;
$$;

-- The list of materials of one listed product, without the files: "What's included" on a locked kit,
-- and the materials list for owners (the download route checks access before signing a link).
create function public.product_contents(p_product_id uuid, p_locale public.locale)
returns table (id uuid, kind public.asset_kind, title text, size_bytes bigint, duration_seconds int)
language sql stable security definer set search_path = '' as $$
  select a.id, a.kind, a.title, a.size_bytes, a.duration_seconds
  from public.product_assets a
  where auth.uid() is not null
    and (public.product_is_listed(p_product_id) or public.is_admin())
    and a.product_id = p_product_id
    and (a.locale is null or a.locale = public.asset_locale(p_product_id, p_locale))
  order by a.position, a.created_at;
$$;

-- The library adds the number of materials (a kit's card shows "12 items"); a ZIP of everything is not one more.
drop function public.library_items(public.locale);
create function public.library_items(p_locale public.locale)
returns table (
  id uuid, slug text, type public.product_type, access public.product_access, visibility public.product_visibility,
  section_slug text, section_name text, section_order int, sort_order int,
  title text, cover_path text, field_colour text, page_count int, chapter_count int, price_cents int,
  owned boolean, asset_count int
)
language sql stable security definer set search_path = '' as $$
  select
    p.id, p.slug, p.type, p.access, p.visibility,
    s.slug, coalesce(st.name, st_en.name, s.slug), coalesce(s.sort_order, 999), p.sort_order,
    coalesce(pt.title, pt_en.title, p.slug), p.cover_path, p.field_colour, p.page_count,
    (select count(*)::int from public.product_chapters c
      where c.product_id = p.id
        and c.locale = case when exists (select 1 from public.product_chapters c2 where c2.product_id = p.id and c2.locale = p_locale) then p_locale else 'en' end),
    p.price_cents,
    p.visibility = 'visible' and public.has_access(p.id),
    (select count(*)::int from public.product_assets a
      where a.product_id = p.id and a.kind <> 'zip' and (a.locale is null or a.locale = public.asset_locale(p.id, p_locale)))
  from public.products p
  left join public.sections s on s.id = p.section_id
  left join public.section_translations st on st.section_id = s.id and st.locale = p_locale
  left join public.section_translations st_en on st_en.section_id = s.id and st_en.locale = 'en'
  left join public.product_translations pt on pt.product_id = p.id and pt.locale = p_locale
  left join public.product_translations pt_en on pt_en.product_id = p.id and pt_en.locale = 'en'
  where auth.uid() is not null and p.visibility <> 'hidden'
  order by coalesce(s.sort_order, 999), p.sort_order, p.slug;
$$;

-- Materials are reordered as a whole list (service role only, like the other admin functions).
create function public.admin_reorder_assets(p_product uuid, p_ids uuid[]) returns void
language sql security definer set search_path = '' as $$
  update public.product_assets a set position = o.n
  from unnest(p_ids) with ordinality as o(id, n)
  where a.id = o.id and a.product_id = p_product;
$$;

revoke execute on function public.asset_locale(uuid, public.locale) from public, anon, authenticated;
revoke execute on function public.product_contents(uuid, public.locale) from public, anon;
revoke execute on function public.library_items(public.locale) from public, anon;
revoke execute on function public.admin_reorder_assets(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.asset_locale(uuid, public.locale) to service_role;
grant execute on function public.product_contents(uuid, public.locale) to authenticated, service_role;
grant execute on function public.library_items(public.locale) to authenticated, service_role;
grant execute on function public.admin_reorder_assets(uuid, uuid[]) to service_role;

-- Storage accepts audio (MP3, M4A) and ZIP files too; the 50 MB limit per file stays.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    update storage.buckets
    set allowed_mime_types = array[
      'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/epub+zip',
      'audio/mpeg', 'audio/mp4', 'application/zip'
    ]
    where id = 'products';
  end if;
end;
$$;
