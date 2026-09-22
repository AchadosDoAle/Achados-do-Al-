import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(nome: string) { return request.cookies.get(nome)?.value; },
        set(nome: string, valor: string, opcoes: CookieOptions) {
          response.cookies.set({ name: nome, value: valor, ...opcoes });
        },
        remove(nome: string, opcoes: CookieOptions) {
          response.cookies.set({ name: nome, value: "", ...opcoes });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const rotaAdmin = request.nextUrl.pathname.startsWith("/admin");
  if (!rotaAdmin) return response;

  if (!user) {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("proximo", request.nextUrl.pathname);
    return NextResponse.redirect(urlLogin);
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("erro", "sem_acesso");
    return NextResponse.redirect(urlLogin);
  }

  return response;
}

export const config = { matcher: ["/admin/:path*"] };
