import type { Metadata } from "next";
import Link from "next/link";
import { destaqueImperdivelAtivo, ofertaEstaExpirada } from "@/lib/oferta-status";
import { NOME_MARCA, NOMES_ALTERNATIVOS, SAME_AS, URL_SITE } from "@/lib/seo-brand";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OfertasGrid from "@/components/OfertasGrid";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertasResumo } from "@/lib/offers-repo";
import { listarCuponsParaBuscaPublica } from "@/lib/coupons-repo";
import { cupomCorrespondeBuscaPublica } from "@/lib/busca-cupons";
import CupomCard from "@/components/CupomCard";
import Container from "@/components/Container";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Achado do Alê — Promoções, cupons e achadinhos",
  description:
    "Achado do Alê reúne promoções, cupons e achadinhos de Mercado Livre, Amazon, Magalu, Shopee e outras lojas em um só lugar.",
  alternates: { canonical: "/" },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { busca?: string | string[] };
}) {
  const valorBusca = searchParams?.busca;
  const busca = (Array.isArray(valorBusca) ? valorBusca[0] : valorBusca ?? "").trim().slice(0, 120);
  const supabase = criarClientePublico();
  const ofertas = await listarOfertasResumo(supabase);
  // Não consultar cupons sem uma pesquisa: preserva a velocidade normal da Home.
  const cuponsEncontrados = busca
    ? (await listarCuponsParaBuscaPublica(supabase)).filter((cupom) =>
        cupomCorrespondeBuscaPublica(cupom, busca)
      )
    : [];
  const ofertasAtivas = ofertas.filter(
    (oferta) => oferta.status === "publicada" && !ofertaEstaExpirada(oferta)
  );
  const promocaoImperdivel = ofertasAtivas.find(destaqueImperdivelAtivo);
  const ofertaDestaque = promocaoImperdivel ?? ofertasAtivas[0];

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
      {busca ? (
        <Container className="px-4 pt-5">
          <h1 className="font-display text-xl font-bold text-text">
            Resultados para “{busca}”
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Pesquisa em promoções, lojas e cupons de desconto.
          </p>
          <section aria-labelledby="titulo-cupons-busca" className="mt-6 mb-5">
            <h2 id="titulo-cupons-busca" className="mb-3 font-display text-lg font-bold text-text">
              🎟️ Cupons encontrados ({cuponsEncontrados.length})
            </h2>
            {cuponsEncontrados.length ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cuponsEncontrados.slice(0, 30).map((cupom) => (
                    <CupomCard key={cupom.id} cupom={cupom} />
                  ))}
                </div>
                {cuponsEncontrados.length > 30 && (
                  <Link href={`/cupons?busca=${encodeURIComponent(busca)}`}
                    className="mt-4 inline-flex rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-bg">
                    Ver todos os {cuponsEncontrados.length} cupons encontrados →
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-text-muted">Nenhum cupom encontrado para esta busca.</p>
            )}
          </section>
        </Container>
      ) : (
        <Hero ofertaDestaque={ofertaDestaque} promocaoImperdivel={Boolean(promocaoImperdivel)} />
      )}
      <section id="ofertas" className="scroll-mt-24">
        <OfertasGrid ofertas={ofertasAtivas} />
      </section>
      <Footer destacarInstagramProjeto />
      <BottomNav />
    </main>
  );
}
