const DOMINIOS_POR_LOJA: Record<string, string[]> = {
  "Mercado Livre": ["mercadolivre.com.br", "mercadolibre.com", "mlb.com"],
  Amazon: ["amazon.com.br", "amzn.to", "amazon.com"],
  Magalu: ["magazineluiza.com.br", "magalu.com"],
  Shopee: ["shopee.com.br", "shp.ee"],
  Natura: ["natura.com.br", "rede.natura.net"],
  Avon: ["avon.com.br"],
  Malwee: ["malwee.com.br"],
  "O Boticário": ["boticario.com.br", "grupoboticario.com.br"],
};

export function linkParecePertencerALoja(link: string, loja: string): boolean {
  const dominiosEsperados = DOMINIOS_POR_LOJA[loja];
  if (!dominiosEsperados) return true; // loja "Outra loja" ou não mapeada
  try {
    const host = new URL(link).hostname.replace(/^www\./, "");
    return dominiosEsperados.some((dominio) => host.endsWith(dominio));
  } catch {
    return false;
  }
}
