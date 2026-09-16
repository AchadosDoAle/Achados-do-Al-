"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Oferta } from "@/lib/types";
import { CATEGORIAS } from "@/lib/mock-data";
import CategoryChips from "./CategoryChips";
import OfferCard from "./OfferCard";
import Container from "./Container";

function GradeComFiltro({ ofertas }: { ofertas: Oferta[] }) {
  const params = useSearchParams();
  const categoriaInicial = params.get("categoria") ?? "Todos";
  const [selecionada, setSelecionada] = useState(categoriaInicial);
  // A busca é lida direto da URL a cada renderização, para reagir
  // imediatamente quando alguém pesquisa pelo campo do cabeçalho.
  const busca = (params.get("busca") ?? "").trim().toLowerCase();

  const ofertasFiltradas = useMemo(() => {
    let resultado = ofertas;

    if (selecionada !== "Todos") {
      resultado = resultado.filter((o) => o.categoria === selecionada);
    }

    if (busca) {
      resultado = resultado.filter((o) =>
        [o.titulo, o.loja, o.cupom ?? "", o.categoria]
          .join(" ")
          .toLowerCase()
          .includes(busca)
      );
    }

    return resultado;
  }, [ofertas, selecionada, busca]);

  return (
    <>
      <Container>
        <CategoryChips
          categorias={CATEGORIAS}
          selecionada={selecionada}
          onSelecionar={setSelecionada}
        />
      </Container>

      <Container className="px-4">
        <h2 className="mb-3 mt-2 flex items-center gap-1.5 font-display text-lg font-bold text-text">
          <span aria-hidden="true">🔥</span>{" "}
          {busca ? `Resultados para "${params.get("busca")}"` : "Ofertas fresquinhas"}
        </h2>
        {ofertasFiltradas.length === 0 ? (
          <p className="text-sm text-text-muted">
            {ofertas.length === 0
              ? "Nenhuma oferta publicada ainda. Volte em breve!"
              : busca
              ? "Nenhuma oferta encontrada para essa busca."
              : "Nenhuma oferta nessa categoria por enquanto."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {ofertasFiltradas.map((oferta) => (
              <OfferCard key={oferta.id} oferta={oferta} />
            ))}
          </div>
        )}
      </Container>
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
