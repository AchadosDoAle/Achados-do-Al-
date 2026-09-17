-- Rode isto no SQL Editor do Supabase. Pode rodar quantas vezes precisar
-- sem medo — ele nunca apaga dados, só cria o que estiver faltando.

create table if not exists public.coupons (
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  loja text not null,
  nome_cupom text not null,
  desconto_percentual numeric,
  valor_cupom text,
  descricao text,
  observacoes text,
  link_produtos text,
  cor_loja text not null default '#FFC93C',
  validade timestamptz,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Garante que TODAS as colunas existem, mesmo que a tabela já tivesse
-- sido criada antes de forma incompleta. Se você já tinha rodado uma
-- versão anterior deste arquivo, estas linhas adicionam só as colunas
-- novas, sem apagar nada que já existia.
alter table public.coupons add column if not exists loja text;
alter table public.coupons add column if not exists nome_cupom text;
alter table public.coupons add column if not exists desconto_percentual numeric;
alter table public.coupons add column if not exists valor_cupom text;
alter table public.coupons add column if not exists descricao text;
alter table public.coupons add column if not exists observacoes text;
alter table public.coupons add column if not exists link_produtos text;
alter table public.coupons add column if not exists cor_loja text default '#FFC93C';
alter table public.coupons add column if not exists validade timestamptz;
alter table public.coupons add column if not exists ativo boolean default true;
alter table public.coupons add column if not exists criado_em timestamptz default now();
alter table public.coupons add column if not exists atualizado_em timestamptz default now();

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

-- ESSENCIAL: força o Supabase a "esquecer" o formato antigo da tabela e
-- reconhecer as colunas novas imediatamente (sem isso, pode continuar
-- dando erro de coluna não encontrada por alguns minutos).
NOTIFY pgrst, 'reload schema';
