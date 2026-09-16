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
    <div className="flex flex-col overflow-hidden rounded-xl2 bg-white ring-1 ring-ink/10">
      <Link href={`/oferta/${oferta.slug}`} className="block">
        <div className="relative aspect-square bg-ink/5">
          {oferta.imagemPrincipal && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={oferta.imagemPrincipal}
              alt={oferta.titulo}
              className="h-full w-full object-cover"
            />
          )}
          {desconto && (
            <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-discount px-2 py-1 text-xs font-semibold text-[#5B4300]">
              ↓ {desconto}%
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 p-3 pb-1">
          <span className="flex items-center gap-1 text-xs font-medium text-ink/50">
            🏪 {oferta.loja}
          </span>
          <span className="line-clamp-2 text-sm font-medium text-ink">
            {oferta.titulo}
          </span>

          <div className="mt-1">
            {oferta.precoAntigo && (
              <span className="block text-xs text-ink/40 line-through">
                {formatarPreco(oferta.precoAntigo)}
              </span>
            )}
            <span className="text-lg font-bold text-brand">
              {formatarPreco(oferta.precoAtual)}
            </span>
            {oferta.precoPix && (
              <span className="block text-xs text-trust">
                {formatarPreco(oferta.precoPix)} à vista no Pix
              </span>
            )}
            {oferta.parcelas && oferta.valorParcela && (
              <span className="block text-xs text-ink/50">
                ou {oferta.parcelas}x de {formatarPreco(oferta.valorParcela)}
              </span>
            )}
            {oferta.cupom && (
              <span className="mt-1 inline-block rounded-md bg-trust/10 px-2 py-0.5 text-xs font-semibold text-trust">
                Cupom {oferta.cupom}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2 p-3 pt-2">
        <Link
          href={`/oferta/${oferta.slug}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-xs font-semibold text-white"
        >
          🛒 Ver oferta
        </Link>
        <button
          aria-label="Favoritar oferta"
          onClick={() => setFavorito(alternarFavorito(oferta.id).includes(oferta.id))}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-ink/10 ${
            favorito ? "bg-accent/10 text-accent" : "bg-cream text-ink/40"
          }`}
        >
          {favorito ? "♥" : "♡"}
        </button>
      </div>
    </div>
  );
}
