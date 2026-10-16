// Versão protegida da função delete-my-account do Achados do Alê.
// ATENÇÃO: esta função SUBSTITUI o código anteriormente implantado.
// O token é validado pelo Supabase Auth e contas de admin_users são protegidas.
// Mantenha a service role SOMENTE nas variáveis de ambiente do Supabase.
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const cabecalhos = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};
const resposta = (objeto: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(objeto), { status, headers: cabecalhos });

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: cabecalhos });
  if (request.method !== 'POST') return resposta({ error: 'Método não permitido' }, 405);

  const token = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '')?.[1];
  if (!token) return resposta({ error: 'Autenticação obrigatória' }, 401);
  let dados: { confirm?: boolean } | null = null;
  try { dados = await request.json(); } catch { /* nega por padrão */ }
  if (dados?.confirm !== true) return resposta({ error: 'Confirmação obrigatória' }, 400);

  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !serviceRole) return resposta({ error: 'Servidor não configurado' }, 503);

  const clienteUsuario = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: identidade, error: erroIdentidade } = await clienteUsuario.auth.getUser(token);
  if (erroIdentidade || !identidade?.user?.id) return resposta({ error: 'Sessão inválida' }, 401);
  const usuario = identidade.user;

  const servidor = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });

  // PROTEÇÃO FUNDAMENTAL: nunca excluir administradores por esta função.
  // Se a tabela não estiver disponível ou a consulta falhar, NÃO prosseguir.
  const { data: adminPorId, error: erroConsulta } = await servidor
    .from('admin_users').select('user_id').eq('user_id', usuario.id).maybeSingle();
  if (erroConsulta) return resposta({ error: 'Não foi possível verificar as permissões. Nenhuma conta foi excluída.' }, 503);
  if (adminPorId) return resposta({ error: 'Esta conta é administrativa e está protegida contra exclusão.' }, 403);

  // Defesa adicional: evita que uma conta com e-mail administrativo seja
  // afetada, mesmo se a identidade tiver sido vinculada de maneira inesperada.
  if (usuario.email) {
    const { data: adminPorEmail, error: erroEmail } = await servidor
      .from('admin_users').select('user_id').ilike('email', usuario.email).limit(1);
    if (erroEmail) return resposta({ error: 'Não foi possível verificar as permissões. Nenhuma conta foi excluída.' }, 503);
    if (adminPorEmail?.length) return resposta({ error: 'Esta conta está associada ao administrativo e não pode ser excluída aqui.' }, 403);
  }

  const { error: erroExclusao } = await servidor.auth.admin.deleteUser(usuario.id);
  if (erroExclusao) return resposta({ error: 'Não foi possível excluir sua conta neste momento.' }, 500);
  return resposta({ deleted: true }, 200);
});
