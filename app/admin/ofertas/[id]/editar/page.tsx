"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Oferta } from "@/lib/types";
import { buscarOfertaPorId } from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import OfferForm from "@/components/admin/OfferForm";

export default function EditarOfertaPage() {
  const params = useParams<{ id: string }>();
  const supabase = criarClienteNavegador();
  const [carregado, setCarregado] = useState(false);
  const [oferta, setOferta] = useState<Oferta | null>(null);

  useEffect(() => {
    buscarOfertaPorId(supabase, params.id).then((encontrada) => {
      setOferta(encontrada);
      setCarregado(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!carregado) return null;
  if (!oferta) notFound();

  return (
    <div>
      <section className="mb-5 rounded-[24px] border border-brand/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink/45">
              <Link href="/admin/ofertas" className="transition hover:text-brand">Ofertas</Link>
              <span>/</span>
              <span>Editar oferta</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Editar oferta</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink/55">
              Revise somente os blocos que precisam de alteração e salve ao final.
            </p>
          </div>

          <Link
            href="/admin/ofertas"
            className="admin-action inline-flex w-fit items-center rounded-xl border px-4 py-2 text-sm font-semibold transition"
          >
            ← Voltar para ofertas
          </Link>
        </div>
      </section>

      <OfferForm ofertaExistente={oferta} />
    </div>
  );
}
