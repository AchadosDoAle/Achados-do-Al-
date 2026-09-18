import Link from "next/link";

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
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-white/5 bg-bg-secondary py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden"
    >
      {ITENS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] text-text-muted"
        >
          <span aria-hidden="true" className="text-lg">
            {item.icone}
          </span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
