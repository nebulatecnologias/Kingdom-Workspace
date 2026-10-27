-- Home Center (protótipo): avaliação de colaboradores por QR code.
-- Aplicado em 27 Out 2026 no projecto Supabase "Kingdom Dashboard" (epqfotzxrcyligwpauwk)
-- como migração hc_avaliacao_colaboradores_qr. Tabelas isoladas com prefixo hc_.
-- Para remover tudo: drop table public.hc_avaliacoes, public.hc_colaboradores;
--                    drop function public.hc_limitar_avaliacoes(), public.hc_limitar_colaboradores();

create table public.hc_colaboradores (
  codigo text primary key check (codigo ~ '^HC-[VM][0-9]{3}$'),
  nome text not null check (char_length(btrim(nome)) between 2 and 80),
  funcao text not null check (funcao in ('vendedor', 'montagem')),
  loja text not null check (loja in ('angola', 'baia', 'matola')),
  equipa text check (equipa in ('A', 'B', 'C', 'D')),
  activo boolean not null default true,
  criado_em timestamptz not null default now(),
  constraint hc_colaboradores_equipa_montagem check (funcao = 'vendedor' or equipa is not null)
);

create table public.hc_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  codigo text not null references public.hc_colaboradores (codigo),
  estrelas smallint not null check (estrelas between 1 and 5),
  c1 smallint not null check (c1 between 1 and 5),
  c2 smallint not null check (c2 between 1 and 5),
  c3 smallint not null check (c3 between 1 and 5),
  comentario text check (char_length(comentario) <= 500),
  criado_em timestamptz not null default now()
);
create index hc_avaliacoes_codigo_idx on public.hc_avaliacoes (codigo);
create index hc_avaliacoes_criado_idx on public.hc_avaliacoes (criado_em desc);

-- Limites contra abuso: no máximo 10 notas por colaborador em 10 minutos e 2000 por dia; 300 colaboradores.
create or replace function public.hc_limitar_avaliacoes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.hc_avaliacoes a where a.codigo = new.codigo and a.criado_em > now() - interval '10 minutes') >= 10 then
    raise exception 'Demasiadas avaliações para este colaborador. Tente mais tarde.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.hc_avaliacoes a where a.criado_em > now() - interval '1 day') >= 2000 then
    raise exception 'Limite diário de avaliações atingido.' using errcode = 'P0001';
  end if;
  new.id := gen_random_uuid();
  new.criado_em := now();
  return new;
end $$;
create trigger hc_limitar_avaliacoes before insert on public.hc_avaliacoes
  for each row execute function public.hc_limitar_avaliacoes();

create or replace function public.hc_limitar_colaboradores() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.hc_colaboradores) >= 300 then
    raise exception 'Limite de colaboradores atingido.' using errcode = 'P0001';
  end if;
  new.nome := btrim(new.nome);
  new.activo := true;
  new.criado_em := now();
  return new;
end $$;
create trigger hc_limitar_colaboradores before insert on public.hc_colaboradores
  for each row execute function public.hc_limitar_colaboradores();

revoke all on function public.hc_limitar_avaliacoes() from public, anon, authenticated;
revoke all on function public.hc_limitar_colaboradores() from public, anon, authenticated;

-- Acesso público do protótipo: ler e acrescentar; nunca alterar nem apagar.
alter table public.hc_colaboradores enable row level security;
alter table public.hc_avaliacoes enable row level security;
revoke all on public.hc_colaboradores, public.hc_avaliacoes from anon, authenticated;
grant select, insert on public.hc_colaboradores, public.hc_avaliacoes to anon, authenticated;

create policy hc_colaboradores_ler on public.hc_colaboradores for select to anon, authenticated using (true);
create policy hc_colaboradores_registar on public.hc_colaboradores for insert to anon, authenticated with check (activo);
create policy hc_avaliacoes_ler on public.hc_avaliacoes for select to anon, authenticated using (true);
create policy hc_avaliacoes_enviar on public.hc_avaliacoes for insert to anon, authenticated
  with check (exists (select 1 from public.hc_colaboradores c where c.codigo = hc_avaliacoes.codigo and c.activo));

-- Colaboradores de demonstração (os mesmos de assets/data.js).
insert into public.hc_colaboradores (codigo, nome, funcao, loja, equipa) values
 ('HC-V001','Hélio Sitoe','vendedor','angola',null), ('HC-V002','Marta Nhantumbo','vendedor','angola',null),
 ('HC-V003','Albino Cossa','vendedor','angola',null), ('HC-V004','Neide Muianga','vendedor','angola',null),
 ('HC-V005','Abel Novela','vendedor','angola',null), ('HC-V006','Neusa Macuácua','vendedor','baia',null),
 ('HC-V007','Celso Mabunda','vendedor','baia',null), ('HC-V008','Lina Bila','vendedor','baia',null),
 ('HC-V009','Samuel Chauque','vendedor','baia',null), ('HC-V010','Vânia Massingue','vendedor','baia',null),
 ('HC-V011','Dércia Tembe','vendedor','matola',null), ('HC-V012','Osvaldo Manhiça','vendedor','matola',null),
 ('HC-V013','Rita Zandamela','vendedor','matola',null), ('HC-V014','Ivo Langa','vendedor','matola',null),
 ('HC-V015','Telma Matsinhe','vendedor','matola',null),
 ('HC-M001','Joaquim Mabote','montagem','angola','A'), ('HC-M002','Eusébio Cuna','montagem','angola','A'),
 ('HC-M003','Armando Sitoe','montagem','baia','B'), ('HC-M004','Lucas Chirindza','montagem','baia','B'),
 ('HC-M005','Benedito Nhamposse','montagem','matola','C'), ('HC-M006','Raul Manjate','montagem','matola','C'),
 ('HC-M007','Feliciano Mondlane','montagem','matola','D'), ('HC-M008','Zacarias Muchanga','montagem','matola','D');
