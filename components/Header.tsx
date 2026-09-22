"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import Container from "./Container";

function CampoBusca({ className }: { className: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [texto, setTexto] = useState(params.get("busca") ?? "");

  function aoBuscar(evento: React.FormEvent) {
    evento.preventDefault();
    const query = texto.trim();
    router.push(query ? `/?busca=${encodeURIComponent(query)}` : "/");
  }

  return (
    <form onSubmit={aoBuscar} className={className}>
      <span aria-hidden="true" className="text-text-muted">
        🔎
      </span>
      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar produtos, lojas, cupons..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
      />
    </form>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-bg-secondary/95 backdrop-blur">
      {/* Google Analytics (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-ZZPY0JEKB9"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-ZZPY0JEKB9');
        `}
      </Script>

      <Container className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Achado do Alê"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="font-display text-lg font-bold tracking-tight text-text">
              Achado<span className="text-gold"> do Alê</span>
            </span>
          </Link>

          <Suspense fallback={<div className="hidden flex-1 md:block" />}>
            <CampoBusca className="hidden flex-1 items-center gap-2 rounded-xl2 bg-card px-4 py-2.5 text-text md:flex md:max-w-md" />
          </Suspense>

          <nav className="hidden items-center gap-6 text-sm font-medium text-text-muted md:flex">
            <Link href="/" className="hover:text-gold">
              Início
            </Link>
            <Link href="/categorias" className="hover:text-gold">
              Categorias
            </Link>
            <Link href="/cupons" className="hover:text-gold">
              Cupons
            </Link>
            <Link href="/favoritos" className="hover:text-gold">
              Favoritos
            </Link>
            <a
              href="/grupo"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-4 py-2 text-bg hover:bg-gold-light"
            >
              Entrar no canal
            </a>
          </nav>
        </div>

        <Suspense fallback={<div className="mt-3 h-11 md:hidden" />}>
          <CampoBusca className="mt-3 flex items-center gap-2 rounded-xl2 bg-card px-4 py-2.5 text-text md:hidden" />
        </Suspense>
      </Container>
    </header>
  );
}