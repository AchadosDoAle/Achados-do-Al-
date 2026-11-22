import { SupabaseClient } from "@supabase/supabase-js";
import { Cupom, CupomFormValues } from "./types";
import { normalizarNomeLoja } from "./mock-data";

// Campos usados pelo modelo Cupom; evita transferir colunas não consumidas.
const CAMPOS_CUPOM = [
  "id", "loja", "nome_cupom", "desconto_percentual", "valor_cupom",
  "descricao", "observacoes", "link_produtos", "link_resgate", "cor_loja",
  "validade", "ativo", "criado_em", "atualizado_em", "publicado_em", "relampago",
].join(",");

// A vitrine pública não usa atualizado_em; mantém observacoes e criado_em
// porque os cartões exibem os termos e usam a data como fallback de publicação.
const CAMPOS_CUPOM_PUBLICO = [
  "id", "loja", "nome_cupom", "desconto_percentual", "valor_cupom",
  "descricao", "observacoes", "link_produtos", "link_resgate", "cor_loja",
  "validade", "ativo", "criado_em", "publicado_em", "relampago",
].join(",");


function linhaParaCupom(linha: any): Cupom {
  return {
    id: linha.id,
    loja: normalizarNomeLoja(linha.loja),
    nomeCupom: linha.nome_cupom,
    descontoPercentual: linha.desconto_percentual ?? undefined,
    valorCupom: linha.valor_cupom ?? undefined,
    descricao: linha.descricao ?? undefined,
    observacoes: linha.observacoes ?? undefined,
    linkProdutos: linha.link_produtos ?? undefined,
    linkResgate: linha.link_resgate ?? undefined,
    corLoja: linha.cor_loja,
    validade: linha.validade ?? undefined,
    ativo: linha.ativo,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
    publicadoEm: linha.publicado_em ?? linha.criado_em,
    relampago: linha.relampago ?? false,
  };
}

function cupomParaLinha(valores: Partial<CupomFormValues>) {
  return {
    loja: valores.loja ? normalizarNomeLoja(valores.loja) : valores.loja,
    nome_cupom: valores.nomeCupom,
    desconto_percentual: valores.descontoPercentual ?? null,
    valor_cupom: valores.valorCupom || null,
    descricao: valores.descricao || null,
    observacoes: valores.observacoes || null,
    link_produtos: valores.linkProdutos || null,
    link_resgate: valores.linkResgate || null,
    cor_loja: valores.corLoja,
    validade: valores.validade || null,
    ativo: valores.ativo ?? true,
    relampago: valores.relampago ?? false,
  };
}

export function cupomExpirado(cupom: Cupom): boolean {
  if (!cupom.validade) return false;
  return new Date(cupom.validade).getTime() < Date.now();
}

export async function listarCuponsPaginados(
  supabase: SupabaseClient,
  pagina = 1,
  itensPorPagina = 30
): Promise<{ itens: Cupom[]; total: number }> {
  const paginaSegura = Math.max(1, pagina);
  const limiteSeguro = Math.max(1, itensPorPagina);
  const inicio = (paginaSegura - 1) * limiteSeguro;
  const fim = inicio + limiteSeguro - 1;

  const { data, error, count } = await supabase
    .from("coupons")
    .select(CAMPOS_CUPOM, { count: "exact" })
    .order("criado_em", { ascending: false })
    .range(inicio, fim);

  if (error) throw error;
  return {
    itens: (data ?? []).map(linhaParaCupom),
    total: count ?? 0,
  };
}

export async function listarCuponsParaBuscaAdmin(
  supabase: SupabaseClient
): Promise<Cupom[]> {
  const TAMANHO_LOTE = 1000;
  const acumulado: any[] = [];
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("coupons")
      .select(CAMPOS_CUPOM)
      .order("criado_em", { ascending: false })
      .range(inicio, inicio + TAMANHO_LOTE - 1);

    if (error) throw error;
    const lote = data ?? [];
    acumulado.push(...lote);

    if (lote.length < TAMANHO_LOTE) break;
    inicio += TAMANHO_LOTE;
  }

  return acumulado.map(linhaParaCupom);
}

/**
 * A pesquisa pública percorre todos os lotes de cupons ativos.
 * Executada SOMENTE quando o visitante efetivamente faz uma busca,
 * evitando a limitação padrão de 1.000 registros do PostgREST.
 * A RLS do Supabase continua sendo aplicada normalmente.
 */
let cuponsBuscaPublicaCache: { valor: Cupom[]; expiraEm: number } | null = null;
let cuponsBuscaPublicaEmAndamento: Promise<Cupom[]> | null = null;

export async function listarCuponsParaBuscaPublica(supabase: SupabaseClient): Promise<Cupom[]> {
  if (cuponsBuscaPublicaCache && cuponsBuscaPublicaCache.expiraEm > Date.now()) {
    return cuponsBuscaPublicaCache.valor;
  }
  if (cuponsBuscaPublicaEmAndamento) return cuponsBuscaPublicaEmAndamento;

  cuponsBuscaPublicaEmAndamento = (async () => {
  const TAMANHO_LOTE = 500;
  const acumulado: Cupom[] = [];
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("coupons")
      .select(CAMPOS_CUPOM_PUBLICO)
      .eq("ativo", true)
      .order("criado_em", { ascending: false })
      .order("id", { ascending: false })
      .range(inicio, inicio + TAMANHO_LOTE - 1);
    if (error) throw error;

    const lote = data ?? [];
    acumulado.push(...lote.map(linhaParaCupom));
    if (lote.length < TAMANHO_LOTE) break;
    inicio += TAMANHO_LOTE;
  }
  cuponsBuscaPublicaCache = { valor: acumulado, expiraEm: Date.now() + 20_000 };
  return acumulado;
  })();

  try {
    return await cuponsBuscaPublicaEmAndamento;
  } finally {
    cuponsBuscaPublicaEmAndamento = null;
  }
}

export async function listarCupons(supabase: SupabaseClient): Promise<Cupom[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select(CAMPOS_CUPOM)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(linhaParaCupom);
}

export async function buscarCupomPorId(
  supabase: SupabaseClient,
  id: string
): Promise<Cupom | null> {
  const { data, error } = await supabase
    .from("coupons")
    .select(CAMPOS_CUPOM)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? linhaParaCupom(data) : null;
}

export async function salvarNovoCupom(
  supabase: SupabaseClient,
  valores: CupomFormValues
): Promise<Cupom> {
  const { data, error } = await supabase
    .from("coupons")
    .insert(cupomParaLinha(valores))
    .select(CAMPOS_CUPOM)
    .single();
  if (error) throw error;
  return linhaParaCupom(data);
}

export async function atualizarCupom(
  supabase: SupabaseClient,
  id: string,
  valores: CupomFormValues
): Promise<Cupom> {
  const { data, error } = await supabase
    .from("coupons")
    .update({ ...cupomParaLinha(valores), atualizado_em: new Date().toISOString() })
    .eq("id", id)
    .select(CAMPOS_CUPOM)
    .single();
  if (error) throw error;
  return linhaParaCupom(data);
}

export async function excluirCupom(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
}

// Filtros públicos aplicados diretamente no Supabase, evitando carregar todos
// os cupons a cada visita. Registros desativados no admin continuam privados.
export type FiltroPublicoCupom = "todos" | "ativos" | "vencidos" | "vence-hoje" | "relampago";

const cuponsPublicosCache = new Map<string, { valor: { itens: Cupom[]; total: number }; expiraEm: number }>();
const cuponsPublicosEmAndamento = new Map<string, Promise<{ itens: Cupom[]; total: number }>>();

export async function listarCuponsPublicosFiltrados(
  supabase: SupabaseClient,
  opcoes: {
    pagina: number;
    porPagina: number;
    filtro: FiltroPublicoCupom;
    loja?: string;
    agora: Date;
    fimDoDiaBrasilia: Date;
  }
): Promise<{ itens: Cupom[]; total: number }> {
  const pagina = Math.max(1, Math.trunc(opcoes.pagina));
  const limite = Math.max(1, Math.min(60, Math.trunc(opcoes.porPagina)));
  const agora = opcoes.agora.toISOString();
  const chave = JSON.stringify([pagina, limite, opcoes.filtro, opcoes.loja ?? "", agora.slice(0, 16), opcoes.fimDoDiaBrasilia.toISOString().slice(0, 10)]);
  const cache = cuponsPublicosCache.get(chave);
  if (cache && cache.expiraEm > Date.now()) return cache.valor;
  const emAndamento = cuponsPublicosEmAndamento.get(chave);
  if (emAndamento) return emAndamento;

  const consulta = (async () => {
    let query = supabase
      .from("coupons")
      .select(CAMPOS_CUPOM_PUBLICO, { count: "exact" })
      .eq("ativo", true);

    if (opcoes.loja) query = query.eq("loja", opcoes.loja);
    switch (opcoes.filtro) {
      case "ativos":
        query = query.or(`validade.is.null,validade.gte.${agora}`);
        break;
      case "vencidos":
        query = query.lt("validade", agora);
        break;
      case "vence-hoje":
        query = query.gte("validade", agora).lte("validade", opcoes.fimDoDiaBrasilia.toISOString());
        break;
      case "relampago":
        query = query.eq("relampago", true).or(`validade.is.null,validade.gte.${agora}`);
        break;
    }

    const inicio = (pagina - 1) * limite;
    const { data, error, count } = await query
      .order("criado_em", { ascending: false })
      .order("id", { ascending: false })
      .range(inicio, inicio + limite - 1);
    if (error) throw error;
    const valor = { itens: (data ?? []).map(linhaParaCupom), total: count ?? 0 };
    cuponsPublicosCache.set(chave, { valor, expiraEm: Date.now() + 15_000 });
    return valor;
  })();

  cuponsPublicosEmAndamento.set(chave, consulta);
  try {
    return await consulta;
  } finally {
    cuponsPublicosEmAndamento.delete(chave);
  }
}

/** Lista somente nomes de lojas (não busca todo o conteúdo dos cupons). */
// Cache curto em memória: a lista de lojas muda muito menos que os cupons.
 // Em instâncias serverless, cada instância mantém seu próprio cache; o TTL
 // limita a defasagem e a Promise compartilhada evita varreduras concorrentes.
let lojasPublicasCache: { valor: string[]; expiraEm: number } | null = null;
let lojasPublicasEmAndamento: Promise<string[]> | null = null;

export async function listarLojasCuponsPublicas(supabase: SupabaseClient): Promise<string[]> {
  const agoraCache = Date.now();
  if (lojasPublicasCache && lojasPublicasCache.expiraEm > agoraCache) {
    return lojasPublicasCache.valor;
  }
  if (lojasPublicasEmAndamento) return lojasPublicasEmAndamento;

  lojasPublicasEmAndamento = (async () => {
  const lojas = new Set<string>();
  const lote = 500;
  let inicio = 0;
  while (true) {
    const { data, error } = await supabase
      .from("coupons")
      .select("loja")
      .eq("ativo", true)
      .order("loja", { ascending: true })
      .range(inicio, inicio + lote - 1);
    if (error) throw error;
    for (const item of data ?? []) {
      const loja = typeof item.loja === "string" ? item.loja.trim() : "";
      if (loja) lojas.add(loja);
    }
    if ((data?.length ?? 0) < lote) break;
    inicio += lote;
  }
  const resultado = [...lojas].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
  lojasPublicasCache = { valor: resultado, expiraEm: Date.now() + 180_000 };
  return resultado;
  })();

  try {
    return await lojasPublicasEmAndamento;
  } finally {
    lojasPublicasEmAndamento = null;
  }
}

/** Atualizações pontuais sem alterar outras propriedades do cupom. */
export async function alterarSituacaoCupom(
  supabase: SupabaseClient,
  id: string,
  acao: "arquivar" | "vencer" | "reativar"
) {
  const alteracoes: Record<string, unknown> = { atualizado_em: new Date().toISOString() };
  if (acao === "arquivar") alteracoes.ativo = false;
  if (acao === "vencer") {
    alteracoes.ativo = true;
    alteracoes.validade = new Date(Date.now() - 86400000).toISOString();
  }
  if (acao === "reativar") {
    alteracoes.ativo = true;
    alteracoes.validade = null;
  }
  const { error } = await supabase.from("coupons").update(alteracoes).eq("id", id);
  if (error) throw error;
}
