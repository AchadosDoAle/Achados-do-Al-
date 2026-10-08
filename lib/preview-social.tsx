import { ImageResponse } from "next/og";
import type { Oferta } from "./types";
import { formatarPrecoSocial, precoPrincipalDaOferta } from "./oferta-share";

/** Fallback de imagem de compartilhamento, servido pelo próprio domínio. */
export function gerarImagemSocialFallback(oferta: Oferta): ImageResponse {
  const preco = precoPrincipalDaOferta(oferta);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: "#08182b",
        color: "#ffffff",
        padding: 54,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: 320,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 28,
          backgroundColor: "#112b45",
        }}
      >
        <div style={{ fontSize: 98, fontWeight: 900, color: "#f4bd42" }}>A</div>
        <div style={{ fontSize: 26, color: "#f4bd42", fontWeight: 800 }}>ACHADO DO ALÊ</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 740,
          paddingLeft: 42,
        }}
      >
        <div style={{ fontSize: 26, color: "#f4bd42", fontWeight: 700 }}>{oferta.loja}</div>
        <div style={{ fontSize: 45, fontWeight: 800, lineHeight: 1.13, marginTop: 20, maxHeight: 240, overflow: "hidden" }}>
          {oferta.titulo}
        </div>
        <div style={{ fontSize: 53, fontWeight: 800, color: "#38dab0", marginTop: 30 }}>
          {preco != null ? formatarPrecoSocial(preco) : "Confira a oferta"}
        </div>
        <div style={{ fontSize: 23, color: "#a8bfd2", marginTop: 16 }}>achadosdoale.com</div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
