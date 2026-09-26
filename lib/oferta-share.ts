import type { SupabaseClient } from "@supabase/supabase-js";
import type { Oferta } from "./types";
import { linhaParaOferta } from "./offers-repo";
import { URL_SITE } from "./seo-brand";

const CODIGO_CURTO_REGEX = /^[a-z0-9]{4,12}$/i;

export function codigoCurtoDaOferta(slug: string) {
  const match = slug.match(/-([a-z0-9]{4,12})$/i);
  return (match?.[1] || slug.slice(-8)).toLowerCase();
}

export function urlCurtaDaOferta(slug: string) {
  return `${URL_SITE}/p/${codigoCurtoDaOferta(slug)}`;
}

export function precoPrincipalDaOferta(oferta: Pick<Oferta, "precoPix" | "precoAtual">) {
  return oferta.precoPix ?? oferta.precoAtual;
}

export function formatarPrecoSocial(valor?: number) {
  return valor == null
    ? "Confira o preço"
    : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function tituloSocialDaOferta(
  oferta: Pick<Oferta, "titulo" | "precoPix" | "precoAtual">
) {
  const preco = precoPrincipalDaOferta(oferta);
  return preco == null ? oferta.titulo : `${oferta.titulo} — ${formatarPrecoSocial(preco)}`;
}

export function descricaoSocialDaOferta(
  oferta: Pick<Oferta, "loja" | "precoPix" | "precoAtual">
) {
  const preco = precoPrincipalDaOferta(oferta);
  const condicao = oferta.precoPix != null ? " no Pix" : "";
  return preco == null
    ? `🏪 ${oferta.loja} · confira a promoção no Achado do Alê`
    : `💰 ${formatarPrecoSocial(preco)}${condicao} · 🏪 ${oferta.loja}`;
}

export function imagemAbsolutaDaOferta(
  oferta: Pick<Oferta, "imagemPrincipal">
): string | undefined {
  const imagem = oferta.imagemPrincipal?.trim();
  if (!imagem) return undefined;

  try {
    return new URL(imagem, URL_SITE).toString();
  } catch {
    return undefined;
  }
}

export async function buscarOfertaPorCodigoCurto(
  supabase: SupabaseClient,
  codigo: string
): Promise<Oferta | null> {
  const codigoLimpo = codigo.toLowerCase().trim();
  if (!CODIGO_CURTO_REGEX.test(codigoLimpo)) return null;

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .like("slug", `%-${codigoLimpo}`)
    .in("status", ["publicada", "expirada"])
    .order("criado_em", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ? linhaParaOferta(data[0]) : null;
}
