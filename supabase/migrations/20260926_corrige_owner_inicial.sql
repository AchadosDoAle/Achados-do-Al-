-- ============================================================
-- ACHADO DO ALÊ — CORREÇÃO DO OWNER INICIAL
-- Pode ser executado com segurança mais de uma vez.
--
-- Objetivo:
-- 1) garantir que exista pelo menos um OWNER quando já há administradores;
-- 2) se houver apenas um administrador, garantir que ele seja OWNER;
-- 3) não alterar os papéis quando já existe um OWNER válido.
-- ============================================================

alter table public.admin_users add column if not exists nome text;
alter table public.admin_users add column if not exists role text not null default 'admin';

-- Se existe somente um administrador, ele é o proprietário inicial.
update public.admin_users
set role = 'owner'
where user_id = (
  select user_id
  from public.admin_users
  order by criado_em asc nulls last, user_id asc
  limit 1
)
and (select count(*) from public.admin_users) = 1;

-- Proteção adicional para instalações que tenham mais de um admin,
-- mas por algum motivo tenham ficado sem nenhum owner. Nesse caso,
-- promove apenas o administrador mais antigo, e não todos.
with owner_inicial as (
  select user_id
  from public.admin_users
  order by criado_em asc nulls last, user_id asc
  limit 1
)
update public.admin_users
set role = 'owner'
where user_id = (select user_id from owner_inicial)
  and not exists (
    select 1 from public.admin_users where role = 'owner'
  );

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

NOTIFY pgrst, 'reload schema';
