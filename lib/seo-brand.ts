export const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://achadosdoale.com";
export const NOME_MARCA = "Achado do Alê";
export const NOMES_ALTERNATIVOS = [
  "Achados do Alê",
  "Achado do Ale",
  "Achados do Ale",
  "achadosdoale.com",
];

export type RedeSocial = {
  nome: string;
  url: string;
};

const redesConfiguradas: RedeSocial[] = [
  {
    nome: "Instagram",
    url:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
      "https://www.instagram.com/achados.do.ale/",
  },
  { nome: "TikTok", url: process.env.NEXT_PUBLIC_TIKTOK_URL || "" },
  { nome: "Facebook", url: process.env.NEXT_PUBLIC_FACEBOOK_URL || "" },
  { nome: "YouTube", url: process.env.NEXT_PUBLIC_YOUTUBE_URL || "" },
  { nome: "X", url: process.env.NEXT_PUBLIC_X_URL || "" },
].filter((rede) => rede.url.trim().length > 0);

export const LINK_CANAL_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL ||
  "https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J";

export const REDES_SOCIAIS: RedeSocial[] = redesConfiguradas;

export const SAME_AS = [
  ...redesConfiguradas.map((rede) => rede.url),
  LINK_CANAL_WHATSAPP,
];
