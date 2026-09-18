export type StatusOferta =
  | "rascunho"
  | "pronta_para_revisar"
  | "aprovada"
  | "publicada"
  | "enviada_whatsapp"
  | "agendada"
  | "expirada"
  | "arquivada";

export const STATUS_LABEL: Record<StatusOferta, string> = {
  rascunho: "Rascunho",
  pronta_para_revisar: "Pronta para revisar",
  aprovada: "Aprovada",
  publicada: "Publicada no site",
  enviada_whatsapp: "Enviada ao WhatsApp",
  agendada: "Agendada",
  expirada: "Expirada",
  arquivada: "Arquivada",
};

export type Oferta = {
  id: string;
  slug: string;

  // Produto
  titulo: string;
  loja: string;
  categoria: string;
  marca?: string;
  modelo?: string;

  // Preço e pagamento
  precoAntigo?: number;
  precoAtual: number;
  precoPix?: number;
  parcelas?: number;
  valorParcela?: number;

  // Promoção
  cupom?: string;
  cupomDescricao?: string;
  linkCupom?: string;
  freteGratis?: boolean;
  estoque?: string;
  validadePromocao?: string;

  // Características
  voltagem?: string;
  cor?: string;
  tamanho?: string;
  capacidade?: string;

  // Publicação
  linkProduto: string;
  usarLinkRedirecionamento?: boolean;
  textoOriginal?: string;
  textoPublicacao?: string;
  observacoes?: string;
  imagemPrincipal?: string;
  status: StatusOferta;
  agendadoPara?: string;

  // Controle
  criadoEm: string;
  atualizadoEm: string;
  publicadoEm?: string;
};

export type OfertaFormValues = Omit<
  Oferta,
  "id" | "slug" | "criadoEm" | "atualizadoEm"
>;

export type EstiloTexto =
  | "engracado"
  | "urgente"
  | "elegante"
  | "mae_e_casa"
  | "tecnologia"
  | "beleza"
  | "ferramentas"
  | "infantil"
  | "minimalista";

export const ESTILO_LABEL: Record<EstiloTexto, string> = {
  engracado: "Engraçado",
  urgente: "Urgente",
  elegante: "Elegante",
  mae_e_casa: "Mãe e casa",
  tecnologia: "Tecnologia",
  beleza: "Beleza",
  ferramentas: "Ferramentas",
  infantil: "Infantil",
  minimalista: "Minimalista",
};

export type Cupom = {
  id: string;
  loja: string;
  nomeCupom: string;
  descontoPercentual?: number;
  valorCupom?: string;
  descricao?: string;
  observacoes?: string;
  linkProdutos?: string;
  corLoja: string;
  validade?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type CupomFormValues = Omit<Cupom, "id" | "criadoEm" | "atualizadoEm">;

export const PALETA_CORES_LOJA = [
  { nome: "Amarelo", cor: "#FFC93C" },
  { nome: "Laranja", cor: "#FF9900" },
  { nome: "Vermelho", cor: "#FF4D4D" },
  { nome: "Rosa", cor: "#FF4F81" },
  { nome: "Roxo", cor: "#8B5CF6" },
  { nome: "Azul", cor: "#3B82F6" },
  { nome: "Verde", cor: "#2FBF8F" },
  { nome: "Cinza", cor: "#94A3B8" },
] as const;
