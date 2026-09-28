-- Fixed-window rate limiting for sign-in, link requests and invite acceptance.
-- Works on serverless without extra infrastructure; only the server (service role) can call it.

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits int not null default 0
);
alter table public.rate_limits enable row level security;
-- No policies: not readable or writable through the API.

-- Registers one hit for p_key and returns true while the key is within p_limit hits per p_window_seconds.
create function public.hit_rate_limit(p_key text, p_limit int, p_window_seconds int) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_hits int;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;

revoke execute on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, int, int) to service_role;

-- Old windows are useless after a day; the invite-expiry cron job also calls this cleanup.
create function public.prune_rate_limits() returns void
language sql security definer set search_path = '' as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;
revoke execute on function public.prune_rate_limits() from public, anon, authenticated;
grant execute on function public.prune_rate_limits() to service_role;
