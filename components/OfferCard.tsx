"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import { ehFavorito, alternarFavorito } from "@/lib/favoritos";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function OfferCard({ oferta, atraso = 0 }: { oferta: Oferta; atraso?: number }) {
  const [favorito, setFavorito] = useState(false);
  const expirada = ofertaEstaExpirada(oferta);

  useEffect(() => {
    setFavorito(ehFavorito(oferta.id));
  }, [oferta.id]);

  const precoPrincipal = oferta.precoPix ?? oferta.precoAtual;
  const desconto =
    !expirada &&
    precoPrincipal != null &&
    oferta.precoAntigo &&
    oferta.precoAntigo > precoPrincipal
      ? Math.round(((oferta.precoAntigo - precoPrincipal) / oferta.precoAntigo) * 100)
      : null;

  return (
    <div
      className="relative mx-auto w-full max-w-[220px] animar-entrada overflow-hidden rounded-xl2 bg-card ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/10 hover:ring-gold/30"
      style={{ animationDelay: `${Math.min(atraso, 8) * 0.05}s` }}
    >
      <button
        aria-label="Favoritar oferta"
        onClick={(e) => {
          e.preventDefault();
          setFavorito(alternarFavorito(oferta.id).includes(oferta.id));
        }}
        className={`absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm backdrop-blur ${favorito ? "bg-gold text-bg" : "bg-bg/60 text-text"}`}
      >
        {favorito ? "♥" : "♡"}
      </button>

      <Link href={`/oferta/${oferta.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bg-secondary">
          <img
            loading="lazy"
            decoding="async"
            src={oferta.imagemPrincipal || "/icon.png"}
            alt={oferta.titulo}
            className={`h-full w-full transition-transform duration-300 group-hover:scale-110 ${
              oferta.imagemPrincipal ? "object-cover" : "object-contain p-8 opacity-70"
            } ${expirada ? "grayscale opacity-60" : ""}`}
          />
          {desconto ? (
            <span className="absolute right-2 top-2 rounded-full bg-gold px-2 py-1 text-xs font-bold text-bg">-{desconto}%</span>
          ) : null}
        </div>

        <div className="flex flex-col gap-1 p-3">
          <span className="line-clamp-2 text-sm font-medium text-text">{oferta.titulo}</span>

          <div>
            {oferta.precoAntigo && (
              <span className={`block text-xs line-through ${expirada ? "text-text-muted/45" : "text-text-muted"}`}>
                {formatarPreco(oferta.precoAntigo)}
              </span>
            )}

            {oferta.precoPix != null ? (
              <>
                <span className={`block text-lg font-bold ${expirada ? "text-text-muted" : "text-trust"}`}>
                  {expirada ? "ESGOTADO · " : ""}{formatarPreco(oferta.precoPix)}
                </span>
                <span className={`block text-[11px] font-semibold ${expirada ? "text-text-muted/50" : "text-trust/80"}`}>
                  no Pix
                </span>
                {oferta.precoAtual != null && (
                  <span className="mt-1 block text-xs text-text-muted">
                    {formatarPreco(oferta.precoAtual)}{oferta.ofereceParcelamento ? " parcelado" : " preço atual"}
                  </span>
                )}
              </>
            ) : oferta.precoAtual != null ? (
              <span className={`text-lg font-bold ${expirada ? "text-text-muted" : "text-gold"}`}>
                {expirada ? "ESGOTADO · " : ""}{formatarPreco(oferta.precoAtual)}
              </span>
            ) : (
              <span className="text-sm font-semibold text-text-muted">Consulte o preço no site</span>
            )}
          </div>

          {oferta.cupom && (
            <span className={`inline-block w-fit rounded-md px-2 py-0.5 text-xs font-semibold ${expirada ? "bg-white/5 text-text-muted/60" : "bg-trust/15 text-trust"}`}>
              Cupom {oferta.cupom}
            </span>
          )}

          <span className="text-xs text-text-muted">🏪 {oferta.loja}</span>
          <span className={`mt-2 block rounded-lg py-2 text-center text-xs font-semibold ${expirada ? "bg-white/10 text-text-muted" : "bg-gold text-bg"}`}>
            {expirada ? "Ver oferta esgotada" : "Acessar promoção"}
          </span>
        </div>
      </Link>
    </div>
  );
}
