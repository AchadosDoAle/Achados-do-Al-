"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Banner exibido DEPOIS do rodapé, apenas em aparelhos móveis.
 * Não é pop-up, não usa position: fixed e não abre o app automaticamente.
 * A versão para iOS continua inativa enquanto não existir um link oficial.
 */
const ANDROID_PACKAGE = "com.achadodoale.app";
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
const IOS_APP = { enabled: false, appStoreUrl: "" };

type Detection = "hidden" | "checking" | "installed" | "not-found" | "unknown" | "ios";
type RelatedApp = { platform?: string; id?: string };
type NavigatorWithRelatedApps = Navigator & {
  getInstalledRelatedApps?: () => Promise<RelatedApp[]>;
};

// Para abrir o aplicativo já instalado, usamos o scheme declarado no Expo:
// achadodoale://home. O Chrome pode bloquear intent:// em alguns contextos;
// a URL da Play Store permanece como fallback.
const APP_OPEN_URL =
  `intent://home#Intent;scheme=achadodoale;package=${ANDROID_PACKAGE};` +
  `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE_URL)};end`;

export default function AndroidAppFooterBanner() {
  const [detection, setDetection] = useState<Detection>("checking");

  useEffect(() => {
    const agent = navigator.userAgent || "";
    const isAndroid = /Android/i.test(agent);
    const isIOS = /iPhone|iPad|iPod/i.test(agent) ||
      (/Macintosh/i.test(agent) && navigator.maxTouchPoints > 1);

    if (isIOS) {
      setDetection(IOS_APP.enabled && IOS_APP.appStoreUrl ? "ios" : "hidden");
      return;
    }
    if (!isAndroid) {
      setDetection("hidden");
      return;
    }

    const navigatorWithApps = navigator as NavigatorWithRelatedApps;
    if (typeof navigatorWithApps.getInstalledRelatedApps !== "function") {
      // Navegador sem suporte: não afirmar que o app não está instalado.
      setDetection("unknown");
      return;
    }

    let isMounted = true;
    const timeout = window.setTimeout(() => {
      if (isMounted) setDetection("unknown");
    }, 2200);

    navigatorWithApps.getInstalledRelatedApps()
      .then((apps) => {
        if (!isMounted) return;
        const installed = apps.some(
          (app) => app.platform === "play" && app.id === ANDROID_PACKAGE
        );
        // [] não garante ausência caso falte a associação no app Android.
        // O rótulo é uma ação, não uma declaração sobre o aparelho.
        setDetection(installed ? "installed" : "not-found");
      })
      .catch(() => {
        if (isMounted) setDetection("unknown");
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
    };
  }, []);

  if (detection === "hidden" || detection === "checking") return null;

  const isInstalled = detection === "installed";
  const isIOS = detection === "ios";
  const href = isIOS
    ? IOS_APP.appStoreUrl
    : isInstalled
      ? APP_OPEN_URL
      : PLAY_STORE_URL;
  const label = isIOS
    ? "Ver app"
    : isInstalled
      ? "Abrir app"
      : detection === "unknown"
        ? "Ver app"
        : "Instalar";

  return (
    <section
      aria-label="Aplicativo Achados do Alê"
      className="mx-auto w-full max-w-6xl px-4 pb-5 pt-3 md:hidden"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#102640] p-3 shadow-[0_8px_26px_rgba(0,0,0,.15)]">
        <Image
          src="/icon.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-xl bg-white object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-white">
            {isInstalled ? "Abra o Achados do Alê" : "Achados do Alê no celular"}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#b8cce1]">
            {isInstalled
              ? "Acesse seus favoritos e alertas personalizados."
              : "Escolha categorias, favorite produtos e receba notificações."}
          </p>
        </div>
        <a
          href={href}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-gold px-3 py-2 text-xs font-extrabold text-[#07111f] transition hover:bg-[#ffd16b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label={
            isInstalled
              ? "Abrir o aplicativo Achados do Alê no Android"
              : "Conhecer o aplicativo Achados do Alê"
          }
          // Intent é navegação no aparelho, não deve abrir em nova aba.
          rel={isInstalled ? undefined : "noopener noreferrer"}
          target={isInstalled ? undefined : "_blank"}
        >
          {label}
        </a>
      </div>
    </section>
  );
}
