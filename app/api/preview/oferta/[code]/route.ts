import { NextResponse } from "next/server";
import { criarClientePublico } from "@/lib/supabase/public";
import { buscarOfertaPorCodigoCurto, imagemAbsolutaDaOferta } from "@/lib/oferta-share";
import { gerarImagemSocialFallback } from "@/lib/preview-social";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS_SUPORTADOS = new Set(["image/jpeg", "image/png", "image/webp"]);
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

function ehUrlPublicaSegura(url: URL): boolean {
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".test") ||
    host === "metadata.google.internal" ||
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) ||
    host.includes(":")
  ) return false;
  return true;
}

async function carregarImagemPublica(endereco: string): Promise<{ bytes: ArrayBuffer; tipo: string } | null> {
  try {
    let atual = new URL(endereco);
    for (let redirecionamentos = 0; redirecionamentos <= 3; redirecionamentos++) {
      if (!ehUrlPublicaSegura(atual)) return null;
      const resposta = await fetch(atual.toString(), {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(4500),
        cache: "no-store",
        headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" },
      });
      if ([301, 302, 303, 307, 308].includes(resposta.status)) {
        const destino = resposta.headers.get("location");
        if (!destino) return null;
        atual = new URL(destino, atual);
        continue;
      }
      if (!resposta.ok) return null;
      const tipo = (resposta.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
      if (!TIPOS_SUPORTADOS.has(tipo)) return null;
      const comprimento = Number(resposta.headers.get("content-length") || 0);
      if (comprimento > TAMANHO_MAXIMO) return null;
      const bytes = await resposta.arrayBuffer();
      if (bytes.byteLength < 100 || bytes.byteLength > TAMANHO_MAXIMO) return null;
      return { bytes, tipo };
    }
  } catch {
    // A loja pode bloquear o servidor: ainda entregamos uma imagem OG válida.
  }
  return null;
}

/** Miniatura pública no domínio do Achado do Alê para bots do WhatsApp/Meta. */
export async function GET(_request: Request, { params }: { params: { code: string } }) {
  try {
    const oferta = await buscarOfertaPorCodigoCurto(criarClientePublico(), params.code);
    if (!oferta) return new NextResponse(null, { status: 404 });

    const origem = imagemAbsolutaDaOferta(oferta);
    const imagem = origem ? await carregarImagemPublica(origem) : null;
    if (imagem) {
      return new NextResponse(imagem.bytes, {
        headers: {
          "Content-Type": imagem.tipo,
          "Cache-Control": "public, max-age=600, s-maxage=86400, stale-while-revalidate=600",
          "Content-Disposition": "inline",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return gerarImagemSocialFallback(oferta);
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
