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

    if (link && /^https?:\/\//i.test(link.trim())) {
      window.open(link.trim(), "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={aoClicar}
      className="mt-1 block text-left"
      aria-label={`Copiar cupom ${nomeCupom}`}
    >
      <span className="font-display text-lg font-extrabold tracking-wide text-white">
        CUPOM <span style={{ color: cor }}>{nomeCupom}</span>
      </span>
      <span className="ml-1 text-xs font-normal text-text-muted">
        {copiado ? "· copiado!" : "· toque para copiar"}
      </span>
    </button>
  );
}
