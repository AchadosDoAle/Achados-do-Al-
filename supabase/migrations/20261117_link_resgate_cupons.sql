-- Separa o link de resgate do link de produtos participantes.
-- Preserva todos os dados existentes em link_produtos.
alter table public.coupons
  add column if not exists link_resgate text;

notify pgrst, 'reload schema';
