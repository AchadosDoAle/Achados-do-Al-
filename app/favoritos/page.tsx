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
import { listarOfertasPorIds } from "@/lib/offers-repo";

export default function FavoritosPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar(mostrarCarregando = false) {
      if (mostrarCarregando && ativo) setCarregando(true);

      const ids = listarFavoritos();
      if (ids.length === 0) {
        if (ativo) {
          setOfertas([]);
          setCarregando(false);
        }
        return;
      }

      try {
        const supabase = criarClientePublico();
        const novasOfertas = await listarOfertasPorIds(supabase, ids);
        if (ativo) setOfertas(novasOfertas);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar(true);

    // O listener global de Realtime dispara este evento quando alguma oferta
    // muda no banco. Favoritos é uma tela Client Component, então refazemos a
    // consulta para refletir preço, status e demais dados sem F5.
    function aoAtualizarConteudo() {
      void carregar(false);
    }

    window.addEventListener("achado:conteudo-atualizado", aoAtualizarConteudo);

    return () => {
      ativo = false;
      window.removeEventListener("achado:conteudo-atualizado", aoAtualizarConteudo);
    };
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
