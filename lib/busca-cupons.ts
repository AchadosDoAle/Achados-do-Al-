import type { Cupom } from "@/lib/types";
import { normalizarBusca } from "@/lib/admin-search";

/** Pesquisa pública, independente de acentos, caixa e pontuação do cupom. */
export function cupomCorrespondeBuscaPublica(cupom: Cupom, busca: string): boolean {
  const termos = normalizarBusca(busca).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return true;

  const conteudo = normalizarBusca([
    cupom.nomeCupom,
    cupom.loja,
    cupom.descontoPercentual != null ? `${cupom.descontoPercentual}% desconto off` : "",
    cupom.valorCupom,
    cupom.descricao,
    cupom.observacoes,
    cupom.linkProdutos,
    cupom.relampago ? "cupom relâmpago relampago" : "",
  ].filter(Boolean).join(" "));
  const semEspacos = conteudo.replace(/\s+/g, "");
  return termos.every((termo) => conteudo.includes(termo) || semEspacos.includes(termo));
}
