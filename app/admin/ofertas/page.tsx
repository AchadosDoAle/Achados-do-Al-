"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import {
  listarOfertas,
  duplicarOferta,
  excluirOferta,
  reativarOfertaReportada,
} from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

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


  async function aoReativar(id: string) {
    const confirmou = window.confirm(
      "Reativar esta oferta? Os avisos de visitantes serão zerados e ela voltará a aparecer como publicada."
    );
    if (!confirmou) return;
    await reativarOfertaReportada(supabase, id);
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
            Gerencie rascunhos, agendamentos, publicações e ofertas vencidas.
          </p>
        </div>
        <Link
          href="/admin/ofertas/nova"
          className="admin-action rounded-[16px] border px-4 py-2.5 text-sm font-semibold shadow-sm"
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
                <StatusBadge status={ofertaEstaExpirada(oferta) ? "expirada" : oferta.status} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/60">
                {oferta.precoPix != null && (
                  <div className="rounded-full bg-trust/10 px-3 py-1 text-trust">
                    Pix: {oferta.precoPix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                )}
                {oferta.precoAtual != null && (
                  <div className="rounded-full bg-cream px-3 py-1">
                    Atual: {oferta.precoAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                )}
                {oferta.precoPix == null && oferta.precoAtual == null && (
                  <div className="rounded-full bg-cream px-3 py-1">Preço não informado</div>
                )}
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
                  className="admin-action-soft rounded-xl border px-3 py-2"
                >
                  Editar
                </Link>
                {ofertaEstaExpirada(oferta) && oferta.status !== "expirada" && (
                  <span className="rounded-xl bg-accent/10 px-3 py-2 text-accent-dark ring-1 ring-accent/20">
                    Validade vencida — edite a data para reativar
                  </span>
                )}
                {oferta.status === "expirada" && (
                  <button
                    onClick={() => aoReativar(oferta.id)}
                    className="admin-action rounded-xl border px-3 py-2"
                  >
                    Reativar oferta
                  </button>
                )}
                <button
                  onClick={() => aoDuplicar(oferta.id)}
                  className="admin-action-soft rounded-xl border px-3 py-2"
                >
                  Duplicar
                </button>
                <button
                  onClick={() => aoExcluir(oferta.id)}
                  className="admin-action-soft rounded-xl border px-3 py-2"
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
