import { CATEGORIAS } from "@/lib/mock-data";

export default function CategoryChips() {
  return (
    <nav
      aria-label="Categorias"
      className="flex gap-2 overflow-x-auto px-4 py-3"
    >
      {CATEGORIAS.map((categoria, index) => (
        <button
          key={categoria}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
            index === 0
              ? "bg-accent text-white"
              : "bg-white text-ink/70 ring-1 ring-ink/10"
          }`}
        >
          {categoria}
        </button>
      ))}
    </nav>
  );
}
