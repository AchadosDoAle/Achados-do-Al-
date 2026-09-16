import { SupabaseClient } from "@supabase/supabase-js";
import { Cupom, CupomFormValues } from "./types";

function linhaParaCupom(linha: any): Cupom {
  return {
    id: linha.id,
    loja: linha.loja,
    nomeCupom: linha.nome_cupom,
    descontoPercentual: linha.desconto_percentual ?? undefined,
    linkProdutos: linha.link_produtos ?? undefined,
    corLoja: linha.cor_loja,
    validade: linha.validade ?? undefined,
    ativo: linha.ativo,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
  };
}

function cupomParaLinha(valores: Partial<CupomFormValues>) {
  return {
    loja: valores.loja,
    nome_cupom: valores.nomeCupom,
    desconto_percentual: valores.descontoPercentual ?? null,
    link_produtos: valores.linkProdutos || null,
    cor_loja: valores.corLoja,
    validade: valores.validade || null,
    ativo: valores.ativo ?? true,
  };
}

export function cupomExpirado(cupom: Cupom): boolean {
  if (!cupom.validade) return false;
  return new Date(cupom.validade).getTime() < Date.now();
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
