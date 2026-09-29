"use client";

import { useState } from "react";
import { Cupom } from "@/lib/types";
import { beneficioCupom, formatarValidadeCupom, urlCurtaDoCupom } from "@/lib/cupom-share";

function montarTextoCompartilhamento(cupom: Cupom) {
  const beneficio = beneficioCupom(cupom);
  const linhas = [
    `🎟️ *CUPOM LIBERADO: ${cupom.nomeCupom}*`,
  ];

  if (beneficio) linhas.push(`💸 ${beneficio}`);
  linhas.push(`🏪 LOJA: *${cupom.loja}*`);
  linhas.push(`⏰ VALIDADE: ${formatarValidadeCupom(cupom.validade)}`);
  linhas.push(`🛒 USAR NA LOJA: ${cupom.loja}`);
  linhas.push("");
  linhas.push(`🔗 ${urlCurtaDoCupom(cupom.id)}`);

  return linhas.join("\n");
}

export default function BotaoCompartilharCupom({ cupom }: { cupom: Cupom }) {
  const [feedback, setFeedback] = useState("");

  async function aoCompartilhar() {
    const texto = montarTextoCompartilhamento(cupom);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Cupom liberado: ${cupom.nomeCupom}`,
          text: texto,
        });
        setFeedback("Compartilhado!");
      } else {
        await navigator.clipboard.writeText(texto);
        setFeedback("Texto copiado!");
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
      className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold transition hover:bg-gold/20"
    >
      {feedback ? `📤 ${feedback}` : "📤 Compartilhar cupom"}
    </button>
  );
}
