-- Otimizacao de Egress e consultas publicas.
-- Indices de FKs e consultas de ofertas/cupons, sem alterar dados existentes.
create index if not exists ai_generations_offer_id_idx
  on public.ai_generations (offer_id);
create index if not exists app_offer_reports_v1_reporter_id_idx
  on public.app_offer_reports_v1 (reporter_id);
create index if not exists publications_offer_id_idx
  on public.publications (offer_id);

create index if not exists offers_status_publicado_id_idx
  on public.offers (status, publicado_em, id);
create index if not exists coupons_ativo_criado_id_idx
  on public.coupons (ativo, criado_em, id);

-- Preserva as regras de acesso e evita reavaliar auth.* para cada linha.
drop policy if exists "Admin consulta o próprio acesso" on public.admin_users;
create policy "Admin consulta o próprio acesso"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Usuários autenticados gerenciam ai_generations" on public.ai_generations;
create policy "Usuários autenticados gerenciam ai_generations"
  on public.ai_generations for all to public
  using ((select auth.role()) = 'authenticated')
  with check ((select auth.role()) = 'authenticated');

drop policy if exists "Admin lê pageviews de analytics" on public.analytics_pageviews;
create policy "Admin lê pageviews de analytics"
  on public.analytics_pageviews for select to public
  using ((select auth.role()) = 'authenticated');

drop policy if exists "Admin lê sessões de analytics" on public.analytics_sessions;
create policy "Admin lê sessões de analytics"
  on public.analytics_sessions for select to public
  using ((select auth.role()) = 'authenticated');

-- Fixa search_path das funções de trigger.
alter function public.fixar_primeira_publicacao_oferta() set search_path = public, pg_temp;
alter function public.fixar_publicacao_cupom() set search_path = public, pg_temp;
