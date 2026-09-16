import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { CATEGORIAS } from "@/lib/mock-data";

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Casa: "🏠",
  Beleza: "💄",
  Tecnologia: "📱",
  Moda: "👕",
  Ferramentas: "🔧",
  Infantil: "🧸",
};

export default function CategoriasPage() {
  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <h1 className="mb-4 font-display text-xl font-bold text-text">
          Categorias
        </h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {CATEGORIAS.filter((c) => c !== "Todos").map((categoria) => (
            <Link
              key={categoria}
              href={`/?categoria=${encodeURIComponent(categoria)}`}
              className="flex flex-col items-center gap-2 rounded-xl2 bg-card p-5 text-center ring-1 ring-white/5 hover:ring-gold/40"
            >
              <span className="text-3xl" aria-hidden="true">
                {ICONE_POR_CATEGORIA[categoria] ?? "🏷️"}
              </span>
              <span className="text-sm font-medium text-text">
                {categoria}
              </span>
            </Link>
          ))}
        </div>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
