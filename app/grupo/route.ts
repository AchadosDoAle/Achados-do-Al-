import { NextResponse } from "next/server";

const URL_CANAL_WHATSAPP =
  "https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J";

function redirecionarParaCanal() {
  // 307 (temporário) é intencional: permite trocar o destino no futuro
  // sem os navegadores manterem um redirecionamento permanente em cache.
  return NextResponse.redirect(URL_CANAL_WHATSAPP, 307);
}

export function GET() {
  return redirecionarParaCanal();
}

export function HEAD() {
  return redirecionarParaCanal();
}
