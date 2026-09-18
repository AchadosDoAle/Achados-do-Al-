"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Cupom } from "@/lib/types";
import { buscarCupomPorId } from "@/lib/coupons-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import CupomForm from "@/components/admin/CupomForm";

export default function EditarCupomPage() {
  const params = useParams<{ id: string }>();
  const supabase = criarClienteNavegador();
  const [carregado, setCarregado] = useState(false);
  const [cupom, setCupom] = useState<Cupom | null>(null);

  useEffect(() => {
    buscarCupomPorId(supabase, params.id).then((encontrado) => {
      setCupom(encontrado);
      setCarregado(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!carregado) return null;
  if (!cupom) notFound();

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink">Editar cupom</h1>
        <p className="mt-1 text-sm text-ink/55">
          Ajuste dados, validade e horário no fuso de Brasília.
        </p>
      </div>
      <CupomForm cupomExistente={cupom} />
    </div>
  );
}
