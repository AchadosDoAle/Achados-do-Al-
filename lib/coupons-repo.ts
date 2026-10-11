import { SupabaseClient } from "@supabase/supabase-js";
import { Cupom, CupomFormValues } from "./types";
import { normalizarNomeLoja } from "./mock-data";

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
    .select("*", { count: "exact" })
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
      .select("*")
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
export async function listarCuponsParaBuscaPublica(supabase: SupabaseClient): Promise<Cupom[]> {
  const TAMANHO_LOTE = 500;
  const acumulado: Cupom[] = [];
  let inicio = 0;

  while (true) {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
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
  return acumulado;
}

export async function listarCupons(supabase: SupabaseClient): Promise<Cupom[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
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
    .select("*")
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
    .select()
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
    .select()
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
  let query = supabase
    .from("coupons")
    .select("*", { count: "exact" })
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
  return { itens: (data ?? []).map(linhaParaCupom), total: count ?? 0 };
}

/** Lista somente nomes de lojas (não busca todo o conteúdo dos cupons). */
export async function listarLojasCuponsPublicas(supabase: SupabaseClient): Promise<string[]> {
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
  return [...lojas].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
}
