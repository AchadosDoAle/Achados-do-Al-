import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
import OfferCard from "@/components/OfferCard";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertasResumo } from "@/lib/offers-repo";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Veja o que já perdeu! | Achado do Alê",
  description:
    "Promoções que já acabaram no Achado do Alê. Fique de olho: algumas ofertas podem voltar.",
  alternates: { canonical: "/perdeu" },
};

export default async function PerdeuPage() {
  const ofertas = await listarOfertasResumo(criarClientePublico());
  const expiradas = ofertas.filter((oferta) => ofertaEstaExpirada(oferta));

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="px-4 py-6">
        <section className="archive-hero overflow-hidden rounded-[28px] border border-gold/15 bg-gradient-to-br from-card via-bg-secondary to-bg p-5 sm:p-7">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">⏳ Arquivo de achadinhos</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Veja o que já perdeu!
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">
              Aqui ficam as promoções que já venceram ou esgotaram. É um ótimo jeito de saber o tipo de oferta que aparece por aqui — e algumas delas podem voltar.
            </p>
            <a
              href="/#ofertas"
              className="btn-modern mt-5 inline-flex items-center rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-bg"
            >
              🔥 Ver ofertas ativas agora
            </a>
          </div>
        </section>

        <div className="mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Histórico</p>
            <h2 className="mt-1 font-display text-xl font-bold text-text">Promoções encerradas</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-text-muted">
            {expiradas.length} {expiradas.length === 1 ? "oferta" : "ofertas"}
          </span>
        </div>

        {expiradas.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-card/70 p-6 text-center">
            <p className="text-sm text-text-muted">Nenhuma promoção encerrada por enquanto. Melhor ainda: você chegou cedo. 😄</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {expiradas.map((oferta, indice) => (
              <OfferCard key={oferta.id} oferta={oferta} atraso={indice} />
            ))}
          </div>
        )}
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
