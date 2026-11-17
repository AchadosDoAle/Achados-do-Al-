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
    const destino = link?.trim();
    const linkValido = Boolean(destino && /^https?:\/\//i.test(destino));

    // Abrir a nova aba diretamente no clique evita que o navegador bloqueie
    // a navegação como pop-up após a operação assíncrona da área de transferência.
    if (linkValido && destino) {
      window.open(destino, "_blank", "noopener,noreferrer");
    }

    try {
      await navigator.clipboard.writeText(nomeCupom);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // A abertura do link não depende da permissão de área de transferência.
    }
  }

  const temLink = Boolean(link && /^https?:\/\//i.test(link.trim()));

  return (
    <button
      type="button"
      onClick={aoClicar}
      className="coupon-voucher-code font-display"
      aria-label={temLink ? `Abrir link e copiar cupom ${nomeCupom}` : `Copiar cupom ${nomeCupom}`}
      title={temLink ? "Abrir o link do cupom e copiar o código" : "Toque para copiar o código"}
    >
      <span className="coupon-voucher-prefix">CUPOM </span>
      <span className="coupon-voucher-name" style={{ color: cor }}>
        {nomeCupom}
      </span>
      <span className="coupon-voucher-copy-hint">
        {copiado ? "Copiado!" : temLink ? "Abrir link e copiar" : "Toque para copiar"}
      </span>
    </button>
  );
}
