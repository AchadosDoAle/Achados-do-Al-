"use client";

import { useEffect, useState } from "react";

function formatarTempo(ms: number): string {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const dias = Math.floor(segundos / 86400);
  const horas = Math.floor((segundos % 86400) / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;
  const dois = (numero: number) => String(numero).padStart(2, "0");
  return dias > 0
    ? `${dias}d ${dois(horas)}h ${dois(minutos)}m ${dois(resto)}s`
    : `${dois(horas)}:${dois(minutos)}:${dois(resto)}`;
}

/** Exibe o prazo real cadastrado; não inventa uma duração para cupons sem validade. */
export default function ContagemCupomRelampago({ validade }: { validade?: string }) {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const fim = validade ? Date.parse(validade) : NaN;
    if (!Number.isFinite(fim)) {
      setRestante(null);
      return;
    }
    const atualizar = () => setRestante(Math.max(0, fim - Date.now()));
    atualizar();
    const intervalo = window.setInterval(atualizar, 1000);
    return () => window.clearInterval(intervalo);
  }, [validade]);

  if (restante === null) {
    return (
      <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200">
        ⚡ Cupom relâmpago · prazo não informado
      </p>
    );
  }

  const encerrado = restante === 0;
  return (
    <div className={`mt-2 rounded-lg border px-3 py-2 ${encerrado ? "border-white/10 bg-white/5 text-text-muted" : restante <= 600000 ? "border-red-400/40 bg-red-500/10 text-red-300" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide">
        {encerrado ? "⚡ Tempo encerrado" : "⚡ Termina em"}
      </p>
      {!encerrado && (
        <p className="mt-1 font-mono text-xl font-bold tabular-nums" role="timer" aria-label={`Tempo restante: ${formatarTempo(restante)}`}>
          {formatarTempo(restante)}
        </p>
      )}
    </div>
  );
}
