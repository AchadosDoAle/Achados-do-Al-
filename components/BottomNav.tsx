import Link from "next/link";

const ITENS = [
  { href: "/", label: "Início", icone: "🏠" },
  { href: "/categorias", label: "Categorias", icone: "🗂️" },
  { href: "/favoritos", label: "Favoritos", icone: "⭐" },
  {
    href: "https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J",
    label: "Canal",
    icone: "📲",
  },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-ink/10 bg-white py-2"
    >
      {ITENS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-ink/70"
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
