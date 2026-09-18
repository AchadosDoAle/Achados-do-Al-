"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [montado, setMontado] = useState(false);
  const temConteudo = Boolean(descricao?.trim() || observacoes?.trim());

  useEffect(() => {
    setMontado(true);
  }, []);

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

  const modal = aberto ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => setAberto(false)}
      role="presentation"
    >
      <div
        className="relative max-h-[82vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-card shadow-2xl"
        onClick={(evento) => evento.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`termos-${nomeCupom}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Termos de uso
            </p>
            <h2
              id={`termos-${nomeCupom}`}
              className="mt-1 font-display text-xl font-bold text-text sm:text-2xl"
            >
              CUPOM {nomeCupom}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setAberto(false)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-xl text-text transition hover:bg-white/15"
            aria-label="Fechar termos de uso"
          >
            ×
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-5 text-sm leading-6 text-text-muted">
            {descricao?.trim() && (
              <section>
                <h3 className="mb-2 font-semibold text-text">Descrição</h3>
                <p className="whitespace-pre-wrap">{descricao}</p>
              </section>
            )}

            {observacoes?.trim() && (
              <section>
                <h3 className="mb-2 font-semibold text-text">
                  Condições e observações
                </h3>
                <p className="whitespace-pre-wrap">{observacoes}</p>
              </section>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-card px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="w-full rounded-xl bg-gold px-4 py-3 text-sm font-bold text-bg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-text transition hover:bg-white/10"
      >
        📋 Termos de uso
      </button>

      {montado && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
