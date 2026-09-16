-- Rode isto no SQL Editor do Supabase, igual fizemos com schema.sql e
-- storage.sql. Cria a tabela de cupons de desconto.

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  loja text not null,
  nome_cupom text not null,
  desconto_percentual numeric,
  link_produtos text,
  cor_loja text not null default '#FFC93C',
  validade timestamptz,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "Qualquer um pode ver os cupons"
  on public.coupons for select
  using (true);

create policy "Usuários autenticados gerenciam cupons"
  on public.coupons for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
