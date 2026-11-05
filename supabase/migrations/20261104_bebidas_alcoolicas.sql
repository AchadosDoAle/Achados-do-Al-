-- Identificação de bebidas alcoólicas para aviso visual 18+ no site.
-- Compatível com instalações existentes; não altera o contrato dos aplicativos.
alter table public.offers
  add column if not exists bebida_alcoolica boolean not null default false;

-- Classificação inicial conservadora das ofertas já cadastradas.
update public.offers
set bebida_alcoolica = true
where bebida_alcoolica = false
  and lower(coalesce(titulo, '') || ' ' || coalesce(categoria, '')) ~
    '(cerveja|chopp|vinho|espumante|champagne|champanhe|whisk(e)?y|vodka|gin|rum|tequila|cacha[cç]a|licor|conhaque|brandy|sake|sidra|vermouth|vermute|destilado|hard seltzer)';

-- O banco também classifica ofertas recebidas do aplicativo administrativo,
-- sem exigir atualização do aplicativo nem mudança no formato do envio.
create or replace function public.classificar_bebida_alcoolica()
returns trigger
language plpgsql
as $$
begin
  if coalesce(new.bebida_alcoolica, false) or
     lower(coalesce(new.titulo, '') || ' ' || coalesce(new.categoria, '')) ~
       '(cerveja|chopp|vinho|espumante|champagne|champanhe|whisk(e)?y|vodka|gin|rum|tequila|cacha[cç]a|licor|conhaque|brandy|sake|sidra|vermouth|vermute|destilado|hard seltzer)' then
    new.bebida_alcoolica := true;
  else
    new.bebida_alcoolica := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_classificar_bebida_alcoolica on public.offers;
create trigger trg_classificar_bebida_alcoolica
before insert or update of titulo, categoria, bebida_alcoolica
on public.offers
for each row execute function public.classificar_bebida_alcoolica();
