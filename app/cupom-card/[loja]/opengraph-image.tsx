import { ImageResponse } from "next/og";
import { estiloCardCupomPorSlug } from "@/lib/cupom-preview-card";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function tamanhoNome(nome: string) {
  if (nome.length <= 10) return 92;
  if (nome.length <= 16) return 80;
  if (nome.length <= 22) return 68;
  return 58;
}

export default function Image({ params }: { params: { loja: string } }) {
  const [loja, estilo] = estiloCardCupomPorSlug(params.loja);
  const nomeLoja = estilo.nome ?? loja.toLocaleUpperCase("pt-BR");
  const fonteLoja = tamanhoNome(nomeLoja);

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: estilo.fundo, color: "#172033", padding: "54px 70px 58px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, fontWeight: 800, letterSpacing: 4, lineHeight: 1 }}>
        CUPOM LIBERADO
      </div>
      <div style={{ width: 880, height: 320, marginTop: 54, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: estilo.cupom, borderRadius: 24, boxShadow: "0 28px 52px rgba(15, 23, 42, 0.18)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 24, display: "flex", border: `3px solid ${estilo.contorno}`, borderRadius: 14 }} />
        <div style={{ position: "absolute", left: -34, top: 126, width: 68, height: 68, display: "flex", borderRadius: 999, background: estilo.fundo }} />
        <div style={{ position: "absolute", right: -34, top: 126, width: 68, height: 68, display: "flex", borderRadius: 999, background: estilo.fundo }} />
        <div style={{ width: 690, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: estilo.texto, fontSize: fonteLoja, fontWeight: 800, lineHeight: 1.02, letterSpacing: nomeLoja.length <= 12 ? 2 : 0, textTransform: "uppercase" }}>
          {nomeLoja}
        </div>
      </div>
    </div>,
    size
  );
}
