"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import { ehFavorito, alternarFavorito } from "@/lib/favoritos";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function OfferCard({ oferta }: { oferta: Oferta }) {
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    setFavorito(ehFavorito(oferta.id));
  }, [oferta.id]);

  const desconto =
    oferta.precoAntigo && oferta.precoAntigo > oferta.precoAtual
      ? Math.round(
          ((oferta.precoAntigo - oferta.precoAtual) / oferta.precoAntigo) * 100
        )
      : null;

  return (
    <div className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-xl2 bg-card ring-1 ring-white/5">
      <button
        aria-label="Favoritar oferta"
        onClick={(e) => {
          e.preventDefault();
          setFavorito(alternarFavorito(oferta.id).includes(oferta.id));
        }}
        className={`absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm backdrop-blur ${
          favorito ? "bg-gold text-bg" : "bg-bg/60 text-text"
        }`}
      >
        {favorito ? "♥" : "♡"}
      </button>

      <Link href={`/oferta/${oferta.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-bg-secondary">
          {oferta.imagemPrincipal && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={oferta.imagemPrincipal}
              alt={oferta.titulo}
              className="h-full w-full object-cover"
            />
          )}
          {desconto && (
            <span className="absolute right-2 top-2 rounded-full bg-gold px-2 py-1 text-xs font-bold text-bg">
              -{desconto}%
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 p-3">
          <span className="line-clamp-2 text-sm font-medium text-text">
            {oferta.titulo}
          </span>

          <div>
            {oferta.precoAntigo && (
              <span className="block text-xs text-text-muted line-through">
                {formatarPreco(oferta.precoAntigo)}
              </span>
            )}
            <span className="text-lg font-bold text-gold">
              {formatarPreco(oferta.precoAtual)}
            </span>
          </div>

          {oferta.cupom && (
            <span className="inline-block w-fit rounded-md bg-trust/15 px-2 py-0.5 text-xs font-semibold text-trust">
              Cupom {oferta.cupom}
            </span>
          )}

          <span className="text-xs text-text-muted">🏪 {oferta.loja}</span>

          <span className="mt-2 block rounded-lg bg-gold py-2 text-center text-xs font-semibold text-bg">
            Acessar promoção
          </span>
        </div>
      </Link>
    </div>
  );
}
