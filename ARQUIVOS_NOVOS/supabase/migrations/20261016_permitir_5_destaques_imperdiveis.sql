-- Achado do Alê: permite até 5 ofertas imperdíveis ao mesmo tempo.
-- Executar no SQL Editor do Supabase ANTES de publicar a atualização do site.
-- Não apaga produtos, cupons ou destaques atuais.

begin;

-- A regra anterior desligava todos os outros destaques a cada nova seleção.
drop trigger if exists trg_manter_um_destaque_imperdivel on public.offers;
drop function if exists public.manter_um_destaque_imperdivel();

-- A validação já existente do limite de 24 horas continua ativa.
-- Essa regra nova impede o 6º destaque ativo, inclusive quando a operação
-- vier de outro cliente (não apenas do painel administrativo do site).
create or replace function public.limitar_cinco_destaques_imperdiveis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  quantidade integer;
begin
  if new.destaque_imperdivel is not true then
    return new;
  end if;

  -- Ignora destaques cuja validade já passou.
  if new.destaque_ate is not null and new.destaque_ate <= now() then
    return new; -- o trigger de validação de prazo existente rejeitará o valor.
  end if;

  -- Serializa alterações concorrentes do carrossel.
  perform pg_advisory_xact_lock(20261016, 5);

  select count(*) into quantidade
    from public.offers
   where destaque_imperdivel is true
     and destaque_ate > now()
     and id is distinct from new.id;

  if quantidade >= 5 then
    raise exception 'Limite de 5 ofertas imperdíveis atingido. Desmarque um destaque antes de continuar.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_limitar_cinco_destaques_imperdiveis on public.offers;
create trigger trg_limitar_cinco_destaques_imperdiveis
before insert or update of destaque_imperdivel, destaque_ate
on public.offers
for each row execute function public.limitar_cinco_destaques_imperdiveis();

commit;
