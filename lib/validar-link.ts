const DOMINIOS_POR_LOJA: Record<string, string[]> = {
  "Mercado Livre": [
    "mercadolivre.com.br",
    "mercadolibre.com",
    "meli.la",
  ],
  Amazon: ["amazon.com.br", "amzn.to", "amazon.com"],
  Netshoes: ["netshoes.com.br"],
  "Magalu - Magazine Luiza": [
    "magazineluiza.com.br",
    "magalu.com",
    "magazinevoce.com.br",
  ],
  Shopee: ["shopee.com.br", "shope.ee", "shp.ee"],
  "ZZ Mall": ["zzmall.com.br"],
  BAW: ["bawclothing.com.br"],
  AliExpress: ["aliexpress.com", "aliexpress.us"],
  Natura: ["natura.com.br", "rede.natura.net"],
  Avon: ["avon.com.br"],
};

export function linkParecePertencerALoja(link: string, loja: string): boolean {
  const dominiosEsperados = DOMINIOS_POR_LOJA[loja];

  // Loja informada manualmente em "Outros": não bloqueia nem acusa domínio.
  if (!dominiosEsperados) return true;

  try {
    const host = new URL(link).hostname.replace(/^www\./, "");
    return dominiosEsperados.some(
      (dominio) => host === dominio || host.endsWith(`.${dominio}`)
    );
  } catch {
    return false;
  }
}
