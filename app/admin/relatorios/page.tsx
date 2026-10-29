"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";

type Periodo = "24h" | "7d" | "30d" | "todos";

// O Supabase/PostgREST pode devolver no máximo 1.000 linhas por requisição,
// mesmo que o cliente peça 5.000. Percorrer páginas evita que o "Todo o
// período" e os gráficos parem silenciosamente nos primeiros 1.000 registros.
const TAMANHO_LOTE = 1000;
type TabelaRelatorio = "offers" | "analytics_pageviews" | "analytics_sessions" | "clicks" | "publications";

async function consultarTodosRegistros<T>(
  supabase: ReturnType<typeof criarClienteNavegador>,
  tabela: TabelaRelatorio,
  campos: string,
  colunaOrdenacao: string,
  colunaDesempate: string,
  desde: string | null
): Promise<{ data: T[]; error: { message: string } | null }> {
  const acumulados: T[] = [];
  let inicio = 0;

  for (;;) {
    let consulta = supabase
      .from(tabela)
      .select(campos)
      .order(colunaOrdenacao, { ascending: false })
      .order(colunaDesempate, { ascending: false })
      .range(inicio, inicio + TAMANHO_LOTE - 1);
    if (desde) consulta = consulta.gte(colunaOrdenacao, desde);

    const { data, error } = await consulta;
    if (error) return { data: [], error };

    const lote = (data ?? []) as unknown as T[];
    acumulados.push(...lote);
    if (lote.length < TAMANHO_LOTE) return { data: acumulados, error: null };
    inicio += TAMANHO_LOTE;
  }
}

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
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
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
  missingSettings?: string[];
};

type DiagnosticoRastreamento = {
  status: "ok" | "warning" | "missing_rpc" | "permission" | "error";
  message: string;
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
  const [erroPageviews, setErroPageviews] = useState<string | null>(null);
  const [erroSessoes, setErroSessoes] = useState<string | null>(null);
  const [erroCliques, setErroCliques] = useState<string | null>(null);
  const [erroPublicacoes, setErroPublicacoes] = useState<string | null>(null);
  const [erroOfertas, setErroOfertas] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoRastreamento | null>(null);
  const [diagnosticando, setDiagnosticando] = useState(false);

  const testarRastreamento = useCallback(async (testeReal = false) => {
    setDiagnosticando(true);
    try {
      const resposta = await fetch("/api/admin/analytics-diagnostics", { method: testeReal ? "POST" : "GET", cache: "no-store" });
      if (!resposta.ok) throw new Error("Não foi possível consultar o diagnóstico.");
      setDiagnostico((await resposta.json()) as DiagnosticoRastreamento);
    } catch {
      setDiagnostico({ status: "error", message: "Não foi possível verificar a função de rastreamento. Atualize a página e tente novamente." });
    } finally {
      setDiagnosticando(false);
    }
  }, []);

  const carregarOnline = useCallback(async () => {
    const desde = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from("analytics_sessions")
      .select("visitor_id", { count: "exact", head: true })
      .gte("last_seen", desde);

    if (!error) setOnlineAgora(count ?? 0);
  }, [supabase]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const desde = inicioPeriodo(periodo);

    const [resOfertas, resPageviews, resSessoes, resCliques, resPublicacoes] = await Promise.all([
      consultarTodosRegistros<OfertaResumo>(
        supabase, "offers", "id,slug,titulo,loja,categoria,status,validade_promocao", "criado_em", "id", null
      ),
      consultarTodosRegistros<Pageview>(
        supabase, "analytics_pageviews",
        "visitor_id,path,referrer,source,device_type,utm_source,utm_medium,utm_campaign,criado_em",
        "criado_em", "id", desde
      ),
      consultarTodosRegistros<Sessao>(
        supabase, "analytics_sessions",
        "visitor_id,last_seen,source,device_type,current_path,utm_source,utm_medium,utm_campaign",
        "last_seen", "visitor_id", desde
      ),
      consultarTodosRegistros<LinhaClique>(
        supabase, "clicks", "offer_id,origem,criado_em,offers(titulo,loja,categoria)",
        "criado_em", "id", desde
      ),
      consultarTodosRegistros<{ status: string; enviado_em: string | null }>(
        supabase, "publications", "status,enviado_em", "enviado_em", "id", desde
      ),
    ]);

    setOfertas((resOfertas.data ?? []) as OfertaResumo[]);
    setPageviews((resPageviews.data ?? []) as Pageview[]);
    setSessoes((resSessoes.data ?? []) as Sessao[]);
    setCliques((resCliques.data ?? []) as unknown as LinhaClique[]);
    setPublicacoes((resPublicacoes.data ?? []) as { status: string; enviado_em: string | null }[]);
    setErroAnalytics(Boolean(
      resPageviews.error || resSessoes.error || resCliques.error ||
      resOfertas.error || resPublicacoes.error
    ));
    setErroPageviews(resPageviews.error?.message ?? null);
    setErroSessoes(resSessoes.error?.message ?? null);
    setErroCliques(resCliques.error?.message ?? null);
    setErroPublicacoes(resPublicacoes.error?.message ?? null);
    setErroOfertas(resOfertas.error?.message ?? null);

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
    void testarRastreamento();
  }, [testarRastreamento]);

  useEffect(() => {
    void carregarOnline();
    const id = window.setInterval(() => void carregarOnline(), 10000);
    return () => window.clearInterval(id);
  }, [carregarOnline]);

  // A contagem básica de pageviews não cria identificador persistente.
  // Visitantes, origem, dispositivo e UTMs vêm somente das sessões detalhadas
  // de quem autorizou métricas adicionais.
  const visitantesUnicos = sessoes.length;
  const fontes = contarPor(sessoes, (item) => item.source);
  const dispositivos = contarPor(sessoes, (item) => item.device_type);
  const paginas = contarPor(pageviews, (item) => tituloPagina(item.path, ofertas));
  const campanhas = contarPor(
    sessoes.filter((item) => item.utm_campaign),
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
      ["Resumo", "Visitantes com métricas", visitantesUnicos],
      ["Resumo", "Online com métricas", onlineAgora],
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
    <div className="flex w-full min-w-0 max-w-full flex-col gap-6 print:gap-4">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
          <button onClick={() => void carregar()} disabled={carregando} className="admin-action-soft rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">
            ↻ Atualizar dados
          </button>
          <button onClick={() => window.print()} className="admin-action-soft rounded-xl border px-4 py-2 text-sm font-semibold">
            🖨️ Imprimir / PDF
          </button>
          <button onClick={exportarCSV} className="admin-action rounded-xl border px-4 py-2 text-sm font-semibold">
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {erroAnalytics && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Não foi possível consultar todas as métricas do Supabase.</p>
          {erroPageviews && <p className="mt-1">Visualizações: {erroPageviews}</p>}
          {erroSessoes && <p className="mt-1">Sessões: {erroSessoes}</p>}
          {erroCliques && <p className="mt-1">Cliques: {erroCliques}</p>}
          {erroPublicacoes && <p className="mt-1">Publicações: {erroPublicacoes}</p>}
          {erroOfertas && <p className="mt-1">Ofertas: {erroOfertas}</p>}
          <p className="mt-2">Verifique as tabelas, as permissões e o script <strong>supabase/analytics.sql</strong>. Não execute SQL sem antes confirmar o erro.</p>
        </div>
      )}

      <section className="rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm print:hidden" aria-label="Diagnóstico da coleta de acessos">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-ink">Diagnóstico do rastreamento</h2>
            <p className="mt-1 text-sm text-ink/55">Consulta os registros atuais. Ao clicar em testar, cria uma visita temporária, verifica a gravação e a leitura e depois a remove.</p>
          </div>
          <button type="button" onClick={() => void testarRastreamento(true)} disabled={diagnosticando} className="admin-action-soft rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {diagnosticando ? "Testando..." : "Testar gravação e leitura"}
          </button>
        </div>
        <p className={`mt-3 text-sm font-medium ${diagnostico?.status === "ok" ? "text-emerald-700" : diagnostico ? "text-amber-800" : "text-ink/55"}`}>
          {diagnostico?.message ?? "Verificando configuração..."}
        </p>
      </section>

      <section className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Cartao rotulo="Online c/ métricas" valor={onlineAgora} destaque />
        <Cartao rotulo="Visualizações" valor={pageviews.length} />
        <Cartao rotulo="Visitantes c/ métricas" valor={visitantesUnicos} />
        <Cartao rotulo="Cliques de saída" valor={cliques.length} />
        <Cartao rotulo="CTR aprox." valor={`${ctr.toFixed(1)}%`} />
        <Cartao rotulo="Ofertas ativas" valor={publicadas} />
        <Cartao rotulo="Expiradas" valor={expiradas} />
        <Cartao rotulo="Envios / falhas" valor={`${enviados} / ${falhas}`} />
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <ListaContagem titulo="Acessos por dia" subtitulo="Evolução das visualizações no período selecionado." dados={acessosPorDia} total={pageviews.length} limite={14} />
        <ListaContagem titulo="Cliques por dia" subtitulo="Evolução dos cliques de saída para as lojas." dados={cliquesPorDia} total={cliques.length} limite={14} />
        <ListaContagem titulo="De onde vêm os acessos" subtitulo="Origem registrada somente nas sessões que autorizaram métricas adicionais." dados={fontes} total={sessoes.length} />
        <ListaContagem titulo="Dispositivos" subtitulo="Tipo de aparelho disponível somente nas sessões com métricas autorizadas." dados={dispositivos} total={sessoes.length} />
        <ListaContagem titulo="Páginas mais acessadas" subtitulo="Visualizações por página neste período." dados={paginas} total={pageviews.length} limite={8} />
        <ListaContagem titulo="Ofertas que mais geraram cliques" subtitulo="Cliques no redirecionamento de afiliado." dados={cliquesPorOferta} total={cliques.length} limite={8} />
        <ListaContagem titulo="Cliques por loja" dados={cliquesPorLoja} total={cliques.length} limite={8} />
        <ListaContagem titulo="Cliques por categoria" dados={cliquesPorCategoria} total={cliques.length} limite={8} />
      </div>

      {Object.keys(campanhas).length > 0 && (
        <ListaContagem titulo="Campanhas UTM" subtitulo="Campanhas identificadas nas sessões que autorizaram métricas adicionais." dados={campanhas} total={sessoes.length} limite={10} />
      )}

      <section className="min-w-0 max-w-full rounded-[22px] bg-white p-5 ring-1 ring-brand/10 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Idade e gênero</h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              Dados demográficos agregados do Google Analytics 4. O site não tenta inferir essas características por conta própria.
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${demografia.configured ? "bg-trust/10 text-trust" : "bg-ink/5 text-ink/50"}`}>
            {demografia.error ? "GA4: falha na conexão" : demografia.configured ? "GA4 Data API conectada" : "GA4 Data API pendente"}
          </span>
        </div>

        {demografia.configured && (demografia.age.length > 0 || demografia.gender.length > 0) ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ListaDemografica titulo="Faixas de idade" dados={demografia.age} />
            <ListaDemografica titulo="Gênero" dados={demografia.gender} />
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#F7F4FA] p-4 text-sm leading-6 text-ink/65">
            {demografia.error ? (
              <span>Não foi possível consultar a propriedade GA4: {demografia.error} Verifique o ID da propriedade, a API habilitada e o acesso de Leitor da conta de serviço.</span>
            ) : !demografia.configured ? (
              <span>
                O rastreamento do Google Analytics já está previsto no site; para exibir idade e gênero aqui falta habilitar a Google Analytics Data API e configurar as credenciais na Vercel.
                {(demografia.missingSettings?.length ?? 0) > 0 && (
                  <span className="mt-2 block font-semibold">Variáveis ausentes: {demografia.missingSettings?.join(", ")}.</span>
                )}
                <span className="mt-2 block">Não envie a chave privada em mensagens nem a coloque no GitHub. Esses dados só ficam disponíveis quando o Google permite a exibição agregada.</span>
              </span>
            ) : (
              "A conexão com o GA4 está funcionando, mas o Google não retornou faixas de idade ou gênero neste período. Tente 30 dias; dados demográficos podem ser omitidos por limites de privacidade."
            )}
          </div>
        )}

        <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-brand print:hidden">
          Abrir Google Analytics ↗
        </a>
      </section>

      <section className="min-w-0 max-w-full rounded-[22px] bg-white p-5 ring-1 ring-brand/10 shadow-sm">
        <h2 className="font-display text-lg font-bold text-ink">Acessos recentes</h2>
        <p className="mt-1 text-sm text-ink/55">Últimas páginas registradas no período selecionado.</p>
        {recentes.length === 0 ? (
          <div className="mt-4 space-y-2 text-sm text-ink/60">
            {erroPageviews ? (
              <p>Falha ao ler os acessos: {erroPageviews}. Confira o diagnóstico acima.</p>
            ) : diagnostico?.status !== "ok" ? (
              <p>Não há acessos para mostrar e o rastreamento ainda precisa ser verificado. Confira o diagnóstico acima.</p>
            ) : (
              <>
                <p>Nenhum acesso encontrado no período selecionado.</p>
                <p>Para testar: abra a página inicial do site em uma janela anônima, aguarde alguns segundos e clique em <strong>Atualizar dados</strong>. A contagem básica não precisa de aceite de métricas avançadas.</p>
              </>
            )}
          </div>
        ) : (
          <div className="mt-4 w-full max-w-full overflow-x-auto">
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
        “Visualizações” usa a contagem operacional básica das páginas públicas e funciona independentemente do aceite das métricas avançadas. Essa trilha não cria identificador persistente. “Online c/ métricas”, origem, dispositivo e campanhas usam apenas sessões de visitantes que autorizaram métricas adicionais.
      </p>
    </div>
  );
}

function Cartao({ rotulo, valor, destaque = false }: { rotulo: string; valor: string | number; destaque?: boolean }) {
  return (
    <div className={`min-w-0 rounded-[20px] p-4 ring-1 shadow-sm ${destaque ? "bg-brand text-white ring-brand" : "bg-white text-ink ring-brand/10"}`}>
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
    <section className="min-w-0 max-w-full rounded-[22px] bg-white p-5 ring-1 ring-brand/10 shadow-sm">
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
