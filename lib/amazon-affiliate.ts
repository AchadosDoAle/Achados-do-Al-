/**
 * Identificação pública do programa Amazon Associados do Achados do Alê.
 * O ID de associado não é uma credencial secreta: ele identifica a origem
 * das compras elegíveis para atribuição de comissão.
 */
export const AMAZON_ASSOCIATE_TAG = "alexandrea702-20";

const HOSTS_AMAZON = new Set([
  "amazon.com.br",
  "www.amazon.com.br",
  "amazon.com",
  "www.amazon.com",
]);

/**
 * Garante o parâmetro tag nos links diretos da Amazon.
 * Links amzn.to são links curtos especiais gerados pelo SiteStripe e devem
 * permanecer intactos, pois a identificação pode estar embutida no destino.
 */
export function garantirTagAmazon(link: string): string {
  const original = link.trim();
  if (!original) return original;

  try {
    const url = new URL(original);
    const host = url.hostname.toLowerCase();

    if (!HOSTS_AMAZON.has(host)) return original;

    // Corrige tags ausentes ou pertencentes a outro ID, sem perder os demais parâmetros.
    if (url.searchParams.get("tag") !== AMAZON_ASSOCIATE_TAG) {
      url.searchParams.set("tag", AMAZON_ASSOCIATE_TAG);
    }

    return url.toString();
  } catch {
    return original;
  }
}

/** Identifica links curtos Amazon que precisam ter sido criados no SiteStripe. */
export function ehLinkCurtoAmazon(link: string): boolean {
  try {
    return new URL(link.trim()).hostname.toLowerCase() === "amzn.to";
  } catch {
    return false;
  }
}
