import { createClient } from "@supabase/supabase-js";

// Usado nas páginas públicas do site (home, página de oferta). Usa a
// chave anônima, então só enxerga o que a política de RLS libera para
// todo mundo — no schema.sql, isso é só as ofertas com status "publicada".
export function criarClientePublico() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
