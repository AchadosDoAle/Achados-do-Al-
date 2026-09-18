"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Oferta } from "@/lib/types";
import {
  CATEGORIAS_ADMIN,
  CATEGORIA_OUTROS,
  LOJAS_AFILIADAS,
  normalizarNomeLoja,
} from "@/lib/mock-data";
import CategoryChips from "./CategoryChips";
import OfferCard from "./OfferCard";
import Container from "./Container";

const ITENS_POR_PAGINA = 25; // 5 colunas x 5 linhas no desktop

function GradeComFiltro({ ofertas }: { ofertas: Oferta[] }) {
  const params = useSearchParams();
  const categoriaInicial = params.get("categoria") ?? "Todos";
  const [selecionada, setSelecionada] = useState(categoriaInicial);
  const [lojaSelecionada, setLojaSelecionada] = useState("Todas");
  const [pagina, setPagina] = useState(1);
  const topoRef = useRef<HTMLDivElement>(null);
  // A busca é lida direto da URL a cada renderização, para reagir
  // imediatamente quando alguém pesquisa pelo campo do cabeçalho.
  const busca = (params.get("busca") ?? "").trim().toLowerCase();

  const lojasComOfertas = useMemo(() => {
    const lojasPersonalizadas = Array.from(
      new Set(
        ofertas
          .map((oferta) => normalizarNomeLoja(oferta.loja))
          .filter((loja) => !LOJAS_AFILIADAS.includes(loja))
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    return ["Todas", ...LOJAS_AFILIADAS, ...lojasPersonalizadas];
  }, [ofertas]);

  const categoriasFiltro = useMemo(() => {
    const categoriasPadrao = CATEGORIAS_ADMIN.filter(
      (categoria) => categoria !== CATEGORIA_OUTROS
    );
    const categoriasPersonalizadas = Array.from(
      new Set(
        ofertas
          .map((oferta) => oferta.categoria?.trim())
          .filter(
            (categoria): categoria is string =>
              typeof categoria === "string" &&
              categoria.length > 0 &&
              !categoriasPadrao.includes(categoria) &&
              categoria !== CATEGORIA_OUTROS
          )
      )
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    return ["Todos", ...categoriasPadrao, ...categoriasPersonalizadas];
  }, [ofertas]);

  const contagensCategorias = useMemo(() => {
    return ofertas.reduce<Record<string, number>>((acc, oferta) => {
      const categoria = oferta.categoria?.trim();
      if (categoria) acc[categoria] = (acc[categoria] ?? 0) + 1;
      return acc;
    }, {});
  }, [ofertas]);

  const ofertasFiltradas = useMemo(() => {
    let resultado = ofertas;

    if (selecionada !== "Todos") {
      resultado = resultado.filter((o) => o.categoria === selecionada);
    }

    if (lojaSelecionada !== "Todas") {
      resultado = resultado.filter(
        (o) => normalizarNomeLoja(o.loja) === lojaSelecionada
      );
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
  }, [ofertas, selecionada, lojaSelecionada, busca]);

  // Sempre que o filtro muda, volta pra primeira página.
  useEffect(() => {
    setPagina(1);
  }, [selecionada, lojaSelecionada, busca]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(ofertasFiltradas.length / ITENS_POR_PAGINA)
  );
  const paginaSegura = Math.min(pagina, totalPaginas);
  const ofertasDaPagina = ofertasFiltradas.slice(
    (paginaSegura - 1) * ITENS_POR_PAGINA,
    paginaSegura * ITENS_POR_PAGINA
  );

  function irParaPagina(novaPagina: number) {
    setPagina(novaPagina);
    topoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Container className="px-4 py-3">
        <div className="flex flex-col gap-3 rounded-2xl bg-bg-secondary/70 p-3 ring-1 ring-white/5 md:flex-row md:items-center md:justify-between">
          <CategoryChips
            categorias={categoriasFiltro}
            selecionada={selecionada}
            onSelecionar={setSelecionada}
            contagens={contagensCategorias}
          />

          <div className="flex min-w-0 items-center gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-text-muted md:flex-none">
              <span className="shrink-0" aria-hidden="true">🏪</span>
              <span className="sr-only">Loja</span>
              <select
                value={lojaSelecionada}
                onChange={(e) => setLojaSelecionada(e.target.value)}
                className="min-w-0 flex-1 rounded-full bg-card px-3 py-2 text-sm text-text outline-none ring-1 ring-white/10 md:max-w-56"
              >
                {lojasComOfertas.map((loja) => (
                  <option key={loja} value={loja}>
                    {loja === "Todas" ? "Todas as lojas" : loja}
                  </option>
                ))}
              </select>
            </label>

            {(selecionada !== "Todos" || lojaSelecionada !== "Todas") && (
              <button
                type="button"
                onClick={() => {
                  setSelecionada("Todos");
                  setLojaSelecionada("Todas");
                }}
                className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-text-muted ring-1 ring-white/10 transition hover:text-text"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </Container>

      <Container className="px-4">
        <div ref={topoRef} className="scroll-mt-24" />
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
              : "Nenhuma oferta com esse filtro por enquanto."}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ofertasDaPagina.map((oferta, indice) => (
                <OfferCard key={oferta.id} oferta={oferta} atraso={indice} />
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => irParaPagina(paginaSegura - 1)}
                  disabled={paginaSegura === 1}
                  className="rounded-lg bg-card px-3 py-2 text-sm font-medium text-text ring-1 ring-white/10 disabled:opacity-30"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-text-muted">
                  Página {paginaSegura} de {totalPaginas}
                </span>
                <button
                  onClick={() => irParaPagina(paginaSegura + 1)}
                  disabled={paginaSegura === totalPaginas}
                  className="rounded-lg bg-card px-3 py-2 text-sm font-medium text-text ring-1 ring-white/10 disabled:opacity-30"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
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
