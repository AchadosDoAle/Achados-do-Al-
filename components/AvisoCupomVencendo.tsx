"use client";

import { useEffect, useState } from "react";

// Fica visível somente nas últimas 60 minutos e atualiza sem recarregar a página.
export default function AvisoCupomVencendo({ validade }: { validade?: string }) {
  const [minutosRestantes, setMinutosRestantes] = useState<number | null>(null);

  useEffect(() => {
    if (!validade) {
      setMinutosRestantes(null);
      return;
    }
    const vencimento = Date.parse(validade);
    if (!Number.isFinite(vencimento)) {
      setMinutosRestantes(null);
      return;
    }
    const atualizar = () => {
      const ms = vencimento - Date.now();
      setMinutosRestantes(ms > 0 && ms <= 3600000 ? Math.ceil(ms / 60000) : null);
    };
    atualizar();
    const intervalo = window.setInterval(atualizar, 30000);
    return () => window.clearInterval(intervalo);
  }, [validade]);

  if (minutosRestantes == null) return null;
  return (
    <p className={`coupon-voucher-warning ${minutosRestantes <= 10 ? "coupon-voucher-warning-urgent" : ""}`} role="status">
      {minutosRestantes <= 10 ? "Atenção: o cupom vence em poucos minutos!" : "Atenção: este cupom vence em menos de 1 hora."}
    </p>
  );
}
