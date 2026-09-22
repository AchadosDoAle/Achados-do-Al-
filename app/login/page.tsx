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
  const [erro, setErro] = useState("");
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);
  const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-6">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-xl2 bg-white p-6 ring-1 ring-ink/10"
      >
        <h1 className="font-display text-xl font-bold text-ink">
          Achado do Alê
        </h1>
        <p className="mt-1 text-sm text-ink/60">Entre para acessar o painel</p>
        {params.get("erro") === "sem_acesso" && (
          <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent-dark">
            Esta conta não tem permissão de administrador.
          </p>
        )}

        <label className="mt-5 block text-sm font-medium text-ink">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>

        <label className="mt-3 block text-sm font-medium text-ink">
          Senha
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>

        {erro && <p className="mt-2 text-sm text-accent-dark">{erro}</p>}
        {mensagemRecuperacao && (
          <p className="mt-2 text-sm text-trust">{mensagemRecuperacao}</p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="mt-5 w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={recuperarSenha}
          disabled={enviandoRecuperacao}
          className="mt-3 w-full text-center text-xs font-medium text-ink/60 underline"
        >
          Esqueci minha senha
        </button>
      </form>
    </main>
  );
}
