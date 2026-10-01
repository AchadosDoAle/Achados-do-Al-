"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

/**
 * Contagem operacional de visualizações do site.
 *
 * Esta trilha é propositalmente mínima: não cria cookie, não grava ID
 * persistente, não envia referrer, dispositivo ou parâmetros UTM. Ela apenas
 * registra a página pública acessada para que o painel consiga contabilizar
 * visualizações mesmo quando o visitante não autoriza métricas avançadas.
 */
export default function BasicPageviewTracker() {
  const pathname = usePathname();
  const ultimoRegistro = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }

    const path = `${window.location.pathname}${window.location.search}`;

    // Evita duplicação causada por re-renderizações do mesmo caminho.
    if (ultimoRegistro.current === path) return;
    ultimoRegistro.current = path;

    const supabase = criarClienteNavegador();
    void supabase.rpc("track_basic_pageview", {
      p_path: path,
    });
  }, [pathname]);

  return null;
}
