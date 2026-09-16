"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import { ehFavorito, alternarFavorito } from "@/lib/favoritos";

function formatarPreco(valor: number) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function OfferCard({ oferta }: { oferta: Oferta }) {
  const [favorito, setFavorito] = useState(false);
  useEffect(() => { setFavorito(ehFavorito(oferta.id)); }, [oferta.id]);
  const desconto = oferta.precoAntigo && oferta.precoAntigo > oferta.precoAtual ? Math.round(((oferta.precoAntigo - oferta.precoAtual) / oferta.precoAntigo) * 100) : null;

  return (
    <article className="offer-card group flex h-full flex-col">
      <Link href={`/oferta/${oferta.slug}`} className="relative block">
        {desconto ? <div className="absolute right-3 top-3 z-10 rounded-full bg-[#f5b942] px-2.5 py-1 text-xs font-black text-[#07111f]">-{desconto}%</div> : null}
        <div className="offer-card-image transition duration-300 group-hover:brightness-95">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={oferta.imagem} alt={oferta.titulo} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/oferta/${oferta.slug}`} className="line-clamp-2 min-h-11 font-bold text-white hover:text-[#f5b942]">{oferta.titulo}</Link>
        {oferta.precoAntigo ? <span className="text-xs text-slate-400 line-through">{formatarPreco(oferta.precoAntigo)}</span> : null}
        <strong className="text-2xl font-black text-[#f5b942]">{formatarPreco(oferta.precoAtual)}</strong>
        {oferta.descontoPix ? <span className="text-xs text-slate-300">{oferta.descontoPix}</span> : null}
        {oferta.cupom ? <span className="w-fit rounded-md border border-[#f5b942]/40 bg-[#f5b942]/10 px-2 py-1 text-xs font-bold text-[#ffd66b]">Cupom: {oferta.cupom}</span> : null}
        <span className="mt-auto text-xs text-slate-400">{oferta.loja}</span>
        <div className="flex items-center gap-2 pt-2">
          <Link href={`/oferta/${oferta.slug}`} className="flex-1 rounded-xl bg-[#f5b942] px-3 py-3 text-center text-sm font-black text-[#07111f] transition hover:bg-[#ffd66b]">Ver oferta</Link>
          <button type="button" aria-label="Favoritar" onClick={() => { const novo = alternarFavorito(oferta.id); setFavorito(novo); }} className="grid h-11 w-11 place-items-center rounded-xl border border-[#f5b942]/30 text-xl text-[#f5b942]">{favorito ? "★" : "☆"}</button>
        </div>
      </div>
    </article>
  );
}
