"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", label: "Início", icone: "🏠" },
  { href: "/categorias", label: "Categorias", icone: "▦" },
  { href: "/cupons", label: "Cupons", icone: "🎟️" },
  { href: "/favoritos", label: "Favoritos", icone: "♡" },
  {
    href: "/grupo",
    label: "Canal",
    icone: "➤",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  function itemAtivo(href: string) {
    if (href === "/") return false;
    if (href === "/categorias") {
      return pathname === "/categorias" || pathname.startsWith("/categoria/");
    }
    return pathname === href;
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around gap-0 border-t border-white/5 bg-bg-secondary px-1 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden"
    >
      {ITENS.map((item) => {
        const ativo = itemAtivo(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`nav-mobile-item flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1.5 py-1 text-[10px] leading-tight sm:text-[11px] ${
              ativo ? "bg-gold/10 font-semibold text-gold" : "text-text-muted"
            }`}
          >
            <span aria-hidden="true" className="text-lg">
              {item.icone}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
