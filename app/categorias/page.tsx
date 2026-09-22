import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
import Link from "next/link";
import { CATEGORIAS_ADMIN, CATEGORIA_OUTROS } from "@/lib/mock-data";
import { slugificar } from "@/lib/texto";

export default function CategoriasPage() {
  const categorias = CATEGORIAS_ADMIN.filter((c) => c !== CATEGORIA_OUTROS);
  return <main className="min-h-screen bg-bg pb-bottom-nav"><Header /><Container className="p-4">
    <h1 className="font-display text-2xl font-bold text-text">Categorias</h1>
    <p className="mt-2 text-sm text-text-muted">Explore promoções por assunto.</p>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {categorias.map((c) => <Link key={c} href={`/categoria/${slugificar(c)}`} className="rounded-xl2 bg-card p-4 font-semibold text-text ring-1 ring-white/5 hover:ring-gold/30">{c}</Link>)}
    </div>
  </Container><Footer /><BottomNav /></main>;
}
