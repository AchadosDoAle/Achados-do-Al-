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
