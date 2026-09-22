import { NextResponse, type NextRequest } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = criarClienteAdmin();
  const { data: oferta } = await supabase.from("offers").select("id,link_produto").eq("id", params.id).maybeSingle();
  if (!oferta?.link_produto) return NextResponse.redirect(new URL("/", req.url));

  const origem = req.nextUrl.searchParams.get("origem") || req.headers.get("referer") || "site";
  await supabase.from("clicks").insert({ offer_id: oferta.id, origem: String(origem).slice(0, 500) });
  return NextResponse.redirect(oferta.link_produto, 302);
}
