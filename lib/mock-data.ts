import { Oferta } from "./types";

export const CATEGORIA_OUTROS = "Outras";

export const CATEGORIAS = [
  "Todos",
  "Casa",
  "Beleza",
  "Tecnologia",
  "Moda",
  "Ferramentas",
  "Infantil",
];

export const CATEGORIAS_ADMIN = [
  "Acessórios",
  "Automotivo",
  "Bebês",
  "Beleza",
  "Brinquedos",
  "Calçados",
  "Casa",
  "Celulares",
  "Cozinha",
  "Decoração",
  "Eletrodomésticos",
  "Eletrônicos",
  "Eletroportáteis",
  "Esporte",
  "Ferramentas",
  "Games",
  "Infantil",
  "Informática",
  "Jardim",
  "Livros",
  "Mercado",
  "Moda",
  "Móveis",
  CATEGORIA_OUTROS,
  "Papelaria",
  "Perfumaria",
  "Pet",
  "Relógios",
  "Saúde",
  "Suplementos",
  "Tecnologia",
  "TV e Áudio",
  "Utilidades",
  "Viagem",
];

// Lojas em que o Achado do Alê trabalha com links de afiliado.
// "Outros" existe apenas no painel: ao selecionar essa opção,
// o nome real da loja é digitado manualmente e é esse nome que fica salvo.
export const LOJAS_AFILIADAS = [
  "Mercado Livre",
  "Amazon",
  "Netshoes",
  "Magalu - Magazine Luiza",
  "Shopee",
  "ZZ Mall",
  "BAW",
  "AliExpress",
  "Natura",
  "Avon",
];

export const LOJA_OUTROS = "Outros";
export const LOJAS = [...LOJAS_AFILIADAS, LOJA_OUTROS];

// Mantém compatibilidade com registros antigos que já podem estar no Supabase.
const ALIASES_LOJAS: Record<string, string> = {
  MercadoLivre: "Mercado Livre",
  Magalu: "Magalu - Magazine Luiza",
  "Magazine Luiza": "Magalu - Magazine Luiza",
  "MagaLu-Magazine Luiza": "Magalu - Magazine Luiza",
  Baw: "BAW",
  "Outra loja": LOJA_OUTROS,
};

export function normalizarNomeLoja(loja: string): string {
  return ALIASES_LOJAS[loja] ?? loja;
}

export function lojaEhAfiliada(loja: string): boolean {
  return LOJAS_AFILIADAS.includes(normalizarNomeLoja(loja));
}

const agora = new Date().toISOString();

export const OFERTAS_EXEMPLO: Oferta[] = [
  {
    id: "1",
    slug: "fritadeira-eletrica-air-fryer-5l",
    titulo: "Fritadeira elétrica Air Fryer 5L",
    loja: "Magalu - Magazine Luiza",
    categoria: "Casa",
    imagemPrincipal: "/placeholder-produto.png",
    precoAntigo: 349.9,
    precoAtual: 219.9,
    ofereceParcelamento: true,
    parcelas: 6,
    valorParcela: 36.65,
    parcelamentoSemJuros: true,
    cupom: "FRITOU10",
    linkProduto: "#",
    freteGratis: true,
    status: "publicada",
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: "2",
    slug: "kit-perfumaria-natura-tododia",
    titulo: "Kit perfumaria Natura Tododia",
    loja: "Natura",
    categoria: "Beleza",
    imagemPrincipal: "/placeholder-produto.png",
    precoAntigo: 129.9,
    precoAtual: 89.9,
    linkProduto: "#",
    status: "publicada",
    criadoEm: agora,
    atualizadoEm: agora,
  },
  {
    id: "3",
    slug: "fone-bluetooth-sem-fio",
    titulo: "Fone bluetooth sem fio",
    loja: "Shopee",
    categoria: "Tecnologia",
    imagemPrincipal: "/placeholder-produto.png",
    precoAntigo: 89.9,
    precoAtual: 45.9,
    cupom: "SOM20",
    linkProduto: "#",
    freteGratis: true,
    status: "publicada",
    criadoEm: agora,
    atualizadoEm: agora,
  },
];
