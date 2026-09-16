"use client";

import { useEffect, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { listarPublicacoes } from "@/lib/publications-repo";

export default function IntegracoesPage() {
  const supabase = criarClienteNavegador();
  const [status, setStatus] = useState<
    { ok: boolean; erro?: string; numero?: string; nome?: string } | null
  >(null);
  const [testando, setTestando] = useState(false);
  const [publicacoes, setPublicacoes] = useState<any[]>([]);

  useEffect(() => {
    listarPublicacoes(supabase).then(setPublicacoes).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function testarConexao() {
    setTestando(true);
    const resposta = await fetch("/api/whatsapp/testar");
    setStatus(await resposta.json());
    setTestando(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="font-display text-base font-bold text-ink">
          WhatsApp Business Platform (Cloud API oficial)
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Esta integração envia mensagens automáticas apenas para números de
          telefone que deram opt-in (ex: uma lista de clientes). Ela{" "}
          <strong>não publica no seu canal do WhatsApp</strong> — hoje a Meta
          não oferece essa opção de forma oficial. Para o canal, use os
          botões "Copiar publicação" e "Enviar para WhatsApp" na tela de cada
          oferta.
        </p>

        <p className="mt-3 text-xs text-ink/50">
          As credenciais (token, ID do número) são configuradas como
          variáveis de ambiente no seu provedor de hospedagem, nunca aqui na
          tela — por segurança, elas não passam pelo navegador.
        </p>

        <button
          onClick={testarConexao}
          disabled={testando}
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {testando ? "Testando..." : "Testar conexão"}
        </button>

        {status && (
          <p
            className={`mt-3 text-sm ${status.ok ? "text-trust" : "text-accent-dark"}`}
          >
            {status.ok
              ? `Conectado ao número ${status.numero} (${status.nome}).`
              : `Falha: ${status.erro}`}
          </p>
        )}
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="font-display text-base font-bold text-ink">
          Histórico de publicações
        </h2>
        {publicacoes.length === 0 ? (
          <p className="mt-2 text-sm text-ink/60">
            Nenhuma publicação registrada ainda.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {publicacoes.map((p) => (
              <li
                key={p.id}
                className="rounded-lg bg-cream p-3 text-sm text-ink/80"
              >
                <p className="font-medium">{p.offers?.titulo ?? "Oferta"}</p>
                <p className="text-xs text-ink/50">
                  {p.canal} · {p.status} ·{" "}
                  {new Date(p.enviado_em).toLocaleString("pt-BR")}
                </p>
                {p.erro && (
                  <p className="mt-1 text-xs text-accent-dark">{p.erro}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
