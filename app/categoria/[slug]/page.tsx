import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
import OfferCard from "@/components/OfferCard";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertasResumo } from "@/lib/offers-repo";
import { CATEGORIAS_ADMIN, CATEGORIA_OUTROS } from "@/lib/mock-data";
import { slugificar } from "@/lib/texto";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

function categoriaPorSlug(slug: string) {
  return CATEGORIAS_ADMIN.filter((c) => c !== CATEGORIA_OUTROS).find((c) => slugificar(c) === slug);
}

export function generateStaticParams() {
  return CATEGORIAS_ADMIN.filter((c) => c !== CATEGORIA_OUTROS).map((categoria) => ({ slug: slugificar(categoria) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const categoria = categoriaPorSlug(params.slug);
  if (!categoria) return {};
  return {
    title: `Promoções de ${categoria} | Achado do Alê`,
    description: `Ofertas, cupons e achadinhos de ${categoria} selecionados pelo Achado do Alê.`,
    alternates: { canonical: `/categoria/${params.slug}` },
  };
}

export default async function CategoriaPage({ params }: { params: { slug: string } }) {
  const categoria = categoriaPorSlug(params.slug);
  if (!categoria) notFound();
  const ofertas = (await listarOfertasResumo(criarClientePublico())).filter(
    (o) => o.categoria === categoria && o.status === "publicada" && !ofertaEstaExpirada(o)
  );
  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gold">Categoria</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-text">Promoções de {categoria}</h1>
        <p className="mt-2 text-sm text-text-muted">Achadinhos e ofertas selecionados nesta categoria.</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {ofertas.map((oferta) => <OfferCard key={oferta.id} oferta={oferta} />)}
        </div>
        {ofertas.length === 0 && <p className="mt-6 text-sm text-text-muted">Nenhuma oferta publicada nesta categoria agora.</p>}
      </Container>
      <Footer /><BottomNav />
    </main>
  );
}
