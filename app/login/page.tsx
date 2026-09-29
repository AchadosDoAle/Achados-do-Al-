"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <FormularioLogin />
    </Suspense>
  );
}

function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = criarClienteNavegador();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setMensagemRecuperacao("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push(params.get("proximo") || "/admin");
    router.refresh();
  }

  async function recuperarSenha() {
    setErro("");
    setMensagemRecuperacao("");

    if (!email) {
      setErro("Digite seu e-mail acima antes de pedir a recuperação.");
      return;
    }

    setEnviandoRecuperacao(true);
    await supabase.auth.resetPasswordForEmail(email);
    setEnviandoRecuperacao(false);
    setMensagemRecuperacao(
      "Se esse e-mail tiver uma conta, enviamos um link de recuperação."
    );
  }

  const estiloCampo: React.CSSProperties = {
    colorScheme: "light",
    WebkitTextFillColor: "#171124",
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f4f6] px-4 py-8 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#f2c24f]/20 to-transparent"
      />

      <section className="relative w-full max-w-md">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efbd45] text-xl font-black text-[#171124] shadow-sm">
            A
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f657a]">
            Painel administrativo
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-[#171124]">
            Achado do Alê
          </h1>
          <p className="mt-1 text-sm text-[#746b7d]">
            Entre com sua conta autorizada para continuar.
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="rounded-2xl border border-[#171124]/10 bg-white p-5 shadow-[0_18px_55px_rgba(23,17,36,0.10)] sm:p-7"
        >
          {params.get("erro") === "sem_acesso" && (
            <p className="mb-4 rounded-xl border border-[#efbd45]/50 bg-[#fff8e6] px-3.5 py-3 text-sm font-medium text-[#6b5314]">
              Esta conta não tem permissão de administrador.
            </p>
          )}

          <label className="block text-sm font-semibold text-[#171124]">
            E-mail
            <input
              type="email"
              required
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              style={estiloCampo}
              className="mt-1.5 w-full rounded-xl border border-[#d8d4dc] bg-white px-3.5 py-3 text-sm text-[#171124] caret-[#171124] outline-none transition placeholder:text-[#aaa3b0] focus:border-[#d9a51f] focus:ring-2 focus:ring-[#efbd45]/25"
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-[#171124]">
            Senha
            <div className="relative mt-1.5">
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                style={estiloCampo}
                className="w-full rounded-xl border border-[#d8d4dc] bg-white py-3 pl-3.5 pr-11 text-sm text-[#171124] caret-[#171124] outline-none transition placeholder:text-[#aaa3b0] focus:border-[#d9a51f] focus:ring-2 focus:ring-[#efbd45]/25"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((valor) => !valor)}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#746b7d] transition hover:bg-[#f5f3f7] hover:text-[#171124] focus:outline-none focus:ring-2 focus:ring-[#efbd45]/40"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    className="h-4 w-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 10.7a2 2 0 002.7 2.7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.2A10.8 10.8 0 0112 5c5.1 0 8.4 4.2 9 5.1.2.3.2.6 0 .9a16.8 16.8 0 01-2.5 2.9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.1 6.1A16.5 16.5 0 003 10.1c-.2.3-.2.6 0 .9.6.9 3.9 5 9 5 1.1 0 2.2-.2 3.1-.5" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10.5C4.5 8 7.7 5 12 5s7.5 3 9 5.5a1 1 0 010 1C19.5 14 16.3 17 12 17s-7.5-3-9-5.5a1 1 0 010-1z"
                    />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {erro && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {erro}
            </p>
          )}
          {mensagemRecuperacao && (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {mensagemRecuperacao}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-5 w-full rounded-xl border border-[#dba82e] bg-[#efbd45] px-4 py-3 text-sm font-bold text-[#171124] shadow-sm transition hover:bg-[#e8b63c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar no painel"}
          </button>

          <button
            type="button"
            onClick={recuperarSenha}
            disabled={enviandoRecuperacao}
            className="mt-3 w-full rounded-lg py-2 text-center text-xs font-semibold text-[#6f657a] transition hover:bg-[#f7f6f8] hover:text-[#171124] disabled:opacity-60"
          >
            {enviandoRecuperacao ? "Enviando recuperação..." : "Esqueci minha senha"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#8a8290]">
          Acesso restrito a administradores autorizados.
        </p>
      </section>
    </main>
  );
}
