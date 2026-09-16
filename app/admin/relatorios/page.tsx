"use client";

import { useEffect, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

type LinhaClique = { offer_id: string; offers: { titulo: string; loja: string; categoria: string } | null };

export default function RelatoriosPage() {
  const supabase = criarClienteNavegador();
  const [carregando, setCarregando] = useState(true);
  const [totais, setTotais] = useState({
    publicadas: 0,
    expiradas: 0,
    publicacoesEnviadas: 0,
    publicacoesComFalha: 0,
  });
  const [cliquesPorLoja, setCliquesPorLoja] = useState<Record<string, number>>({});
  const [cliquesPorCategoria, setCliquesPorCategoria] = useState<Record<string, number>>({});
  const [maisAcessadas, setMaisAcessadas] = useState<{ titulo: string; cliques: number }[]>([]);

  useEffect(() => {
    async function carregar() {
      const [{ data: ofertas }, { data: cliques }, { data: publicacoes }] =
        await Promise.all([
          supabase.from("offers").select("status"),
          supabase
            .from("clicks")
            .select("offer_id, offers(titulo, loja, categoria)"),
          supabase.from("publications").select("status"),
        ]);

      const porLoja: Record<string, number> = {};
      const porCategoria: Record<string, number> = {};
      const porOferta: Record<string, number> = {};

      ((cliques ?? []) as unknown as LinhaClique[]).forEach((c) => {
        const loja = c.offers?.loja ?? "Desconhecida";
        const categoria = c.offers?.categoria ?? "Desconhecida";
        const titulo = c.offers?.titulo ?? "Oferta removida";
        porLoja[loja] = (porLoja[loja] ?? 0) + 1;
        porCategoria[categoria] = (porCategoria[categoria] ?? 0) + 1;
        porOferta[titulo] = (porOferta[titulo] ?? 0) + 1;
      });

      setCliquesPorLoja(porLoja);
      setCliquesPorCategoria(porCategoria);
      setMaisAcessadas(
        Object.entries(porOferta)
          .map(([titulo, cliques]) => ({ titulo, cliques }))
          .sort((a, b) => b.cliques - a.cliques)
          .slice(0, 5)
      );

      setTotais({
        publicadas: (ofertas ?? []).filter((o) => o.status === "publicada").length,
        expiradas: (ofertas ?? []).filter((o) => o.status === "expirada").length,
        publicacoesEnviadas: (publicacoes ?? []).filter((p) => p.status === "enviado").length,
        publicacoesComFalha: (publicacoes ?? []).filter((p) => p.status === "erro").length,
      });

      setCarregando(false);
    }
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (carregando) return <p className="text-sm text-ink/60">Carregando...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <Cartao rotulo="Ofertas publicadas" valor={totais.publicadas} />
        <Cartao rotulo="Ofertas expiradas" valor={totais.expiradas} />
        <Cartao rotulo="Publicações enviadas" valor={totais.publicacoesEnviadas} />
        <Cartao rotulo="Falhas de envio" valor={totais.publicacoesComFalha} />
      </div>

      <ListaContagem titulo="Cliques por loja" dados={cliquesPorLoja} />
      <ListaContagem titulo="Cliques por categoria" dados={cliquesPorCategoria} />

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="font-display text-base font-bold text-ink">
          Ofertas mais acessadas
        </h2>
        {maisAcessadas.length === 0 ? (
          <p className="mt-2 text-sm text-ink/60">Ainda sem cliques registrados.</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-1 text-sm text-ink/80">
            {maisAcessadas.map((item) => (
              <li key={item.titulo} className="flex justify-between">
                <span>{item.titulo}</span>
                <span className="font-medium">{item.cliques}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Cartao({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
      <p className="text-xs text-ink/50">{rotulo}</p>
      <p className="text-2xl font-bold text-ink">{valor}</p>
    </div>
  );
}

function ListaContagem({
  titulo,
  dados,
}: {
  titulo: string;
  dados: Record<string, number>;
}) {
  const entradas = Object.entries(dados).sort((a, b) => b[1] - a[1]);
  return (
    <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
      <h2 className="font-display text-base font-bold text-ink">{titulo}</h2>
      {entradas.length === 0 ? (
        <p className="mt-2 text-sm text-ink/60">Sem dados ainda.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1 text-sm text-ink/80">
          {entradas.map(([chave, valor]) => (
            <li key={chave} className="flex justify-between">
              <span>{chave}</span>
              <span className="font-medium">{valor}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
