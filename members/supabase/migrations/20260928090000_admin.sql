-- Phase 4: administration.
-- Admin pages read and write with the service role, after the server has checked the admin's session
-- (requireAdmin). The functions below are therefore service-role only; RLS keeps protecting the public API.

-- ---------------------------------------------------------------------------
-- Two-step verification for administrators
-- ---------------------------------------------------------------------------
-- An admin who has turned on an authenticator app only counts as admin once the session has passed it (aal2).
-- Without this, a stolen password alone would still unlock every admin-only row through the API.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin' and p.status = 'active'
      and (
        coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'aal', 'aal1') = 'aal2'
        or not exists (select 1 from auth.mfa_factors f where f.user_id = p.id and f.status = 'verified')
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Chapters are written in a simple Markdown in the editor; body_html is what members read (sanitised).
-- ---------------------------------------------------------------------------
alter table public.product_chapters add column if not exists body_md text;

-- ---------------------------------------------------------------------------
-- Overview figures, in South African time.
-- ---------------------------------------------------------------------------
create function public.admin_overview() returns jsonb
language sql stable security definer set search_path = '' as $$
  with bounds as (
    select
      (date_trunc('month', now() at time zone 'Africa/Johannesburg') at time zone 'Africa/Johannesburg') as month_start,
      (date_trunc('week', now() at time zone 'Africa/Johannesburg') at time zone 'Africa/Johannesburg') as week_start
  ),
  weeks as (
    select w, b.week_start - make_interval(weeks => w) as from_at, b.week_start - make_interval(weeks => w - 1) as to_at
    from bounds b, generate_series(4, 0, -1) w
  )
  select jsonb_build_object(
    'members', (select count(*) from public.profiles where role = 'member'),
    'members_month', (select count(*) from public.profiles, bounds where role = 'member' and created_at >= month_start),
    'pending', (select count(*) from public.invites where status in ('sent', 'opened') and expires_at > now()),
    'expiring_week', (select count(*) from public.invites
                      where status in ('sent', 'opened') and expires_at > now() and expires_at <= now() + interval '7 days'),
    'unlocks_month', (select count(*) from public.entitlements, bounds where source = 'order' and granted_at >= month_start),
    'sales_month_cents', (select coalesce(sum(amount_cents - refunded_cents), 0) from public.orders, bounds
                          where created_at >= month_start and status in ('paid', 'partially_refunded')),
    'weeks', (select jsonb_agg(jsonb_build_object(
        'members', (select count(*) from public.profiles where role = 'member' and created_at >= from_at and created_at < to_at),
        'invites', (select count(*) from public.invites where created_at >= from_at and created_at < to_at),
        'unlocks', (select count(*) from public.entitlements where source = 'order' and granted_at >= from_at and granted_at < to_at)
      ) order by w desc) from weeks)
  );
$$;

-- ---------------------------------------------------------------------------
-- Ordering: the showcase and sections are saved as a full list of ids.
-- ---------------------------------------------------------------------------
create function public.admin_reorder_products(p_ids uuid[]) returns void
language sql security definer set search_path = '' as $$
  update public.products p set sort_order = x.i * 10
  from unnest(p_ids) with ordinality as x(id, i)
  where p.id = x.id;
$$;

create function public.admin_reorder_sections(p_ids uuid[]) returns void
language sql security definer set search_path = '' as $$
  update public.sections s set sort_order = x.i * 10
  from unnest(p_ids) with ordinality as x(id, i)
  where s.id = x.id;
$$;

-- ---------------------------------------------------------------------------
-- Pages keep positions 1..n with no gaps, and every language moves together.
-- (Chapters are saved as a whole list by the editor, so they need no helper.)
-- Positions are unique, so rows are parked out of the way first.
-- ---------------------------------------------------------------------------
create function public.admin_move_page(p_product uuid, p_from int, p_to int) returns void
language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  select max(position) into n from public.product_pages where product_id = p_product;
  if n is null or p_from = p_to or p_from < 1 or p_to < 1 or p_from > n or p_to > n then return; end if;
  update public.product_pages set position = position + 100000 where product_id = p_product;
  update public.product_pages set position = case
      when position - 100000 = p_from then p_to
      when p_from < p_to and position - 100000 > p_from and position - 100000 <= p_to then position - 100001
      when p_from > p_to and position - 100000 >= p_to and position - 100000 < p_from then position - 99999
      else position - 100000 end
  where product_id = p_product;
end;
$$;

create function public.admin_delete_page(p_product uuid, p_position int) returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.product_pages where product_id = p_product and position = p_position;
  update public.product_pages set position = position + 100000 where product_id = p_product and position > p_position;
  update public.product_pages set position = position - 100001 where product_id = p_product and position > 100000;
end;
$$;

revoke execute on function public.admin_overview() from public, anon, authenticated;
revoke execute on function public.admin_reorder_products(uuid[]) from public, anon, authenticated;
revoke execute on function public.admin_reorder_sections(uuid[]) from public, anon, authenticated;
revoke execute on function public.admin_move_page(uuid, int, int) from public, anon, authenticated;
revoke execute on function public.admin_delete_page(uuid, int) from public, anon, authenticated;
grant execute on function public.admin_overview() to service_role;
grant execute on function public.admin_reorder_products(uuid[]) to service_role;
grant execute on function public.admin_reorder_sections(uuid[]) to service_role;
grant execute on function public.admin_move_page(uuid, int, int) to service_role;
grant execute on function public.admin_delete_page(uuid, int) to service_role;

-- The activity feed and the audit page read the newest entries first, sometimes for one target.
create index if not exists audit_log_target_idx on public.audit_log (target_type, target_id, at desc);
