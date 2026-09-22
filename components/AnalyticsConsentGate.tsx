"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AnalyticsTracker from "./AnalyticsTracker";
import GoogleAnalytics from "./GoogleAnalytics";

const CHAVE = "achado_ale_consentimento_analytics";

export default function AnalyticsConsentGate({ measurementId }: { measurementId?: string }) {
  const [consentimento, setConsentimento] = useState<"aceito" | "recusado" | "pendente">("pendente");

  useEffect(() => {
    const valor = window.localStorage.getItem(CHAVE);
    if (valor === "aceito" || valor === "recusado") setConsentimento(valor);
  }, []);

  function escolher(valor: "aceito" | "recusado") {
    window.localStorage.setItem(CHAVE, valor);
    setConsentimento(valor);
  }

  return (
    <>
      {consentimento === "aceito" && <AnalyticsTracker />}
      {consentimento === "aceito" && measurementId ? <GoogleAnalytics measurementId={measurementId} /> : null}
      {consentimento === "pendente" && (
        <div className="fixed bottom-20 left-3 right-3 z-[70] mx-auto max-w-xl rounded-2xl border border-white/10 bg-bg-secondary/95 p-4 text-text shadow-2xl backdrop-blur md:bottom-4">
          <p className="text-sm font-semibold">Privacidade e métricas</p>
          <p className="mt-1 text-xs leading-5 text-text-muted">
            Podemos usar métricas anônimas para entender acessos e melhorar o site. Você pode recusar sem perder nenhuma funcionalidade. <Link href="/privacidade" className="text-gold underline">Saiba mais</Link>.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => escolher("aceito")} className="rounded-lg bg-gold px-4 py-2 text-xs font-bold text-bg">Aceitar métricas</button>
            <button onClick={() => escolher("recusado")} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-text-muted">Recusar</button>
          </div>
        </div>
      )}
    </>
  );
}
