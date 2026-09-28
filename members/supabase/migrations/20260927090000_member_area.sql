-- Phase 3: member area read models.
-- Row-level security hides a product's content (pages, chapters, files) from members who do not own it,
-- but the library and product pages still need its outline: titles, reading times and thumbnails.
-- These functions return exactly that, never the content itself, for listed products only.

-- One row per listed product for the library, in the member's language (English fallback), with ownership.
create function public.library_items(p_locale public.locale)
returns table (
  id uuid, slug text, type public.product_type, access public.product_access, visibility public.product_visibility,
  section_slug text, section_name text, section_order int, sort_order int,
  title text, cover_path text, field_colour text, page_count int, chapter_count int, price_cents int,
  owned boolean
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
    p.visibility = 'visible' and public.has_access(p.id)
  from public.products p
  left join public.sections s on s.id = p.section_id
  left join public.section_translations st on st.section_id = s.id and st.locale = p_locale
  left join public.section_translations st_en on st_en.section_id = s.id and st_en.locale = 'en'
  left join public.product_translations pt on pt.product_id = p.id and pt.locale = p_locale
  left join public.product_translations pt_en on pt_en.product_id = p.id and pt_en.locale = 'en'
  where auth.uid() is not null and p.visibility <> 'hidden'
  order by coalesce(s.sort_order, 999), p.sort_order, p.slug;
$$;

-- The outline of one listed product: chapters (reading products) or pages (colouring packs and workbooks).
-- Page line art is included only for built-in sample art or when the member has access; otherwise just the preview.
create function public.product_outline(p_product_id uuid, p_locale public.locale)
returns table (kind text, "position" int, title text, minutes int, is_sample boolean, preview_path text, lineart_path text)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_access boolean;
  v_chapter_locale public.locale;
begin
  if auth.uid() is null or not (public.product_is_listed(p_product_id) or public.is_admin()) then
    return;
  end if;
  v_access := public.has_access(p_product_id) or public.is_admin();

  select case when exists (select 1 from public.product_chapters where product_id = p_product_id and locale = p_locale)
              then p_locale else 'en'::public.locale end
  into v_chapter_locale;

  return query
    select 'chapter'::text, c.position, c.title, c.minutes, c.is_sample, null::text, null::text
    from public.product_chapters c
    where c.product_id = p_product_id and c.locale = v_chapter_locale
    order by c.position;

  return query
    select 'page'::text, pg.position, pg.title, null::int, false, pg.preview_path,
      case when v_access or pg.lineart_path like 'builtin:%' then pg.lineart_path end
    from public.product_pages pg
    where pg.product_id = p_product_id
      and pg.locale is not distinct from (
        select x.locale from public.product_pages x
        where x.product_id = p_product_id and (x.locale = p_locale or x.locale is null or x.locale = 'en')
        order by case when x.locale = p_locale then 0 when x.locale is null then 1 else 2 end
        limit 1)
    order by pg.position;
end;
$$;

revoke execute on function public.library_items(public.locale) from public, anon;
revoke execute on function public.product_outline(uuid, public.locale) from public, anon;
grant execute on function public.library_items(public.locale) to authenticated, service_role;
grant execute on function public.product_outline(uuid, public.locale) to authenticated, service_role;

-- Reading progress is saved with upsert; members may only move their own row.
create index if not exists reading_progress_user_idx on public.reading_progress (user_id, updated_at desc);
