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
      <div className="mb-6 flex flex-col items-start gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Ofertas</h1>
          <p className="mt-1 text-sm text-ink/55">
            Visual mais limpo para gerenciar produtos publicados, rascunhos e envios.
          </p>
        </div>
        <Link
          href="/admin/ofertas/nova"
          className="rounded-[16px] bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          + Nova oferta
        </Link>
      </div>

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : ofertas.length === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhuma oferta cadastrada ainda. Toque em <strong>Nova oferta</strong> para começar.
        </div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {ofertas.map((oferta) => (
            <li
              key={oferta.id}
              className="rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-ink">{oferta.titulo}</p>
                  <p className="mt-1 text-sm text-ink/55">
                    {oferta.loja} · {oferta.categoria}
                  </p>
                </div>
                <StatusBadge status={oferta.status} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/60">
                <div className="rounded-full bg-cream px-3 py-1">
                  Atual: {oferta.precoAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
                {oferta.precoAntigo ? (
                  <div className="rounded-full bg-brand/5 px-3 py-1">
                    Antes: {oferta.precoAntigo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                ) : null}
                {oferta.cupom ? <div className="rounded-full bg-trust/10 px-3 py-1 text-trust">Cupom: {oferta.cupom}</div> : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                <Link
                  href={`/admin/ofertas/${oferta.id}/editar`}
                  className="rounded-xl bg-cream px-3 py-2 text-ink/80 ring-1 ring-ink/10"
                >
                  Editar
                </Link>
                {oferta.status === "aprovada" && (
                  <button
                    onClick={() => aoMarcarComoEnviada(oferta)}
                    className="rounded-xl bg-trust/10 px-3 py-2 text-trust ring-1 ring-trust/20"
                  >
                    Marcar como enviada
                  </button>
                )}
                <button
                  onClick={() => aoDuplicar(oferta.id)}
                  className="rounded-xl bg-cream px-3 py-2 text-ink/80 ring-1 ring-ink/10"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => aoExcluir(oferta.id)}
                  className="rounded-xl bg-cream px-3 py-2 text-accent-dark ring-1 ring-ink/10"
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
