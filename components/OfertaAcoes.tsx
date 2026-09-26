"use client";

import { useState } from "react";

export function BotaoCopiarCupom({ cupom }: { cupom: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(cupom);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      onClick={copiar}
      className="rounded-lg bg-trust/15 px-4 py-2 text-sm font-medium text-trust"
    >
      {copiado ? "Cupom copiado!" : `🏷️ Copiar cupom ${cupom}`}
    </button>
  );
}

export function BotaoCompartilhar({
  titulo,
  loja,
  preco,
  precoPix,
  url,
}: {
  titulo: string;
  loja: string;
  preco?: number;
  precoPix?: boolean;
  url: string;
}) {
  const [feedback, setFeedback] = useState("");

  function montarTexto() {
    const linhas = [`🔥 ${titulo}`];
    if (preco != null) {
      linhas.push(
        `💰 ${preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}${precoPix ? " no Pix" : ""}`
      );
    }
    linhas.push(`🏪 ${loja}`);
    linhas.push("");
    linhas.push(`🔗 ${url}`);
    return linhas.join("\n");
  }

  async function compartilhar() {
    const texto = montarTexto();
    try {
      if (navigator.share) {
        // O link vai dentro do texto para o WhatsApp não descartar nome/preço
        // e, ao mesmo tempo, conseguir montar a prévia Open Graph do link curto.
        await navigator.share({ title: titulo, text: texto });
        setFeedback("Compartilhado!");
      } else {
        await navigator.clipboard.writeText(texto);
        setFeedback("Copiado!");
      }
      setTimeout(() => setFeedback(""), 2000);
    } catch {
      // Usuário cancelou o compartilhamento.
    }
  }

  return (
    <button
      onClick={compartilhar}
      className="flex-1 rounded-xl2 bg-card px-4 py-3 text-sm font-medium text-text ring-1 ring-white/10 hover:ring-gold/40"
    >
      {feedback ? `📤 ${feedback}` : "📤 Compartilhar"}
    </button>
  );
}
