import type { SupabaseClient } from "@supabase/supabase-js";
import type { Cupom } from "./types";
import { buscarCupomPorId } from "./coupons-repo";
import { URL_SITE } from "./seo-brand";

function uuidParaCodigo(id: string) {
  const hex = id.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return id;

  let binario = "";
  for (let i = 0; i < hex.length; i += 2) {
    binario += String.fromCharCode(Number.parseInt(hex.slice(i, i + 2), 16));
  }
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function codigoParaUuid(codigo: string) {
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(codigo)) return codigo;
  if (!/^[A-Za-z0-9_-]{20,24}$/.test(codigo)) return null;

  try {
    const base64 = codigo.replace(/-/g, "+").replace(/_/g, "/");
    const preenchido = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binario = atob(preenchido);
    if (binario.length !== 16) return null;
    const hex = Array.from(binario)
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  } catch {
    return null;
  }
}

export function codigoCurtoDoCupom(id: string) {
  return uuidParaCodigo(id);
}

export function urlCurtaDoCupom(id: string) {
  return `${URL_SITE}/c/${codigoCurtoDoCupom(id)}`;
}

export function formatarValidadeCupom(validade?: string) {
  if (!validade) return "Consulte as condições";
  const iso = validade.slice(0, 10);
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : validade;
}

export function beneficioCupom(cupom: Pick<Cupom, "descontoPercentual" | "valorCupom">) {
  if (cupom.descontoPercentual != null) return `${cupom.descontoPercentual}% DE DESCONTO`;
  return cupom.valorCupom?.trim() || undefined;
}

export async function buscarCupomPorCodigoCurto(
  supabase: SupabaseClient,
  codigo: string
): Promise<Cupom | null> {
  const id = codigoParaUuid(codigo.trim());
  if (!id) return null;
  return buscarCupomPorId(supabase, id);
}
