"use client";

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Todos: "🏠",
  Casa: "🛋️",
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
      className="flex gap-2 overflow-x-auto px-4 py-3"
    >
      {categorias.map((categoria) => {
        const ativa = categoria === selecionada;
        return (
          <button
            key={categoria}
            onClick={() => onSelecionar(categoria)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              ativa
                ? "bg-brand text-white"
                : "bg-white text-ink/70 ring-1 ring-ink/10"
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
