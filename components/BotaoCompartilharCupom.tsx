"use client";

import { useState } from "react";
import { Cupom } from "@/lib/types";
import { cupomExpirado } from "@/lib/coupons-repo";

function montarTextoCompartilhamento(cupom: Cupom) {
  const partes: string[] = [];
  partes.push(`🎟️ CUPOM ${cupom.nomeCupom}`);
  partes.push(`🏪 Loja: ${cupom.loja}`);

  if (cupom.valorCupom) {
    partes.push(`💸 Benefício: ${cupom.valorCupom}`);
  } else if (cupom.descontoPercentual != null) {
    partes.push(`💸 Benefício: ${cupom.descontoPercentual}% OFF`);
  }

  if (cupom.observacoes) {
    const linhas = cupom.observacoes
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (linhas.length > 0) {
      partes.push("📋 Informações importantes:");
      for (const linha of linhas) {
        partes.push(`- ${linha}`);
      }
    }
  }

  if (cupom.validade) {
    const data = new Date(cupom.validade).toLocaleDateString("pt-BR");
    partes.push(`${cupomExpirado(cupom) ? "⏳ Expirou em" : "⏰ Válido até"} ${data}`);
  }

  if (cupom.linkProdutos && /^https?:\/\//i.test(cupom.linkProdutos.trim())) {
    partes.push(`🔗 ${cupom.linkProdutos.trim()}`);
  }

  return partes.join("\n");
}

export default function BotaoCompartilharCupom({ cupom }: { cupom: Cupom }) {
  const [feedback, setFeedback] = useState("");

  async function aoCompartilhar() {
    const texto = montarTextoCompartilhamento(cupom);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Cupom ${cupom.nomeCupom}`,
          text: texto,
        });
        setFeedback("compartilhado!");
      } else {
        await navigator.clipboard.writeText(texto);
        setFeedback("texto copiado!");
      }
      setTimeout(() => setFeedback(""), 2000);
    } catch {
      // Usuário cancelou ou navegador bloqueou; evita erro visível.
    }
  }

  return (
    <button
      type="button"
      onClick={aoCompartilhar}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text transition hover:bg-white/10"
    >
      {feedback ? `↗ ${feedback}` : "↗ Compartilhar"}
    </button>
  );
}
