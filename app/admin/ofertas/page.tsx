"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import {
  listarOfertas,
  duplicarOferta,
  excluirOferta,
  publicarOfertaAgora,
} from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

function podeRepublicar(oferta: Oferta) {
  if (oferta.status === "rascunho") return false;
  return (
    oferta.status === "expirada" ||
    oferta.status === "arquivada" ||
    (oferta.status === "publicada" && ofertaEstaExpirada(oferta))
  );
}

export default function ListaOfertasPage() {
  const supabase = criarClienteNavegador();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState("");

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

  async function aoPublicar(oferta: Oferta, republicar = false) {
    const acao = republicar ? "Republicar" : "Publicar";
    const detalheValidade = ofertaEstaExpirada(oferta) && oferta.validadePromocao
      ? "\n\nA validade antiga já venceu e será removida para a oferta voltar ao ar."
      : "";
    const confirmou = window.confirm(
      `${acao} \"${oferta.titulo}\" agora no site?${detalheValidade}`
    );
    if (!confirmou) return;

    setErroAcao("");
    setAcaoEmAndamento(oferta.id);
    try {
      await publicarOfertaAgora(supabase, oferta);
      await recarregar();
    } catch (erro) {
      console.error(erro);
      setErroAcao(
        `Não foi possível ${republicar ? "republicar" : "publicar"} a oferta. Tente novamente.`
      );
    } finally {
      setAcaoEmAndamento(null);
    }
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

      {erroAcao && (
        <div className="mb-4 rounded-[16px] border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {erroAcao}
        </div>
      )}

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : ofertas.length === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhuma oferta cadastrada ainda. Toque em <strong>Nova oferta</strong> para começar.
        </div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {ofertas.map((oferta) => {
            const expirada = ofertaEstaExpirada(oferta);
            const republicavel = podeRepublicar(oferta);
            const executando = acaoEmAndamento === oferta.id;
            const statusVisual = oferta.status === "arquivada"
              ? "arquivada"
              : expirada
                ? "expirada"
                : oferta.status;

            return (
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
                  <StatusBadge status={statusVisual} />
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

                  {expirada && oferta.status !== "expirada" && oferta.status !== "arquivada" && (
                    <span className="rounded-xl bg-accent/10 px-3 py-2 text-accent-dark ring-1 ring-accent/20">
                      Validade vencida
                    </span>
                  )}

                  <button
                    onClick={() => aoDuplicar(oferta.id)}
                    disabled={executando}
                    className="admin-action-soft rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Duplicar
                  </button>
                  <button
                    onClick={() => aoExcluir(oferta.id)}
                    disabled={executando}
                    className="admin-action-soft rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Excluir
                  </button>

                  {oferta.status === "rascunho" && (
                    <button
                      onClick={() => aoPublicar(oferta)}
                      disabled={executando}
                      className="admin-action rounded-xl border px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {executando ? "PUBLICANDO..." : "PUBLICAR"}
                    </button>
                  )}

                  {republicavel && (
                    <button
                      onClick={() => aoPublicar(oferta, true)}
                      disabled={executando}
                      className="admin-action rounded-xl border px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {executando ? "REPUBLICANDO..." : "REPUBLICAR"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
