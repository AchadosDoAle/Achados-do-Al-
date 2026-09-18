"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

type Motivo = "promocao_vencida" | "produto_acabou" | "preco_divergente";

const OPCOES: Array<{ motivo: Motivo; label: string }> = [
  { motivo: "promocao_vencida", label: "PROMOÇÃO VENCIDA" },
  { motivo: "produto_acabou", label: "ACABOU" },
  { motivo: "preco_divergente", label: "NÃO ESTÁ ESSE PREÇO" },
];

const CHAVE_VISITANTE = "achado-do-ale-visitor-id";

function obterIdentificadorVisitante() {
  const existente = window.localStorage.getItem(CHAVE_VISITANTE);
  if (existente) return existente;

  const novo =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(CHAVE_VISITANTE, novo);
  return novo;
}

export default function ReportarOferta({ ofertaId }: { ofertaId: string }) {
  const router = useRouter();
  const supabase = criarClienteNavegador();
  const [enviando, setEnviando] = useState<Motivo | null>(null);
  const [mensagem, setMensagem] = useState("");

  async function reportar(motivo: Motivo) {
    if (enviando) return;
    setEnviando(motivo);
    setMensagem("");

    try {
      const reporterId = obterIdentificadorVisitante();
      const { data, error } = await supabase.rpc("report_offer_issue", {
        p_offer_id: ofertaId,
        p_reporter_id: reporterId,
        p_motivo: motivo,
      });

      if (error) throw error;

      const resultado = Array.isArray(data) ? data[0] : data;
      const desativada = Boolean(resultado?.desativada);
      const novoAviso = Boolean(resultado?.novo_aviso);

      if (desativada) {
        setMensagem(
          "Obrigado pelo aviso! A promoção foi marcada como vencida para revisão."
        );
        router.refresh();
        return;
      }

      if (!novoAviso) {
        setMensagem("Seu aviso para esta oferta já foi registrado anteriormente.");
      } else {
        setMensagem(
          "Obrigado! Seu aviso foi registrado e vamos verificar essa promoção."
        );
      }
    } catch (erro) {
      console.error(erro);
      setMensagem("Não foi possível registrar o aviso agora. Tente novamente em instantes.");
    } finally {
      setEnviando(null);
    }
  }

  return (
    <section className="mt-5 rounded-xl2 border border-danger/20 bg-danger/5 p-4">
      <p className="text-sm font-semibold text-text">Encontrou algum problema com a promoção?</p>
      <p className="mt-1 text-xs leading-5 text-text-muted">
        Avise a gente se a promoção acabou, venceu ou se o preço anunciado não estiver mais disponível.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {OPCOES.map((opcao) => (
          <button
            key={opcao.motivo}
            type="button"
            onClick={() => reportar(opcao.motivo)}
            disabled={Boolean(enviando)}
            className="rounded-lg border border-danger/25 bg-bg-secondary px-3 py-2 text-xs font-semibold text-text transition hover:border-danger/50 hover:bg-danger/10 disabled:opacity-50"
          >
            {enviando === opcao.motivo ? "ENVIANDO..." : opcao.label}
          </button>
        ))}
      </div>

      {mensagem && (
        <p className="mt-3 rounded-lg bg-bg-secondary px-3 py-2 text-xs leading-5 text-text-muted">
          {mensagem}
        </p>
      )}
    </section>
  );
}
