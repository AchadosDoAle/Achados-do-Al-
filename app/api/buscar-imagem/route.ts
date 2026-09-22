import { NextResponse } from "next/server";
import { usuarioEhAdmin } from "@/lib/admin-auth";
import { criarClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

const USER_AGENTS = [
  // Meta/WhatsApp costuma conseguir previews que uma requisição de servidor
  // comum não recebe. Tentamos primeiro um crawler social.
  "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)",
  // Depois tentamos um navegador normal para páginas que bloqueiam crawlers.
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  // Alguns redirecionadores entregam uma resposta diferente para mobile.
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
];

const MAX_REDIRECTS = 8;

function limparUrl(valor: string) {
  return valor
    .trim()
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/gi, "&")
    .replace(/&#x2f;/gi, "/")
    .replace(/\\\//g, "/");
}

function urlHttpValida(valor: string) {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function absoluta(valor: string, base: string): string | null {
  try {
    return new URL(limparUrl(valor), base).href;
  } catch {
    return null;
  }
}

function extrairMeta(html: string, chave: string) {
  const chaveEscapada = chave.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const padroes = [
    new RegExp(
      `<meta[^>]+(?:property|name|itemprop)=["']${chaveEscapada}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["']${chaveEscapada}["']`,
      "i"
    ),
  ];

  for (const padrao of padroes) {
    const match = html.match(padrao);
    if (match?.[1]) return match[1];
  }
  return null;
}

function procurarImagemEmJson(valor: unknown): string | null {
  if (!valor) return null;

  if (typeof valor === "string") {
    return /^https?:\/\//i.test(valor) ? valor : null;
  }

  if (Array.isArray(valor)) {
    for (const item of valor) {
      const achada = procurarImagemEmJson(item);
      if (achada) return achada;
    }
    return null;
  }

  if (typeof valor === "object") {
    const obj = valor as Record<string, unknown>;

    // Schema.org costuma guardar a imagem exatamente nestas propriedades.
    for (const chave of ["image", "contentUrl", "thumbnailUrl"]) {
      if (obj[chave]) {
        const achada = procurarImagemEmJson(obj[chave]);
        if (achada) return achada;
      }
    }

    // Alguns sites encapsulam Product/Offer dentro de @graph.
    for (const chave of ["@graph", "mainEntity", "itemListElement"]) {
      if (obj[chave]) {
        const achada = procurarImagemEmJson(obj[chave]);
        if (achada) return achada;
      }
    }
  }

  return null;
}

function extrairImagemJsonLd(html: string) {
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const script of scripts) {
    const conteudo = script[1]?.trim();
    if (!conteudo) continue;
    try {
      const json = JSON.parse(conteudo);
      const imagem = procurarImagemEmJson(json);
      if (imagem) return imagem;
    } catch {
      // JSON-LD malformado é comum; seguimos para as outras estratégias.
    }
  }

  return null;
}

function extrairImagemFallback(html: string, urlBase: string) {
  const candidatos: Array<{ url: string; pontos: number }> = [];
  const imgs = html.matchAll(/<img\b[^>]*>/gi);

  for (const resultado of imgs) {
    const tag = resultado[0];
    const srcMatch = tag.match(
      /(?:data-zoom-image|data-old-hires|data-a-dynamic-image|data-src|data-lazy-src|src)=["']([^"']+)["']/i
    );
    if (!srcMatch?.[1]) continue;

    // data-a-dynamic-image da Amazon é um JSON dentro do atributo.
    let valor = srcMatch[1];
    if (valor.trim().startsWith("{")) {
      try {
        const json = JSON.parse(valor.replace(/&quot;/g, '"')) as Record<string, unknown>;
        const primeira = Object.keys(json)[0];
        if (primeira) valor = primeira;
      } catch {
        continue;
      }
    }

    const url = absoluta(valor, urlBase);
    if (!url || !/^https?:\/\//i.test(url)) continue;

    const textoTag = tag.toLowerCase();
    if (/(logo|icon|sprite|avatar|pixel|tracking|badge)/i.test(textoTag + url)) {
      continue;
    }

    let pontos = 0;
    if (/(product|produto|gallery|galeria|main|principal|zoom|hero)/i.test(textoTag)) pontos += 5;
    if (/(data-zoom-image|data-old-hires)/i.test(tag)) pontos += 6;

    const largura = Number(tag.match(/width=["']?(\d+)/i)?.[1] || 0);
    const altura = Number(tag.match(/height=["']?(\d+)/i)?.[1] || 0);
    if (largura >= 300 || altura >= 300) pontos += 3;
    if (largura >= 600 || altura >= 600) pontos += 2;

    candidatos.push({ url, pontos });
  }

  candidatos.sort((a, b) => b.pontos - a.pontos);
  return candidatos[0]?.url ?? null;
}

function extrairUrlImagem(html: string, urlBase: string): string | null {
  for (const chave of [
    "og:image:secure_url",
    "og:image:url",
    "og:image",
    "twitter:image:src",
    "twitter:image",
    "image",
  ]) {
    const valor = extrairMeta(html, chave);
    if (valor) {
      const url = absoluta(valor, urlBase);
      if (url) return url;
    }
  }

  const imageSrc = html.match(
    /<link[^>]+rel=["'](?:image_src|preload)["'][^>]+href=["']([^"']+)["'][^>]*>/i
  );
  if (imageSrc?.[1]) {
    const url = absoluta(imageSrc[1], urlBase);
    if (url) return url;
  }

  const jsonLd = extrairImagemJsonLd(html);
  if (jsonLd) {
    const url = absoluta(jsonLd, urlBase);
    if (url) return url;
  }

  return extrairImagemFallback(html, urlBase);
}

function extrairRedirecionamentoHtml(html: string, urlBase: string): string | null {
  const metaRefresh = html.match(
    /<meta[^>]+http-equiv=["']?refresh["']?[^>]+content=["'][^"']*url\s*=\s*([^"';>]+)["']/i
  );
  if (metaRefresh?.[1]) {
    const url = absoluta(metaRefresh[1], urlBase);
    if (url) return url;
  }

  const jsPatterns = [
    /(?:window\.)?location(?:\.href)?\s*=\s*["']([^"']+)["']/i,
    /(?:window\.)?location\.replace\(\s*["']([^"']+)["']\s*\)/i,
    /(?:window\.)?location\.assign\(\s*["']([^"']+)["']\s*\)/i,
  ];
  for (const padrao of jsPatterns) {
    const match = html.match(padrao);
    if (match?.[1]) {
      const url = absoluta(match[1], urlBase);
      if (url) return url;
    }
  }

  return null;
}

function extrairCanonical(html: string, urlBase: string): string | null {
  const match = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  return match?.[1] ? absoluta(match[1], urlBase) : null;
}

type ResultadoPagina = {
  imagem: string;
  pagina: string;
  userAgent: string;
};

async function procurarImagemNoFluxo(linkInicial: string): Promise<ResultadoPagina | null> {
  for (const userAgent of USER_AGENTS) {
    let atual = linkInicial;
    const visitadas = new Set<string>();

    for (let passo = 0; passo < MAX_REDIRECTS; passo += 1) {
      if (!urlHttpValida(atual) || visitadas.has(atual)) break;
      visitadas.add(atual);

      let resposta: Response;
      try {
        resposta = await fetch(atual, {
          method: "GET",
          redirect: "manual",
          cache: "no-store",
          headers: {
            "User-Agent": userAgent,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
          },
        });
      } catch {
        break;
      }

      if (resposta.status >= 300 && resposta.status < 400) {
        const location = resposta.headers.get("location");
        if (!location) break;
        const destino = absoluta(location, atual);
        if (!destino) break;
        atual = destino;
        continue;
      }

      if (!resposta.ok) break;

      const contentType = resposta.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        return { imagem: atual, pagina: atual, userAgent };
      }

      const html = await resposta.text();
      const paginaFinal = resposta.url || atual;
      const imagem = extrairUrlImagem(html, paginaFinal);
      if (imagem) {
        return { imagem, pagina: paginaFinal, userAgent };
      }

      // Alguns encurtadores (especialmente links de app/afiliado) não fazem
      // um 301/302 puro: entregam uma página que redireciona via HTML/JS.
      const redirecionamentoHtml = extrairRedirecionamentoHtml(html, paginaFinal);
      if (redirecionamentoHtml && !visitadas.has(redirecionamentoHtml)) {
        atual = redirecionamentoHtml;
        continue;
      }

      // Se o link de tracking chegou a uma página sem preview, o canonical
      // muitas vezes aponta para a página de produto limpa, que contém a imagem.
      const canonical = extrairCanonical(html, paginaFinal);
      if (canonical && canonical !== paginaFinal && !visitadas.has(canonical)) {
        atual = canonical;
        continue;
      }

      break;
    }
  }

  return null;
}

function candidatosAdicionais(link: string) {
  const candidatos: string[] = [];
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    const ultimoTrecho = url.pathname.split("/").filter(Boolean).pop() || "";

    // Links de compartilhamento da Amazon podem parar num redirecionador
    // intermediário. O trecho B0XXXXXXXX costuma ser o ASIN do produto.
    if ((host === "link.amazon" || host.endsWith("amzlinks.in")) && /^[A-Z0-9]{10}$/i.test(ultimoTrecho)) {
      candidatos.push(`https://www.amazon.com.br/dp/${ultimoTrecho}`);
    }
  } catch {
    // O link principal já será validado no fluxo normal.
  }
  return candidatos;
}

async function baixarImagem(resultado: ResultadoPagina) {
  const resposta = await fetch(resultado.imagem, {
    redirect: "follow",
    cache: "no-store",
    headers: {
      "User-Agent": resultado.userAgent,
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: resultado.pagina,
    },
  });

  if (!resposta.ok) return null;
  const tipo = resposta.headers.get("content-type") || "";
  if (!tipo.startsWith("image/")) return null;

  return {
    bytes: await resposta.arrayBuffer(),
    tipo,
  };
}

export async function POST(req: Request) {
  if (!(await usuarioEhAdmin())) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  const { link } = await req.json();
  if (!link || typeof link !== "string" || !urlHttpValida(link)) {
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
    const tentativas = [link, ...candidatosAdicionais(link)];
    let resultado: ResultadoPagina | null = null;

    for (const candidato of tentativas) {
      resultado = await procurarImagemNoFluxo(candidato);
      if (resultado) break;
    }

    if (!resultado) {
      return NextResponse.json(
        {
          erro:
            "Não encontramos uma imagem automaticamente. O site da loja pode estar bloqueando robôs ou entregar o produto apenas pelo aplicativo. Você ainda pode enviar a foto manualmente.",
        },
        { status: 200 }
      );
    }

    const imagem = await baixarImagem(resultado);
    if (!imagem) {
      return NextResponse.json(
        {
          erro:
            "Encontramos a imagem, mas a loja bloqueou o download automático. Envie a foto manualmente.",
        },
        { status: 200 }
      );
    }

    const extensao = imagem.tipo.includes("png")
      ? "png"
      : imagem.tipo.includes("webp")
      ? "webp"
      : imagem.tipo.includes("avif")
      ? "avif"
      : imagem.tipo.includes("gif")
      ? "gif"
      : "jpg";
    const nomeArquivo = `${crypto.randomUUID()}-auto.${extensao}`;

    const { error } = await supabase.storage
      .from("ofertas")
      .upload(nomeArquivo, imagem.bytes, {
        contentType: imagem.tipo,
        upsert: false,
      });

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
