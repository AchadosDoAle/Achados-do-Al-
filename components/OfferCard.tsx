"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import { ehFavorito, alternarFavorito } from "@/lib/favoritos";

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function OfferCard({
  oferta,
  atraso = 0,
}: {
  oferta: Oferta;
  atraso?: number;
}) {
  const [favorito, setFavorito] = useState(false);
  const expirada = oferta.status === "expirada";

  useEffect(() => {
    setFavorito(ehFavorito(oferta.id));
  }, [oferta.id]);

  // O selo usa o melhor preço disponível: Pix quando houver;
  // caso contrário, usa o preço atual normal.
  const precoParaDesconto = oferta.precoPix ?? oferta.precoAtual;
  const desconto =
    oferta.precoAntigo && oferta.precoAntigo > precoParaDesconto
      ? Math.round(
          ((oferta.precoAntigo - precoParaDesconto) / oferta.precoAntigo) * 100
        )
      : null;

  return (
    <div
      className={`relative mx-auto w-full max-w-[220px] animar-entrada overflow-hidden rounded-xl2 bg-card ring-1 ring-white/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/10 hover:ring-gold/30 ${expirada ? "grayscale opacity-70" : ""}`}
      style={{ animationDelay: `${Math.min(atraso, 8) * 0.05}s` }}
    >
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

      <Link href={`/oferta/${oferta.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={oferta.imagemPrincipal || "/icon.png"}
            alt={oferta.titulo}
            className={`h-full w-full transition-transform duration-300 group-hover:scale-110 ${
              oferta.imagemPrincipal ? "object-cover" : "object-contain p-8 opacity-70"
            }`}
          />
          {expirada ? (
            <span className="absolute right-2 top-2 rounded-full bg-danger px-2 py-1 text-[10px] font-bold text-white">
              PROMOÇÃO VENCIDA
            </span>
          ) : desconto ? (
            <span className="absolute right-2 top-2 rounded-full bg-gold px-2 py-1 text-xs font-bold text-bg">
              -{desconto}%
            </span>
          ) : null}
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
            {oferta.precoPix && (
              <span className="mt-1 block text-sm font-bold text-trust">
                {formatarPreco(oferta.precoPix)} no Pix
              </span>
            )}
          </div>

          {oferta.cupom && (
            <span className="inline-block w-fit rounded-md bg-trust/15 px-2 py-0.5 text-xs font-semibold text-trust">
              Cupom {oferta.cupom}
            </span>
          )}

          <span className="text-xs text-text-muted">🏪 {oferta.loja}</span>

          <span className={`mt-2 block rounded-lg py-2 text-center text-xs font-semibold ${expirada ? "bg-white/10 text-text-muted" : "bg-gold text-bg"}`}>
            {expirada ? "Ver promoção vencida" : "Acessar promoção"}
          </span>
        </div>
      </Link>
    </div>
  );
}
