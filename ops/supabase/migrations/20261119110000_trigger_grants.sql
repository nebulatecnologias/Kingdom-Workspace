-- Kingdom Ops — migration 0002: trigger functions are not an API.
-- The security-definer history triggers were callable through /rest/v1/rpc (Supabase advisor 0028/0029).
revoke execute on function public.cards_log_activity() from public, anon, authenticated;
revoke execute on function public.minutes_log_activity() from public, anon, authenticated;
