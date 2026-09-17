import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Tenta achar a imagem "oficial" da página (a mesma que aparece quando
// você cola o link no WhatsApp) procurando as meta tags mais comuns.
function extrairUrlImagem(html: string, urlBase: string): string | null {
  const padroes = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const padrao of padroes) {
    const encontrado = html.match(padrao);
    if (encontrado?.[1]) {
      try {
        return new URL(encontrado[1], urlBase).href;
      } catch {
        continue;
      }
    }
  }
  return null;
}

export async function POST(req: Request) {
  const { link } = await req.json();
  if (!link || typeof link !== "string") {
    return NextResponse.json({ erro: "Link inválido." }, { status: 400 });
  }

  const supabase = criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  try {
    const respostaPagina = await fetch(link, {
      headers: {
        // Vários sites de loja só entregam a página completa (com as
        // meta tags de imagem) para um navegador de verdade.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!respostaPagina.ok) {
      return NextResponse.json(
        { erro: "Não foi possível abrir o link do produto." },
        { status: 200 }
      );
    }

    const html = await respostaPagina.text();
    const urlImagem = extrairUrlImagem(html, respostaPagina.url);

    if (!urlImagem) {
      return NextResponse.json(
        { erro: "Não encontramos uma imagem automaticamente nessa página." },
        { status: 200 }
      );
    }

    // Baixa a imagem e guarda no nosso próprio Storage, para não depender
    // do site da loja continuar servindo essa imagem no mesmo endereço.
    const respostaImagem = await fetch(urlImagem);
    if (!respostaImagem.ok) {
      return NextResponse.json(
        { erro: "Encontramos a imagem, mas não conseguimos baixá-la." },
        { status: 200 }
      );
    }

    const bytes = await respostaImagem.arrayBuffer();
    const tipo = respostaImagem.headers.get("content-type") || "image/jpeg";
    const extensao = tipo.includes("png")
      ? "png"
      : tipo.includes("webp")
      ? "webp"
      : "jpg";
    const nomeArquivo = `${crypto.randomUUID()}-auto.${extensao}`;

    const { error } = await supabase.storage
      .from("ofertas")
      .upload(nomeArquivo, bytes, { contentType: tipo, upsert: false });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 200 });
    }

    const { data } = supabase.storage.from("ofertas").getPublicUrl(nomeArquivo);

    return NextResponse.json({ imagemUrl: data.publicUrl });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json(
      { erro: "Não foi possível buscar a imagem automaticamente." },
      { status: 200 }
    );
  }
}
