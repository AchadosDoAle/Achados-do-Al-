import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { usuarioEhAdmin } from "@/lib/admin-auth";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { criarClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StatusDiagnostico = "ok" | "warning" | "missing_rpc" | "permission" | "error";

function resposta(status: StatusDiagnostico, message: string) {
  return NextResponse.json({ status, message }, { headers: { "Cache-Control": "no-store" } });
}

function classificarErroRpc(error: { code?: string; message: string }) {
  if (error.code === "PGRST202" || /function.*(not found|schema cache|does not exist)/i.test(error.message)) {
    return resposta("missing_rpc", "A função track_basic_pageview não foi encontrada. Confira a migração de Analytics no Supabase.");
  }
  if (error.code === "42501" || /permission denied|not allowed|execute privilege/i.test(error.message)) {
    return resposta("permission", "A função de visitas recusou a chamada pública. Confira o GRANT EXECUTE para anon e authenticated no Supabase.");
  }
  return resposta("error", `Falha ao chamar track_basic_pageview (código ${error.code || "desconhecido"}). Veja os logs do Supabase.`);
}

async function verificarLeitura() {
  const admin = criarClienteAdmin();
  const usuario = criarClienteServidor();
  const [total, visivel] = await Promise.all([
    admin.from("analytics_pageviews").select("id", { count: "exact", head: true }),
    usuario.from("analytics_pageviews").select("id", { count: "exact", head: true }),
  ]);
  if (total.error) return { erro: `Não foi possível consultar analytics_pageviews com a chave administrativa (código ${total.error.code || "desconhecido"}).` };
  if (visivel.error) return { erro: `O painel não conseguiu ler analytics_pageviews (código ${visivel.error.code || "desconhecido"}). Confira a política RLS.` };
  return { total: total.count ?? 0, visivel: visivel.count ?? 0 };
}

/** Inspeção sem gravações: não apresenta um teste com caminho vazio como prova de funcionamento. */
export async function GET() {
  if (!(await usuarioEhAdmin())) return resposta("error", "Acesso não autorizado.");
  try {
    const leitura = await verificarLeitura();
    if (leitura.erro) return resposta("error", leitura.erro);
    if (leitura.total! > 0 && leitura.visivel === 0) {
      return resposta("permission", `Existem ${leitura.total} visualizações no banco, mas nenhuma está visível ao painel. Verifique as políticas de leitura (RLS) do Supabase.`);
    }
    if (leitura.total === 0) {
      return resposta("warning", "Nenhuma visualização está armazenada no Supabase. Use o botão de teste real para verificar a gravação e a leitura.");
    }
    return resposta("ok", `O banco contém ${leitura.total} visualizações e o painel consegue ler ${leitura.visivel}. Use o teste real para verificar novas gravações.`);
  } catch (error) {
    console.error("Falha no diagnóstico de Analytics:", error);
    return resposta("error", "Não foi possível inspecionar os registros. Confira a configuração do Supabase na Vercel.");
  }
}

/**
 * Teste explícito e reversível: insere uma visualização usando exatamente o
 * papel anon dos visitantes, verifica leitura no painel e remove apenas a
 * linha criada pelo próprio teste. Não contabiliza visitas fictícias.
 */
export async function POST() {
  if (!(await usuarioEhAdmin())) return resposta("error", "Acesso não autorizado.");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return resposta("error", "Variáveis públicas do Supabase não configuradas.");

  const caminhoTeste = `/__analytics_test_${crypto.randomUUID()}`;
  let deveLimpar = false;
  try {
    const visitante = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Caminho não vazio é essencial: o teste anterior retornava sucesso sem INSERT.
    const { error } = await visitante.rpc("track_basic_pageview", { p_path: caminhoTeste });
    if (error) return classificarErroRpc(error);
    deveLimpar = true;

    const admin = criarClienteAdmin();
    const usuario = criarClienteServidor();
    const [gravado, visivel] = await Promise.all([
      admin.from("analytics_pageviews").select("id", { count: "exact", head: true }).eq("path", caminhoTeste),
      usuario.from("analytics_pageviews").select("id", { count: "exact", head: true }).eq("path", caminhoTeste),
    ]);
    if (gravado.error) return resposta("error", `Erro na verificação do registro (código ${gravado.error.code || "desconhecido"}).`);
    if (!gravado.count) return resposta("error", "A função respondeu sem erro, mas não gravou a visualização. Confira a implementação e as permissões no Supabase.");
    if (visivel.error || !visivel.count) {
      return resposta("permission", "A visualização foi gravada, mas não está visível ao painel administrativo. Confira a política de leitura RLS.");
    }
    return resposta("ok", "Teste concluído: a visita foi gravada com permissão pública e lida pelo painel. O registro de teste foi descartado.");
  } catch (error) {
    console.error("Falha no teste real de Analytics:", error);
    return resposta("error", "Não foi possível executar o teste real de visualizações. Confira os logs e variáveis do Supabase.");
  } finally {
    if (deveLimpar) {
      try {
        const { error } = await criarClienteAdmin().from("analytics_pageviews").delete().eq("path", caminhoTeste);
        if (error) console.error("Falha ao remover visualização temporária:", error);
      } catch (error) {
        console.error("Falha ao limpar visualização temporária:", error);
      }
    }
  }
}
