"use client";

import { useEffect, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function BlackFridayToggle() {
  const [ativo, setAtivo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let montado = true;
    criarClienteNavegador()
      .from("integrations")
      .select("ativo")
      .eq("tipo", "site_setting")
      .eq("nome", "blackfriday_mode")
      .maybeSingle()
      .then(({ data, error }) => {
        if (!montado) return;
        if (error) setErro("Não foi possível carregar o modo Black Friday.");
        else setAtivo(data?.ativo === true);
        setCarregando(false);
      });
    return () => { montado = false; };
  }, []);

  async function alternar() {
    if (carregando || salvando) return;
    const proximo = !ativo;
    setSalvando(true);
    setErro("");
    const { error } = await criarClienteNavegador()
      .from("integrations")
      .update({ ativo: proximo, atualizado_em: new Date().toISOString() })
      .eq("tipo", "site_setting")
      .eq("nome", "blackfriday_mode");
    if (error) setErro("Não foi possível salvar. Verifique sua permissão de administrador.");
    else setAtivo(proximo);
    setSalvando(false);
  }

  return (
    <section className="rounded-[22px] border border-[#35215D]/15 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8A6B25]">Campanha visual do site</p>
          <h2 className="mt-1 text-lg font-extrabold text-[#35215D]">Ativar modo BlackFriday</h2>
          <p className="mt-1 max-w-xl text-sm text-ink/60">
            Quando ativado, todas as promoções do site recebem a tarjeta BLACKFRIDAY automaticamente. Não altera o aplicativo nem os dados das ofertas.
          </p>
          <p className="mt-2 text-xs font-semibold" aria-live="polite">
            {carregando ? "Carregando configuração…" : ativo ? "Modo BlackFriday ativado no site" : "Modo BlackFriday desativado"}
          </p>
          {erro && <p role="alert" className="mt-2 text-xs text-red-700">{erro}</p>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ativo}
          aria-label="Ativar modo BlackFriday"
          disabled={carregando || salvando}
          onClick={alternar}
          className={`relative inline-flex h-10 w-[76px] shrink-0 items-center rounded-full p-1 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F5B942]/40 disabled:cursor-wait disabled:opacity-60 ${ativo ? "bg-[#21152F]" : "bg-slate-300"}`}
        >
          <span className={`inline-block h-8 w-8 rounded-full bg-white shadow-md transition-transform ${ativo ? "translate-x-9" : "translate-x-0"}`} />
          <span className="sr-only">{salvando ? "Salvando" : ativo ? "Ativado" : "Desativado"}</span>
        </button>
      </div>
    </section>
  );
}
