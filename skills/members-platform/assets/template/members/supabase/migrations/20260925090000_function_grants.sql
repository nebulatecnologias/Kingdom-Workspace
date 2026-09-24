-- Tighten who can call the helper functions through the API (/rest/v1/rpc/...).
-- Postgres grants EXECUTE to PUBLIC by default, which the Supabase security advisor flags for SECURITY DEFINER functions.

-- Trigger function: only ever runs as the auth.users trigger, never as an API call.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Used inside RLS policies, which apply only to signed-in members: visitors have no reason to call them.
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.has_access(uuid) from public, anon;
revoke execute on function public.product_is_listed(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.has_access(uuid) to authenticated, service_role;
grant execute on function public.product_is_listed(uuid) to authenticated, service_role;
