import { criarClienteAdmin } from "@/lib/supabase/admin";
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
 * Evita um bloqueio do gerenciador de usuários.
 *
 * Se existe apenas UM registro em admin_users e esse registro pertence ao
 * usuário logado, ele necessariamente precisa ser o owner inicial do sistema.
 * Caso esteja como "admin" por causa de uma instalação/migração antiga, o
 * servidor corrige o papel automaticamente usando a service role.
 *
 * A correção só acontece quando há exatamente um administrador cadastrado.
 * Assim que existir mais de um administrador, os papéis passam a ser
 * respeitados normalmente e nenhum "admin" ganha privilégio por conta própria.
 */
async function garantirOwnerInicial(userId: string, roleAtual: "owner" | "admin") {
  if (roleAtual === "owner") return "owner" as const;

  try {
    const supabaseAdmin = criarClienteAdmin();
    const { data: administradores, error } = await supabaseAdmin
      .from("admin_users")
      .select("user_id, role")
      .limit(2);

    if (error || !administradores || administradores.length !== 1) {
      return roleAtual;
    }

    const unicoAdmin = administradores[0];
    if (unicoAdmin.user_id !== userId) return roleAtual;

    const { error: erroAtualizacao } = await supabaseAdmin
      .from("admin_users")
      .update({ role: "owner" })
      .eq("user_id", userId);

    if (erroAtualizacao) return roleAtual;
    return "owner" as const;
  } catch {
    // Se a variável de service role estiver indisponível por algum motivo,
    // preserva o comportamento existente em vez de derrubar o painel inteiro.
    return roleAtual;
  }
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

  const roleLido: "owner" | "admin" = data.role === "owner" ? "owner" : "admin";
  const role = await garantirOwnerInicial(user.id, roleLido);

  return {
    userId: data.user_id as string,
    email: (data.email as string) || user.email || "",
    nome: (data.nome as string) || null,
    role,
  };
}

export async function usuarioEhOwner() {
  const admin = await obterAdminAtual();
  return admin?.role === "owner";
}
