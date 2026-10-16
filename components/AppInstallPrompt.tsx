"use client";

import { useEffect, useState } from "react";

const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.achadodoale.app";
const IOS_URL = ""; // Preencher somente quando o app iOS estiver publicado.
const IOS_PROMPT_ENABLED = false;
const STORAGE_KEY = "achados-app-install-prompt-dismissed-v1";
const DISMISS_DAYS = 14;

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  return "other";
}

export default function AppInstallPrompt() {
  const [platform, setPlatform] = useState<Platform>("other");
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    let vivo = true;
    let timer: number | undefined;
    const current = detectPlatform();
    setPlatform(current);
    if (current !== "android" && !(current === "ios" && IOS_PROMPT_ENABLED && IOS_URL)) return;
    if (window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone) return;
    try {
      if (Number(localStorage.getItem(STORAGE_KEY) || 0) > Date.now()) return;
    } catch { /* Armazenamento indisponível. */ }

    const preparar = async () => {
      if (current === "android") {
        const navegador = navigator as Navigator & {
          getInstalledRelatedApps?: () => Promise<Array<{ platform?: string; id?: string }>>;
        };
        if (typeof navegador.getInstalledRelatedApps === "function") {
          try {
            const apps = await navegador.getInstalledRelatedApps();
            if (!vivo) return;
            if (apps.some(a => a.platform === "play" && a.id === "com.achadodoale.app")) {
              setInstalled(true);
              return; // Não oferecer instalação a quem já possui o aplicativo.
            }
          } catch { /* Alguns navegadores não suportam a verificação. */ }
        }
      }
      if (vivo) timer = window.setTimeout(() => { if (vivo) setVisible(true); }, 3500);
    };
    void preparar();
    return () => { vivo = false; if (timer !== undefined) window.clearTimeout(timer); };
  }, []);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISS_DAYS * 86400000)); } catch { /* Storage indisponível */ }
  }

  if (!visible || installed || (platform !== "android" && !(platform === "ios" && IOS_PROMPT_ENABLED && IOS_URL))) return null;
  const url = platform === "android" ? ANDROID_URL : IOS_URL;

  return (
    <aside role="dialog" aria-modal="false" aria-label="Conheça o aplicativo Achados do Alê" className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-md animate-[appPromptUp_.3s_ease-out] rounded-2xl border border-white/15 bg-[#10243a] p-4 text-white shadow-[0_12px_42px_rgba(0,0,0,.45)] sm:bottom-5">
      <button type="button" aria-label="Fechar convite para instalar o aplicativo" onClick={dismiss} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg text-white/80 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400">×</button>
      <div className="flex items-start gap-3 pr-7">
        <img src="/icon.png" alt="Ícone Achados do Alê" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl bg-white object-contain" />
        <div>
          <p className="text-sm font-bold leading-snug">Leve os achadinhos com você!</p>
          <p className="mt-1 text-xs leading-relaxed text-white/75">Receba alertas das ofertas que te interessam, escolha seus produtos favoritos e salve seus achados.</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={dismiss} className="flex-1 rounded-xl bg-[#f5b942] px-4 py-2.5 text-center text-sm font-bold text-[#10243a] transition hover:bg-[#ffd06b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400">Instalar aplicativo</a>
        <button type="button" onClick={dismiss} className="rounded-xl border border-white/15 px-3 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10">Agora não</button>
      </div>
      <style jsx>{`@keyframes appPromptUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } } @media (prefers-reduced-motion: reduce) { aside { animation: none; } }`}</style>
    </aside>
  );
}
