import type { Metadata } from "next";
import { ofertaEstaExpirada } from "@/lib/oferta-status";
import { NOME_MARCA, NOMES_ALTERNATIVOS, SAME_AS, URL_SITE } from "@/lib/seo-brand";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OfertasGrid from "@/components/OfertasGrid";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertasResumo } from "@/lib/offers-repo";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Achado do Alê — Promoções, cupons e achadinhos",
  description:
    "Achado do Alê reúne promoções, cupons e achadinhos de Mercado Livre, Amazon, Magalu, Shopee e outras lojas em um só lugar.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const supabase = criarClientePublico();
  const ofertas = await listarOfertasResumo(supabase);
  const ofertasAtivas = ofertas.filter(
    (oferta) => oferta.status === "publicada" && !ofertaEstaExpirada(oferta)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${URL_SITE}/#organization`,
        name: NOME_MARCA,
        alternateName: NOMES_ALTERNATIVOS,
        url: `${URL_SITE}/`,
        logo: {
          "@type": "ImageObject",
          "@id": `${URL_SITE}/#logo`,
          url: `${URL_SITE}/icon.png`,
          contentUrl: `${URL_SITE}/icon.png`,
          caption: NOME_MARCA,
        },
        image: { "@id": `${URL_SITE}/#logo` },
        sameAs: SAME_AS,
      },
      {
        "@type": "WebSite",
        "@id": `${URL_SITE}/#website`,
        url: `${URL_SITE}/`,
        name: NOME_MARCA,
        alternateName: NOMES_ALTERNATIVOS,
        description:
          "Promoções, cupons e achadinhos selecionados para ajudar você a economizar.",
        publisher: { "@id": `${URL_SITE}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${URL_SITE}/?busca={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
        }}
      />
      <Header />
      <Hero
        ofertaDestaque={ofertasAtivas[0]}
      />
      <section id="ofertas" className="scroll-mt-24">
        <OfertasGrid ofertas={ofertasAtivas} />
      </section>
      <Footer destacarInstagramProjeto />
      <BottomNav />
    </main>
  );
}
