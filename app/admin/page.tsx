"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listarOfertas } from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { Oferta } from "@/lib/types";

export default function AdminHomePage() {
  const supabase = criarClienteNavegador();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  useEffect(() => {
    listarOfertas(supabase).then(setOfertas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contagem = (status: string) =>
    ofertas.filter((o) => o.status === status).length;

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ink">
        Bem-vindo(a) de volta
      </h1>

      <div className="mt-4 flex gap-2">
        <Link
          href="/admin/ofertas/nova"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Nova oferta
        </Link>
        <Link
          href="/admin/ofertas"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink ring-1 ring-ink/10"
        >
          Ver ofertas
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
          <p className="text-xs text-ink/50">Publicadas</p>
          <p className="text-2xl font-bold text-ink">
            {contagem("publicada")}
          </p>
        </div>
        <div className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
          <p className="text-xs text-ink/50">Rascunhos</p>
          <p className="text-2xl font-bold text-ink">{contagem("rascunho")}</p>
        </div>
        <div className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
          <p className="text-xs text-ink/50">Agendadas</p>
          <p className="text-2xl font-bold text-ink">{contagem("agendada")}</p>
        </div>
        <div className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
          <p className="text-xs text-ink/50">Expiradas</p>
          <p className="text-2xl font-bold text-ink">{contagem("expirada")}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-ink/50">
        Relatórios mais completos (cliques, desempenho por período) ficam em
        "Relatórios" no menu acima.
      </p>
    </div>
  );
}
