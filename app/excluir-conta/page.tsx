"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

/**
 * Sessão separada da autenticação administrativa do site.
 * NÃO usar criarClienteNavegador() (@supabase/ssr), pois ele utiliza cookies
 * compartilhados com /login e /admin. O cliente abaixo usa somente uma chave
 * exclusiva no localStorage e nunca altera o login administrativo existente.
 */
function criarClienteExclusao(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chavePublica = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chavePublica || typeof window === "undefined") return null;

  let storage: Storage;
  try { storage = window.localStorage; } catch { return null; }

  return createClient(url, chavePublica, {
    auth: {
      storageKey: "achados-customer-account-deletion-v1",
      storage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });
}

function mensagemErro(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a solicitação. Tente novamente.";
}

export default function ExcluirContaPage() {
  const supabase = useMemo(criarClienteExclusao, []);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!supabase) { setCarregando(false); return; }
    let ativo = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (ativo) {
        setUsuario(sessao?.user ?? null);
        setCarregando(false);
      }
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!ativo) return;
      if (error) setErro("Não foi possível carregar sua sessão Google. Tente entrar novamente.");
      setUsuario(data.session?.user ?? null);
      setCarregando(false);
    }).catch(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; subscription.unsubscribe(); };
  }, [supabase]);

  const entrarComGoogle = useCallback(async () => {
    if (!supabase || ocupado) return;
    setErro("");
    setOcupado(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/excluir-conta` },
      });
      if (error) throw error;
      // Supabase redirecionará ao Google quando a operação tiver sucesso.
    } catch (error) {
      setErro(mensagemErro(error));
      setOcupado(false);
    }
  }, [supabase, ocupado]);

  const sairDaConta = useCallback(async () => {
    if (!supabase || ocupado) return;
    setOcupado(true);
    setErro("");
    try {
      await supabase.auth.signOut({ scope: "local" });
      setUsuario(null);
      setAceite(false);
      setTextoConfirmacao("");
    } catch (error) { setErro(mensagemErro(error)); }
    finally { setOcupado(false); }
  }, [supabase, ocupado]);

  const excluirMinhaConta = useCallback(async () => {
    if (!supabase || !usuario || ocupado || !aceite || textoConfirmacao !== "EXCLUIR") return;
    setErro("");
    setOcupado(true);
    try {
      // getUser confirma que a sessão ainda é válida antes da operação destrutiva.
      const { data: identificacao, error: erroIdentificacao } = await supabase.auth.getUser();
      if (erroIdentificacao || identificacao.user?.id !== usuario.id) {
        throw new Error("Sua sessão expirou. Entre novamente com o Google.");
      }
      const { data, error } = await supabase.functions.invoke("delete-my-account", {
        body: { confirm: true },
      });
      if (error || !data?.deleted) {
        // A função protegida retorna 403 para contas administrativas.
        const status = (error as { context?: { status?: number } } | null)?.context?.status;
        if (status === 403) throw new Error("Essa conta possui acesso administrativo protegido e não pode ser excluída por esta página.");
        throw new Error(data?.error || "A exclusão não foi concluída. Entre em contato com o suporte.");
      }
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      setUsuario(null);
      setConcluido(true);
    } catch (error) {
      setErro(mensagemErro(error));
    } finally { setOcupado(false); }
  }, [supabase, usuario, ocupado, aceite, textoConfirmacao]);

  return (
    <div className="min-h-screen bg-bg pb-bottom-nav text-text">
      <Header />
      <main>
        <Container className="px-4 py-8 sm:py-12">
          <article className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-card p-5 shadow-lg sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold">Sua conta, suas escolhas</p>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Excluir minha conta</h1>
            <p className="mt-4 text-sm leading-7 text-text-muted">
              Você pode solicitar a exclusão definitiva da conta de cliente do Achados do Alê.
              Esta opção também está disponível no aplicativo Android, em <strong>Perfil → Excluir minha conta</strong>.
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-bg-secondary/70 px-4 py-4 text-sm leading-6 text-text-muted">
              <p className="font-semibold text-text">O que acontece quando você exclui?</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Seu acesso como cliente é encerrado.</li>
                <li>A conta e as preferências vinculadas a ela são excluídas do Supabase, conforme a estrutura de dados atual.</li>
                <li>Favoritos armazenados somente no aparelho podem continuar nele até você apagar os dados locais do aplicativo.</li>
                <li>Registros que precisem ser retidos por obrigação legal podem seguir os prazos informados na <Link href="/privacidade" className="underline decoration-gold/60 hover:text-gold">Política de Privacidade</Link>.</li>
              </ul>
            </div>

            {concluido ? (
              <div role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
                <strong>Sua conta de cliente foi excluída.</strong>
                <p className="mt-2">Obrigado por fazer parte do Achados do Alê. Você pode continuar vendo as promoções sem login.</p>
                <Link href="/" className="mt-4 inline-block font-semibold underline">Voltar às ofertas</Link>
              </div>
            ) : carregando ? (
              <p role="status" className="mt-6 text-sm text-text-muted">Verificando sua conta...</p>
            ) : !supabase ? (
              <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm">O login está temporariamente indisponível. A configuração pública do Supabase não foi encontrada.</p>
            ) : !usuario ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-text-muted">Para identificar a conta correta, entre com o mesmo Google usado no aplicativo.</p>
                <button type="button" disabled={ocupado} onClick={entrarComGoogle}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#202124] transition hover:bg-[#f1f1f1] disabled:opacity-60">
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.88 46.98 24.55z"/>
                    <path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.95 23.95 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.73-6C30.01 37.65 27.25 38.5 24 38.5c-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {ocupado ? "Abrindo Google..." : "Continuar com Google"}
                </button>
                <p className="text-xs text-text-muted">O login desta página é separado do acesso ao painel administrativo.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <section className="rounded-xl border border-white/10 bg-bg-secondary/60 p-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Conta identificada</p>
                  <p className="mt-1 break-all font-semibold">{usuario.email || "Conta Google"}</p>
                  <button type="button" onClick={sairDaConta} disabled={ocupado} className="mt-2 text-xs font-semibold text-gold underline disabled:opacity-60">Não é minha conta / Trocar conta</button>
                </section>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-text-muted">
                  <input type="checkbox" checked={aceite} onChange={e => setAceite(e.target.checked)} disabled={ocupado} className="mt-1 h-4 w-4 accent-[#f5b942]" />
                  <span>Entendo que a exclusão da minha conta é permanente e que perderei as preferências sincronizadas associadas a ela.</span>
                </label>
                <div>
                  <label htmlFor="confirmar-exclusao" className="block text-sm font-medium">Digite <strong>EXCLUIR</strong> para confirmar</label>
                  <input id="confirmar-exclusao" type="text" autoComplete="off" value={textoConfirmacao} onChange={e=>setTextoConfirmacao(e.target.value)} disabled={ocupado}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-bg-secondary px-4 py-3 text-text outline-none focus:border-gold" placeholder="EXCLUIR" />
                </div>
                <button type="button" disabled={ocupado || !aceite || textoConfirmacao !== "EXCLUIR"} onClick={excluirMinhaConta}
                  className="min-h-12 w-full rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40">
                  {ocupado ? "Excluindo sua conta..." : "Excluir minha conta definitivamente"}
                </button>
              </div>
            )}
            {erro ? <p role="alert" className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{erro}</p> : null}
            <div className="mt-7 border-t border-white/10 pt-5 text-sm text-text-muted">
              <p>Se preferir, consulte os canais de contato indicados na <Link href="/privacidade" className="font-semibold text-gold underline">Política de Privacidade</Link>.</p>
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
