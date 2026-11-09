import { ImageResponse } from "next/og";
import { criarClientePublico } from "@/lib/supabase/public";
import { buscarCupomPorCodigoCurto } from "@/lib/cupom-share";
import { normalizarNomeLoja } from "@/lib/mock-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type EstiloLoja = {
  fundo: string;
  cupom: string;
  texto: string;
  contorno: string;
  nome?: string;
};

const ESTILOS_LOJAS: Record<string, EstiloLoja> = {
  "Mercado Livre": {
    fundo: "#FFF8D8",
    cupom: "#FFE600",
    texto: "#1F2A44",
    contorno: "rgba(31, 42, 68, 0.18)",
  },
  Amazon: {
    fundo: "#FFF4E5",
    cupom: "#FF9900",
    texto: "#111827",
    contorno: "rgba(17, 24, 39, 0.18)",
  },
  Netshoes: {
    fundo: "#FDECEC",
    cupom: "#E31837",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  "Magalu - Magazine Luiza": {
    fundo: "#EAF4FF",
    cupom: "#0086FF",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.60)",
    nome: "MAGALU",
  },
  Shopee: {
    fundo: "#FFF0E8",
    cupom: "#EE4D2D",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.60)",
  },
  "ZZ Mall": {
    fundo: "#F4ECFF",
    cupom: "#7C3AED",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  BAW: {
    fundo: "#F3F4F6",
    cupom: "#111111",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
  AliExpress: {
    fundo: "#FFF0F0",
    cupom: "#FF4747",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.60)",
  },
  Natura: {
    fundo: "#F6EFE8",
    cupom: "#8A5A44",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  Avon: {
    fundo: "#FDEBF4",
    cupom: "#E4007F",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  Adidas: {
    fundo: "#F3F4F6",
    cupom: "#111111",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
  Dafiti: {
    fundo: "#F4F0FA",
    cupom: "#3A2D5B",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
  "L'Oréal": {
    fundo: "#F8F3E6",
    cupom: "#C7A34B",
    texto: "#171717",
    contorno: "rgba(23, 23, 23, 0.18)",
  },
  "Loja NBA": {
    fundo: "#EAF0F8",
    cupom: "#17408B",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  Nike: {
    fundo: "#F5F5F5",
    cupom: "#111111",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
  Samsung: {
    fundo: "#EDF3FF",
    cupom: "#1428A0",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  Sephora: {
    fundo: "#F5F5F5",
    cupom: "#111111",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
  "ShopTIMÃO": {
    fundo: "#F0F0F0",
    cupom: "#111111",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
  Arno: {
    fundo: "#FFECEC",
    cupom: "#D6001C",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  "C&A": {
    fundo: "#FFF0F1",
    cupom: "#D71920",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  Drogal: {
    fundo: "#EEF8F1",
    cupom: "#14804A",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  "Fut Fanatics": {
    fundo: "#FFF1EB",
    cupom: "#F05A28",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  Intimissimi: {
    fundo: "#F8EFEF",
    cupom: "#7B2D35",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
  "KaBuM!": {
    fundo: "#FFF1E6",
    cupom: "#FF6500",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  },
  Stanley: {
    fundo: "#EEF5EC",
    cupom: "#1F5D42",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.56)",
  },
};

function tamanhoNome(nome: string) {
  if (nome.length <= 10) return 92;
  if (nome.length <= 16) return 80;
  if (nome.length <= 22) return 68;
  return 58;
}

function estiloDaLoja(loja: string, corFallback?: string): EstiloLoja {
  const nomeNormalizado = normalizarNomeLoja(loja);
  const estilo = ESTILOS_LOJAS[nomeNormalizado];
  if (estilo) return estilo;

  return {
    fundo: "#F3F4F6",
    cupom: corFallback?.trim() || "#334155",
    texto: "#FFFFFF",
    contorno: "rgba(255, 255, 255, 0.58)",
  };
}

export default async function Image({ params }: { params: { code: string } }) {
  const cupom = await buscarCupomPorCodigoCurto(criarClientePublico(), params.code);

  if (!cupom?.ativo) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F5F6F8",
          color: "#172033",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 800,
          fontFamily: "Arial, sans-serif",
        }}
      >
        Achado do Alê
      </div>,
      size
    );
  }

  const lojaNormalizada = normalizarNomeLoja(cupom.loja);
  const estilo = estiloDaLoja(lojaNormalizada, cupom.corLoja);
  const nomeLoja = estilo.nome ?? lojaNormalizada.toLocaleUpperCase("pt-BR");
  const fonteLoja = tamanhoNome(nomeLoja);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: estilo.fundo,
        color: "#172033",
        padding: "54px 70px 58px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: 4,
          lineHeight: 1,
        }}
      >
        CUPOM LIBERADO
      </div>

      <div
        style={{
          width: 880,
          height: 320,
          marginTop: 54,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: estilo.cupom,
          borderRadius: 24,
          boxShadow: "0 28px 52px rgba(15, 23, 42, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 24,
            display: "flex",
            border: `3px solid ${estilo.contorno}`,
            borderRadius: 14,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: -34,
            top: 126,
            width: 68,
            height: 68,
            display: "flex",
            borderRadius: 999,
            background: estilo.fundo,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -34,
            top: 126,
            width: 68,
            height: 68,
            display: "flex",
            borderRadius: 999,
            background: estilo.fundo,
          }}
        />

        <div
          style={{
            width: 690,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: estilo.texto,
            fontSize: fonteLoja,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: nomeLoja.length <= 12 ? 2 : 0,
            textTransform: "uppercase",
          }}
        >
          {nomeLoja}
        </div>
      </div>
    </div>,
    size
  );
}
