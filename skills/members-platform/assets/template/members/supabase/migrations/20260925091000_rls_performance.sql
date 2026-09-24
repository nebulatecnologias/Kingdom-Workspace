-- Performance fixes from the Supabase advisor.
-- 1. Policies call auth.uid() through a sub-select, so Postgres evaluates it once per query instead of once per row.
-- 2. Indexes on foreign keys that are filtered on or cascade on delete.

drop policy profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy orders_select on public.orders;
create policy orders_select on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy entitlements_select on public.entitlements;
create policy entitlements_select on public.entitlements for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy reading_progress_select on public.reading_progress;
create policy reading_progress_select on public.reading_progress for select to authenticated
  using (user_id = (select auth.uid()));

drop policy reading_progress_insert on public.reading_progress;
create policy reading_progress_insert on public.reading_progress for insert to authenticated
  with check (user_id = (select auth.uid()) and public.has_access(product_id));

drop policy reading_progress_update on public.reading_progress;
create policy reading_progress_update on public.reading_progress for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create index entitlements_product_idx on public.entitlements (product_id);
create index entitlements_order_idx on public.entitlements (order_id);
create index orders_user_idx on public.orders (user_id);
create index products_section_idx on public.products (section_id);
create index reading_progress_product_idx on public.reading_progress (product_id);
create index invites_order_idx on public.invites (order_id);
create index invites_created_by_idx on public.invites (created_by);
create index audit_log_actor_idx on public.audit_log (actor_id);
