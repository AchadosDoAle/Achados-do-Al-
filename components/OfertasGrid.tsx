"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Oferta } from "@/lib/types";
import { CATEGORIAS } from "@/lib/mock-data";
import CategoryChips from "./CategoryChips";
import OfferCard from "./OfferCard";

function GradeComFiltro({ ofertas }: { ofertas: Oferta[] }) {
  const params = useSearchParams();
  const categoriaInicial = params.get("categoria") ?? "Todos";
  const [selecionada, setSelecionada] = useState(categoriaInicial);

  const ofertasFiltradas = useMemo(
    () =>
      selecionada === "Todos"
        ? ofertas
        : ofertas.filter((o) => o.categoria === selecionada),
    [ofertas, selecionada]
  );

  return (
    <>
      <CategoryChips
        categorias={CATEGORIAS}
        selecionada={selecionada}
        onSelecionar={setSelecionada}
      />

      <section className="px-4">
        <h2 className="mb-3 mt-2 flex items-center gap-1.5 font-display text-lg font-bold text-ink">
          <span aria-hidden="true">🔥</span> Ofertas fresquinhas
        </h2>
        {ofertasFiltradas.length === 0 ? (
          <p className="text-sm text-ink/60">
            {ofertas.length === 0
              ? "Nenhuma oferta publicada ainda. Volte em breve!"
              : "Nenhuma oferta nessa categoria por enquanto."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ofertasFiltradas.map((oferta) => (
              <OfferCard key={oferta.id} oferta={oferta} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function OfertasGrid({ ofertas }: { ofertas: Oferta[] }) {
  return (
    <Suspense fallback={null}>
      <GradeComFiltro ofertas={ofertas} />
    </Suspense>
  );
}
