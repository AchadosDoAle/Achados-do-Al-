import { ImageResponse } from "next/og";
import type { Oferta } from "./types";
import { formatarPrecoSocial, precoPrincipalDaOferta } from "./oferta-share";

type OpcoesImagemSocial = {
  imagemProdutoDataUrl?: string | null;
};

/**
 * Arte social 1200x630 servida pelo próprio domínio.
 * A foto do produto, quando disponível, já vem embutida como data URL,
 * evitando que o crawler do WhatsApp precise acessar a CDN da loja.
 */
export function gerarImagemSocialFallback(
  oferta: Oferta,
  opcoes: OpcoesImagemSocial = {}
): ImageResponse {
  const preco = precoPrincipalDaOferta(oferta);
  const imagemProduto = opcoes.imagemProdutoDataUrl?.trim() || null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#08182b",
        color: "#ffffff",
        padding: 48,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: 500,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 28,
          backgroundColor: "#ffffff",
          overflow: "hidden",
          padding: imagemProduto ? 22 : 0,
        }}
      >
        {imagemProduto ? (
          <img
            src={imagemProduto}
            width="456"
            height="456"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#112b45",
            }}
          >
            <div style={{ fontSize: 98, fontWeight: 900, color: "#f4bd42" }}>A</div>
            <div style={{ fontSize: 26, color: "#f4bd42", fontWeight: 800 }}>
              ACHADO DO ALÊ
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 604,
          paddingLeft: 42,
        }}
      >
        <div style={{ fontSize: 25, color: "#f4bd42", fontWeight: 800 }}>
          ACHADO DO ALÊ · {oferta.loja}
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.1,
            marginTop: 18,
            maxHeight: 205,
            overflow: "hidden",
          }}
        >
          {oferta.titulo}
        </div>

        {oferta.precoAntigo ? (
          <div
            style={{
              fontSize: 26,
              color: "#a8bfd2",
              marginTop: 24,
              textDecoration: "line-through",
            }}
          >
            {formatarPrecoSocial(oferta.precoAntigo)}
          </div>
        ) : null}

        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#38dab0",
            marginTop: 8,
          }}
        >
          {preco != null ? formatarPrecoSocial(preco) : "Confira a oferta"}
        </div>

        {oferta.cupom ? (
          <div
            style={{
              marginTop: 20,
              fontSize: 22,
              padding: "9px 14px",
              border: "2px dashed #f4bd42",
              borderRadius: 12,
              color: "#ffd66b",
              alignSelf: "flex-start",
            }}
          >
            CUPOM: {oferta.cupom}
          </div>
        ) : null}

        <div style={{ fontSize: 21, color: "#a8bfd2", marginTop: 18 }}>
          achadosdoale.com
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control":
          "public, max-age=600, s-maxage=86400, stale-while-revalidate=600",
        "Content-Type": "image/png",
      },
    }
  );
}
