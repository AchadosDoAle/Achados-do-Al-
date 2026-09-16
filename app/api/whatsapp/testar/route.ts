import { NextResponse } from "next/server";
import { testarConexaoWhatsApp } from "@/lib/whatsapp";

export async function GET() {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return NextResponse.json({
      ok: false,
      erro: "WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados.",
    });
  }

  const resultado = await testarConexaoWhatsApp();
  return NextResponse.json(resultado);
}
