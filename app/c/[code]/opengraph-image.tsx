import { ImageResponse } from "next/og";
import { criarClientePublico } from "@/lib/supabase/public";
import {
  beneficioCupom,
  buscarCupomPorCodigoCurto,
  formatarValidadeCupom,
} from "@/lib/cupom-share";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { code: string } }) {
  const cupom = await buscarCupomPorCodigoCurto(criarClientePublico(), params.code);
  if (!cupom?.ativo) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#07111F", color: "white", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
        Achado do Alê
      </div>,
      size
    );
  }

  const beneficio = beneficioCupom(cupom);
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#07111F", color: "#F8FAFC", padding: 54, fontFamily: "sans-serif" }}>
      <div style={{ width: "100%", border: "3px solid #F5B942", borderRadius: 36, padding: 48, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 27, color: "#F5B942", fontWeight: 900, letterSpacing: 2 }}>CUPOM LIBERADO · ACHADO DO ALÊ</div>
        <div style={{ marginTop: 28, fontSize: 68, fontWeight: 900, lineHeight: 1.05 }}>{cupom.nomeCupom}</div>
        {beneficio ? <div style={{ marginTop: 22, fontSize: 42, color: "#2FBF8F", fontWeight: 900 }}>{beneficio}</div> : null}
        <div style={{ marginTop: 30, display: "flex", gap: 34, fontSize: 28, color: "#CBD5E1" }}>
          <div>🏪 {cupom.loja}</div>
          <div>⏰ {formatarValidadeCupom(cupom.validade)}</div>
        </div>
      </div>
    </div>,
    size
  );
}
