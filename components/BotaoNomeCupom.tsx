"use client";

import { useState } from "react";

export default function BotaoNomeCupom({
  nomeCupom,
  cor,
  link,
}: {
  nomeCupom: string;
  cor: string;
  link?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function aoClicar() {
    try {
      await navigator.clipboard.writeText(nomeCupom);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // se o navegador bloquear a cópia automática, segue só com o link
    }

    // Só abre em nova aba se o campo "Link dos produtos" parecer mesmo
    // um link (senão, provavelmente é uma lista de produtos em texto).
    if (link && /^https?:\/\//i.test(link.trim())) {
      window.open(link.trim(), "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={aoClicar}
      className="mt-1 block text-left font-display text-lg font-extrabold tracking-wide"
      style={{ color: cor }}
    >
      CUPOM {nomeCupom}
      <span className="ml-1 text-xs font-normal text-text-muted">
        {copiado ? "· copiado!" : "· toque para copiar"}
      </span>
    </button>
  );
}
