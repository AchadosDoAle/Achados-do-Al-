"use client";

import { useMemo, useState } from "react";
import { Oferta } from "@/lib/types";
import { CATEGORIAS } from "@/lib/mock-data";
import CategoryChips from "./CategoryChips";
import OfferCard from "./OfferCard";

type Props = { ofertas: Oferta[] };

export default function OfertasGrid({ ofertas }: Props) {
  const [selecionada, setSelecionada] = useState("Todos");

  const ofertasFiltradas = useMemo(() => {
    if (selecionada === "Todos") return ofertas;
    return ofertas.filter((oferta) => oferta.categoria === selecionada);
  }, [ofertas, selecionada]);

  return (
    <section id="ofertas" className="site-shell pb-bottom-nav pb-24">
      <div className="mb-5">
        <p className="mb-1 text-sm font-bold uppercase tracking-[.2em] text-[#f5b942]">Ofertas selecionadas</p>
        <h2 className="text-3xl font-black text-white md:text-4xl">Ofertas mais recentes</h2>
      </div>

      <div className="mb-6">
        <CategoryChips categorias={CATEGORIAS} selecionada={selecionada} onSelecionar={setSelecionada} />
      </div>

      {ofertasFiltradas.length === 0 ? (
        <div className="rounded-2xl border border-[#f5b942]/25 bg-[#10243a] p-10 text-center text-slate-200">
          {ofertas.length === 0 ? "Nenhuma oferta publicada ainda. Volte em breve!" : "Nenhuma oferta nessa categoria por enquanto."}
        </div>
      ) : (
        <div className="offer-grid">
          {ofertasFiltradas.map((oferta) => <OfferCard key={oferta.id} oferta={oferta} />)}
        </div>
      )}
    </section>
  );
}
