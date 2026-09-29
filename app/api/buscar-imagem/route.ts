import { NextResponse } from "next/server";
import { usuarioEhAdmin } from "@/lib/admin-auth";
import { criarClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

const USER_AGENTS = [
  // O WhatsApp/Meta costuma enxergar previews que uma requisição genérica não recebe.
  "WhatsApp/2.24.20.89 A",
  "facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)",
  "Facebot",
  "TelegramBot (like TwitterBot)",
  // Fallbacks de navegador para páginas que bloqueiam crawlers sociais.
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
];

const MAX_REDIRECTS = 10;

function limparUrl(valor: string) {
  return valor
    .trim()
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&#38;/gi, "&")
    .replace(/&#x2f;/gi, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/\\u002f/gi, "/")
    .replace(/\\\//g, "/");
}

function urlHttpValida(valor: string) {
  try {
    const url = new URL(valor);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    // Evita acessos óbvios à própria máquina/rede local pelo endpoint administrativo.
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function absoluta(valor: string, base: string): string | null {
  try {
    const url = new URL(limparUrl(valor), base).href;
    return urlHttpValida(url) ? url : null;
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
    if (match?.[1]) return limparUrl(match[1]);
  }
  return null;
}

function pareceImagemUtil(url: string) {
  return !/(?:logo|favicon|sprite|avatar|pixel|tracking|badge|icon(?:-|_|\.)|placeholder|spacer)/i.test(
    url
  );
}

function procurarImagemEmJson(valor: unknown, profundidade = 0): string | null {
  if (!valor || profundidade > 8) return null;

  if (typeof valor === "string") {
    const limpo = limparUrl(valor);
    const pareceUrlDeImagem =
      /^(?:https?:)?\/\//i.test(limpo) ||
      /^\//.test(limpo) ||
      /\.(?:jpe?g|png|webp|avif|gif)(?:[?#]|$)/i.test(limpo);
    return pareceUrlDeImagem && pareceImagemUtil(limpo) ? limpo : null;
  }

  if (Array.isArray(valor)) {
    for (const item of valor) {
      const achada = procurarImagemEmJson(item, profundidade + 1);
      if (achada) return achada;
    }
    return null;
  }

  if (typeof valor === "object") {
    const obj = valor as Record<string, unknown>;

    // Prioriza nomes que normalmente representam a imagem do produto.
    const chavesImagem = [
      "image",
      "images",
      "imageUrl",
      "image_url",
      "imageURL",
      "secure_url",
      "contentUrl",
      "thumbnailUrl",
      "thumbnail",
      "picture",
      "pictures",
      "primaryImage",
      "mainImage",
    ];
    for (const chave of chavesImagem) {
      if (obj[chave] != null) {
        const achada = procurarImagemEmJson(obj[chave], profundidade + 1);
        if (achada) return achada;
      }
    }

    // Depois percorre estruturas aninhadas (Next.js, GraphQL, schema.org etc.).
    for (const [chave, item] of Object.entries(obj)) {
      if (chavesImagem.includes(chave)) continue;
      if (typeof item !== "object" || item == null) continue;
      const achada = procurarImagemEmJson(item, profundidade + 1);
      if (achada) return achada;
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

function extrairImagemDeScripts(html: string, urlBase: string) {
  // Next.js, lojas SPA e páginas de afiliado frequentemente serializam o
  // produto em JSON mesmo quando as tags Open Graph não vêm no HTML inicial.
  const scriptsJson = html.matchAll(
    /<script[^>]*(?:id=["']__NEXT_DATA__["']|type=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const script of scriptsJson) {
    const conteudo = script[1]?.trim();
    if (!conteudo) continue;
    try {
      const json = JSON.parse(conteudo);
      const imagem = procurarImagemEmJson(json);
      if (imagem) return absoluta(imagem, urlBase);
    } catch {
      // Continua para a busca textual abaixo.
    }
  }

  const padroes = [
    /["'](?:imageUrl|image_url|imageURL|primaryImage|mainImage|thumbnailUrl|secure_url)["']\s*:\s*["']([^"']+)["']/gi,
    /["'](?:image|thumbnail|picture)["']\s*:\s*["'](https?:\\?\/\\?\/[^"']+)["']/gi,
  ];
  for (const padrao of padroes) {
    for (const match of html.matchAll(padrao)) {
      const url = match[1] ? absoluta(match[1], urlBase) : null;
      if (url && pareceImagemUtil(url)) return url;
    }
  }

  return null;
}

function maiorSrcset(valor: string, urlBase: string) {
  const candidatos = valor
    .split(",")
    .map((parte) => parte.trim())
    .map((parte) => {
      const [src, descriptor = ""] = parte.split(/\s+/, 2);
      const peso = Number(descriptor.replace(/[^0-9.]/g, "")) || 0;
      return { url: absoluta(src, urlBase), peso };
    })
    .filter((item): item is { url: string; peso: number } => Boolean(item.url));

  candidatos.sort((a, b) => b.peso - a.peso);
  return candidatos[0]?.url ?? null;
}

function extrairImagemFallback(html: string, urlBase: string) {
  const candidatos: Array<{ url: string; pontos: number }> = [];
  const tags = html.matchAll(/<(?:img|source)\b[^>]*>/gi);

  for (const resultado of tags) {
    const tag = resultado[0];
    const srcsetMatch = tag.match(/(?:data-srcset|srcset)=["']([^"']+)["']/i);
    const srcMatch = tag.match(
      /(?:data-zoom-image|data-old-hires|data-a-dynamic-image|data-src|data-lazy-src|data-original|src)=["']([^"']+)["']/i
    );

    let url: string | null = null;
    if (srcsetMatch?.[1]) url = maiorSrcset(srcsetMatch[1], urlBase);

    if (!url && srcMatch?.[1]) {
      let valor = srcMatch[1];
      // data-a-dynamic-image da Amazon é um JSON dentro do atributo.
      if (valor.trim().startsWith("{")) {
        try {
          const json = JSON.parse(valor.replace(/&quot;/g, '"')) as Record<string, unknown>;
          const primeira = Object.keys(json)[0];
          if (primeira) valor = primeira;
        } catch {
          valor = "";
        }
      }
      if (valor) url = absoluta(valor, urlBase);
    }

    if (!url || !pareceImagemUtil(url)) continue;

    const textoTag = tag.toLowerCase();
    let pontos = 0;
    if (/(product|produto|gallery|galeria|main|principal|zoom|hero|primary)/i.test(textoTag)) pontos += 7;
    if (/(data-zoom-image|data-old-hires|srcset)/i.test(tag)) pontos += 6;

    const largura = Number(tag.match(/width=["']?(\d+)/i)?.[1] || 0);
    const altura = Number(tag.match(/height=["']?(\d+)/i)?.[1] || 0);
    if (largura >= 300 || altura >= 300) pontos += 3;
    if (largura >= 600 || altura >= 600) pontos += 3;

    candidatos.push({ url, pontos });
  }

  const css = html.matchAll(/background(?:-image)?\s*:\s*url\(["']?([^"')]+)["']?\)/gi);
  for (const match of css) {
    const url = match[1] ? absoluta(match[1], urlBase) : null;
    if (url && pareceImagemUtil(url)) candidatos.push({ url, pontos: 2 });
  }

  candidatos.sort((a, b) => b.pontos - a.pontos);
  return candidatos[0]?.url ?? null;
}

function extrairUrlImagem(html: string, urlBase: string): string | null {
  const candidatosMeta: string[] = [];
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
      if (url) candidatosMeta.push(url);
    }
  }

  const metaUtil = candidatosMeta.find(pareceImagemUtil);
  if (metaUtil) return metaUtil;

  const imageSrc = html.match(
    /<link[^>]+rel=["'](?:image_src|preload)["'][^>]+href=["']([^"']+)["'][^>]*>/i
  );
  if (imageSrc?.[1]) {
    const url = absoluta(imageSrc[1], urlBase);
    if (url && pareceImagemUtil(url)) return url;
  }

  const jsonLd = extrairImagemJsonLd(html);
  if (jsonLd) {
    const url = absoluta(jsonLd, urlBase);
    if (url) return url;
  }

  const script = extrairImagemDeScripts(html, urlBase);
  if (script) return script;

  const fallback = extrairImagemFallback(html, urlBase);
  if (fallback) return fallback;

  // Se só havia uma meta genérica (ex.: URL com "logo" no nome), ainda é
  // melhor devolvê-la como último recurso do que falhar sem qualquer imagem.
  return candidatosMeta[0] ?? null;
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
  const padroes = [
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i,
  ];
  for (const padrao of padroes) {
    const match = html.match(padrao);
    if (match?.[1]) return absoluta(match[1], urlBase);
  }
  return null;
}

function extrairDestinoDosParametros(link: string) {
  const destinos: string[] = [];
  try {
    const url = new URL(link);
    for (const chave of ["url", "u", "target", "dest", "destination", "redirect", "redirect_url", "redirect_uri", "deeplink", "link"]) {
      const valor = url.searchParams.get(chave);
      if (!valor) continue;
      let atual = valor;
      for (let i = 0; i < 2; i += 1) {
        try {
          atual = decodeURIComponent(atual);
        } catch {
          break;
        }
      }
      const destino = absoluta(atual, link);
      if (destino && destino !== link) destinos.push(destino);
    }
  } catch {
    // Ignora URL inválida; a validação principal trata isso.
  }
  return destinos;
}

function extrairLinkProvavel(html: string, urlBase: string) {
  for (const match of html.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1];
    const texto = match[2].replace(/<[^>]+>/g, " ");
    if (!/(produto|product|oferta|comprar|continuar|abrir|ver item|ir para)/i.test(`${href} ${texto}`)) {
      continue;
    }
    const url = absoluta(href, urlBase);
    if (url && url !== urlBase) return url;
  }
  return null;
}

type ResultadoPagina = {
  imagem: string;
  pagina: string;
  userAgent: string;
};

async function procurarImagemNoFluxo(linkInicial: string): Promise<ResultadoPagina | null> {
  for (const userAgent of USER_AGENTS) {
    const fila = [linkInicial, ...extrairDestinoDosParametros(linkInicial)];
    const visitadas = new Set<string>();

    for (let passo = 0; passo < MAX_REDIRECTS && fila.length; passo += 1) {
      const atual = fila.shift()!;
      if (!urlHttpValida(atual) || visitadas.has(atual)) continue;
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
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/*,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
      } catch {
        continue;
      }

      if (resposta.status >= 300 && resposta.status < 400) {
        const location = resposta.headers.get("location");
        if (location) {
          const destino = absoluta(location, atual);
          if (destino && !visitadas.has(destino)) fila.unshift(destino);
        }
        continue;
      }

      if (!resposta.ok) continue;

      const contentType = resposta.headers.get("content-type") || "";
      if (contentType.startsWith("image/")) {
        return { imagem: resposta.url || atual, pagina: atual, userAgent };
      }

      const html = await resposta.text();
      const paginaFinal = resposta.url || atual;
      const imagem = extrairUrlImagem(html, paginaFinal);
      if (imagem) return { imagem, pagina: paginaFinal, userAgent };

      const proximos = [
        extrairRedirecionamentoHtml(html, paginaFinal),
        extrairCanonical(html, paginaFinal),
        ...extrairDestinoDosParametros(paginaFinal),
        extrairLinkProvavel(html, paginaFinal),
      ].filter((item): item is string => Boolean(item));

      for (const destino of proximos) {
        if (!visitadas.has(destino)) fila.push(destino);
      }
    }
  }

  return null;
}

function candidatosAdicionais(link: string) {
  const candidatos = extrairDestinoDosParametros(link);
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    const trechos = url.pathname.split("/").filter(Boolean);
    const ultimoTrecho = trechos.at(-1) || "";

    // Links de compartilhamento da Amazon às vezes carregam o ASIN na URL.
    const asin = trechos.find((trecho) => /^[A-Z0-9]{10}$/i.test(trecho));
    if ((host.includes("amazon") || host.endsWith("amzlinks.in")) && asin) {
      candidatos.push(`https://www.amazon.com.br/dp/${asin}`);
    } else if ((host === "link.amazon" || host.endsWith("amzlinks.in")) && /^[A-Z0-9]{10}$/i.test(ultimoTrecho)) {
      candidatos.push(`https://www.amazon.com.br/dp/${ultimoTrecho}`);
    }
  } catch {
    // O link principal já será validado no fluxo normal.
  }
  return Array.from(new Set(candidatos));
}

async function baixarImagem(resultado: ResultadoPagina) {
  const tentativas = [
    { userAgent: resultado.userAgent, referer: resultado.pagina },
    { userAgent: USER_AGENTS[0], referer: resultado.pagina },
    { userAgent: USER_AGENTS[1], referer: resultado.pagina },
    { userAgent: USER_AGENTS[4], referer: resultado.pagina },
    { userAgent: USER_AGENTS[4], referer: undefined },
  ];

  for (const tentativa of tentativas) {
    try {
      const headers: Record<string, string> = {
        "User-Agent": tentativa.userAgent,
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      };
      if (tentativa.referer) headers.Referer = tentativa.referer;

      const resposta = await fetch(resultado.imagem, {
        redirect: "follow",
        cache: "no-store",
        headers,
      });

      if (!resposta.ok) continue;
      const tipo = resposta.headers.get("content-type") || "";
      if (!tipo.startsWith("image/")) continue;

      const bytes = await resposta.arrayBuffer();
      if (bytes.byteLength < 512) continue;
      return { bytes, tipo };
    } catch {
      // Tenta o próximo conjunto de cabeçalhos.
    }
  }

  return null;
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
    const tentativas = Array.from(new Set([link, ...candidatosAdicionais(link)]));
    let resultado: ResultadoPagina | null = null;

    for (const candidato of tentativas) {
      resultado = await procurarImagemNoFluxo(candidato);
      if (resultado) break;
    }

    if (!resultado) {
      return NextResponse.json(
        {
          erro:
            "Não encontramos uma imagem automaticamente. A loja pode entregar o produto apenas via JavaScript/app ou bloquear crawlers. Você ainda pode enviar a foto manualmente.",
        },
        { status: 200 }
      );
    }

    const imagem = await baixarImagem(resultado);
    if (!imagem) {
      // Se o WhatsApp consegue enxergar a imagem mas a loja bloqueia o download
      // do nosso servidor, ainda usamos a URL pública encontrada como fallback.
      return NextResponse.json({
        imagemUrl: resultado.imagem,
        origem: "externa",
        aviso: "Imagem localizada no preview do link e usada diretamente.",
      });
    }

    const extensao = imagem.tipo.includes("png")
      ? "png"
      : imagem.tipo.includes("webp")
      ? "webp"
      : imagem.tipo.includes("avif")
      ? "avif"
      : imagem.tipo.includes("gif")
      ? "gif"
      : imagem.tipo.includes("svg")
      ? "svg"
      : "jpg";
    const nomeArquivo = `${crypto.randomUUID()}-auto.${extensao}`;

    const { error } = await supabase.storage.from("ofertas").upload(nomeArquivo, imagem.bytes, {
      contentType: imagem.tipo,
      upsert: false,
    });

    if (error) {
      // Mantém o cadastro ágil mesmo quando apenas o upload no Storage falhar.
      return NextResponse.json({
        imagemUrl: resultado.imagem,
        origem: "externa",
        aviso: "Imagem encontrada, mas não foi possível copiá-la para o Storage; usando a URL original.",
      });
    }

    const { data } = supabase.storage.from("ofertas").getPublicUrl(nomeArquivo);
    return NextResponse.json({ imagemUrl: data.publicUrl, origem: "storage" });
  } catch (erro) {
    console.error(erro);
    return NextResponse.json(
      { erro: "Não foi possível buscar a imagem automaticamente." },
      { status: 200 }
    );
  }
}
