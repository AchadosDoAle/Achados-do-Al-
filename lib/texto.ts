export function normalizarBusca(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugificar(valor: string) {
  return normalizarBusca(valor).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
