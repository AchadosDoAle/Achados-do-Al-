-- Achado do Alê — destaque imperdível + cupom relâmpago + observação de preço
-- Pode ser executado mais de uma vez. Não apaga registros existentes.

alter table public.offers
  add column if not exists preco_observacao text;

alter table public.offers
  add column if not exists destaque_imperdivel boolean not null default false;

alter table public.offers
  add column if not exists destaque_ate timestamptz;

alter table public.coupons
  add column if not exists relampago boolean not null default false;

-- Garante que um destaque nunca seja salvo por mais de 24 horas.
create or replace function public.validar_destaque_imperdivel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.destaque_imperdivel, false) then
    if new.destaque_ate is null then
      new.destaque_ate := now() + interval '24 hours';
    end if;

    if new.destaque_ate <= now() then
      raise exception 'A validade do destaque precisa estar no futuro.';
    end if;

    if new.destaque_ate > now() + interval '24 hours 2 minutes' then
      raise exception 'O destaque pode durar no máximo 24 horas.';
    end if;
  else
    new.destaque_ate := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validar_destaque_imperdivel on public.offers;
create trigger trg_validar_destaque_imperdivel
before insert or update of destaque_imperdivel, destaque_ate
on public.offers
for each row execute function public.validar_destaque_imperdivel();

-- Mantém apenas um destaque ativo por vez. Ao marcar outro, o anterior sai do destaque.
create or replace function public.manter_um_destaque_imperdivel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.destaque_imperdivel, false) then
    update public.offers
       set destaque_imperdivel = false,
           destaque_ate = null,
           atualizado_em = now()
     where id <> new.id
       and destaque_imperdivel = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_manter_um_destaque_imperdivel on public.offers;
create trigger trg_manter_um_destaque_imperdivel
after insert or update of destaque_imperdivel
on public.offers
for each row execute function public.manter_um_destaque_imperdivel();

notify pgrst, 'reload schema';
