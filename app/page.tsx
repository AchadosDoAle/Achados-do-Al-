import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OfertasGrid from "@/components/OfertasGrid";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertas } from "@/lib/offers-repo";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = criarClientePublico();
  const ofertas = await listarOfertas(supabase, { apenasPublicadas: true });

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Hero ofertaDestaque={ofertas[0]} />
      <section id="ofertas" className="scroll-mt-24">
        <OfertasGrid ofertas={ofertas} />
      </section>
      <Footer />
      <BottomNav />
    </main>
  );
}
