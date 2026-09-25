"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cupom } from "@/lib/types";
import { listarCupons, excluirCupom, cupomExpirado } from "@/lib/coupons-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function ListaCuponsPage() {
  const supabase = criarClienteNavegador();
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function recarregar() {
    setCarregando(true);
    try {
      setCupons(await listarCupons(supabase));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function aoExcluir(id: string) {
    const confirmou = window.confirm("Excluir este cupom?");
    if (!confirmou) return;
    await excluirCupom(supabase, id);
    recarregar();
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Cupons</h1>
          <p className="mt-1 text-sm text-ink/55">
            Gerencie cupons com uma visualização mais atual e direta.
          </p>
        </div>
        <Link
          href="/admin/cupons/novo"
          className="admin-action rounded-[16px] border px-4 py-2.5 text-sm font-semibold shadow-sm"
        >
          + Novo cupom
        </Link>
      </div>

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : cupons.length === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhum cupom cadastrado ainda.
        </div>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {cupons.map((cupom) => {
            const expirado = cupomExpirado(cupom);
            return (
              <li
                key={cupom.id}
                className="rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold" style={{ color: cupom.corLoja }}>
                      CUPOM {cupom.nomeCupom}
                    </p>
                    <p className="mt-1 text-sm text-ink/55">{cupom.loja}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {expirado && (
                      <span className="rounded-full bg-ink/10 px-2.5 py-1 text-xs font-medium text-ink/50">
                        Esgotado
                      </span>
                    )}
                    {!cupom.ativo && (
                      <span className="rounded-full bg-ink/10 px-2.5 py-1 text-xs font-medium text-ink/50">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/60">
                  {cupom.descontoPercentual ? (
                    <div className="rounded-full bg-discount/25 px-3 py-1 font-medium text-ink">
                      {cupom.descontoPercentual}% OFF
                    </div>
                  ) : null}
                  {cupom.valorCupom ? (
                    <div className="rounded-full bg-brand/5 px-3 py-1">{cupom.valorCupom}</div>
                  ) : null}
                  {cupom.validade ? (
                    <div className="rounded-full bg-cream px-3 py-1">
                      Validade configurada
                    </div>
                  ) : (
                    <div className="rounded-full bg-cream px-3 py-1">Sem validade</div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <Link
                    href={`/admin/cupons/${cupom.id}/editar`}
                    className="admin-action-soft rounded-xl border px-3 py-2"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => aoExcluir(cupom.id)}
                    className="admin-action-soft rounded-xl border px-3 py-2"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
