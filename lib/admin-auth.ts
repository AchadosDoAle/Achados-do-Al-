import { criarClienteServidor } from "@/lib/supabase/server";

export async function usuarioEhAdmin() {
  const supabase = criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return !error && Boolean(data);
}

/**
 * Retorna o administrador logado (id, e-mail e papel) ou null se não
 * estiver logado / não for administrador. Use isto nas rotas de API
 * que precisam saber se quem está pedindo é "owner" (pode gerenciar
 * outros usuários) ou apenas "admin" (ofertas, cupons, relatórios).
 */
export async function obterAdminAtual() {
  const supabase = criarClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, email, nome, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return {
    userId: data.user_id as string,
    email: (data.email as string) || user.email || "",
    nome: (data.nome as string) || null,
    role: (data.role as "owner" | "admin") || "admin",
  };
}

export async function usuarioEhOwner() {
  const admin = await obterAdminAtual();
  return admin?.role === "owner";
}
