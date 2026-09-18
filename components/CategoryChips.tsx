"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Todos: "▦",
  Casa: "🏠",
  Eletrodomésticos: "🔌",
  Cozinha: "🍳",
  Beleza: "💄",
  Perfumaria: "🧴",
  Tecnologia: "📱",
  Informática: "💻",
  Celulares: "📲",
  "TV e Áudio": "📺",
  Games: "🎮",
  Moda: "👕",
  Calçados: "👟",
  Esporte: "🏃",
  Ferramentas: "🔧",
  Automotivo: "🚗",
  Infantil: "🧸",
  Bebês: "🍼",
  Mercado: "🛒",
  Saúde: "🩺",
  Suplementos: "💪",
  Pet: "🐾",
  Móveis: "🛋️",
  Decoração: "🪴",
  Papelaria: "✏️",
  Livros: "📚",
  Utilidades: "✨",
};

export default function CategoryChips({
  categorias,
  selecionada,
  onSelecionar,
  contagens,
}: {
  categorias: string[];
  selecionada: string;
  onSelecionar: (categoria: string) => void;
  contagens?: Record<string, number>;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const opcoes = useMemo(
    () => categorias.filter((categoria) => categoria !== "Todos"),
    [categorias]
  );

  const opcoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return opcoes;
    return opcoes.filter((categoria) =>
      categoria.toLocaleLowerCase("pt-BR").includes(termo)
    );
  }, [busca, opcoes]);

  useEffect(() => {
    function fecharAoClicarFora(evento: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(evento.target as Node)
      ) {
        setAberto(false);
      }
    }

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  function selecionar(categoria: string) {
    onSelecionar(categoria);
    setAberto(false);
    setBusca("");
  }

  return (
    <div className="flex min-w-0 items-center gap-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => selecionar("Todos")}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          selecionada === "Todos"
            ? "bg-gold text-bg"
            : "bg-card text-text-muted ring-1 ring-white/10 hover:text-text"
        }`}
      >
        <span aria-hidden="true">▦</span>
        Todos
      </button>

      <div className="relative min-w-0">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={aberto}
          onClick={() => setAberto((atual) => !atual)}
          className={`flex max-w-[230px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:max-w-none ${
            selecionada !== "Todos"
              ? "bg-gold text-bg"
              : "bg-card text-text-muted ring-1 ring-white/10 hover:text-text"
          }`}
        >
          <span aria-hidden="true">
            {selecionada === "Todos"
              ? "☰"
              : ICONE_POR_CATEGORIA[selecionada] ?? "🏷️"}
          </span>
          <span className="truncate">
            {selecionada === "Todos" ? "Categorias" : selecionada}
          </span>
          <span
            aria-hidden="true"
            className={`ml-0.5 text-[10px] transition-transform ${
              aberto ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {aberto && (
          <div className="absolute left-0 top-[calc(100%+10px)] z-40 w-[min(92vw,680px)] rounded-2xl border border-white/10 bg-bg-secondary p-3 shadow-2xl shadow-black/40">
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-white/10">
              <span aria-hidden="true" className="text-text-muted">
                🔎
              </span>
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar categoria..."
                className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-muted/70"
              />
            </div>

            <div className="max-h-[55vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {opcoesFiltradas.map((categoria) => {
                  const ativa = categoria === selecionada;
                  const quantidade = contagens?.[categoria] ?? 0;
                  return (
                    <button
                      key={categoria}
                      type="button"
                      onClick={() => selecionar(categoria)}
                      className={`flex min-h-14 items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                        ativa
                          ? "bg-gold text-bg"
                          : "bg-card text-text hover:ring-1 hover:ring-gold/40"
                      }`}
                    >
                      <span className="text-lg" aria-hidden="true">
                        {ICONE_POR_CATEGORIA[categoria] ?? "🏷️"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold sm:text-sm">
                          {categoria}
                        </span>
                        <span
                          className={`block text-[10px] ${
                            ativa ? "text-bg/70" : "text-text-muted"
                          }`}
                        >
                          {quantidade === 1
                            ? "1 oferta"
                            : `${quantidade} ofertas`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {opcoesFiltradas.length === 0 && (
                <p className="px-2 py-5 text-center text-sm text-text-muted">
                  Nenhuma categoria encontrada.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
