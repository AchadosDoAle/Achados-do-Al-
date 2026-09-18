-- SISTEMA DE AVISOS DE PROMOÇÃO VENCIDA
-- Rode este arquivo UMA VEZ no SQL Editor do Supabase.
-- Ele cria o registro de avisos, impede voto repetido do mesmo visitante
-- e marca a oferta como "expirada" após 3 visitantes distintos.

create table if not exists public.offer_reports (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  reporter_id text not null,
  motivo text not null,
  criado_em timestamptz not null default now(),
  constraint offer_reports_visitante_unico unique (offer_id, reporter_id),
  constraint offer_reports_motivo_valido check (
    motivo in ('promocao_vencida', 'produto_acabou', 'preco_divergente')
  )
);

create index if not exists offer_reports_offer_id_idx
  on public.offer_reports (offer_id);

alter table public.offer_reports enable row level security;

-- Ofertas expiradas continuam públicas para consulta, mas aparecem em cinza.
drop policy if exists "Qualquer um pode ler ofertas publicadas" on public.offers;
drop policy if exists "Qualquer um pode ler ofertas publicadas ou expiradas" on public.offers;

create policy "Qualquer um pode ler ofertas publicadas ou expiradas"
  on public.offers for select
  using (status in ('publicada', 'expirada'));

-- Registra um aviso de forma anônima e atômica.
-- O mesmo reporter_id só conta uma vez por oferta.
create or replace function public.report_offer_issue(
  p_offer_id uuid,
  p_reporter_id text,
  p_motivo text
)
returns table(total integer, desativada boolean, novo_aviso boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer := 0;
  v_inseridos integer := 0;
  v_status text;
begin
  if p_reporter_id is null or length(trim(p_reporter_id)) < 8 then
    raise exception 'Identificador de visitante inválido';
  end if;

  if p_motivo not in ('promocao_vencida', 'produto_acabou', 'preco_divergente') then
    raise exception 'Motivo inválido';
  end if;

  select status into v_status
  from public.offers
  where id = p_offer_id;

  if v_status is null or v_status not in ('publicada', 'expirada') then
    raise exception 'Oferta indisponível';
  end if;

  insert into public.offer_reports (offer_id, reporter_id, motivo)
  values (p_offer_id, trim(p_reporter_id), p_motivo)
  on conflict (offer_id, reporter_id) do nothing;

  get diagnostics v_inseridos = row_count;

  select count(*)::integer into v_total
  from public.offer_reports
  where offer_id = p_offer_id;

  if v_total >= 3 and v_status = 'publicada' then
    update public.offers
    set status = 'expirada', atualizado_em = now()
    where id = p_offer_id and status = 'publicada';
    v_status := 'expirada';
  end if;

  return query
  select v_total, (v_status = 'expirada'), (v_inseridos > 0);
end;
$$;

revoke all on function public.report_offer_issue(uuid, text, text) from public;
grant execute on function public.report_offer_issue(uuid, text, text) to anon, authenticated;

-- Reativação exclusiva do administrador autenticado.
-- Zera os avisos anteriores para a promoção começar uma nova contagem.
create or replace function public.reactivate_offer(p_offer_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_atualizados integer := 0;
begin
  if auth.role() <> 'authenticated' then
    raise exception 'Não autorizado';
  end if;

  delete from public.offer_reports where offer_id = p_offer_id;

  update public.offers
  set status = 'publicada', atualizado_em = now()
  where id = p_offer_id and status = 'expirada';

  get diagnostics v_atualizados = row_count;
  return v_atualizados > 0;
end;
$$;

revoke all on function public.reactivate_offer(uuid) from public;
grant execute on function public.reactivate_offer(uuid) to authenticated;
