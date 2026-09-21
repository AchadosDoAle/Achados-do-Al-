-- Permite ofertas sem preço no Pix e/ou sem preço parcelado
-- e registra se a loja oferece parcelamento.

alter table public.offers
  alter column preco_atual drop not null;

alter table public.offers
  add column if not exists oferece_parcelamento boolean not null default false;

-- Preserva o comportamento das ofertas antigas que já possuem parcelas cadastradas.
update public.offers
set oferece_parcelamento = true
where coalesce(parcelas, 0) > 0
  and coalesce(valor_parcela, 0) > 0;
