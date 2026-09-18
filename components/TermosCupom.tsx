"use client";

import { useEffect, useState } from "react";

export default function TermosCupom({
  nomeCupom,
  descricao,
  observacoes,
}: {
  nomeCupom: string;
  descricao?: string;
  observacoes?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const temConteudo = Boolean(descricao?.trim() || observacoes?.trim());

  useEffect(() => {
    if (!aberto) return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }

    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  if (!temConteudo) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-text transition hover:bg-white/10"
      >
        📋 Termos de uso
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={() => setAberto(false)}
          role="presentation"
        >
          <div
            className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-card p-5 shadow-2xl sm:rounded-3xl sm:p-6"
            onClick={(evento) => evento.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`termos-${nomeCupom}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                  Termos de uso
                </p>
                <h2
                  id={`termos-${nomeCupom}`}
                  className="mt-1 font-display text-xl font-bold text-text"
                >
                  CUPOM {nomeCupom}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setAberto(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-lg text-text transition hover:bg-white/15"
                aria-label="Fechar termos de uso"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-5 text-sm leading-6 text-text-muted">
              {descricao?.trim() && (
                <section>
                  <h3 className="mb-2 font-semibold text-text">Descrição</h3>
                  <p className="whitespace-pre-wrap">{descricao}</p>
                </section>
              )}

              {observacoes?.trim() && (
                <section>
                  <h3 className="mb-2 font-semibold text-text">Condições e observações</h3>
                  <p className="whitespace-pre-wrap">{observacoes}</p>
                </section>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAberto(false)}
              className="mt-6 w-full rounded-xl bg-gold px-4 py-3 text-sm font-bold text-bg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
