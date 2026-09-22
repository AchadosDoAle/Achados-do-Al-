"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

type Periodo = "24h" | "7d" | "30d" | "todos";

type OfertaResumo = {
  id: string;
  slug: string;
  titulo: string;
  loja: string;
  categoria: string;
  status: string;
  validade_promocao?: string | null;
};

type LinhaClique = {
  offer_id: string;
  origem: string | null;
  criado_em: string;
  offers: { titulo: string; loja: string; categoria: string } | null;
};

type Pageview = {
  visitor_id: string;
  path: string;
  referrer: string | null;
  source: string | null;
  device_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  criado_em: string;
};

type Sessao = {
  visitor_id: string;
  last_seen: string;
  source: string | null;
  device_type: string | null;
  current_path: string | null;
};

type LinhaRecente = {
  quando: string;
  pagina: string;
  origem: string;
  dispositivo: string;
};

type Demografia = {
  configured: boolean;
  age: { label: string; users: number }[];
  gender: { label: string; users: number }[];
  error?: string;
};

const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "24h", rotulo: "Últimas 24h" },
  { valor: "7d", rotulo: "7 dias" },
  { valor: "30d", rotulo: "30 dias" },
  { valor: "todos", rotulo: "Todo o período" },
];

function inicioPeriodo(periodo: Periodo) {
  if (periodo === "todos") return null;
  const horas = periodo === "24h" ? 24 : periodo === "7d" ? 24 * 7 : 24 * 30;
  return new Date(Date.now() - horas * 60 * 60 * 1000).toISOString();
}

function validadePassou(validade?: string | null) {
  if (!validade) return false;
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return validade.slice(0, 10) < hoje;
}

function contarPor<T>(itens: T[], obter: (item: T) => string | null | undefined) {
  const resultado: Record<string, number> = {};
  itens.forEach((item) => {
    const chave = obter(item)?.trim() || "Desconhecido";
    resultado[chave] = (resultado[chave] ?? 0) + 1;
  });
  return resultado;
}

function tituloPagina(path: string, ofertas: OfertaResumo[]) {
  if (path === "/" || path.startsWith("/?")) return "Home";
  if (path.startsWith("/cupons")) return "Cupons";
  if (path.startsWith("/categorias")) return "Categorias";
  if (path.startsWith("/favoritos")) return "Favoritos";
  const slug = path.match(/^\/oferta\/([^/?#]+)/)?.[1];
  if (slug) {
    return ofertas.find((oferta) => oferta.slug === slug)?.titulo ?? `Oferta: ${decodeURIComponent(slug)}`;
  }
  return path;
}

function csvEscape(valor: string | number) {
  const texto = String(valor ?? "");
  return `"${texto.replace(/"/g, '""')}"`;
}

export default function RelatoriosPage() {
  const supabase = useMemo(() => criarClienteNavegador(), []);
  const [periodo, setPeriodo] = useState<Periodo>("7d");
  const [carregando, setCarregando] = useState(true);
  const [erroAnalytics, setErroAnalytics] = useState(false);
  const [onlineAgora, setOnlineAgora] = useState(0);
  const [ofertas, setOfertas] = useState<OfertaResumo[]>([]);
  const [pageviews, setPageviews] = useState<Pageview[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [cliques, setCliques] = useState<LinhaClique[]>([]);
  const [publicacoes, setPublicacoes] = useState<{ status: string; enviado_em: string | null }[]>([]);
  const [demografia, setDemografia] = useState<Demografia>({ configured: false, age: [], gender: [] });

  const carregarOnline = useCallback(async () => {
    const desde = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from("analytics_sessions")
      .select("visitor_id")
      .gte("last_seen", desde);

    if (!error) setOnlineAgora((data ?? []).length);
  }, [supabase]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const desde = inicioPeriodo(periodo);

    let consultaPageviews = supabase
      .from("analytics_pageviews")
      .select("visitor_id,path,referrer,source,device_type,utm_source,utm_medium,utm_campaign,criado_em")
      .order("criado_em", { ascending: false })
      .limit(5000);

    let consultaSessoes = supabase
      .from("analytics_sessions")
      .select("visitor_id,last_seen,source,device_type,current_path")
      .order("last_seen", { ascending: false })
      .limit(5000);

    let consultaCliques = supabase
      .from("clicks")
      .select("offer_id,origem,criado_em,offers(titulo,loja,categoria)")
      .order("criado_em", { ascending: false })
      .limit(5000);

    let consultaPublicacoes = supabase
      .from("publications")
      .select("status,enviado_em")
      .order("enviado_em", { ascending: false })
      .limit(5000);

    if (desde) {
      consultaPageviews = consultaPageviews.gte("criado_em", desde);
      consultaSessoes = consultaSessoes.gte("last_seen", desde);
      consultaCliques = consultaCliques.gte("criado_em", desde);
      consultaPublicacoes = consultaPublicacoes.gte("enviado_em", desde);
    }

    const [resOfertas, resPageviews, resSessoes, resCliques, resPublicacoes] = await Promise.all([
      supabase.from("offers").select("id,slug,titulo,loja,categoria,status,validade_promocao"),
      consultaPageviews,
      consultaSessoes,
      consultaCliques,
      consultaPublicacoes,
    ]);

    setOfertas((resOfertas.data ?? []) as OfertaResumo[]);
    setPageviews((resPageviews.data ?? []) as Pageview[]);
    setSessoes((resSessoes.data ?? []) as Sessao[]);
    setCliques((resCliques.data ?? []) as unknown as LinhaClique[]);
    setPublicacoes((resPublicacoes.data ?? []) as { status: string; enviado_em: string | null }[]);
    setErroAnalytics(Boolean(resPageviews.error || resSessoes.error));

    try {
      const respostaDemografia = await fetch(`/api/admin/ga4-demographics?periodo=${periodo}`, { cache: "no-store" });
      const dadosDemografia = (await respostaDemografia.json()) as Demografia;
      setDemografia(dadosDemografia);
    } catch {
      setDemografia({ configured: false, age: [], gender: [] });
    }

    setCarregando(false);
  }, [periodo, supabase]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    void carregarOnline();
    const id = window.setInterval(() => void carregarOnline(), 10000);
    return () => window.clearInterval(id);
  }, [carregarOnline]);

  const visitantesUnicos = new Set(pageviews.map((item) => item.visitor_id)).size;
  const fontes = contarPor(pageviews, (item) => item.source);
  const dispositivos = contarPor(pageviews, (item) => item.device_type);
  const paginas = contarPor(pageviews, (item) => tituloPagina(item.path, ofertas));
  const campanhas = contarPor(
    pageviews.filter((item) => item.utm_campaign),
    (item) => item.utm_campaign
  );
  const acessosPorDia = contarPor(pageviews, (item) => new Date(item.criado_em).toLocaleDateString("pt-BR"));
  const cliquesPorDia = contarPor(cliques, (item) => new Date(item.criado_em).toLocaleDateString("pt-BR"));
  const cliquesPorLoja = contarPor(cliques, (item) => item.offers?.loja);
  const cliquesPorCategoria = contarPor(cliques, (item) => item.offers?.categoria);
  const cliquesPorOferta = contarPor(cliques, (item) => item.offers?.titulo ?? "Oferta removida");

  const publicadas = ofertas.filter((o) => o.status === "publicada" && !validadePassou(o.validade_promocao)).length;
  const expiradas = ofertas.filter((o) => o.status === "expirada" || validadePassou(o.validade_promocao)).length;
  const enviados = publicacoes.filter((p) => p.status === "enviado").length;
  const falhas = publicacoes.filter((p) => p.status === "erro").length;
  const ctr = pageviews.length > 0 ? (cliques.length / pageviews.length) * 100 : 0;

  const recentes: LinhaRecente[] = pageviews.slice(0, 12).map((item) => ({
    quando: item.criado_em,
    pagina: tituloPagina(item.path, ofertas),
    origem: item.source || "Direto",
    dispositivo: item.device_type || "Desconhecido",
  }));

  function exportarCSV() {
    const linhas: (string | number)[][] = [
      ["RELATÓRIO ACHADO DO ALÊ", "", ""],
      ["Período", PERIODOS.find((p) => p.valor === periodo)?.rotulo ?? periodo, ""],
      ["Métrica", "Item", "Valor"],
      ["Resumo", "Visualizações", pageviews.length],
      ["Resumo", "Visitantes únicos", visitantesUnicos],
      ["Resumo", "Online agora", onlineAgora],
      ["Resumo", "Cliques de saída", cliques.length],
      ["Resumo", "CTR aproximada", `${ctr.toFixed(1)}%`],
      ["Resumo", "Ofertas publicadas", publicadas],
      ["Resumo", "Ofertas expiradas", expiradas],
      ...Object.entries(fontes).map(([item, valor]) => ["Origem dos acessos", item, valor]),
      ...Object.entries(dispositivos).map(([item, valor]) => ["Dispositivos", item, valor]),
      ...Object.entries(paginas).map(([item, valor]) => ["Páginas mais acessadas", item, valor]),
      ...Object.entries(acessosPorDia).map(([item, valor]) => ["Acessos por dia", item, valor]),
      ...Object.entries(cliquesPorDia).map(([item, valor]) => ["Cliques por dia", item, valor]),
      ...Object.entries(cliquesPorLoja).map(([item, valor]) => ["Cliques por loja", item, valor]),
      ...demografia.age.map((item) => ["Faixa de idade (GA4)", item.label, item.users]),
      ...demografia.gender.map((item) => ["Gênero (GA4)", item.label, item.users]),
      ...Object.entries(cliquesPorCategoria).map(([item, valor]) => ["Cliques por categoria", item, valor]),
    ];

    const csv = "\uFEFF" + linhas.map((linha) => linha.map(csvEscape).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-achado-do-ale-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (carregando) return <p className="text-sm text-ink/60">Carregando relatório...</p>;

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand/60">Analytics</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">Relatórios do site</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink/55">
            Acessos, origem do tráfego, dispositivos, ofertas e desempenho em um único painel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
            className="rounded-xl border border-brand/15 bg-white px-3 py-2 text-sm font-semibold text-ink"
          >
            {PERIODOS.map((item) => (
              <option key={item.valor} value={item.valor}>{item.rotulo}</option>
            ))}
          </select>
          <button onClick={() => window.print()} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink ring-1 ring-brand/15">
            🖨️ Imprimir / PDF
          </button>
          <button onClick={exportarCSV} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {erroAnalytics && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          O rastreamento detalhado ainda não está ativo. Rode <strong>supabase/analytics.sql</strong> no SQL Editor para liberar acessos, fontes, dispositivos e contador em tempo real.
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Cartao rotulo="Online agora" valor={onlineAgora} destaque />
        <Cartao rotulo="Visualizações" valor={pageviews.length} />
        <Cartao rotulo="Visitantes únicos" valor={visitantesUnicos} />
        <Cartao rotulo="Cliques de saída" valor={cliques.length} />
        <Cartao rotulo="CTR aprox." valor={`${ctr.toFixed(1)}%`} />
        <Cartao rotulo="Ofertas ativas" valor={publicadas} />
        <Cartao rotulo="Expiradas" valor={expiradas} />
        <Cartao rotulo="Envios / falhas" valor={`${enviados} / ${falhas}`} />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListaContagem titulo="Acessos por dia" subtitulo="Evolução das visualizações no período selecionado." dados={acessosPorDia} total={pageviews.length} limite={14} />
        <ListaContagem titulo="Cliques por dia" subtitulo="Evolução dos cliques de saída para as lojas." dados={cliquesPorDia} total={cliques.length} limite={14} />
        <ListaContagem titulo="De onde vêm os acessos" subtitulo="Referrer e UTMs registrados pelo próprio site." dados={fontes} total={pageviews.length} />
        <ListaContagem titulo="Dispositivos" subtitulo="Tipo de aparelho usado nos acessos." dados={dispositivos} total={pageviews.length} />
        <ListaContagem titulo="Páginas mais acessadas" subtitulo="Visualizações por página neste período." dados={paginas} total={pageviews.length} limite={8} />
        <ListaContagem titulo="Ofertas que mais geraram cliques" subtitulo="Cliques no redirecionamento de afiliado." dados={cliquesPorOferta} total={cliques.length} limite={8} />
        <ListaContagem titulo="Cliques por loja" dados={cliquesPorLoja} total={cliques.length} limite={8} />
        <ListaContagem titulo="Cliques por categoria" dados={cliquesPorCategoria} total={cliques.length} limite={8} />
      </div>

      {Object.keys(campanhas).length > 0 && (
        <ListaContagem titulo="Campanhas UTM" subtitulo="Campanhas identificadas por utm_campaign." dados={campanhas} total={pageviews.length} limite={10} />
      )}

      <section className="rounded-[22px] bg-white p-5 ring-1 ring-brand/10 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Idade e gênero</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              Dados demográficos agregados do Google Analytics 4. O site não tenta inferir essas características por conta própria.
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${demografia.configured ? "bg-trust/10 text-trust" : "bg-ink/5 text-ink/50"}`}>
            {demografia.configured ? "GA4 conectado" : "GA4 ainda não conectado"}
          </span>
        </div>

        {demografia.configured && (demografia.age.length > 0 || demografia.gender.length > 0) ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ListaDemografica titulo="Faixas de idade" dados={demografia.age} />
            <ListaDemografica titulo="Gênero" dados={demografia.gender} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#F7F4FA] p-4 text-sm leading-6 text-ink/65">
            {demografia.error
              ? "O GA4 está configurado, mas não foi possível carregar os dados demográficos agora. Confira as permissões da Data API e do usuário de serviço."
              : "Para preencher idade e gênero aqui, configure o GA4, ative Google Signals e conecte a Data API. O Google só disponibiliza esses dados para usuários elegíveis e pode aplicar limites mínimos de privacidade."}
          </div>
        )}

        <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-brand print:hidden">
          Abrir Google Analytics ↗
        </a>
      </section>

      <section className="rounded-[22px] bg-white p-5 ring-1 ring-brand/10 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Acessos recentes</h2>
        <p className="mt-1 text-sm text-ink/55">Últimas páginas registradas no período selecionado.</p>
        {recentes.length === 0 ? (
          <p className="mt-4 text-sm text-ink/55">Ainda sem acessos registrados.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="pb-2 pr-4">Horário</th>
                  <th className="pb-2 pr-4">Página</th>
                  <th className="pb-2 pr-4">Origem</th>
                  <th className="pb-2">Dispositivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {recentes.map((item, index) => (
                  <tr key={`${item.quando}-${index}`}>
                    <td className="py-2 pr-4 text-ink/55">{new Date(item.quando).toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-4 font-medium text-ink">{item.pagina}</td>
                    <td className="py-2 pr-4 text-ink/65">{item.origem}</td>
                    <td className="py-2 text-ink/65">{item.dispositivo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs leading-5 text-ink/45">
        “Online agora” considera visitantes com atividade nos últimos 2 minutos e é atualizado a cada 10 segundos. O rastreamento próprio usa um identificador anônimo salvo no navegador e não grava nome, e-mail, telefone ou endereço IP.
      </p>
    </div>
  );
}

function Cartao({ rotulo, valor, destaque = false }: { rotulo: string; valor: string | number; destaque?: boolean }) {
  return (
    <div className={`rounded-[20px] p-4 ring-1 shadow-sm ${destaque ? "bg-brand text-white ring-brand" : "bg-white text-ink ring-brand/10"}`}>
      <p className={`text-xs font-semibold ${destaque ? "text-white/75" : "text-ink/45"}`}>{rotulo}</p>
      <p className="mt-1 text-2xl font-extrabold">{valor}</p>
      {destaque && <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/75"><span className="h-2 w-2 rounded-full bg-trust" /> atualizado ao vivo</span>}
    </div>
  );
}

function ListaDemografica({
  titulo,
  dados,
}: {
  titulo: string;
  dados: { label: string; users: number }[];
}) {
  const total = dados.reduce((soma, item) => soma + item.users, 0);
  return (
    <div className="rounded-2xl bg-[#F7F4FA] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">{titulo}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {dados.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink/70">{item.label}</span>
            <span className="font-semibold text-ink">
              {item.users}{total > 0 ? ` · ${((item.users / total) * 100).toFixed(0)}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListaContagem({
  titulo,
  subtitulo,
  dados,
  total,
  limite = 10,
}: {
  titulo: string;
  subtitulo?: string;
  dados: Record<string, number>;
  total: number;
  limite?: number;
}) {
  const entradas = Object.entries(dados).sort((a, b) => b[1] - a[1]).slice(0, limite);
  const maior = entradas[0]?.[1] ?? 1;

  return (
    <section className="rounded-[22px] bg-white p-5 ring-1 ring-brand/10 shadow-sm">
      <h2 className="font-display text-lg font-bold text-ink">{titulo}</h2>
      {subtitulo && <p className="mt-1 text-sm text-ink/50">{subtitulo}</p>}
      {entradas.length === 0 ? (
        <p className="mt-4 text-sm text-ink/55">Sem dados ainda.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {entradas.map(([chave, valor]) => {
            const percentual = total > 0 ? (valor / total) * 100 : 0;
            return (
              <li key={chave}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{chave}</span>
                  <span className="shrink-0 text-ink/55">{valor} · {percentual.toFixed(0)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand/5">
                  <div className="h-full rounded-full bg-brand/70" style={{ width: `${Math.max(4, (valor / maior) * 100)}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
