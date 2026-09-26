import type { Metadata } from "next";
import Link from "next/link";
import BotaoSair from "@/components/admin/BotaoSair";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/admin/ofertas", label: "Ofertas" },
  { href: "/admin/cupons", label: "Cupons" },
  { href: "/admin/integracoes", label: "Integrações" },
  { href: "/admin/relatorios", label: "Relatórios" },
  { href: "/admin/usuarios", label: "Usuários" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="admin-area min-h-screen bg-[#F1F2F4] text-ink"
      style={{ colorScheme: "light" }}
    >
      <header className="sticky top-0 z-20 border-b border-brand/10 bg-white shadow-sm print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <Link href="/admin" className="font-display text-lg font-bold text-ink sm:text-xl">
              Painel — Achado do Alê
            </Link>
            <p className="hidden text-xs text-ink/50 sm:block">
              Ofertas, cupons e publicações
            </p>
          </div>
          <BotaoSair />
        </div>
      </header>

      <div className="border-b border-brand/10 bg-white print:hidden">
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="admin-action shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">{children}</main>
    </div>
  );
}
