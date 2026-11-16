-- Avisos por email dos formulários (aplicado a 16/11/2026 como painel_003_avisos_email + remetente_reserva)
alter table public.painel_sites
  add column if not exists email_avisos text[] not null default '{}',
  add column if not exists remetente_avisos text,
  add column if not exists remetente_reserva text,
  add column if not exists marca jsonb not null default '{}'::jsonb;
alter table public.painel_mensagens add column if not exists aviso jsonb;
-- Kingdom: avisos para contact@kingdomcompany.co.za, de noreply@kingdomcompany.co.za
-- (reserva noreply@kingdomcompny.com enquanto a chave da Resend do painel não envia do domínio do site).
