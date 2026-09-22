"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
            <Link href="/" className="nav-link-modern">
              Início
            </Link>
            <Link href="/categorias" className="nav-link-modern">
              Categorias
            </Link>
            <Link href="/cupons" className="nav-link-modern">
              Cupons
            </Link>
            <Link href="/favoritos" className="nav-link-modern">
              Favoritos
            </Link>
            <Link href="/perdeu" className="nav-link-modern text-gold/90">
              Já perdeu?
            </Link>
            <a
              href="/grupo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-modern rounded-full bg-gold px-4 py-2 text-bg hover:bg-gold-light"
            >
              Entrar no canal
            </a>
          </nav>
        </div>

        <Suspense fallback={<div className="mt-3 h-11 md:hidden" />}>
          <CampoBusca className="mt-3 flex items-center gap-2 rounded-xl2 bg-card px-4 py-2.5 text-text md:hidden" />
        </Suspense>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:hidden">
          <Link
            href="/#ofertas"
            className="btn-modern shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text-muted"
          >
            🔥 Ofertas de agora
          </Link>
          <Link
            href="/perdeu"
            className="btn-modern shrink-0 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold"
          >
            ⏳ Veja o que já perdeu!
          </Link>
        </div>
      </Container>
    </header>
  );
}
