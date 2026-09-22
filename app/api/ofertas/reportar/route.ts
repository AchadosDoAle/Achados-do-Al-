import { createHash, randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";

const MOTIVOS = new Set(["promocao_vencida", "produto_acabou", "preco_divergente"]);
const COOKIE = "achado_reporter";

export async function POST(req: NextRequest) {
  const { offerId, motivo } = await req.json().catch(() => ({}));
  if (!offerId || !MOTIVOS.has(motivo)) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "sem-ip";
  const ua = req.headers.get("user-agent") || "sem-ua";
  const navegadorId = req.cookies.get(COOKIE)?.value || randomUUID();
  const salt = process.env.REPORT_FINGERPRINT_SALT || process.env.CRON_SECRET || "achado-do-ale";
  const reporterId = createHash("sha256").update(`${salt}|${ip}|${ua}|${navegadorId}`).digest("hex");

  const supabase = criarClienteAdmin();
  const umaHoraAtras = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentes } = await supabase
    .from("offer_reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", reporterId)
    .gte("criado_em", umaHoraAtras);

  if ((recentes ?? 0) >= 12) {
    const resposta = NextResponse.json({ erro: "Muitos avisos em pouco tempo." }, { status: 429 });
    resposta.cookies.set(COOKIE, navegadorId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return resposta;
  }

  const { data: oferta } = await supabase
    .from("offers")
    .select("id,status")
    .eq("id", offerId)
    .maybeSingle();

  if (!oferta || !["publicada", "expirada"].includes(oferta.status)) {
    return NextResponse.json({ erro: "Oferta indisponível" }, { status: 404 });
  }

  const { error: inserirErro } = await supabase
    .from("offer_reports")
    .insert({ offer_id: offerId, reporter_id: reporterId, motivo });

  const novoAviso = !inserirErro;
  if (inserirErro && inserirErro.code !== "23505") {
    return NextResponse.json({ erro: inserirErro.message }, { status: 500 });
  }

  const { count } = await supabase
    .from("offer_reports")
    .select("id", { count: "exact", head: true })
    .eq("offer_id", offerId);

  const total = count ?? 0;
  let desativada = oferta.status === "expirada";
  if (total >= 3 && oferta.status === "publicada") {
    await supabase
      .from("offers")
      .update({ status: "expirada", atualizado_em: new Date().toISOString() })
      .eq("id", offerId)
      .eq("status", "publicada");
    desativada = true;
  }

  const resposta = NextResponse.json({ total, desativada, novoAviso });
  resposta.cookies.set(COOKIE, navegadorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return resposta;
}
