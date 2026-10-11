import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import CupomCard from "@/components/CupomCard";
import { criarClientePublico } from "@/lib/supabase/public";
import {
  listarCuponsParaBuscaPublica,
  listarCuponsPublicosFiltrados,
  listarLojasCuponsPublicas,
  type FiltroPublicoCupom,
} from "@/lib/coupons-repo";
import { normalizarNomeLoja } from "@/lib/mock-data";
import { cupomCorrespondeBuscaPublica } from "@/lib/busca-cupons";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Cupons de desconto",
  description: "Cupons de desconto selecionados de grandes lojas, com validade e termos de uso.",
  alternates: { canonical: "/cupons" },
};

const FILTROS: { valor: FiltroPublicoCupom; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativos", rotulo: "Ativos" },
  { valor: "vencidos", rotulo: "Vencidos" },
  { valor: "vence-hoje", rotulo: "Vence hoje" },
  { valor: "relampago", rotulo: "⚡ Relâmpago" },
];
const POR_PAGINA = 30;

function fimDeHojeBrasilia(agora: Date): Date {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(agora);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value || "";
  // O Brasil usa UTC-03:00 atualmente; a fronteira do dia é a local de Brasília.
  return new Date(`${valor("year")}-${valor("month")}-${valor("day")}T23:59:59.999-03:00`);
}

function statusDoCupom(validade: string | undefined, agora: number): "ativo" | "vencido" {
  return validade && Date.parse(validade) < agora ? "vencido" : "ativo";
}

export default async function CuponsPage({
  searchParams,
}: {
  searchParams?: {
    busca?: string | string[];
    pagina?: string | string[];
    filtro?: string | string[];
    loja?: string | string[];
  };
}) {
  const primeiro = (valor?: string | string[]) => Array.isArray(valor) ? valor[0] || "" : valor || "";
  const busca = primeiro(searchParams?.busca).trim().slice(0, 120);
  const filtroInformado = primeiro(searchParams?.filtro);
  const filtro: FiltroPublicoCupom = FILTROS.some((f) => f.valor === filtroInformado)
    ? filtroInformado as FiltroPublicoCupom : "todos";
  const loja = primeiro(searchParams?.loja).trim().slice(0, 120);
  const paginaInformada = Number(primeiro(searchParams?.pagina));
  const paginaSolicitada = Number.isSafeInteger(paginaInformada) && paginaInformada > 0 ? paginaInformada : 1;
  const agora = new Date();
  const instanteAtual = agora.getTime();
  const fimDia = fimDeHojeBrasilia(agora);

  const supabase = criarClientePublico();
  const lojasDisponiveisPromise = listarLojasCuponsPublicas(supabase);
  let encontrados = [] as Awaited<ReturnType<typeof listarCuponsParaBuscaPublica>>;
  let total = 0;
  let pagina = paginaSolicitada;

  if (busca) {
    // A busca sem acentos precisa percorrer o histórico. Ela só faz isso
    // quando o usuário pesquisa; os filtros normais têm paginação no servidor.
    const todos = await listarCuponsParaBuscaPublica(supabase);
    encontrados = todos.filter((cupom) => {
      if (!cupom.ativo || !cupomCorrespondeBuscaPublica(cupom, busca)) return false;
      if (loja && normalizarNomeLoja(cupom.loja) !== normalizarNomeLoja(loja)) return false;
      const estado = statusDoCupom(cupom.validade, instanteAtual);
      if (filtro === "ativos" && estado !== "ativo") return false;
      if (filtro === "vencidos" && estado !== "vencido") return false;
      if (filtro === "relampago" && (!cupom.relampago || estado !== "ativo")) return false;
      if (filtro === "vence-hoje" && (!cupom.validade || estado !== "ativo" || Date.parse(cupom.validade) > fimDia.getTime())) return false;
      return true;
    });
    total = encontrados.length;
  } else {
    const resposta = await listarCuponsPublicosFiltrados(supabase, {
      pagina, porPagina: POR_PAGINA, filtro, loja: loja || undefined, agora, fimDoDiaBrasilia: fimDia,
    });
    encontrados = resposta.itens;
    total = resposta.total;
  }

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  if (pagina > totalPaginas) {
    pagina = totalPaginas;
    if (!busca) {
      const resposta = await listarCuponsPublicosFiltrados(supabase, {
        pagina, porPagina: POR_PAGINA, filtro, loja: loja || undefined, agora, fimDoDiaBrasilia: fimDia,
      });
      encontrados = resposta.itens;
    }
  }
  const cupons = busca ? encontrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA) : encontrados;
  const lojas = await lojasDisponiveisPromise;
  const gerarLink = (novoFiltro: FiltroPublicoCupom, numeroPagina = 1) => {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (loja) params.set("loja", loja);
    if (novoFiltro !== "todos") params.set("filtro", novoFiltro);
    if (numeroPagina > 1) params.set("pagina", String(numeroPagina));
    const query = params.toString();
    return query ? `/cupons?${query}` : "/cupons";
  };

  const cuponsRelampago = cupons.filter(
    (cupom) => cupom.relampago && statusDoCupom(cupom.validade, instanteAtual) === "ativo"
  );
  const cuponsRegulares = cupons.filter((cupom) => !cuponsRelampago.some((r) => r.id === cupom.id));
  const filtrosAtivos = Boolean(busca || loja || filtro !== "todos");

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <h1 className="mb-1 flex items-center gap-2 font-display text-xl font-bold text-text">🎟️ Cupons de desconto</h1>
        <p className="mb-5 text-sm text-text-muted">
          Encontre cupons por código, loja e validade. Os esgotados continuam em cinza.
        </p>

        <section className="mb-6 rounded-2xl border border-white/10 bg-card/80 p-3 sm:p-4" aria-label="Filtros de cupons">
          <form action="/cupons" method="get" role="search" className="flex flex-col gap-3">
            <input type="hidden" name="filtro" value={filtro} />
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="search" name="busca" defaultValue={busca} aria-label="Pesquisar cupons"
                placeholder="Buscar cupom, loja ou desconto..."
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-bg/70 px-4 py-3 text-sm text-text outline-none focus:border-gold"
              />
              <select
                name="loja" aria-label="Filtrar cupons por loja" defaultValue={loja}
                className="min-w-0 rounded-xl border border-white/10 bg-bg px-3 py-3 text-sm text-text outline-none focus:border-gold sm:max-w-[220px]"
              >
                <option value="">Todas as lojas</option>
                {loja && !lojas.includes(loja) && <option value={loja}>{loja}</option>}
                {lojas.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
              </select>
              <button type="submit" className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-bg">Pesquisar / Filtrar</button>
              {filtrosAtivos && (
                <Link href="/cupons" className="rounded-xl border border-white/10 bg-bg/80 px-4 py-3 text-center text-sm font-semibold text-text hover:border-white/25">Limpar</Link>
              )}
            </div>
          </form>
          <nav aria-label="Filtrar por situação" className="mt-3 flex flex-wrap gap-2">
            {FILTROS.map((item) => (
              <Link
                key={item.valor}
                href={gerarLink(item.valor)}
                aria-current={filtro === item.valor ? "page" : undefined}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors duration-150 ${
                  filtro === item.valor
                    ? "border-gold bg-gold text-bg"
                    : "border-white/10 bg-white/[0.04] text-text-muted hover:border-gold/40 hover:text-text"
                }`}
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>
        </section>

        <p className="mb-4 text-sm text-text-muted" role="status">
          {total} {total === 1 ? "cupom encontrado" : "cupons encontrados"}
          {filtrosAtivos ? " com os filtros selecionados." : "."}
        </p>

        {cupons.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-card px-4 py-7 text-sm text-text-muted">
            Nenhum cupom corresponde aos filtros. Experimente limpar a busca ou escolher outra loja.
          </div>
        ) : (
          <div className="space-y-8">
            {cuponsRelampago.length > 0 && (
              <section aria-labelledby="cupons-relampago">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-lg ring-1 ring-amber-300/20">⚡</span>
                  <div>
                    <h2 id="cupons-relampago" className="font-display text-xl font-bold text-text">CUPONS RELÂMPAGO</h2>
                    <p className="text-xs text-text-muted">Ofertas rápidas marcadas pelo administrativo.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cuponsRelampago.map((cupom) => <CupomCard key={cupom.id} cupom={cupom} />)}
                </div>
              </section>
            )}
            {cuponsRegulares.length > 0 && (
              <section aria-labelledby="todos-cupons">
                {cuponsRelampago.length > 0 && (
                  <h2 id="todos-cupons" className="mb-3 font-display text-lg font-bold text-text">Outros cupons</h2>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cuponsRegulares.map((cupom) => <CupomCard key={cupom.id} cupom={cupom} />)}
                </div>
              </section>
            )}
          </div>
        )}

        {totalPaginas > 1 && (
          <nav aria-label="Paginação dos cupons" className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm">
            {pagina > 1 ? <Link href={gerarLink(filtro, pagina - 1)} className="rounded-xl bg-card px-4 py-2 font-semibold text-text">← Anterior</Link> : <span className="px-4 py-2 text-text-muted/50">← Anterior</span>}
            <span className="text-text-muted">Página {pagina} de {totalPaginas}</span>
            {pagina < totalPaginas ? <Link href={gerarLink(filtro, pagina + 1)} className="rounded-xl bg-card px-4 py-2 font-semibold text-text">Próxima →</Link> : <span className="px-4 py-2 text-text-muted/50">Próxima →</span>}
          </nav>
        )}
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
