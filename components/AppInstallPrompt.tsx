"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ANDROID_PACKAGE = "com.achadodoale.app";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=" + ANDROID_PACKAGE;
const ANDROID_OPEN_URL =
  "intent://home#Intent;scheme=achadodoale;package=" + ANDROID_PACKAGE +
  ";S.browser_fallback_url=" + encodeURIComponent(PLAY_STORE_URL) + ";end";

type Platform = "android" | "ios" | "other";
type RelatedApp = { platform?: string; id?: string };
type RelatedAppsNavigator = Navigator & {
  getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
  standalone?: boolean;
};

function plataformaAtual(): Platform {
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua) ||
      (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return "other";
}

/**
 * Um único convite fixo no topo, desvinculado do rodapé.
 * Recusar fecha só durante a navegação atual; F5/reload o exibe novamente.
 * A web não consegue garantir a detecção de aplicativos instalados:
 * no Android a abertura usa intent com fallback oficial da Play Store.
 */
export default function AppInstallPrompt() {
  const pathname = usePathname();
  const [platform, setPlatform] = useState<Platform>("other");
  const [dismissed, setDismissed] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [installedConfirmed, setInstalledConfirmed] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlatform(plataformaAtual());
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as RelatedAppsNavigator).standalone)
    );

    const nav = navigator as RelatedAppsNavigator;
    if (typeof nav.getInstalledRelatedApps !== "function") return;
    let active = true;
    nav.getInstalledRelatedApps()
      .then((apps) => {
        if (active && apps.some((app) =>
          app.platform === "play" && app.id === ANDROID_PACKAGE
        )) setInstalledConfirmed(true);
      })
      .catch(() => { /* Ausência de suporte não significa app desinstalado. */ });
    return () => { active = false; };
  }, []);

  const isPublicPage = !/^\/(?:admin|login|auth)(?:\/|$)/.test(pathname || "") &&
    pathname !== "/app/ios";
  const visible = platform !== "other" && isPublicPage && !dismissed && !standalone;

  useEffect(() => {
    if (!visible) {
      setBannerHeight(0);
      document.documentElement.style.removeProperty("--app-top-prompt-height");
      return;
    }
    const updateHeight = () => {
      const height = Math.ceil(bannerRef.current?.getBoundingClientRect().height || 0);
      setBannerHeight(height);
      document.documentElement.style.setProperty("--app-top-prompt-height", height + "px");
    };
    updateHeight();
    const observer = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateHeight) : null;
    if (bannerRef.current) observer?.observe(bannerRef.current);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateHeight);
      document.documentElement.style.removeProperty("--app-top-prompt-height");
    };
  }, [visible]);

  if (!visible) return null;

  const isAndroid = platform === "android";
  const actionLabel = isAndroid ? "Abrir app" : "Ver app iOS";

  return (
    <>
      <div aria-hidden="true" className="md:hidden" style={{ height: bannerHeight }} />
      <aside
        ref={bannerRef}
        role="region"
        aria-label="Abrir o aplicativo Achados do Alê"
        className="fixed inset-x-0 top-0 z-[90] border-b border-[#4a5a6d] bg-[#111c2b] px-3 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:hidden"
      >
        <div className="mx-auto max-w-lg">
          <div className="flex items-center gap-2.5">
            <Image
              src="/icon.png" alt=""
              width={42} height={42}
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">Achados do Alê</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#c3d0e1]">
                {isAndroid
                  ? installedConfirmed
                    ? "Abra o app para ver seus favoritos e alertas."
                    : "Abra o app ou baixe na Play Store."
                  : "A versão para iPhone está em desenvolvimento."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Fechar aviso e continuar no site"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-white/80 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              ×
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isAndroid ? (
              <a
                href={ANDROID_OPEN_URL}
                className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-gold px-3 py-2 text-xs font-extrabold text-[#091724] hover:bg-[#ffd16b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {actionLabel}
              </a>
            ) : (
              <Link
                href="/app/ios"
                onClick={() => setDismissed(true)}
                className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg bg-gold px-3 py-2 text-xs font-extrabold text-[#091724] hover:bg-[#ffd16b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {actionLabel}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Continuar no site
            </button>
          </div>
          {isAndroid && !installedConfirmed && (
            <p className="mt-1.5 text-center text-[11px] text-[#c3d0e1]">
              Ainda não tem?{" "}
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-gold underline underline-offset-2">
                Baixar na Play Store
              </a>
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
