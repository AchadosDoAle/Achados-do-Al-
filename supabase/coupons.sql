-- Rode isto no SQL Editor do Supabase. Pode rodar quantas vezes precisar
-- sem medo — ele nunca apaga dados, só cria o que estiver faltando.

-- Rode isto no SQL Editor do Supabase. Pode rodar quantas vezes precisar.
-- O script preserva os dados existentes e adapta uma tabela "coupons"
-- que eventualmente tenha sido criada antes com outro formato.

create extension if not exists "pgcrypto";

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid()
);

-- Garante que TODAS as colunas usadas pelo site existam, mesmo que a tabela
-- já tenha sido criada antes de forma incompleta ou com outro esquema.
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

-- Compatibilidade com tentativas antigas:
-- se a tabela já possuía colunas que NÃO fazem parte do formato atual
-- (por exemplo "code") e alguma delas era NOT NULL, um INSERT do site
-- falhava porque o código atual não envia valor para essa coluna.
--
-- Este bloco remove APENAS a obrigatoriedade (NOT NULL) das colunas antigas.
-- Ele não apaga coluna, não apaga conteúdo e não mexe na chave primária "id".
do $$
declare
  coluna record;
begin
  for coluna in
    select c.column_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'coupons'
      and c.is_nullable = 'NO'
      and c.column_name not in (
        'id',
        'loja',
        'nome_cupom',
        'desconto_percentual',
        'valor_cupom',
        'descricao',
        'observacoes',
        'link_produtos',
        'cor_loja',
        'validade',
        'ativo',
        'criado_em',
        'atualizado_em'
      )
  loop
    execute format(
      'alter table public.coupons alter column %I drop not null',
      coluna.column_name
    );
  end loop;
end $$;

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

-- Força a API do Supabase/PostgREST a reconhecer imediatamente o esquema atual.
NOTIFY pgrst, 'reload schema';
de ver os cupons"
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
