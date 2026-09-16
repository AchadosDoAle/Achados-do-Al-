import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function criarClienteServidor() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(nome: string) {
          return cookieStore.get(nome)?.value;
        },
        set(nome: string, valor: string, opcoes: CookieOptions) {
          cookieStore.set({ name: nome, value: valor, ...opcoes });
        },
        remove(nome: string, opcoes: CookieOptions) {
          cookieStore.set({ name: nome, value: "", ...opcoes });
        },
      },
    }
  );
}
