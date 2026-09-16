import { NextResponse, type NextRequest } from "next/server";
import { criarClientePublico } from "@/lib/supabase/public";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = criarClientePublico();

  const { data: oferta } = await supabase
    .from("offers")
    .select("link_produto, status")
    .eq("id", params.id)
    .maybeSingle();

  if (!oferta) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Não bloqueia o redirecionamento se o registro do clique falhar —
  // o mais importante é a pessoa chegar até a loja.
  await supabase.from("clicks").insert({
    offer_id: params.id,
    origem: req.headers.get("referer") ?? "direto",
  });

  return NextResponse.redirect(oferta.link_produto);
}
