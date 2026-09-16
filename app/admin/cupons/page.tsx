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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Cupons</h1>
        <Link
          href="/admin/cupons/novo"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Novo cupom
        </Link>
      </div>

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : cupons.length === 0 ? (
        <p className="text-sm text-ink/60">Nenhum cupom cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cupons.map((cupom) => {
            const expirado = cupomExpirado(cupom);
            return (
              <li
                key={cupom.id}
                className="rounded-xl2 bg-white p-3 ring-1 ring-ink/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: cupom.corLoja }}
                    >
                      CUPOM {cupom.nomeCupom}
                    </p>
                    <p className="text-xs text-ink/50">{cupom.loja}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {expirado && (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink/50">
                        Esgotado
                      </span>
                    )}
                    {!cupom.ativo && (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink/50">
                        Inativo
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex gap-2 text-xs font-medium">
                  <Link
                    href={`/admin/cupons/${cupom.id}/editar`}
                    className="rounded-lg bg-cream px-3 py-1.5 text-ink/70 ring-1 ring-ink/10"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => aoExcluir(cupom.id)}
                    className="rounded-lg bg-cream px-3 py-1.5 text-accent-dark ring-1 ring-ink/10"
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
