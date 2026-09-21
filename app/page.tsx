import type { Metadata } from "next";
import { ofertaEstaExpirada } from "@/lib/oferta-status";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OfertasGrid from "@/components/OfertasGrid";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertas } from "@/lib/offers-repo";

export const revalidate = 0;
const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://achadosdoale.com";

export const metadata: Metadata = {
  title: "Ofertas, cupons e achadinhos",
  description:
    "Encontre ofertas, cupons e achadinhos selecionados de grandes lojas em um só lugar.",
  alternates: { canonical: "/" },
};


export default async function HomePage() {
  const supabase = criarClientePublico();
  const ofertas = await listarOfertas(supabase, { apenasPublicadas: true });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Achado do Alê",
    url: URL_SITE,
    description: "Ofertas, cupons e achadinhos selecionados.",
  };

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Header />
      <Hero ofertaDestaque={ofertas.find((oferta) => oferta.status === "publicada" && !ofertaEstaExpirada(oferta))} />
      <section id="ofertas" className="scroll-mt-24">
        <OfertasGrid ofertas={ofertas} />
      </section>
      <Footer />
      <BottomNav />
    </main>
  );
}
