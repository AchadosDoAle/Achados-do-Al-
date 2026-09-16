import { Oferta } from "./types";

export const CATEGORIAS = [
  "Todos",
  "Casa",
  "Beleza",
  "Tecnologia",
  "Moda",
  "Ferramentas",
  "Infantil",
];

export const LOJAS = [
  "Mercado Livre",
  "Amazon",
  "Magalu",
  "Shopee",
  "Natura",
  "Avon",
  "Malwee",
  "O Boticário",
  "Outra loja",
];

const agora = new Date().toISOString();

export const OFERTAS_EXEMPLO: Oferta[] = [
  {
    id: "1",
    slug: "fritadeira-eletrica-air-fryer-5l",
    titulo: "Fritadeira elétrica Air Fryer 5L",
    loja: "Magalu",
    categoria: "Casa",
    imagemPrincipal: "/placeholder-produto.png",
    precoAntigo: 349.9,
    precoAtual: 219.9,
    parcelas: 6,
    valorParcela: 36.65,
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
