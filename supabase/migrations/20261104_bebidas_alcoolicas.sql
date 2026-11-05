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
