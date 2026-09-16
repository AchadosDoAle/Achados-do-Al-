"use client";

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
      <h1 className="mb-4 font-display text-xl font-bold text-ink">
        Editar oferta
      </h1>
      <OfferForm ofertaExistente={oferta} />
    </div>
  );
}
