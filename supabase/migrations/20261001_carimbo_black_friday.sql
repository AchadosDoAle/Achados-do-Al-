-- Achado do Alê — carimbo imutável de postagem + Oferta Black Friday
-- Execute UMA VEZ no SQL Editor do Supabase antes de publicar esta versão do site.
-- O script preserva os registros existentes.

begin;

-- 1) Marca manual para ofertas especiais de Black Friday.
alter table public.offers
  add column if not exists oferta_black boolean not null default false;

-- 2) Cupons passam a ter um carimbo explícito de primeira postagem.
alter table public.coupons
  add column if not exists publicado_em timestamptz;

update public.coupons
set publicado_em = coalesce(publicado_em, criado_em, now())
where publicado_em is null;

alter table public.coupons
  alter column publicado_em set default now();

alter table public.coupons
  alter column publicado_em set not null;

-- 3) Ofertas antigas que já foram colocadas no ar e ainda não possuem
-- publicado_em recebem o melhor carimbo histórico disponível: criado_em.
-- Não alteramos as que já possuem publicado_em.
update public.offers
set publicado_em = coalesce(publicado_em, criado_em, now())
where publicado_em is null
  and status in ('publicada', 'expirada', 'arquivada', 'enviada_whatsapp');

-- 4) O carimbo de uma oferta é fixado na PRIMEIRA publicação.
-- Republicar não muda essa data e nem uma edição manual/API consegue alterá-la.
create or replace function public.fixar_primeira_publicacao_oferta()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status in ('publicada', 'expirada', 'enviada_whatsapp') then
      new.publicado_em := now();
    else
      new.publicado_em := null;
    end if;
  elsif old.publicado_em is not null then
    new.publicado_em := old.publicado_em;
  elsif new.status in ('publicada', 'expirada', 'enviada_whatsapp') then
    new.publicado_em := now();
  else
    new.publicado_em := null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_fixar_primeira_publicacao_oferta on public.offers;
create trigger trg_fixar_primeira_publicacao_oferta
before insert or update on public.offers
for each row execute function public.fixar_primeira_publicacao_oferta();

-- 5) O carimbo dos cupons é sempre o momento da criação/postagem e também
-- fica imutável depois disso.
create or replace function public.fixar_publicacao_cupom()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.publicado_em := coalesce(new.criado_em, now());
  else
    new.publicado_em := old.publicado_em;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_fixar_publicacao_cupom on public.coupons;
create trigger trg_fixar_publicacao_cupom
before insert or update on public.coupons
for each row execute function public.fixar_publicacao_cupom();

-- Atualiza imediatamente o cache de esquema da API do Supabase/PostgREST.
notify pgrst, 'reload schema';

commit;
