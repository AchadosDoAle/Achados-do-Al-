import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { CATEGORIAS } from "@/lib/mock-data";

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Todos: "🏠",
  Casa: "🛋️",
  Beleza: "💄",
  Tecnologia: "📱",
  Moda: "👕",
  Ferramentas: "🔧",
  Infantil: "🧸",
};

export default function CategoriasPage() {
  return (
    <main className="pb-bottom-nav">
      <Header />
      <section className="p-4">
        <h1 className="mb-4 font-display text-xl font-bold text-ink">
          Categorias
        </h1>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIAS.filter((c) => c !== "Todos").map((categoria) => (
            <Link
              key={categoria}
              href={`/?categoria=${encodeURIComponent(categoria)}`}
              className="flex flex-col items-center gap-2 rounded-xl2 bg-white p-5 text-center ring-1 ring-ink/10"
            >
              <span className="text-3xl" aria-hidden="true">
                {ICONE_POR_CATEGORIA[categoria] ?? "🏷️"}
              </span>
              <span className="text-sm font-medium text-ink">{categoria}</span>
            </Link>
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
