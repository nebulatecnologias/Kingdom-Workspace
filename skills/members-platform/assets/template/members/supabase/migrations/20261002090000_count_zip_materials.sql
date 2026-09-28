-- A ZIP counts as one material like any other file: a kit with a ZIP and two loose files shows "3 items".
create or replace function public.library_items(p_locale public.locale)
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
      where a.product_id = p.id and (a.locale is null or a.locale = public.asset_locale(p.id, p_locale)))
  from public.products p
  left join public.sections s on s.id = p.section_id
  left join public.section_translations st on st.section_id = s.id and st.locale = p_locale
  left join public.section_translations st_en on st_en.section_id = s.id and st_en.locale = 'en'
  left join public.product_translations pt on pt.product_id = p.id and pt.locale = p_locale
  left join public.product_translations pt_en on pt_en.product_id = p.id and pt_en.locale = 'en'
  where auth.uid() is not null and p.visibility <> 'hidden'
  order by coalesce(s.sort_order, 999), p.sort_order, p.slug;
$$;
