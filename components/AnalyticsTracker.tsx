"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

const CHAVE_VISITANTE = "achado_ale_visitor_id";

function obterVisitanteId() {
  try {
    const existente = window.localStorage.getItem(CHAVE_VISITANTE);
    if (existente) return existente;

    const novo =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `vis-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(CHAVE_VISITANTE, novo);
    return novo;
  } catch {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function identificarDispositivo() {
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(ua)) return "Tablet";
  if (/mobi|android|iphone|ipod/.test(ua)) return "Celular";
  return "Computador";
}

function identificarOrigem(referrer: string, utmSource: string | null) {
  if (utmSource) return utmSource.trim();
  if (!referrer) return "Direto";

  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("google.")) return "Google";
    if (host.includes("bing.")) return "Bing";
    if (host.includes("facebook.") || host.includes("fb.com")) return "Facebook";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("whatsapp.")) return "WhatsApp";
    if (host.includes("tiktok.")) return "TikTok";
    if (host.includes("youtube.")) return "YouTube";
    if (host.includes("achadosdoale.com")) return "Navegação interna";
    return host.replace(/^www\./, "");
  } catch {
    return "Referência externa";
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const visitanteId = useRef<string | null>(null);
  const dadosUltimaPagina = useRef<{
    path: string;
    referrer: string;
    source: string;
    deviceType: string;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  } | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login")) {
      return;
    }

    const supabase = criarClienteNavegador();
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer || "";
    const utmSource = params.get("utm_source");
    const dados = {
      path: `${window.location.pathname}${window.location.search}`,
      referrer,
      source: identificarOrigem(referrer, utmSource),
      deviceType: identificarDispositivo(),
      utmSource,
      utmMedium: params.get("utm_medium"),
      utmCampaign: params.get("utm_campaign"),
    };

    visitanteId.current = visitanteId.current ?? obterVisitanteId();
    dadosUltimaPagina.current = dados;

    void supabase.rpc("track_analytics_visit", {
      p_visitor_id: visitanteId.current,
      p_path: dados.path,
      p_referrer: dados.referrer || null,
      p_source: dados.source,
      p_device_type: dados.deviceType,
      p_utm_source: dados.utmSource,
      p_utm_medium: dados.utmMedium,
      p_utm_campaign: dados.utmCampaign,
      p_is_heartbeat: false,
    });
  }, [pathname]);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      const dados = dadosUltimaPagina.current;
      const id = visitanteId.current;
      if (!dados || !id) return;

      const supabase = criarClienteNavegador();
      void supabase.rpc("track_analytics_visit", {
        p_visitor_id: id,
        p_path: dados.path,
        p_referrer: dados.referrer || null,
        p_source: dados.source,
        p_device_type: dados.deviceType,
        p_utm_source: dados.utmSource,
        p_utm_medium: dados.utmMedium,
        p_utm_campaign: dados.utmCampaign,
        p_is_heartbeat: true,
      });
    }, 30000);

    return () => window.clearInterval(intervalo);
  }, []);

  return null;
}
