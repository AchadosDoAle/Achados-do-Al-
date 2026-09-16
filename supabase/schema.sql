-- Rode este arquivo no SQL Editor do seu projeto Supabase
-- (Etapa 3). A tabela de usuários de login já existe pronta
-- em auth.users, gerenciada pelo próprio Supabase Auth.

create extension if not exists "pgcrypto";

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  loja text not null,
  categoria text not null,
  marca text,
  modelo text,
  preco_antigo numeric,
  preco_atual numeric not null,
  preco_pix numeric,
  parcelas integer,
  valor_parcela numeric,
  cupom text,
  link_cupom text,
  frete_gratis boolean default false,
  estoque text,
  validade_promocao date,
  voltagem text,
  cor text,
  tamanho text,
  capacidade text,
  link_produto text not null,
  usar_link_redirecionamento boolean default false,
  texto_original text,
  texto_publicacao text,
  observacoes text,
  imagem_principal text,
  status text not null default 'rascunho',
  agendado_para timestamptz,
  publicado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers (id) on delete cascade,
  canal text not null,
  status text not null,
  texto_publicado text,
  id_externo text,
  erro text,
  enviado_em timestamptz default now()
);

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers (id) on delete cascade,
  prompt text not null,
  resposta text,
  modelo text,
  aprovado boolean default false,
  criado_em timestamptz default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  nome text not null,
  credenciais_criptografadas text,
  ativo boolean default false,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers (id) on delete cascade,
  origem text,
  criado_em timestamptz default now()
);

-- Segurança: só usuários autenticados (você, no painel) podem
-- ler/escrever ofertas. O site público lê só o que está "publicada"
-- através da service role usada nos componentes de servidor.
alter table public.offers enable row level security;
alter table public.publications enable row level security;
alter table public.ai_generations enable row level security;
alter table public.integrations enable row level security;
alter table public.clicks enable row level security;

create policy "Usuários autenticados gerenciam ofertas"
  on public.offers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Qualquer um pode ler ofertas publicadas"
  on public.offers for select
  using (status = 'publicada');

create policy "Usuários autenticados gerenciam publications"
  on public.publications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados gerenciam ai_generations"
  on public.ai_generations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Usuários autenticados gerenciam integrations"
  on public.integrations for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Qualquer um pode registrar um clique"
  on public.clicks for insert
  with check (true);

create policy "Usuários autenticados leem cliques"
  on public.clicks for select
  using (auth.role() = 'authenticated');
