"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnalyticsTracker from "./AnalyticsTracker";
import BasicPageviewTracker from "./BasicPageviewTracker";
import GoogleAnalytics from "./GoogleAnalytics";

const CHAVE = "achado_ale_consentimento_analytics";
type Consentimento = "aceito" | "recusado" | "pendente";

function atualizarConsentimentoGoogle(valor: Exclude<Consentimento, "pendente">) {
  const gtag = (
    window as typeof window & {
      gtag?: (...args: unknown[]) => void;
    }
  ).gtag;

  gtag?.("consent", "update", {
    analytics_storage: valor === "aceito" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export default function AnalyticsConsentGate({
  measurementId,
}: {
  measurementId?: string;
}) {
  const [consentimento, setConsentimento] = useState<Consentimento>("pendente");
  const [carregado, setCarregado] = useState(false);
  const [reabrir, setReabrir] = useState(false);

  useEffect(() => {
    const abrirPreferencias = () => setReabrir(true);
    window.addEventListener("achado:abrir-privacidade", abrirPreferencias);
    return () => window.removeEventListener("achado:abrir-privacidade", abrirPreferencias);
  }, []);

  useEffect(() => {
    const valor = window.localStorage.getItem(CHAVE);
    if (valor === "aceito" || valor === "recusado") {
      atualizarConsentimentoGoogle(valor);
      setConsentimento(valor);
    }
    setCarregado(true);
  }, []);

  function escolher(valor: "aceito" | "recusado") {
    window.localStorage.setItem(CHAVE, valor);
    atualizarConsentimentoGoogle(valor);
    setConsentimento(valor);
    setReabrir(false);
  }

  return (
    <>
      {/*
        Contador operacional sempre ativo: registra somente a página pública
        acessada, sem cookie/ID persistente, referrer, dispositivo ou UTM.
      */}
      <BasicPageviewTracker />

      {/* Métricas detalhadas continuam condicionadas ao consentimento. */}
      {consentimento === "aceito" && <AnalyticsTracker />}
      {consentimento === "aceito" && measurementId ? (
        <GoogleAnalytics measurementId={measurementId} />
      ) : null}

      {carregado && (consentimento === "pendente" || reabrir) && (
        <section role="dialog" aria-label="Preferências de privacidade" aria-modal="false"
          className="fixed inset-x-0 bottom-0 z-[90] w-full border-t border-[#f5b942]/50 bg-[#101d30] text-white shadow-[0_-10px_40px_rgba(0,0,0,.35)] print:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold">Sua privacidade é importante</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-200">
                Usamos recursos essenciais para o site funcionar. Com sua autorização, utilizamos
                Google Analytics 4 e Google Signals para medir audiência e obter estatísticas
                agregadas, que podem incluir dados demográficos quando disponíveis. Você pode
                recusar sem perder acesso às ofertas e mudar sua escolha depois. {" "}
                <Link href="/privacidade" className="font-semibold text-[#f5b942] underline underline-offset-2">Política de Privacidade</Link>.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row lg:w-auto">
              <button type="button" onClick={() => escolher("recusado")}
                className="min-h-11 rounded-xl border border-white/50 px-6 py-2.5 text-sm font-bold text-white hover:bg-white/10">Recusar opcionais</button>
              <button type="button" onClick={() => escolher("aceito")}
                className="min-h-11 rounded-xl bg-[#f5b942] px-6 py-2.5 text-sm font-extrabold text-[#101d30] hover:bg-[#ffd06c]">Aceitar métricas</button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
