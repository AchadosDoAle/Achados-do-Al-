import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
import Link from "next/link";
import { CATEGORIAS_ADMIN, CATEGORIA_OUTROS } from "@/lib/mock-data";
import { slugificar } from "@/lib/texto";

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Acessórios: "👜",
  Automotivo: "🚗",
  Bebês: "🍼",
  Bebidas: "🥤",
  Beleza: "💄",
  Brinquedos: "🧸",
  Calçados: "👟",
  Casa: "🏠",
  Celulares: "📱",
  Cozinha: "🍳",
  "Cuidados Pessoais": "🧼",
  Decoração: "🪴",
  Eletrodomésticos: "🔌",
  Eletrônicos: "🔋",
  Eletroportáteis: "☕",
  Esporte: "🏃",
  Ferramentas: "🔧",
  Games: "🎮",
  Infantil: "🧒",
  Informática: "💻",
  Jardim: "🌿",
  Livros: "📚",
  Mercado: "🛒",
  Moda: "👕",
  Móveis: "🛋️",
  Papelaria: "✏️",
  Perfumaria: "🧴",
  Pet: "🐾",
  Relógios: "⌚",
  Saúde: "🩺",
  Suplementos: "💪",
  Tecnologia: "🖥️",
  "TV e Áudio": "📺",
  Utilidades: "✨",
  Viagem: "🧳",
};

export default function CategoriasPage() {
  const categorias = CATEGORIAS_ADMIN.filter((c) => c !== CATEGORIA_OUTROS);

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <h1 className="font-display text-2xl font-bold text-text">Categorias</h1>
        <p className="mt-2 text-sm text-text-muted">Explore promoções por assunto.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categorias.map((categoria, index) => (
            <Link
              key={categoria}
              href={`/categoria/${slugificar(categoria)}`}
              className="category-page-card group flex min-h-[52px] items-center gap-2.5 rounded-xl2 bg-card p-4 font-semibold text-text ring-1 ring-white/5"
              style={{ animationDelay: `${Math.min(index * 24, 480)}ms` }}
            >
              <span
                aria-hidden="true"
                className="category-page-card-emoji shrink-0 text-xl leading-none"
              >
                {ICONE_POR_CATEGORIA[categoria] ?? "🏷️"}
              </span>
              <span className="min-w-0 leading-tight">{categoria}</span>
            </Link>
          ))}
        </div>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
