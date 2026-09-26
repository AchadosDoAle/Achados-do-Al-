-- ============================================================
-- ACHADO DO ALÊ — GERENCIADOR DE USUÁRIOS (papéis de administrador)
-- Rode UMA VEZ no SQL Editor do Supabase, depois de já ter rodado
-- o supabase/profissionalizacao.sql (que cria a tabela admin_users).
-- ============================================================

-- Adiciona nome e papel (role) aos administradores, sem apagar nada
-- que já existe.
alter table public.admin_users add column if not exists nome text;
alter table public.admin_users add column if not exists role text not null default 'admin';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'admin_users_role_check'
  ) then
    alter table public.admin_users
      add constraint admin_users_role_check check (role in ('owner', 'admin'));
  end if;
end $$;

-- IMPORTANTE: por segurança, todo administrador já cadastrado até hoje
-- vira "owner" (acesso completo, incluindo gerenciar outros usuários).
-- Isso evita que alguém fique trancado para fora do próprio painel.
-- Depois, na aba "Usuários" do site, você pode rebaixar quem quiser
-- para o papel "admin" (sem acesso ao gerenciador de usuários).
update public.admin_users set role = 'owner' where role is null or role = 'admin';

-- Função auxiliar: usuário logado é "owner"?
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

create index if not exists admin_users_role_idx on public.admin_users(role);

-- A tabela admin_users continua só de leitura para "authenticated" via
-- RLS (cada um só enxerga a própria linha). Todas as operações de
-- listar/criar/editar/remover administradores acontecem através de
-- rotas de API no servidor (com a chave de serviço do Supabase), que
-- conferem se quem está pedindo é um "owner" antes de executar
-- qualquer alteração. Não precisamos abrir mais RLS para isso.

NOTIFY pgrst, 'reload schema';
