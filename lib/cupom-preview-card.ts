export type EstiloCardCupom = {
  slug: string;
  fundo: string;
  cupom: string;
  texto: string;
  contorno: string;
  nome?: string;
};

export const CARDS_CUPOM_POR_LOJA: Record<string, EstiloCardCupom> = {
  "Mercado Livre": { slug: "mercado-livre", fundo: "#FFF8D8", cupom: "#FFE600", texto: "#1F2A44", contorno: "rgba(31, 42, 68, 0.18)" },
  Amazon: { slug: "amazon", fundo: "#FFF4E5", cupom: "#FF9900", texto: "#111827", contorno: "rgba(17, 24, 39, 0.18)" },
  Netshoes: { slug: "netshoes", fundo: "#F2E8FA", cupom: "#5B168C", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  "Magalu - Magazine Luiza": { slug: "magalu", fundo: "#EAF4FF", cupom: "#0086FF", texto: "#FFFFFF", contorno: "rgba(255,255,255,.60)", nome: "MAGALU" },
  Shopee: { slug: "shopee", fundo: "#FFF0E8", cupom: "#EE4D2D", texto: "#FFFFFF", contorno: "rgba(255,255,255,.60)" },
  "ZZ Mall": { slug: "zz-mall", fundo: "#F4ECFF", cupom: "#7C3AED", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  BAW: { slug: "baw", fundo: "#F3F4F6", cupom: "#111111", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
  AliExpress: { slug: "aliexpress", fundo: "#FFF0F0", cupom: "#FF4747", texto: "#FFFFFF", contorno: "rgba(255,255,255,.60)" },
  Natura: { slug: "natura", fundo: "#F6EFE8", cupom: "#8A5A44", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  Avon: { slug: "avon", fundo: "#FDEBF4", cupom: "#E4007F", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  Adidas: { slug: "adidas", fundo: "#F3F4F6", cupom: "#111111", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
  Dafiti: { slug: "dafiti", fundo: "#F4F0FA", cupom: "#3A2D5B", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
  "L'Oréal": { slug: "loreal", fundo: "#F8F3E6", cupom: "#C7A34B", texto: "#171717", contorno: "rgba(23,23,23,.18)" },
  "Loja NBA": { slug: "loja-nba", fundo: "#EAF0F8", cupom: "#17408B", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  Nike: { slug: "nike", fundo: "#F5F5F5", cupom: "#111111", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
  Samsung: { slug: "samsung", fundo: "#EDF3FF", cupom: "#1428A0", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  Sephora: { slug: "sephora", fundo: "#F5F5F5", cupom: "#111111", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
  "ShopTIMÃO": { slug: "shoptimao", fundo: "#F0F0F0", cupom: "#111111", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
  Arno: { slug: "arno", fundo: "#FFECEC", cupom: "#D6001C", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  "C&A": { slug: "cea", fundo: "#FFF0F1", cupom: "#D71920", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  Drogal: { slug: "drogal", fundo: "#EEF8F1", cupom: "#14804A", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  "Fut Fanatics": { slug: "fut-fanatics", fundo: "#FFF1EB", cupom: "#F05A28", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  Intimissimi: { slug: "intimissimi", fundo: "#F8EFEF", cupom: "#7B2D35", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
  "KaBuM!": { slug: "kabum", fundo: "#FFF1E6", cupom: "#FF6500", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" },
  Stanley: { slug: "stanley", fundo: "#EEF5EC", cupom: "#1F5D42", texto: "#FFFFFF", contorno: "rgba(255,255,255,.56)" },
};

export function slugCardCupom(loja: string) {
  return CARDS_CUPOM_POR_LOJA[loja]?.slug ?? "outros";
}

export function estiloCardCupomPorSlug(slug: string): [string, EstiloCardCupom] {
  for (const [loja, estilo] of Object.entries(CARDS_CUPOM_POR_LOJA)) {
    if (estilo.slug === slug) return [loja, estilo];
  }
  return ["ACHADO DO ALÊ", { slug: "outros", fundo: "#F3F4F6", cupom: "#334155", texto: "#FFFFFF", contorno: "rgba(255,255,255,.58)" }];
}
