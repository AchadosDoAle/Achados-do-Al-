"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

const ATRASO_ATUALIZACAO_MS = 350;

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

  useEffect(() => {
    // O painel administrativo já controla o próprio estado. Evitamos uma
    // atualização remota no meio de formulários de edição/cadastro.
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }

    const supabase = criarClienteNavegador();

    function atualizarConteudo(tabela: "offers" | "coupons", evento?: string) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        // Também avisamos componentes 100% client-side (como Favoritos), que
        // não são recarregados apenas pela nova árvore de Server Components.
        window.dispatchEvent(
          new CustomEvent("achado:conteudo-atualizado", {
            detail: { tabela, evento: evento ?? "change" },
          })
        );
        router.refresh();
      }, ATRASO_ATUALIZACAO_MS);
    }

    const canal = supabase
      .channel("achado-site-publico-v1")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offers" },
        (payload) => atualizarConteudo("offers", payload.eventType)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "coupons" },
        (payload) => atualizarConteudo("coupons", payload.eventType)
      )
      .subscribe();

    // Se o celular/notebook ficou em segundo plano e a conexão realtime caiu,
    // atualizar ao voltar para a aba garante que a vitrine não fique antiga.
    function atualizarAoVoltar() {
      if (document.visibilityState === "visible") router.refresh();
    }

    function atualizarAoFocar() {
      router.refresh();
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
