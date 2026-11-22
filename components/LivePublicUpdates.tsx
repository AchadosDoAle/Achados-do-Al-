"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

const ATRASO_ATUALIZACAO_MS = 350;
const INTERVALO_MINIMO_REFRESH_MS = 1500;

/**
 * Mantém as vitrines públicas sincronizadas com o Supabase em tempo real.
 *
 * Quando ofertas ou cupons são inseridos, alterados ou removidos, fazemos um
 * router.refresh(). Isso pede novamente os Server Components sem recarregar a
 * página inteira e preserva o estado local dos componentes Client (filtros,
 * posição da tela etc.) sempre que possível.
 */
export default function LivePublicUpdates() {
  const pathname = usePathname();
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoRefreshRef = useRef(Date.now());
  const eventosPendentesRef = useRef<Partial<Record<"offers" | "coupons", string>>>({});

  useEffect(() => {
    // O painel administrativo já controla o próprio estado. Evitamos uma
    // atualização remota no meio de formulários de edição/cadastro.
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }

    const supabase = criarClienteNavegador();

    function agendarAtualizacao(tabela?: "offers" | "coupons", evento?: string) {
      if (tabela) eventosPendentesRef.current[tabela] = evento ?? "change";
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const intervaloRestante = Math.max(
        0,
        INTERVALO_MINIMO_REFRESH_MS - (Date.now() - ultimoRefreshRef.current)
      );

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        ultimoRefreshRef.current = Date.now();

        // Agrupa eventos de ofertas/cupons e evita refresh duplicado quando
        // focus e visibilitychange são disparados juntos pelo navegador.
        const eventosPendentes = eventosPendentesRef.current;
        eventosPendentesRef.current = {};

        for (const [tabelaAtualizada, eventoAtualizado] of Object.entries(eventosPendentes)) {
          if (tabelaAtualizada !== "offers" && tabelaAtualizada !== "coupons") continue;
          window.dispatchEvent(
            new CustomEvent("achado:conteudo-atualizado", {
              detail: { tabela: tabelaAtualizada, evento: eventoAtualizado ?? "change" },
            })
          );
        }

        router.refresh();
      }, Math.max(ATRASO_ATUALIZACAO_MS, intervaloRestante));
    }
    const canal = supabase
      .channel("achado-site-publico-v1")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers" },
        (payload) => agendarAtualizacao("offers", payload.eventType)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "coupons" },
        (payload) => agendarAtualizacao("coupons", payload.eventType)
      )
      .subscribe();

    // Se o celular/notebook ficou em segundo plano e a conexão realtime caiu,
    // atualizar ao voltar para a aba garante que a vitrine não fique antiga.
    function atualizarAoVoltar() {
      if (document.visibilityState === "visible") agendarAtualizacao();
    }

    function atualizarAoFocar() {
      agendarAtualizacao();
    }

    document.addEventListener("visibilitychange", atualizarAoVoltar);
    window.addEventListener("focus", atualizarAoFocar);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      document.removeEventListener("visibilitychange", atualizarAoVoltar);
      window.removeEventListener("focus", atualizarAoFocar);
      void supabase.removeChannel(canal);
    };
  }, [pathname, router]);

  return null;
}
