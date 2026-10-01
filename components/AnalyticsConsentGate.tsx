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

  useEffect(() => {
    const valor = window.localStorage.getItem(CHAVE);
    if (valor === "aceito" || valor === "recusado") {
      atualizarConsentimentoGoogle(valor);
      setConsentimento(valor);
    }
  }, []);

  function escolher(valor: "aceito" | "recusado") {
    window.localStorage.setItem(CHAVE, valor);
    atualizarConsentimentoGoogle(valor);
    setConsentimento(valor);
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

      {consentimento === "pendente" && (
        <div className="fixed bottom-20 left-3 right-3 z-[70] mx-auto max-w-xl rounded-2xl border border-white/10 bg-bg-secondary/95 p-4 text-text shadow-2xl backdrop-blur md:bottom-4">
          <p className="text-sm font-semibold">Privacidade e métricas</p>
          <p className="mt-1 text-xs leading-5 text-text-muted">
            O site mantém uma contagem básica e anônima de páginas visualizadas,
            sem criar identificador persistente. Com sua permissão, também podemos
            usar métricas adicionais para entender origem dos acessos, dispositivo
            e campanhas. Você pode recusar sem perder nenhuma funcionalidade. O
            Google Analytics permanece sem armazenamento de Analytics até você
            aceitar.{" "}
            <Link href="/privacidade" className="text-gold underline">
              Saiba mais
            </Link>
            .
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => escolher("aceito")}
              className="btn-modern rounded-lg bg-gold px-4 py-2 text-xs font-bold text-bg"
            >
              Aceitar métricas
            </button>
            <button
              onClick={() => escolher("recusado")}
              className="btn-modern rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-text-muted"
            >
              Recusar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
