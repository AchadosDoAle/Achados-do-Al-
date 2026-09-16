import { NextResponse, type NextRequest } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  // Protege a rota: só a própria Vercel (com o segredo configurado)
  // pode disparar essa publicação automática.
  const segredo = req.headers.get("authorization");
  if (segredo !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const supabase = criarClienteAdmin();
  const agora = new Date().toISOString();

  const { data: ofertasParaPublicar, error } = await supabase
    .from("offers")
    .select("id")
    .eq("status", "agendada")
    .lte("agendado_para", agora);

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  for (const oferta of ofertasParaPublicar ?? []) {
    await supabase
      .from("offers")
      .update({ status: "publicada", publicado_em: agora })
      .eq("id", oferta.id);
  }

  return NextResponse.json({
    publicadas: ofertasParaPublicar?.length ?? 0,
  });
}
