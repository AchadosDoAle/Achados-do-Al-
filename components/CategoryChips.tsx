"use client";

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Todos: "▦",
  Casa: "🏠",
  Beleza: "💄",
  Tecnologia: "📱",
  Moda: "👕",
  Ferramentas: "🔧",
  Infantil: "🧸",
};

export default function CategoryChips({
  categorias,
  selecionada,
  onSelecionar,
}: {
  categorias: string[];
  selecionada: string;
  onSelecionar: (categoria: string) => void;
}) {
  return (
    <nav
      aria-label="Categorias"
      className="flex gap-2 overflow-x-auto px-4 py-3 md:flex-wrap md:overflow-visible"
    >
      {categorias.map((categoria) => {
        const ativa = categoria === selecionada;
        return (
          <button
            key={categoria}
            onClick={() => onSelecionar(categoria)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              ativa
                ? "bg-gold text-bg"
                : "bg-card text-text-muted ring-1 ring-white/5 hover:text-text"
            }`}
          >
            <span aria-hidden="true">
              {ICONE_POR_CATEGORIA[categoria] ?? "🏷️"}
            </span>
            {categoria}
          </button>
        );
      })}
    </nav>
  );
}
