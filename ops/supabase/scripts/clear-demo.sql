-- Removes the prototype's sample cards, history and minutes; keeps the team and the five pipelines.
-- Run once before the team starts using the app for real (Supabase SQL editor or MCP execute_sql).
begin;
delete from public.minutes;
delete from public.card_activity;
delete from public.card_participants;
delete from public.cards;
commit;
