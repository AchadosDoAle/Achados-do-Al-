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
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Alguns navegadores não permitem usar a área de transferência.
    }

    if (link && /^https?:\/\//i.test(link.trim())) {
      window.open(link.trim(), "_blank", "noopener,noreferrer");
    }
  }

  return (
    <button
      type="button"
      onClick={aoClicar}
      className="coupon-voucher-code font-display"
      aria-label={`Copiar cupom ${nomeCupom}`}
      title="Toque para copiar o código"
    >
      <span className="coupon-voucher-prefix">CUPOM </span>
      <span className="coupon-voucher-name" style={{ color: cor }}>
        {nomeCupom}
      </span>
      <span className="coupon-voucher-copy-hint">{copiado ? "Copiado!" : "Toque para copiar"}</span>
    </button>
  );
}
