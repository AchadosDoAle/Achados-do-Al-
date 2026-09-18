-- Execute uma vez no SQL Editor do Supabase.
-- Adiciona a condição/restrição do frete nas ofertas.

alter table public.offers
  add column if not exists frete_condicao text;
