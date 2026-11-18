"use client";

import { useState } from "react";

export default function BotaoNomeCupom({
  nomeCupom,
  cor,
  linkResgate,
}: {
  nomeCupom: string;
  cor: string;
  linkResgate?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const destino = linkResgate?.trim();
  const linkValido = Boolean(destino && /^https?:\\/\\//i.test(destino));

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(nomeCupom);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  const conteudo = (
    <>
      <span className="coupon-voucher-code-main">
        <span className="coupon-voucher-prefix">CUPOM </span>
        <span className="coupon-voucher-name" style={{ color: cor }}>{nomeCupom}</span>
      </span>
      <span className="coupon-voucher-copy-hint">
        {linkValido ? "ABRIR LINK DE RESGATE ↗" : copiado ? "COPIADO!" : "TOQUE PARA COPIAR"}
      </span>
    </>
  );

  if (linkValido && destino) {
    return (
      <a
        href={destino}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="coupon-voucher-code font-display"
        aria-label={`Abrir página para resgatar o cupom ${nomeCupom}`}
        title="Abrir o link para resgatar o cupom"
      >
        {conteudo}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={copiarCodigo}
      className="coupon-voucher-code font-display"
      aria-label={`Copiar código do cupom ${nomeCupom}`}
      title="Toque para copiar o código"
    >
      {conteudo}
    </button>
  );
}
