const CHAVE = "achado-do-ale:favoritos";

export function listarFavoritos(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(CHAVE) ?? "[]");
  } catch {
    return [];
  }
}

export function ehFavorito(id: string): boolean {
  return listarFavoritos().includes(id);
}

export function alternarFavorito(id: string): string[] {
  const atuais = listarFavoritos();
  const novos = atuais.includes(id)
    ? atuais.filter((x) => x !== id)
    : [...atuais, id];
  window.localStorage.setItem(CHAVE, JSON.stringify(novos));
  return novos;
}
