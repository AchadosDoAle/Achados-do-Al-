import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryChips from "@/components/CategoryChips";
import OfferCard from "@/components/OfferCard";
import BottomNav from "@/components/BottomNav";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertas } from "@/lib/offers-repo";

// Renderiza no servidor a cada acesso, já trazendo as ofertas publicadas
// do banco de dados — bom para SEO, porque o HTML já chega pronto.
export const revalidate = 60;

export default async function HomePage() {
  const supabase = criarClientePublico();
  const ofertas = await listarOfertas(supabase, { apenasPublicadas: true });

  return (
    <main className="pb-bottom-nav">
      <Header />
      <Hero />
      <CategoryChips />

      <section className="px-4">
        <h2 className="mb-3 mt-2 font-display text-lg font-bold text-ink">
          Ofertas mais recentes
        </h2>
        {ofertas.length === 0 ? (
          <p className="text-sm text-ink/60">
            Nenhuma oferta publicada ainda. Volte em breve!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ofertas.map((oferta) => (
              <OfferCard key={oferta.id} oferta={oferta} />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}
