"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import OfferCard from "@/components/OfferCard";
import { Oferta } from "@/lib/types";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarFavoritos } from "@/lib/favoritos";

export default function FavoritosPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const ids = listarFavoritos();
      if (ids.length === 0) {
        setCarregando(false);
        return;
      }
      const supabase = criarClientePublico();
      const { data } = await supabase.from("offers").select("*").in("id", ids);
      setOfertas(
        (data ?? []).map((linha: any) => ({
          id: linha.id,
          slug: linha.slug,
          titulo: linha.titulo,
          loja: linha.loja,
          categoria: linha.categoria,
          precoAntigo: linha.preco_antigo ?? undefined,
          precoAtual: Number(linha.preco_atual),
          precoPix: linha.preco_pix ?? undefined,
          parcelas: linha.parcelas ?? undefined,
          valorParcela: linha.valor_parcela ?? undefined,
          parcelamentoSemJuros: linha.parcelamento_sem_juros ?? false,
          cupom: linha.cupom ?? undefined,
          linkProduto: linha.link_produto,
          imagemPrincipal: linha.imagem_principal ?? undefined,
          status: linha.status,
          criadoEm: linha.criado_em,
          atualizadoEm: linha.atualizado_em,
        }))
      );
      setCarregando(false);
    }
    carregar();
  }, []);

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <h1 className="mb-4 font-display text-xl font-bold text-text">
          Seus favoritos
        </h1>
        {carregando ? (
          <p className="text-sm text-text-muted">Carregando...</p>
        ) : ofertas.length === 0 ? (
          <p className="text-sm text-text-muted">
            Toque no coração ♡ de uma oferta para guardá-la aqui. Os
            favoritos ficam salvos só neste navegador.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {ofertas.map((oferta) => (
              <OfferCard key={oferta.id} oferta={oferta} />
            ))}
          </div>
        )}
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
