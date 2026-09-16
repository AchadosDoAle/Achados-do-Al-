import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryChips from "@/components/CategoryChips";
import OfferCard from "@/components/OfferCard";
import BottomNav from "@/components/BottomNav";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertas } from "@/lib/offers-repo";
import { CATEGORIAS } from "@/lib/mock-data";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = criarClientePublico();
  const ofertas = await listarOfertas(supabase, { apenasPublicadas: true });
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <Header />
      <Hero />
      <main id="ofertas" className="site-shell pb-bottom-nav pb-24">
        <section className="mb-8">
          <p className="mb-1 text-sm font-bold uppercase tracking-[.2em] text-[#f5b942]">Ofertas selecionadas</p>
          <h2 className="text-3xl font-black text-white md:text-4xl">Ofertas mais recentes</h2>
          <div className="mt-5"><CategoryChips categorias={CATEGORIAS} selecionada="Todos" onSelecionar={() => {}} /></div>
        </section>
        {ofertas.length === 0 ? <div className="rounded-2xl border border-[#f5b942]/25 bg-[#10243a] p-10 text-center text-slate-200">Nenhuma oferta publicada ainda. Volte em breve!</div> : <div className="offer-grid">{ofertas.map((oferta) => <OfferCard key={oferta.id} oferta={oferta} />)}</div>}
      </main>
      <BottomNav />
    </div>
  );
}
