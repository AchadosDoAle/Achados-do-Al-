import Link from "next/link";
import Container from "./Container";
import { Oferta } from "@/lib/types";

function formatarPreco(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function calcularDesconto(oferta?: Oferta) {
  if (!oferta?.precoAntigo) return null;
  const precoPrincipal = oferta.precoPix ?? oferta.precoAtual;
  if (precoPrincipal == null || oferta.precoAntigo <= precoPrincipal) return null;
  return Math.round((1 - precoPrincipal / oferta.precoAntigo) * 100);
}

export default function Hero({ ofertaDestaque }: { ofertaDestaque?: Oferta }) {
  const desconto = calcularDesconto(ofertaDestaque);

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-bg-secondary">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-trust/10 blur-3xl"
      />

      <Container className="relative grid gap-8 px-4 py-9 md:grid-cols-[1.05fr_.95fr] md:items-center md:gap-12 md:py-14">
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

        <div className="relative mx-auto w-full max-w-lg md:mx-0 md:justify-self-end">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold/15 via-transparent to-trust/10 blur-2xl" />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0A1727] p-4 shadow-2xl shadow-black/30 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                  Achado em destaque
                </p>
                <p className="mt-1 text-sm font-semibold text-text">
                  Uma amostra do que já está no site
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-lg font-black text-bg shadow-lg shadow-gold/10">
                %
              </div>
            </div>

            {ofertaDestaque ? (
              <Link
                href={`/oferta/${ofertaDestaque.slug}`}
                className="group block rounded-2xl border border-white/10 bg-card/80 p-3 transition hover:border-gold/30 hover:bg-card"
              >
                <div className="grid grid-cols-[92px_1fr] gap-3 sm:grid-cols-[118px_1fr] sm:gap-4">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-white">
                    {ofertaDestaque.imagemPrincipal ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ofertaDestaque.imagemPrincipal}
                        alt={ofertaDestaque.titulo}
                        className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-4xl">🛍️</span>
                    )}
                    {desconto ? (
                      <span className="absolute left-2 top-2 rounded-md bg-gold px-1.5 py-1 text-[10px] font-black text-bg">
                        -{desconto}%
                      </span>
                    ) : null}
                  </div>

                  <div className="min-w-0 py-0.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gold-light">
                      {ofertaDestaque.loja}
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-text sm:text-base">
                      {ofertaDestaque.titulo}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
                      {ofertaDestaque.precoPix != null ? (
                        <span className="font-display text-2xl font-bold leading-none text-trust">
                          {formatarPreco(ofertaDestaque.precoPix)} <span className="text-xs font-semibold">no Pix</span>
                        </span>
                      ) : ofertaDestaque.precoAtual != null ? (
                        <span className="font-display text-2xl font-bold leading-none text-text">
                          {formatarPreco(ofertaDestaque.precoAtual)}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-text-muted">Consulte o preço</span>
                      )}
                      {ofertaDestaque.precoAntigo ? (
                        <span className="text-xs text-text-muted line-through">
                          {formatarPreco(ofertaDestaque.precoAntigo)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {ofertaDestaque.cupom ? (
                        <span className="rounded-lg border border-dashed border-gold/40 bg-gold/10 px-2 py-1 text-[11px] font-bold text-gold-light">
                          CUPOM: {ofertaDestaque.cupom}
                        </span>
                      ) : null}
                      {ofertaDestaque.freteGratis ? (
                        <span className="rounded-lg bg-trust/10 px-2 py-1 text-[11px] font-semibold text-trust">
                          Frete grátis
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-card/80 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-4xl">
                    ✨
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      Os próximos achados aparecem aqui
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-text-muted">
                      Publique uma oferta no painel e a Home ganha um destaque automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/[0.04] p-3 text-center ring-1 ring-white/[0.06]">
                <div className="text-lg">🔥</div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Ofertas
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3 text-center ring-1 ring-white/[0.06]">
                <div className="text-lg">🏷️</div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Cupons
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-3 text-center ring-1 ring-white/[0.06]">
                <div className="text-lg">💛</div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  Favoritos
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-3 hidden rotate-[-4deg] rounded-xl border border-gold/20 bg-[#13263C] px-3 py-2 shadow-xl sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
              Achado do Alê
            </p>
            <p className="text-xs font-semibold text-text">economia sem enrolação ✦</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
