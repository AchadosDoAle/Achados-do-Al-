-- Executar uma vez no SQL Editor do Supabase.
-- Registros antigos ficam como "Com juros" por segurança.

alter table public.offers
  add column if not exists parcelamento_sem_juros boolean not null default false;
