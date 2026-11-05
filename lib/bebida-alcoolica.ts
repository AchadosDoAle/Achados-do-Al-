/**
 * O aviso 18+ depende exclusivamente da opção manual salva no cadastro.
 * Nunca inferimos que um produto é alcoólico pelo título ou descrição.
 */
export function ofertaEhBebidaAlcoolica(oferta: {
  bebidaAlcoolica?: boolean | null;
}): boolean {
  return oferta.bebidaAlcoolica === true;
}
