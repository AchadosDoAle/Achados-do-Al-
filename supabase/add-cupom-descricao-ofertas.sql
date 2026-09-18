-- Execute uma única vez no SQL Editor do Supabase.
-- Adiciona o campo de descrição do cupom às ofertas existentes.

alter table public.offers
  add column if not exists cupom_descricao text;
