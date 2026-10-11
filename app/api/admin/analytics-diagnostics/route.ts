import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { usuarioEhAdmin } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await usuarioEhAdmin())) {
    return NextResponse.json({ status: "error", message: "Acesso não autorizado." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ status: "error", message: "Variáveis públicas de conexão com o Supabase não configuradas na Vercel." });
  }

  try {
    // Usa a chave pública e nenhuma sessão: testa exatamente a permissão dos visitantes.
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Com caminho vazio a função track_basic_pageview retorna sem inserir
    // nenhum registro: diagnóstico seguro, sem visitas fictícias.
    const { error } = await supabase.rpc("track_basic_pageview", { p_path: "" });
    if (!error) {
      return NextResponse.json({
        status: "ok",
        message: "Rastreamento básico disponível para visitantes. Se não houver acessos, abra a Home em uma janela anônima e atualize este relatório.",
      });
    }

    if (error.code === "PGRST202" || /function.*(not found|schema cache|does not exist)/i.test(error.message)) {
      return NextResponse.json({
        status: "missing_rpc",
        message: "A função track_basic_pageview não está disponível no Supabase. Verifique o script supabase/analytics.sql no SQL Editor.",
      });
    }

    if (error.code === "42501" || /permission denied|not allowed|execute privilege/i.test(error.message)) {
      return NextResponse.json({
        status: "permission",
        message: "Visitantes não têm permissão para executar track_basic_pageview. Confira o GRANT EXECUTE da função para anon e authenticated.",
      });
    }

    return NextResponse.json({
      status: "error",
      message: `O Supabase recusou a verificação de rastreamento (código ${error.code || "desconhecido"}). Confira as funções e permissões do Analytics.`,
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Falha de conexão com o Supabase. Confira a configuração do projeto." });
  }
}
