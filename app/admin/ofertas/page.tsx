"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import {
  listarOfertas,
  duplicarOferta,
  excluirOferta,
  atualizarOferta,
} from "@/lib/offers-repo";
import { registrarPublicacao } from "@/lib/publications-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";

export default function ListaOfertasPage() {
  const supabase = criarClienteNavegador();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function recarregar() {
    setCarregando(true);
    try {
      setOfertas(await listarOfertas(supabase));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function aoDuplicar(id: string) {
    await duplicarOferta(supabase, id);
    recarregar();
  }

  async function aoMarcarComoEnviada(oferta: Oferta) {
    await registrarPublicacao(supabase, {
      offerId: oferta.id,
      canal: "whatsapp_manual",
      status: "enviado",
      textoPublicado: oferta.textoPublicacao,
    });
    await atualizarOferta(supabase, oferta.id, {
      ...oferta,
      status: "enviada_whatsapp",
    });
    recarregar();
  }

  async function aoExcluir(id: string) {
    const confirmou = window.confirm(
      "Tem certeza que deseja excluir esta oferta? Essa ação não pode ser desfeita."
    );
    if (!confirmou) return;
    await excluirOferta(supabase, id);
    recarregar();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Ofertas</h1>
        <Link
          href="/admin/ofertas/nova"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Nova oferta
        </Link>
      </div>

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : ofertas.length === 0 ? (
        <p className="text-sm text-ink/60">
          Nenhuma oferta cadastrada ainda. Toque em "Nova oferta" para
          começar.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ofertas.map((oferta) => (
            <li
              key={oferta.id}
              className="rounded-xl2 bg-white p-3 ring-1 ring-ink/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {oferta.titulo}
                  </p>
                  <p className="text-xs text-ink/50">
                    {oferta.loja} · {oferta.categoria}
                  </p>
                </div>
                <StatusBadge status={oferta.status} />
              </div>

              <p className="mt-2 text-base font-bold text-brand">
                {oferta.precoAtual.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>

              <div className="mt-3 flex gap-2 text-xs font-medium">
                <Link
                  href={`/admin/ofertas/${oferta.id}/editar`}
                  className="rounded-lg bg-cream px-3 py-1.5 text-ink/70 ring-1 ring-ink/10"
                >
                  Editar
                </Link>
                {oferta.status === "aprovada" && (
                  <button
                    onClick={() => aoMarcarComoEnviada(oferta)}
                    className="rounded-lg bg-trust/10 px-3 py-1.5 text-trust ring-1 ring-trust/20"
                  >
                    Marcar como enviada
                  </button>
                )}
                <button
                  onClick={() => aoDuplicar(oferta.id)}
                  className="rounded-lg bg-cream px-3 py-1.5 text-ink/70 ring-1 ring-ink/10"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => aoExcluir(oferta.id)}
                  className="rounded-lg bg-cream px-3 py-1.5 text-accent-dark ring-1 ring-ink/10"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
