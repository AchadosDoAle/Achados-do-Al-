import { LOJAS_AFILIADAS, normalizarNomeLoja } from "./mock-data";

/** Só atribui marcas que também são lojas (Adidas, Nike, Samsung etc.)
 * quando a publicação declara explicitamente a LOJA vendedora. */
export function detectarLojaDeclarada(texto: string): string | undefined {
  const nomeChave = (nome: string) =>
    nome.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’'\s\-]/g, "")
      .toLocaleUpperCase("pt-BR");

  for (const linhaBruta of texto.split(/\r?\n/)) {
    const linha = linhaBruta
      .replace(/[\*_~`]/g, " ")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
      .replace(/[\uFE0E\uFE0F\u200B-\u200D\u2060]/g, " ")
      .replace(/^[^\p{L}\p{N}]+/gu, "")
      .trim();

    // Aceita "LOJA: ADIDAS", "🏁 LOJA OFICIAL ADIDAS" e
    // "VENDIDO POR: MERCADO LIVRE", sem inferir pela marca do produto.
    const declarado = linha.match(
      /^(?:(?:LOJA|SITE)\s*(?:OFICIAL\s*)?|VENDID[OA]\s+POR\s*|VENDEDOR\s*)(?:[:\-–—]\s*)?(?:(?:DA|DO|DE)\s+)?(.+)$/i
    )?.[1]?.trim().replace(/[.,;:!]+$/, "").trim();
    if (!declarado) continue;

    const normalizado = normalizarNomeLoja(declarado);
    const encontrada = LOJAS_AFILIADAS.find(
      (loja) => nomeChave(loja) === nomeChave(normalizado)
    );
    if (encontrada) return encontrada;
  }
  return undefined;
}
