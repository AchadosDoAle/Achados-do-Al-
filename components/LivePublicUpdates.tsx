"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

const ATRASO_ATUALIZACAO_MS = 500;
const INTERVALO_MINIMO_REFRESH_MS = 1500;

/**
 * Mantém as vitrines públicas sincronizadas com o Supabase em tempo real.
 * Agrupa eventos e evita refreshes duplicados ao recuperar o foco da janela.
 */
export default function LivePublicUpdates() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoRefreshRef = useRef(0);

  useEffect(() => {
    const supabase = criarClienteNavegador();

    function programarAtualizacao(tabela?: "offers" | "coupons", evento?: string) {
      const rotaAtual = window.location.pathname;
      if (rotaAtual.startsWith("/admin") || rotaAtual.startsWith("/login")) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const desdeUltimoRefresh = Date.now() - ultimoRefreshRef.current;
      const esperaMinima = Math.max(0, INTERVALO_MINIMO_REFRESH_MS - desdeUltimoRefresh);
      const atraso = Math.max(ATRASO_ATUALIZACAO_MS, esperaMinima);

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        ultimoRefreshRef.current = Date.now();

        if (tabela) {
          window.dispatchEvent(
            new CustomEvent("achado:conteudo-atualizado", {
              detail: { tabela, evento: evento ?? "change" },
            })
          );
        }
        router.refresh();
      }, atraso);
    }

    const canal = supabase
      .channel("achado-site-publico-v1")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers" },
        (payload) => programarAtualizacao("offers", payload.eventType)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "coupons" },
        (payload) => programarAtualizacao("coupons", payload.eventType)
      )
      .subscribe();

    // A visibilidade cobre o retorno à aba. Não registramos também "focus",
    // pois navegadores móveis podem disparar os dois eventos em sequência.
    function atualizarAoVoltar() {
      if (document.visibilityState === "visible") programarAtualizacao();
    }

    document.addEventListener("visibilitychange", atualizarAoVoltar);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      document.removeEventListener("visibilitychange", atualizarAoVoltar);
      void supabase.removeChannel(canal);
    };
  }, [router]);

  return null;
}
