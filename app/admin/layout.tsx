import Link from "next/link";
import BotaoSair from "@/components/admin/BotaoSair";

const links = [
  { href: "/admin/ofertas", label: "Ofertas" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/integracoes", label: "Integrações" },
  { href: "/admin/relatorios", label: "Relatórios" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand/5 via-cream to-white">
      <header className="sticky top-0 z-20 border-b border-brand/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin" className="font-display text-xl font-bold text-ink">
              Painel — Achado do Alê
            </Link>
            <p className="mt-1 text-sm text-ink/55">
              Gerencie ofertas, cupons e publicações em um painel mais moderno.
            </p>
          </div>
          <BotaoSair />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4">
        <nav className="mb-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-brand/10 bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-brand/25 hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
}
