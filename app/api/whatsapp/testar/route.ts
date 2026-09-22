import { NextResponse } from "next/server";
import { testarConexaoWhatsApp } from "@/lib/whatsapp";
import { usuarioEhAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await usuarioEhAdmin())) {
    return NextResponse.json({ ok: false, erro: "Não autorizado" }, { status: 401 });
  }
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return NextResponse.json({ ok: false, erro: "WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados." });
  }
  return NextResponse.json(await testarConexaoWhatsApp());
}
