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

/** Imagem para compartilhamento entregue pelo nosso domínio (não pelo CDN da loja).
 * A versão muda quando a oferta é editada, reduzindo cache desatualizado. */
export function imagemSocialDaOferta(
  oferta: Pick<Oferta, "slug" | "atualizadoEm">
) {
  const versao = Date.parse(oferta.atualizadoEm);
  const sufixo = Number.isFinite(versao) ? `?v=${Math.floor(versao / 1000).toString(36)}` : "";
  return `${URL_SITE}/api/preview/oferta/${codigoCurtoDaOferta(oferta.slug)}${sufixo}`;
}

export function imagensSociaisDaOferta(
  oferta: Pick<Oferta, "slug" | "atualizadoEm" | "imagemPrincipal">
) {
  const principal = imagemAbsolutaDaOferta(oferta);
  const fallback = imagemSocialDaOferta(oferta);
  return Array.from(new Set([principal, fallback].filter((v): v is string => Boolean(v))));
}

export function precoPrincipalDaOferta(oferta: Pick<Oferta, "precoPix" | "precoAtual">) {
  const precos = [oferta.precoPix, oferta.precoAtual].filter(
    (valor): valor is number => typeof valor === "number" && Number.isFinite(valor)
  );
  return precos.length ? Math.min(...precos) : undefined;
}

export function precoPrincipalEhPix(oferta: Pick<Oferta, "precoPix" | "precoAtual">) {
  const principal = precoPrincipalDaOferta(oferta);
  return principal != null && oferta.precoPix != null && oferta.precoPix === principal;
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
  const condicao = precoPrincipalEhPix(oferta) ? " no Pix" : "";
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
