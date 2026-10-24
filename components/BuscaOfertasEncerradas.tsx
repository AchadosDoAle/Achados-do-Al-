"use client";

import { useMemo, useState } from "react";
import type { Oferta } from "@/lib/types";
import OfferCard from "@/components/OfferCard";
import { textoCorrespondeBusca } from "@/lib/admin-search";

export default function BuscaOfertasEncerradas({ ofertas }: { ofertas: Oferta[] }) {
  const [pesquisa, setPesquisa] = useState("");
  const filtradas = useMemo(() => ofertas.filter((oferta) =>
    textoCorrespondeBusca(pesquisa, [
      oferta.titulo, oferta.loja, oferta.categoria, oferta.marca, oferta.modelo,
      oferta.cupom, oferta.cor, oferta.tamanho, oferta.capacidade,
    ])
  ), [ofertas, pesquisa]);

  return (
    <>
      <div className="mt-5 rounded-2xl border border-white/10 bg-card/70 p-3 sm:p-4">
        <label htmlFor="busca-encerradas" className="mb-2 block text-sm font-semibold text-text">
          Pesquisar promoções encerradas
        </label>
        <div className="flex gap-2">
          <input
            id="busca-encerradas"
            type="search"
            value={pesquisa}
            onChange={(evento) => setPesquisa(evento.target.value)}
            placeholder="Buscar produto, loja, marca, cupom..."
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-bg px-4 py-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
          {pesquisa && (
            <button type="button" onClick={() => setPesquisa("")}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-text hover:border-gold/40 hover:text-gold">
              Limpar
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-text-muted" aria-live="polite">
          {filtradas.length} {filtradas.length === 1 ? "oferta encerrada encontrada" : "ofertas encerradas encontradas"}
        </p>
      </div>

      {ofertas.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-card/70 p-6 text-center">
          <p className="text-sm text-text-muted">Nenhuma promoção encerrada por enquanto. Melhor ainda: você chegou cedo. 😄</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-card/70 p-6 text-center">
          <p className="text-sm text-text-muted">Nenhuma oferta encerrada corresponde à sua pesquisa.</p>
          <button type="button" onClick={() => setPesquisa("")} className="mt-3 text-sm font-semibold text-gold hover:underline">Limpar pesquisa</button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtradas.map((oferta, indice) => (
            <OfferCard key={oferta.id} oferta={oferta} atraso={indice} />
          ))}
        </div>
      )}
    </>
  );
}
