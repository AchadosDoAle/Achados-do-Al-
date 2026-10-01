-- ============================================================
-- ACHADO DO ALÊ — CONTAGEM BÁSICA DE VISUALIZAÇÕES
-- 2026-10-01
--
-- Objetivo:
-- 1) contabilizar pageviews públicos mesmo sem aceite das métricas avançadas;
-- 2) não criar identificador persistente nessa contagem básica;
-- 3) manter sessões/origem/dispositivo/UTM somente para quem aceitou métricas;
-- 4) evitar dupla contagem quando o visitante aceitou as métricas.
-- ============================================================

create extension if not exists "pgcrypto";

-- Garante a estrutura, inclusive em instalações antigas.
create table if not exists public.analytics_sessions (
  visitor_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  landing_path text,
  current_path text,
  first_referrer text,
  source text,
  device_type text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create table if not exists public.analytics_pageviews (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  path text not null,
  referrer text,
  source text,
  device_type text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  criado_em timestamptz not null default now()
);

create index if not exists analytics_sessions_last_seen_idx
  on public.analytics_sessions (last_seen desc);

create index if not exists analytics_pageviews_created_idx
  on public.analytics_pageviews (criado_em desc);

create index if not exists analytics_pageviews_visitor_idx
  on public.analytics_pageviews (visitor_id);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_pageviews enable row level security;

-- Contador operacional mínimo.
-- Usa um valor sentinela fixo em visitor_id para manter compatibilidade com a
-- tabela já existente sem identificar o visitante.
create or replace function public.track_basic_pageview(
  p_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_path is null or length(trim(p_path)) = 0 then
    return;
  end if;

  -- Proteção adicional: não contabiliza rotas administrativas/login mesmo que
  -- a função seja chamada manualmente pelo cliente.
  if trim(p_path) ~ '^/(admin|login)(/|[?]|$)' then
    return;
  end if;

  insert into public.analytics_pageviews (
    visitor_id,
    path,
    referrer,
    source,
    device_type,
    utm_source,
    utm_medium,
    utm_campaign
  ) values (
    'basic-pageview',
    left(trim(p_path), 1000),
    null,
    'Contagem básica',
    'Não coletado',
    null,
    null,
    null
  );
end;
$$;

revoke all on function public.track_basic_pageview(text) from public;
grant execute on function public.track_basic_pageview(text) to anon, authenticated;

-- Métricas detalhadas: passa a registrar/atualizar SOMENTE a sessão.
-- O pageview já é gravado pela função track_basic_pageview, evitando que um
-- visitante que aceitou métricas seja contado duas vezes.
create or replace function public.track_analytics_visit(
  p_visitor_id text,
  p_path text,
  p_referrer text default null,
  p_source text default null,
  p_device_type text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_is_heartbeat boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor_id is null or length(trim(p_visitor_id)) < 8 then
    return;
  end if;

  if p_path is null or length(trim(p_path)) = 0 then
    return;
  end if;

  if trim(p_path) ~ '^/(admin|login)(/|[?]|$)' then
    return;
  end if;

  insert into public.analytics_sessions (
    visitor_id,
    first_seen,
    last_seen,
    landing_path,
    current_path,
    first_referrer,
    source,
    device_type,
    utm_source,
    utm_medium,
    utm_campaign
  ) values (
    left(trim(p_visitor_id), 120),
    now(),
    now(),
    left(p_path, 1000),
    left(p_path, 1000),
    left(coalesce(p_referrer, ''), 1500),
    left(coalesce(p_source, 'Direto'), 300),
    left(coalesce(p_device_type, 'Desconhecido'), 100),
    left(coalesce(p_utm_source, ''), 300),
    left(coalesce(p_utm_medium, ''), 300),
    left(coalesce(p_utm_campaign, ''), 500)
  )
  on conflict (visitor_id) do update set
    last_seen = now(),
    current_path = excluded.current_path,
    source = case when excluded.source <> '' then excluded.source else analytics_sessions.source end,
    device_type = case when excluded.device_type <> '' then excluded.device_type else analytics_sessions.device_type end,
    utm_source = case when excluded.utm_source <> '' then excluded.utm_source else analytics_sessions.utm_source end,
    utm_medium = case when excluded.utm_medium <> '' then excluded.utm_medium else analytics_sessions.utm_medium end,
    utm_campaign = case when excluded.utm_campaign <> '' then excluded.utm_campaign else analytics_sessions.utm_campaign end;

  -- p_is_heartbeat permanece na assinatura por compatibilidade com o front-end.
  -- Pageviews NÃO são mais inseridos aqui para evitar dupla contagem.
end;
$$;

revoke all on function public.track_analytics_visit(text, text, text, text, text, text, text, text, boolean) from public;
grant execute on function public.track_analytics_visit(text, text, text, text, text, text, text, text, boolean) to anon, authenticated;

notify pgrst, 'reload schema';
