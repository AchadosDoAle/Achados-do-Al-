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
