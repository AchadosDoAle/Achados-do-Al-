import { createClient } from "@supabase/supabase-js";

// Use este cliente só em código que roda no servidor (rotas de API,
// cron jobs). Ele ignora as regras de RLS, então NUNCA importe este
// arquivo em um componente que rode no navegador.
export function criarClienteAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
