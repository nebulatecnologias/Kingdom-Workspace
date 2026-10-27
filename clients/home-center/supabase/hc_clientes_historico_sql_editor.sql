-- Home Center: clientes por e-mail, histórico e avaliações verificadas.
-- Correr tudo de uma vez no SQL Editor do Supabase (projecto Kingdom Dashboard).
-- Está dentro de uma transacção: se der erro, nada fica aplicado.

begin;

create table public.hc_clientes (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and char_length(email) <= 254 and email ~ '^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$'),
  nome text not null check (char_length(btrim(nome)) between 2 and 80),
  criado_em timestamptz not null default now(),
  actualizado_em timestamptz not null default now()
);
comment on table public.hc_clientes is 'Home Center: um cliente por e-mail. Dados pessoais: sem acesso directo, só por funções que mascaram.';

create table public.hc_eventos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.hc_clientes (id) on delete cascade,
  tipo text not null check (tipo in ('compra', 'avaliacao_qr', 'nps', 'mensagem', 'avaliacao_publica')),
  referencia text check (char_length(referencia) <= 60),
  resumo text not null check (char_length(resumo) <= 300),
  valor numeric(14, 2),
  loja text check (loja in ('angola', 'baia', 'matola')),
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);
comment on table public.hc_eventos is 'Home Center: histórico de cada cliente (compras, avaliações por QR, NPS, mensagens, avaliações públicas).';
create index hc_eventos_cliente_idx on public.hc_eventos (cliente_id, criado_em desc);
create unique index hc_eventos_referencia_unica on public.hc_eventos (tipo, referencia) where referencia is not null;

alter table public.hc_avaliacoes
  add column cliente_id uuid references public.hc_clientes (id),
  add column estado text not null default 'pendente' check (estado in ('pendente', 'confirmada')),
  add column confirmado_em timestamptz;
create index hc_avaliacoes_cliente_idx on public.hc_avaliacoes (cliente_id);

create table public.hc_confirmacoes (
  avaliacao_id uuid primary key references public.hc_avaliacoes (id) on delete cascade,
  token_hash text not null unique,
  email text not null,
  expira_em timestamptz not null,
  email_enviado boolean,
  criado_em timestamptz not null default now()
);
comment on table public.hc_confirmacoes is 'Home Center: códigos de confirmação das avaliações (só o hash). Só o servidor lê.';

-- Fecho total das tabelas com dados pessoais e das avaliações: tudo passa pelas funções.
alter table public.hc_clientes enable row level security;
alter table public.hc_eventos enable row level security;
alter table public.hc_confirmacoes enable row level security;
revoke all on public.hc_clientes, public.hc_eventos, public.hc_confirmacoes from anon, authenticated;
drop policy if exists hc_avaliacoes_ler on public.hc_avaliacoes;
drop policy if exists hc_avaliacoes_enviar on public.hc_avaliacoes;
revoke all on public.hc_avaliacoes from anon, authenticated;

create or replace function public.hc_mascarar_email(e text) returns text
language sql immutable set search_path = public as $$
  select case when e is null then null else left(split_part(e, '@', 1), 1) || '•••@' || split_part(e, '@', 2) end
$$;

create or replace function public.hc_mascarar_nome(n text) returns text
language sql immutable set search_path = public as $$
  select case when n is null then null
    when position(' ' in btrim(n)) = 0 then btrim(n)
    else split_part(btrim(n), ' ', 1) || ' ' || left(reverse(split_part(reverse(btrim(n)), ' ', 1)), 1) || '.' end
$$;

-- O cliente pelo e-mail; cria-o se for novo. O nome fica o do primeiro registo.
create or replace function public.hc_cliente_id(p_email text, p_nome text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_email text := lower(btrim(p_email));
begin
  insert into public.hc_clientes (email, nome) values (v_email, btrim(p_nome))
  on conflict (email) do update set actualizado_em = now()
  returning id into v_id;
  return v_id;
end $$;

-- Chamada só pela função hc-avaliacao (chave de serviço): guarda a nota, junta ao cliente e
-- devolve o código de confirmação que segue por e-mail.
create or replace function public.hc_enviar_avaliacao(
  p_codigo text, p_estrelas int, p_c1 int, p_c2 int, p_c3 int, p_comentario text, p_nome text, p_email text
) returns table (avaliacao_id uuid, token text, colaborador_nome text, colaborador_funcao text, cliente_nome text)
language plpgsql security definer set search_path = public as $$
declare
  v_col public.hc_colaboradores%rowtype;
  v_cliente uuid;
  v_id uuid;
  v_token text := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  v_email text := lower(btrim(coalesce(p_email, '')));
begin
  select * into v_col from public.hc_colaboradores where codigo = upper(btrim(p_codigo)) and activo;
  if not found then raise exception 'Não encontrámos este colaborador.' using errcode = 'P0001'; end if;
  if char_length(btrim(coalesce(p_nome, ''))) < 2 then raise exception 'Escreva o seu nome.' using errcode = 'P0001'; end if;
  if v_email !~ '^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$' or char_length(v_email) > 254 then
    raise exception 'O e-mail não parece válido.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.hc_confirmacoes c where c.criado_em > now() - interval '1 day') >= 200 then
    raise exception 'Limite diário de avaliações atingido. Tente amanhã.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.hc_confirmacoes c where c.email = v_email and c.criado_em > now() - interval '1 day') >= 5 then
    raise exception 'Este e-mail já enviou muitas avaliações hoje.' using errcode = 'P0001';
  end if;
  v_cliente := public.hc_cliente_id(v_email, p_nome);
  if exists (select 1 from public.hc_avaliacoes a where a.cliente_id = v_cliente and a.codigo = v_col.codigo and a.criado_em > now() - interval '1 day') then
    raise exception 'Já avaliou % hoje com este e-mail.', split_part(v_col.nome, ' ', 1) using errcode = 'P0001';
  end if;
  insert into public.hc_avaliacoes (codigo, estrelas, c1, c2, c3, comentario, cliente_id)
  values (v_col.codigo, p_estrelas, p_c1, p_c2, p_c3, nullif(btrim(coalesce(p_comentario, '')), ''), v_cliente)
  returning id into v_id;
  insert into public.hc_eventos (cliente_id, tipo, referencia, resumo, loja, dados)
  values (v_cliente, 'avaliacao_qr', 'QR-' || v_id::text,
    p_estrelas || (case when p_estrelas = 1 then ' estrela' else ' estrelas' end) || ' a ' || v_col.nome ||
      (case when v_col.funcao = 'montagem' then ' (entrega e montagem, equipa ' || v_col.equipa || ')' else ' (atendimento)' end),
    v_col.loja,
    jsonb_build_object('avaliacao_id', v_id, 'codigo', v_col.codigo, 'estrelas', p_estrelas, 'c1', p_c1, 'c2', p_c2, 'c3', p_c3,
      'comentario', nullif(btrim(coalesce(p_comentario, '')), ''), 'estado', 'pendente'));
  insert into public.hc_confirmacoes (avaliacao_id, token_hash, email, expira_em)
  values (v_id, encode(sha256(convert_to(v_token, 'UTF8')), 'hex'), v_email, now() + interval '7 days');
  return query select v_id, v_token, v_col.nome, v_col.funcao, (select c.nome from public.hc_clientes c where c.id = v_cliente);
end $$;

create or replace function public.hc_marcar_envio(p_avaliacao uuid, p_ok boolean) returns void
language sql security definer set search_path = public as $$
  update public.hc_confirmacoes set email_enviado = p_ok where avaliacao_id = p_avaliacao
$$;

-- Chamada só pela função hc-avaliacao: confirma a avaliação cujo código vem no link do e-mail.
create or replace function public.hc_confirmar_avaliacao(p_token text)
returns table (estado text, colaborador_nome text, cliente_nome text, ja_estava boolean)
language plpgsql security definer set search_path = public as $$
declare v_conf public.hc_confirmacoes%rowtype; v_av public.hc_avaliacoes%rowtype;
begin
  select * into v_conf from public.hc_confirmacoes c where c.token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
  if not found then raise exception 'Este link de confirmação não é válido.' using errcode = 'P0001'; end if;
  select * into v_av from public.hc_avaliacoes a where a.id = v_conf.avaliacao_id;
  if v_av.estado = 'confirmada' then
    return query select 'confirmada'::text, (select nome from public.hc_colaboradores where codigo = v_av.codigo), (select nome from public.hc_clientes where id = v_av.cliente_id), true;
    return;
  end if;
  if v_conf.expira_em < now() then raise exception 'Este link expirou. Leia o QR de novo para avaliar.' using errcode = 'P0001'; end if;
  update public.hc_avaliacoes set estado = 'confirmada', confirmado_em = now() where id = v_av.id;
  update public.hc_eventos set dados = dados || jsonb_build_object('estado', 'confirmada')
   where tipo = 'avaliacao_qr' and referencia = 'QR-' || v_av.id::text;
  return query select 'confirmada'::text, (select nome from public.hc_colaboradores where codigo = v_av.codigo), (select nome from public.hc_clientes where id = v_av.cliente_id), false;
end $$;

-- Leituras públicas do dashboard: sempre mascaradas.
create or replace function public.hc_avaliacoes_lista(p_limite int default 1000)
returns table (id uuid, codigo text, estrelas smallint, c1 smallint, c2 smallint, c3 smallint, comentario text, criado_em timestamptz,
  estado text, confirmado_em timestamptz, cliente_id uuid, cliente_nome text, cliente_email text, com_compra boolean)
language sql stable security definer set search_path = public as $$
  select a.id, a.codigo, a.estrelas, a.c1, a.c2, a.c3, a.comentario, a.criado_em, a.estado, a.confirmado_em, a.cliente_id,
    public.hc_mascarar_nome(c.nome), public.hc_mascarar_email(c.email),
    exists (select 1 from public.hc_eventos e where e.cliente_id = a.cliente_id and e.tipo = 'compra')
  from public.hc_avaliacoes a left join public.hc_clientes c on c.id = a.cliente_id
  order by a.criado_em desc
  limit least(greatest(coalesce(p_limite, 1000), 1), 2000)
$$;

create or replace function public.hc_clientes_lista()
returns table (id uuid, nome text, email text, criado_em timestamptz, ultimo_em timestamptz, compras int, total_compras numeric,
  avaliacoes int, avaliacoes_confirmadas int, nps int, mensagens int, publicas int)
language sql stable security definer set search_path = public as $$
  select c.id, public.hc_mascarar_nome(c.nome), public.hc_mascarar_email(c.email), c.criado_em,
    (select max(e.criado_em) from public.hc_eventos e where e.cliente_id = c.id),
    (select count(*)::int from public.hc_eventos e where e.cliente_id = c.id and e.tipo = 'compra'),
    coalesce((select sum(e.valor) from public.hc_eventos e where e.cliente_id = c.id and e.tipo = 'compra'), 0),
    (select count(*)::int from public.hc_avaliacoes a where a.cliente_id = c.id),
    (select count(*)::int from public.hc_avaliacoes a where a.cliente_id = c.id and a.estado = 'confirmada'),
    (select count(*)::int from public.hc_eventos e where e.cliente_id = c.id and e.tipo = 'nps'),
    (select count(*)::int from public.hc_eventos e where e.cliente_id = c.id and e.tipo = 'mensagem'),
    (select count(*)::int from public.hc_eventos e where e.cliente_id = c.id and e.tipo = 'avaliacao_publica')
  from public.hc_clientes c
  order by 5 desc nulls last
  limit 500
$$;

create or replace function public.hc_cliente_historico(p_cliente uuid)
returns table (id uuid, tipo text, referencia text, resumo text, valor numeric, loja text, dados jsonb, criado_em timestamptz)
language sql stable security definer set search_path = public as $$
  select e.id, e.tipo, e.referencia, e.resumo, e.valor, e.loja, e.dados, e.criado_em
  from public.hc_eventos e where e.cliente_id = p_cliente
  order by e.criado_em desc
  limit 300
$$;

-- Escrita do dashboard (protótipo sem login): junta uma compra, NPS ou mensagem ao cliente do e-mail.
-- Com login, passa a ser só para contas da gestão.
create or replace function public.hc_registar_evento(
  p_email text, p_nome text, p_tipo text, p_referencia text, p_resumo text, p_valor numeric, p_loja text, p_dados jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_cliente uuid;
begin
  if p_tipo not in ('compra', 'nps', 'mensagem') then raise exception 'Tipo de registo não permitido.' using errcode = 'P0001'; end if;
  if (select count(*) from public.hc_eventos e where e.criado_em > now() - interval '1 day') >= 1000 then
    raise exception 'Limite diário de registos atingido.' using errcode = 'P0001';
  end if;
  v_cliente := public.hc_cliente_id(p_email, p_nome);
  insert into public.hc_eventos (cliente_id, tipo, referencia, resumo, valor, loja, dados)
  values (v_cliente, p_tipo, nullif(btrim(coalesce(p_referencia, '')), ''), left(btrim(p_resumo), 300), p_valor, p_loja, coalesce(p_dados, '{}'::jsonb) - 'email')
  on conflict (tipo, referencia) where referencia is not null do nothing;
  return v_cliente;
end $$;

revoke all on function public.hc_mascarar_email(text), public.hc_mascarar_nome(text), public.hc_cliente_id(text, text),
  public.hc_enviar_avaliacao(text, int, int, int, int, text, text, text), public.hc_marcar_envio(uuid, boolean),
  public.hc_confirmar_avaliacao(text), public.hc_avaliacoes_lista(int), public.hc_clientes_lista(),
  public.hc_cliente_historico(uuid), public.hc_registar_evento(text, text, text, text, text, numeric, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.hc_enviar_avaliacao(text, int, int, int, int, text, text, text), public.hc_marcar_envio(uuid, boolean),
  public.hc_confirmar_avaliacao(text) to service_role;
grant execute on function public.hc_avaliacoes_lista(int), public.hc_clientes_lista(), public.hc_cliente_historico(uuid),
  public.hc_registar_evento(text, text, text, text, text, numeric, text, jsonb) to anon, authenticated, service_role;

-- Clientes e histórico de demonstração (fictícios), ligados aos pedidos, conversas e NPS do dashboard.
insert into public.hc_clientes (id, email, nome, criado_em) values
 ('7c1e0000-0000-4000-8000-000000000001', 'ana.muianga@example.com', 'Ana Muianga', '2026-03-14 11:20+02'),
 ('7c1e0000-0000-4000-8000-000000000002', 'fernando.massingue@example.com', 'Fernando Massingue', '2026-10-17 16:20+02'),
 ('7c1e0000-0000-4000-8000-000000000003', 'carlos.bila@example.com', 'Carlos Bila', '2026-10-09 11:10+02'),
 ('7c1e0000-0000-4000-8000-000000000004', 'amelia.cossa@example.com', 'Amélia Cossa', '2026-10-16 12:40+02'),
 ('7c1e0000-0000-4000-8000-000000000005', 'rosa.chauque@example.com', 'Rosa Chauque', '2026-10-22 09:50+02'),
 ('7c1e0000-0000-4000-8000-000000000006', 'lucas.novela@example.com', 'Lucas Novela', '2026-10-24 21:12+02'),
 ('7c1e0000-0000-4000-8000-000000000007', 'paulo.cossa@example.com', 'Paulo Cossa', '2026-10-14 17:25+02'),
 ('7c1e0000-0000-4000-8000-000000000008', 'jorge.matsinhe@example.com', 'Jorge Matsinhe', '2026-05-08 10:00+02'),
 ('7c1e0000-0000-4000-8000-000000000009', 'gil.macuacua@example.com', 'Gil Macuácua', '2026-10-25 11:05+02'),
 ('7c1e0000-0000-4000-8000-000000000010', 'mariana.novela@example.com', 'Mariana Novela', '2026-09-10 16:00+02'),
 ('7c1e0000-0000-4000-8000-000000000011', 'compras@baoba.example.com', 'Escritórios Baobá, Lda', '2026-06-12 09:00+02');

insert into public.hc_eventos (cliente_id, tipo, referencia, resumo, valor, loja, dados, criado_em) values
 ('7c1e0000-0000-4000-8000-000000000001', 'compra', 'VENDA-0314', 'Mesa de centro', 38900, 'angola', '{"pagamento":"M-Pesa"}', '2026-03-14 11:20+02'),
 ('7c1e0000-0000-4000-8000-000000000001', 'mensagem', 'MSG-c1', 'WhatsApp: perguntou pelo sofá de 3 lugares cinzento e se entregam na Matola', null, 'angola', '{"canal":"whatsapp"}', '2026-10-26 20:14+02'),
 ('7c1e0000-0000-4000-8000-000000000002', 'compra', 'HC-24815', 'Conjunto de sala de jantar, 6 lugares', 118000, 'matola', '{"pagamento":"Cartão"}', '2026-10-17 16:20+02'),
 ('7c1e0000-0000-4000-8000-000000000002', 'mensagem', 'MSG-c7', 'WhatsApp: a sala de jantar era para chegar a 24 Out e ainda não chegou', null, 'matola', '{"canal":"whatsapp"}', '2026-10-26 19:32+02'),
 ('7c1e0000-0000-4000-8000-000000000002', 'nps', 'NPS-d2', 'Nota 3 no inquérito pós-entrega: entrega atrasada 3 dias', null, 'matola', '{"nota":3,"motivo":"Atraso na entrega"}', '2026-10-26 23:00+02'),
 ('7c1e0000-0000-4000-8000-000000000003', 'compra', 'HC-24766', 'Guarda-roupa de 3 portas', 54000, 'matola', '{"pagamento":"Cartão"}', '2026-10-09 11:10+02'),
 ('7c1e0000-0000-4000-8000-000000000003', 'avaliacao_publica', 'REV-r1', 'Google, 2 estrelas: montagem marcada para sábado e ninguém apareceu', null, 'matola', '{"canal":"google","estrelas":2}', '2026-10-21 10:30+02'),
 ('7c1e0000-0000-4000-8000-000000000003', 'nps', 'NPS-d1', 'Nota 2 no inquérito pós-entrega: a montagem marcada não aconteceu', null, 'matola', '{"nota":2,"motivo":"Montagem em falta ou mal feita"}', '2026-10-26 15:00+02'),
 ('7c1e0000-0000-4000-8000-000000000004', 'compra', 'HC-24797', 'Mesa de jantar extensível', 38600, 'baia', '{"pagamento":"Transferência"}', '2026-10-16 12:40+02'),
 ('7c1e0000-0000-4000-8000-000000000004', 'nps', 'NPS-d3', 'Nota 4 no inquérito pós-entrega: mesa entregue com um risco no tampo', null, 'baia', '{"nota":4,"motivo":"Produto danificado"}', '2026-10-27 05:00+02'),
 ('7c1e0000-0000-4000-8000-000000000005', 'compra', 'HC-24822', 'Cómoda de 6 gavetas', 46900, 'baia', '{"pagamento":"e-Mola"}', '2026-10-22 09:50+02'),
 ('7c1e0000-0000-4000-8000-000000000006', 'compra', 'HC-24831', 'Sofá-cama e mesa de apoio', 72400, 'matola', '{"pagamento":"M-Pesa"}', '2026-10-24 21:12+02'),
 ('7c1e0000-0000-4000-8000-000000000007', 'compra', 'HC-24790', 'Cama de casal com colchão', 63200, 'angola', '{"pagamento":"M-Pesa"}', '2026-10-14 17:25+02'),
 ('7c1e0000-0000-4000-8000-000000000007', 'nps', 'NPS-p07', 'Nota 10 no inquérito pós-entrega', null, 'angola', '{"nota":10}', '2026-10-23 10:00+02'),
 ('7c1e0000-0000-4000-8000-000000000008', 'compra', 'VENDA-0508', 'Cómoda', 22800, 'baia', '{"pagamento":"Numerário"}', '2026-05-08 10:00+02'),
 ('7c1e0000-0000-4000-8000-000000000008', 'compra', 'VENDA-1020', 'Cama de casal', 52000, 'baia', '{"pagamento":"Cartão"}', '2026-10-20 15:00+02'),
 ('7c1e0000-0000-4000-8000-000000000008', 'mensagem', 'MSG-c5', 'WhatsApp: agradeceu a montagem da cama', null, 'baia', '{"canal":"whatsapp"}', '2026-10-26 11:20+02'),
 ('7c1e0000-0000-4000-8000-000000000008', 'nps', 'NPS-p08', 'Nota 9 no inquérito pós-entrega', null, 'baia', '{"nota":9}', '2026-10-26 12:00+02'),
 ('7c1e0000-0000-4000-8000-000000000009', 'compra', 'HC-24840', 'Sofá de canto e mesa de centro', 89000, 'angola', '{"pagamento":"Prestações"}', '2026-10-25 11:05+02'),
 ('7c1e0000-0000-4000-8000-000000000010', 'compra', 'VENDA-0910', 'Sofá de 3 lugares', 61000, 'angola', '{"pagamento":"Cartão"}', '2026-09-10 16:00+02'),
 ('7c1e0000-0000-4000-8000-000000000010', 'avaliacao_publica', 'REV-r4', 'Google, 5 estrelas: o vendedor Hélio ajudou muito a escolher', null, 'angola', '{"canal":"google","estrelas":5}', '2026-09-16 11:45+02'),
 ('7c1e0000-0000-4000-8000-000000000011', 'compra', 'VENDA-0612', 'Cadeiras de escritório', 1060000, 'angola', '{"pagamento":"Fatura a 30 dias"}', '2026-06-12 09:00+02'),
 ('7c1e0000-0000-4000-8000-000000000011', 'compra', 'HC-24828', '24 secretárias e 24 cadeiras', 840000, 'angola', '{"pagamento":"Fatura a 30 dias"}', '2026-10-23 10:30+02'),
 ('7c1e0000-0000-4000-8000-000000000011', 'mensagem', 'MSG-c2', 'Site: pedido de orçamento para 24 secretárias, 24 cadeiras e 2 mesas de reunião', null, 'angola', '{"canal":"site"}', '2026-10-26 16:02+02');

commit;
