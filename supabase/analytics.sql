-- ============================================================
-- ANALYTICS DO ACHADO DO ALÊ
-- Rode UMA VEZ no SQL Editor do Supabase.
-- Registra acessos anônimos sem salvar IP, nome, e-mail ou telefone.
-- ============================================================

create extension if not exists "pgcrypto";

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

drop policy if exists "Admin lê sessões de analytics" on public.analytics_sessions;
create policy "Admin lê sessões de analytics"
  on public.analytics_sessions for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admin lê pageviews de analytics" on public.analytics_pageviews;
create policy "Admin lê pageviews de analytics"
  on public.analytics_pageviews for select
  using (auth.role() = 'authenticated');

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

  if not coalesce(p_is_heartbeat, false) then
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
      left(trim(p_visitor_id), 120),
      left(p_path, 1000),
      left(coalesce(p_referrer, ''), 1500),
      left(coalesce(p_source, 'Direto'), 300),
      left(coalesce(p_device_type, 'Desconhecido'), 100),
      left(coalesce(p_utm_source, ''), 300),
      left(coalesce(p_utm_medium, ''), 300),
      left(coalesce(p_utm_campaign, ''), 500)
    );
  end if;
end;
$$;

revoke all on function public.track_analytics_visit(text, text, text, text, text, text, text, text, boolean) from public;
grant execute on function public.track_analytics_visit(text, text, text, text, text, text, text, text, boolean) to anon, authenticated;
