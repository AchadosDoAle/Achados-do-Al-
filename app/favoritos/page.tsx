"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
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
    <main className="pb-bottom-nav">
      <Header />
      <section className="p-4">
        <h1 className="mb-4 font-display text-xl font-bold text-ink">
          Seus favoritos
        </h1>
        {carregando ? (
          <p className="text-sm text-ink/60">Carregando...</p>
        ) : ofertas.length === 0 ? (
          <p className="text-sm text-ink/60">
            Toque no coração ♡ de uma oferta para guardá-la aqui. Os
            favoritos ficam salvos só neste navegador.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ofertas.map((oferta) => (
              <OfferCard key={oferta.id} oferta={oferta} />
            ))}
          </div>
        )}
      </section>
      <BottomNav />
    </main>
  );
}
