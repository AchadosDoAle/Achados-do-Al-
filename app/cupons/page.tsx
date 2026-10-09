import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import CupomCard from "@/components/CupomCard";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarCupons, listarCuponsParaBuscaPublica } from "@/lib/coupons-repo";
import { cupomCorrespondeBuscaPublica } from "@/lib/busca-cupons";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Cupons de desconto",
  description: "Cupons de desconto selecionados de grandes lojas, com validade e termos de uso.",
  alternates: { canonical: "/cupons" },
};

export default async function CuponsPage({
  searchParams,
}: {
  searchParams?: { busca?: string | string[]; pagina?: string | string[] };
}) {
  const valorBusca = searchParams?.busca;
  const busca = (Array.isArray(valorBusca) ? valorBusca[0] : valorBusca ?? "").trim().slice(0, 120);
  const supabase = criarClientePublico();
  // Busca todo o histórico SOMENTE quando o visitante digitar um termo.
  const todos = busca
    ? await listarCuponsParaBuscaPublica(supabase)
    : await listarCupons(supabase);
  const encontrados = todos.filter((c) =>
    c.ativo && (!busca || cupomCorrespondeBuscaPublica(c, busca))
  );
  const porPagina = 30;
  const valorPagina = searchParams?.pagina;
  const numeroPagina = Number(Array.isArray(valorPagina) ? valorPagina[0] : valorPagina);
  const paginaSolicitada = Number.isSafeInteger(numeroPagina) && numeroPagina > 0 ? numeroPagina : 1;
  const totalPaginas = busca ? Math.max(1, Math.ceil(encontrados.length / porPagina)) : 1;
  const pagina = Math.min(paginaSolicitada, totalPaginas);
  const cupons = busca
    ? encontrados.slice((pagina - 1) * porPagina, pagina * porPagina)
    : encontrados;
  const paginaHref = (numero: number) => `/cupons?busca=${encodeURIComponent(busca)}&pagina=${numero}`;
  const agora = Date.now();
  const cuponsRelampago = cupons.filter(
    (c) => c.relampago && (!c.validade || new Date(c.validade).getTime() >= agora)
  );
  const cuponsRegulares = cupons.filter((c) => !cuponsRelampago.some((r) => r.id === c.id));

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
        <form action="/cupons" method="get" role="search" className="mb-5 flex flex-wrap items-center gap-2">
          <input type="search" name="busca" defaultValue={busca}
            aria-label="Pesquisar cupons" placeholder="Buscar código, loja ou desconto..."
            className="min-w-0 flex-1 rounded-xl bg-card px-4 py-3 text-sm text-text outline-none ring-1 ring-white/10 focus:ring-gold" />
          <button type="submit" className="rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-bg">
            Pesquisar
          </button>
          {busca && (
            <Link href="/cupons" className="rounded-xl bg-card px-4 py-3 text-sm font-semibold text-text ring-1 ring-white/10">
              Limpar
            </Link>
          )}
        </form>
        {busca && (
          <p className="mb-4 text-sm text-text-muted" role="status">
            {encontrados.length} {encontrados.length === 1 ? "cupom encontrado" : "cupons encontrados"} para “{busca}”.
          </p>
        )}

        {cupons.length === 0 ? (
          <p className="text-sm text-text-muted">
            {busca ? "Nenhum cupom corresponde à sua pesquisa." : "Nenhum cupom cadastrado ainda."}
          </p>
        ) : (
          <div className="space-y-8">
            {cuponsRelampago.length > 0 && (
              <section aria-labelledby="cupons-relampago">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-lg ring-1 ring-amber-300/20">⚡</span>
                  <div>
                    <h2 id="cupons-relampago" className="font-display text-xl font-bold text-text">CUPONS RELÂMPAGO</h2>
                    <p className="text-xs text-text-muted">Oportunidades rápidas destacadas no painel.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cuponsRelampago.map((cupom) => (
                    <CupomCard key={cupom.id} cupom={cupom} />
                  ))}
                </div>
              </section>
            )}

            {cuponsRegulares.length > 0 && (
              <section aria-labelledby="todos-cupons">
                {cuponsRelampago.length > 0 && (
                  <h2 id="todos-cupons" className="mb-3 font-display text-lg font-bold text-text">Todos os cupons</h2>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cuponsRegulares.map((cupom) => (
                    <CupomCard key={cupom.id} cupom={cupom} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        {busca && totalPaginas > 1 && (
          <nav aria-label="Páginas dos cupons encontrados" className="mt-7 flex items-center justify-center gap-4 text-sm">
            {pagina > 1 ? (
              <Link href={paginaHref(pagina - 1)} className="rounded-xl bg-card px-4 py-2 font-semibold text-text">← Anterior</Link>
            ) : <span className="px-4 py-2 text-text-muted/40">← Anterior</span>}
            <span className="text-text-muted">Página {pagina} de {totalPaginas}</span>
            {pagina < totalPaginas ? (
              <Link href={paginaHref(pagina + 1)} className="rounded-xl bg-card px-4 py-2 font-semibold text-text">Próxima →</Link>
            ) : <span className="px-4 py-2 text-text-muted/40">Próxima →</span>}
          </nav>
        )}
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
