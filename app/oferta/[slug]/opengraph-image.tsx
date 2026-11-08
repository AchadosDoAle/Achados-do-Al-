import { ImageResponse } from "next/og";
import { criarClientePublico } from "@/lib/supabase/public";
import { buscarOfertaPorSlug } from "@/lib/offers-repo";
import {
  imagemAbsolutaDaOferta,
  precoPrincipalDaOferta,
  precoPrincipalEhPix,
} from "@/lib/oferta-share";

export const runtime = "nodejs";
export const revalidate = 0;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TIPOS_IMAGEM = new Set(["image/jpeg", "image/png", "image/webp"]);
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

function dinheiro(v?: number) {
  return v == null
    ? "Confira o preço"
    : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function urlPublicaSegura(url: URL) {
  if (url.protocol !== "https:" || url.username || url.password || url.port) {
    return false;
  }

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
  ) {
    return false;
  }

  return true;
}

/**
 * Baixa a foto do produto ANTES de montar o PNG social.
 *
 * O ImageResponse pode falhar silenciosamente para o crawler do WhatsApp
 * quando tenta buscar diretamente imagens de algumas CDNs de lojas.
 * Embutindo os bytes como data URL, o og:image final deixa de depender
 * dessa segunda requisição externa.
 */
async function imagemEmbutida(endereco?: string): Promise<string | null> {
  if (!endereco) return null;

  try {
    let atual = new URL(endereco);

    for (let redirecionamentos = 0; redirecionamentos <= 3; redirecionamentos++) {
      if (!urlPublicaSegura(atual)) return null;

      const resposta = await fetch(atual.toString(), {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(6500),
        headers: {
          Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36",
        },
      });

      if ([301, 302, 303, 307, 308].includes(resposta.status)) {
        const destino = resposta.headers.get("location");
        if (!destino) return null;
        atual = new URL(destino, atual);
        continue;
      }

      if (!resposta.ok) return null;

      const tipo = (resposta.headers.get("content-type") || "")
        .split(";")[0]
        .trim()
        .toLowerCase();

      if (!TIPOS_IMAGEM.has(tipo)) return null;

      const tamanhoDeclarado = Number(resposta.headers.get("content-length") || 0);
      if (tamanhoDeclarado > TAMANHO_MAXIMO) return null;

      const bytes = await resposta.arrayBuffer();
      if (bytes.byteLength < 100 || bytes.byteLength > TAMANHO_MAXIMO) return null;

      return `data:${tipo};base64,${Buffer.from(bytes).toString("base64")}`;
    }
  } catch {
    // Se a loja bloquear a requisição, a arte social ainda será gerada
    // com um fallback visual — nunca deixamos o og:image sem resposta.
  }

  return null;
}

export default async function Image({ params }: { params: { slug: string } }) {
  const oferta = await buscarOfertaPorSlug(criarClientePublico(), params.slug);

  if (!oferta) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#07111F",
          color: "white",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 800,
        }}
      >
        Achado do Alê
      </div>,
      size
    );
  }

  const preco = precoPrincipalDaOferta(oferta);
  const origem = imagemAbsolutaDaOferta(oferta);
  const fotoProduto = await imagemEmbutida(origem);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#07111F",
        color: "#F8FAFC",
        padding: 48,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "46%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 32,
          overflow: "hidden",
          padding: 24,
        }}
      >
        {fotoProduto ? (
          <img
            src={fotoProduto}
            width="500"
            height="500"
            style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#07111F",
            }}
          >
            <div style={{ fontSize: 116 }}>🛍️</div>
            <div style={{ marginTop: 18, fontSize: 28, fontWeight: 800 }}>
              ACHADO DO ALÊ
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          width: "54%",
          paddingLeft: 48,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 28, color: "#F5B942", fontWeight: 800 }}>
          ACHADO DO ALÊ · {oferta.loja}
        </div>

        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            lineHeight: 1.08,
            marginTop: 18,
            maxHeight: 190,
            overflow: "hidden",
          }}
        >
          {oferta.titulo}
        </div>

        {oferta.precoAntigo ? (
          <div
            style={{
              fontSize: 28,
              color: "#A8B5C5",
              marginTop: 26,
              textDecoration: "line-through",
            }}
          >
            {dinheiro(oferta.precoAntigo)}
          </div>
        ) : null}

        <div
          style={{
            fontSize: 58,
            color: precoPrincipalEhPix(oferta) ? "#2FBF8F" : "#F5B942",
            fontWeight: 900,
            marginTop: 8,
          }}
        >
          {dinheiro(preco)}
        </div>

        {precoPrincipalEhPix(oferta) ? (
          <div style={{ fontSize: 24, color: "#2FBF8F", fontWeight: 700 }}>
            NO PIX
          </div>
        ) : null}

        {oferta.cupom ? (
          <div
            style={{
              marginTop: 24,
              fontSize: 24,
              padding: "10px 16px",
              border: "2px dashed #F5B942",
              borderRadius: 14,
              color: "#FFD66B",
              alignSelf: "flex-start",
            }}
          >
            CUPOM: {oferta.cupom}
          </div>
        ) : null}
      </div>
    </div>,
    size
  );
}
