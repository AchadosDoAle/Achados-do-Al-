-- Achados do Ale - atualizacao em tempo real da vitrine publica
-- Execute UMA VEZ no SQL Editor do Supabase.
-- Nao apaga registros, nao altera colunas e nao muda dados existentes.
-- Apenas inclui offers e coupons na publication usada pelo Supabase Realtime.

do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    raise exception 'Publication supabase_realtime nao encontrada neste projeto.';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'offers'
  ) then
    execute 'alter publication supabase_realtime add table public.offers';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'coupons'
  ) then
    execute 'alter publication supabase_realtime add table public.coupons';
  end if;
end
$$;

notify pgrst, 'reload schema';
