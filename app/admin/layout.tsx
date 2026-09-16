import Link from "next/link";
import BotaoSair from "@/components/admin/BotaoSair";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between bg-brand px-4 py-4 text-white">
        <Link href="/admin" className="font-display text-lg font-bold">
          Painel — Achado do Alê
        </Link>
        <BotaoSair />
      </header>
      <nav className="flex gap-4 bg-brand-light/20 px-4 py-2 text-sm">
        <Link href="/admin/ofertas">Ofertas</Link>
        <Link href="/admin/cupons">Cupons</Link>
        <Link href="/admin/integracoes">Integrações</Link>
        <Link href="/admin/relatorios">Relatórios</Link>
      </nav>
      <div className="p-4">{children}</div>
    </div>
  );
}
