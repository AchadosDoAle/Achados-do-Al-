-- Rode isto no SQL Editor do Supabase, igual fizemos com schema.sql e
-- storage.sql. Cria a tabela de cupons de desconto.

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  loja text not null,
  nome_cupom text not null,
  desconto_percentual numeric,
  valor_cupom text,
  descricao text,
  link_produtos text,
  cor_loja text not null default '#FFC93C',
  validade timestamptz,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Se você já tinha rodado uma versão anterior deste arquivo, estas linhas
-- adicionam só as colunas novas, sem apagar nada que já existia.
alter table public.coupons add column if not exists valor_cupom text;
alter table public.coupons add column if not exists descricao text;
alter table public.coupons add column if not exists observacoes text;

alter table public.coupons enable row level security;

drop policy if exists "Qualquer um pode ver os cupons" on public.coupons;
create policy "Qualquer um pode ver os cupons"
  on public.coupons for select
  using (true);

drop policy if exists "Usuários autenticados gerenciam cupons" on public.coupons;
create policy "Usuários autenticados gerenciam cupons"
  on public.coupons for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
