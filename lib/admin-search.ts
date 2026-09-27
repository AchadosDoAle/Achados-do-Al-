/**
 * Utilitários de busca usados nas listagens administrativas.
 * A normalização remove acentos, diferenças entre maiúsculas/minúsculas
 * e pontuação para permitir pesquisas rápidas por trechos do conteúdo.
 */
export function normalizarBusca(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function textoCorrespondeBusca(
  busca: string,
  valores: Array<unknown>
): boolean {
  const termos = normalizarBusca(busca).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return true;

  const conteudo = normalizarBusca(valores.join(" "));
  return termos.every((termo) => conteudo.includes(termo));
}
