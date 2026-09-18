import { SupabaseClient } from "@supabase/supabase-js";
import { Oferta, OfertaFormValues } from "./types";
import { normalizarNomeLoja } from "./mock-data";

// O banco usa snake_case (como no modelo que você pediu); o app usa
// camelCase. Estas duas funções fazem a conversão nos dois sentidos.

function linhaParaOferta(linha: any): Oferta {
  return {
    id: linha.id,
    slug: linha.slug,
    titulo: linha.titulo,
    loja: normalizarNomeLoja(linha.loja),
    categoria: linha.categoria,
    marca: linha.marca ?? undefined,
    modelo: linha.modelo ?? undefined,
    precoAntigo: linha.preco_antigo ?? undefined,
    precoAtual: Number(linha.preco_atual),
    precoPix: linha.preco_pix ?? undefined,
    parcelas: linha.parcelas ?? undefined,
    valorParcela: linha.valor_parcela ?? undefined,
    cupom: linha.cupom ?? undefined,
    cupomDescricao: linha.cupom_descricao ?? undefined,
    linkCupom: linha.link_cupom ?? undefined,
    freteGratis: linha.frete_gratis ?? false,
    estoque: linha.estoque ?? undefined,
    validadePromocao: linha.validade_promocao ?? undefined,
    voltagem: linha.voltagem ?? undefined,
    cor: linha.cor ?? undefined,
    tamanho: linha.tamanho ?? undefined,
    capacidade: linha.capacidade ?? undefined,
    linkProduto: linha.link_produto,
    usarLinkRedirecionamento: linha.usar_link_redirecionamento ?? false,
    textoOriginal: linha.texto_original ?? undefined,
    textoPublicacao: linha.texto_publicacao ?? undefined,
    observacoes: linha.observacoes ?? undefined,
    imagemPrincipal: linha.imagem_principal ?? undefined,
    status: linha.status,
    agendadoPara: linha.agendado_para ?? undefined,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
    publicadoEm: linha.publicado_em ?? undefined,
  };
}

function ofertaParaLinha(valores: Partial<OfertaFormValues>) {
  return {
    titulo: valores.titulo,
    loja: valores.loja ? normalizarNomeLoja(valores.loja) : valores.loja,
    categoria: valores.categoria,
    marca: valores.marca || null,
    modelo: valores.modelo || null,
    preco_antigo: valores.precoAntigo ?? null,
    preco_atual: valores.precoAtual,
    preco_pix: valores.precoPix ?? null,
    parcelas: valores.parcelas ?? null,
    valor_parcela: valores.valorParcela ?? null,
    cupom: valores.cupom || null,
    cupom_descricao: valores.cupomDescricao || null,
    link_cupom: valores.linkCupom || null,
    frete_gratis: valores.freteGratis ?? false,
    estoque: valores.estoque || null,
    validade_promocao: valores.validadePromocao || null,
    voltagem: valores.voltagem || null,
    cor: valores.cor || null,
    tamanho: valores.tamanho || null,
    capacidade: valores.capacidade || null,
    link_produto: valores.linkProduto,
    usar_link_redirecionamento: valores.usarLinkRedirecionamento ?? false,
    texto_original: valores.textoOriginal || null,
    texto_publicacao: valores.textoPublicacao || null,
    observacoes: valores.observacoes || null,
    imagem_principal: valores.imagemPrincipal || null,
    status: valores.status,
    agendado_para: valores.agendadoPara || null,
  };
}

function gerarSlug(titulo: string) {
  return (
    titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7)
  );
}

export async function listarOfertas(
  supabase: SupabaseClient,
  filtros?: { status?: string; apenasPublicadas?: boolean }
): Promise<Oferta[]> {
  let consulta = supabase
    .from("offers")
    .select("*")
    .order("criado_em", { ascending: false });

  if (filtros?.status) consulta = consulta.eq("status", filtros.status);
  if (filtros?.apenasPublicadas) consulta = consulta.eq("status", "publicada");

  const { data, error } = await consulta;
  if (error) throw error;
  return (data ?? []).map(linhaParaOferta);
}

export async function buscarOfertaPorId(
  supabase: SupabaseClient,
  id: string
): Promise<Oferta | null> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? linhaParaOferta(data) : null;
}

export async function buscarOfertaPorSlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Oferta | null> {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? linhaParaOferta(data) : null;
}

export async function salvarNovaOferta(
  supabase: SupabaseClient,
  valores: OfertaFormValues
): Promise<Oferta> {
  const linha = {
    ...ofertaParaLinha(valores),
    slug: gerarSlug(valores.titulo),
  };
  const { data, error } = await supabase
    .from("offers")
    .insert(linha)
    .select()
    .single();
  if (error) throw error;
  return linhaParaOferta(data);
}

export async function atualizarOferta(
  supabase: SupabaseClient,
  id: string,
  valores: OfertaFormValues
): Promise<Oferta> {
  const { data, error } = await supabase
    .from("offers")
    .update({ ...ofertaParaLinha(valores), atualizado_em: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return linhaParaOferta(data);
}

export async function duplicarOferta(
  supabase: SupabaseClient,
  id: string
): Promise<Oferta> {
  const original = await buscarOfertaPorId(supabase, id);
  if (!original) throw new Error("Oferta não encontrada");

  const { id: _id, slug: _slug, criadoEm, atualizadoEm, ...resto } = original;
  return salvarNovaOferta(supabase, {
    ...resto,
    titulo: `${original.titulo} (cópia)`,
    status: "rascunho",
  });
}

export async function excluirOferta(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw error;
}
