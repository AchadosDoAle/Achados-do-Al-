-- ============================================================
-- ACHADO DO ALÊ — PROFISSIONALIZAÇÃO / SEGURANÇA
-- Rode UMA VEZ no SQL Editor, ANTES de publicar esta versão.
-- IMPORTANTE: substitua SEU_EMAIL_ADMIN@EXEMPLO.COM pelo e-mail usado no login.
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  criado_em timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon;
grant select on table public.admin_users to authenticated;
revoke insert, update, delete on table public.admin_users from authenticated;

-- Garante as tabelas usadas pelos relatórios e avisos, caso ainda não existam.
create table if not exists public.analytics_sessions (
  visitor_id text primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  landing_path text, current_path text, first_referrer text, source text, device_type text,
  utm_source text, utm_medium text, utm_campaign text
);

create table if not exists public.analytics_pageviews (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null, path text not null, referrer text, source text, device_type text,
  utm_source text, utm_medium text, utm_campaign text, criado_em timestamptz not null default now()
);

create table if not exists public.offer_reports (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete cascade,
  reporter_id text not null,
  motivo text not null,
  criado_em timestamptz not null default now(),
  unique(offer_id, reporter_id)
);

alter table public.analytics_sessions enable row level security;
alter table public.analytics_pageviews enable row level security;
alter table public.offer_reports enable row level security;

-- Função de analytics usada pelo site público (sem IP, nome, e-mail ou telefone).
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
  if p_visitor_id is null or length(trim(p_visitor_id)) < 8 then return; end if;
  if p_path is null or length(trim(p_path)) = 0 then return; end if;

  insert into public.analytics_sessions (
    visitor_id, first_seen, last_seen, landing_path, current_path, first_referrer, source, device_type, utm_source, utm_medium, utm_campaign
  ) values (
    left(trim(p_visitor_id), 120), now(), now(), left(p_path, 1000), left(p_path, 1000),
    left(coalesce(p_referrer, ''), 1500), left(coalesce(p_source, 'Direto'), 300),
    left(coalesce(p_device_type, 'Desconhecido'), 100), left(coalesce(p_utm_source, ''), 300),
    left(coalesce(p_utm_medium, ''), 300), left(coalesce(p_utm_campaign, ''), 500)
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
    insert into public.analytics_pageviews (visitor_id, path, referrer, source, device_type, utm_source, utm_medium, utm_campaign)
    values (
      left(trim(p_visitor_id), 120), left(p_path, 1000), left(coalesce(p_referrer, ''), 1500),
      left(coalesce(p_source, 'Direto'), 300), left(coalesce(p_device_type, 'Desconhecido'), 100),
      left(coalesce(p_utm_source, ''), 300), left(coalesce(p_utm_medium, ''), 300), left(coalesce(p_utm_campaign, ''), 500)
    );
  end if;
end;
$$;
revoke all on function public.track_analytics_visit(text, text, text, text, text, text, text, text, boolean) from public;
grant execute on function public.track_analytics_visit(text, text, text, text, text, text, text, text, boolean) to anon, authenticated;

create index if not exists analytics_sessions_last_seen_idx on public.analytics_sessions(last_seen desc);
create index if not exists analytics_pageviews_created_idx on public.analytics_pageviews(criado_em desc);
create index if not exists analytics_pageviews_visitor_idx on public.analytics_pageviews(visitor_id);


create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_users a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admin consulta o próprio acesso" on public.admin_users;
create policy "Admin consulta o próprio acesso" on public.admin_users
for select to authenticated using (user_id = auth.uid());

-- CADASTRE O ADMIN. TROQUE O E-MAIL ABAIXO.
insert into public.admin_users(user_id, email)
select id, email from auth.users where lower(email) = lower('ale.nascimentolb1@hotmail.com')
on conflict (user_id) do update set email = excluded.email;

-- Ofertas
drop policy if exists "Usuários autenticados gerenciam ofertas" on public.offers;
drop policy if exists "Administradores gerenciam ofertas" on public.offers;
create policy "Administradores gerenciam ofertas" on public.offers for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Cupons
drop policy if exists "Usuários autenticados gerenciam cupons" on public.coupons;
drop policy if exists "Administradores gerenciam cupons" on public.coupons;
create policy "Administradores gerenciam cupons" on public.coupons for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Publicações / integrações / IA legada
drop policy if exists "Usuários autenticados gerenciam publications" on public.publications;
drop policy if exists "Administradores gerenciam publications" on public.publications;
create policy "Administradores gerenciam publications" on public.publications for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Usuários autenticados gerenciam integrations" on public.integrations;
drop policy if exists "Administradores gerenciam integrations" on public.integrations;
create policy "Administradores gerenciam integrations" on public.integrations for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Cliques: agora só o backend registra; admins leem.
drop policy if exists "Qualquer um pode registrar um clique" on public.clicks;
drop policy if exists "Usuários autenticados leem cliques" on public.clicks;
drop policy if exists "Administradores leem cliques" on public.clicks;
create policy "Administradores leem cliques" on public.clicks for select to authenticated using (public.is_admin());

-- Analytics: escrita continua pela RPC security definer; leitura apenas admin.
drop policy if exists "Admin lê sessões de analytics" on public.analytics_sessions;
create policy "Admin lê sessões de analytics" on public.analytics_sessions for select to authenticated using (public.is_admin());
drop policy if exists "Admin lê pageviews de analytics" on public.analytics_pageviews;
create policy "Admin lê pageviews de analytics" on public.analytics_pageviews for select to authenticated using (public.is_admin());

-- O sistema público de avisos agora passa por uma API no servidor.
drop function if exists public.report_offer_issue(uuid, text, text);

-- Reativação somente por administrador.
create or replace function public.reactivate_offer(p_offer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_atualizados integer := 0;
begin
  if not public.is_admin() then raise exception 'Não autorizado'; end if;
  delete from public.offer_reports where offer_id = p_offer_id;
  update public.offers set status = 'publicada', atualizado_em = now() where id = p_offer_id and status = 'expirada';
  get diagnostics v_atualizados = row_count;
  return v_atualizados > 0;
end;
$$;
revoke all on function public.reactivate_offer(uuid) from public;
grant execute on function public.reactivate_offer(uuid) to authenticated;

-- Índices úteis para crescimento do site.
create index if not exists offers_status_created_idx on public.offers(status, criado_em desc);
create index if not exists offers_categoria_idx on public.offers(categoria);
create index if not exists offers_loja_idx on public.offers(loja);
create index if not exists offers_validade_idx on public.offers(validade_promocao);
create index if not exists clicks_offer_created_idx on public.clicks(offer_id, criado_em desc);
