import Link from "next/link";
import Container from "./Container";
import DestaquesCarousel from "./DestaquesCarousel";
import type { Oferta } from "@/lib/types";

export default function Hero({ destaques, recentes }: { destaques: Oferta[]; recentes: Oferta[] }) {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-bg-secondary">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-trust/10 blur-3xl" />
      <Container className="relative grid gap-8 px-4 py-9 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-8 lg:py-14 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-light">
            <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_14px_rgba(245,185,66,.8)]" />
            ACHADOS SELECIONADOS EM UM SÓ LUGAR
          </div>

          <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-text sm:text-5xl md:text-[3.65rem]">
            O melhor dos achadinhos,
            <span className="block text-gold">sem você precisar garimpar.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted md:text-lg">
            Ofertas e cupons organizados para você bater o olho, comparar e
            aproveitar o que realmente vale a pena.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#ofertas"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-bg shadow-[0_12px_30px_rgba(245,185,66,.18)] transition hover:-translate-y-0.5 hover:bg-gold-light"
            >
              Ver ofertas agora
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              href="/cupons"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-text transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <span aria-hidden="true">🏷️</span>
              Explorar cupons
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-text-muted sm:text-sm">
            <span className="flex items-center gap-2">
              <span className="text-trust">✓</span> Ofertas selecionadas
            </span>
            <span className="flex items-center gap-2">
              <span className="text-trust">✓</span> Cupons reunidos
            </span>
            <span className="flex items-center gap-2">
              <span className="text-trust">✓</span> Tudo direto ao ponto
            </span>
          </div>
        </div>

        <DestaquesCarousel destaques={destaques} recentes={recentes} />
      </Container>
    </section>
  );
}
