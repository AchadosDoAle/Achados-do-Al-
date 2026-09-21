import type { Metadata } from "next";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import CupomCard from "@/components/CupomCard";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarCupons } from "@/lib/coupons-repo";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Cupons de desconto",
  description: "Cupons de desconto selecionados de grandes lojas, com validade e termos de uso.",
  alternates: { canonical: "/cupons" },
};

export default async function CuponsPage() {
  const supabase = criarClientePublico();
  const todos = await listarCupons(supabase);
  const cupons = todos.filter((c) => c.ativo);

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <h1 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-text">
          🎟️ Cupons de desconto
        </h1>
        <p className="mb-4 text-sm text-text-muted">
          Cupons cinza com a tarja ESGOTADO já venceram.
        </p>

        {cupons.length === 0 ? (
          <p className="text-sm text-text-muted">
            Nenhum cupom cadastrado ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cupons.map((cupom) => (
              <CupomCard key={cupom.id} cupom={cupom} />
            ))}
          </div>
        )}
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
