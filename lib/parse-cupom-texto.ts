import { LOJAS_AFILIADAS, normalizarNomeLoja } from "./mock-data";
import { CupomFormValues } from "./types";

export type ResultadoLeituraCupom = {
  valores: Partial<CupomFormValues>;
  camposDetectados: string[];
  validadeData?: string;
  validadeHora?: string;
};

function textoBase(texto: string) {
  return texto
    .replace(/\u00A0/g, " ")
    .replace(/[\*~`]/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'");
}

function detectarLoja(texto: string) {
  const t = texto.toLocaleUpperCase("pt-BR");
  const aliases: Array<[string, string]> = [
    ["MERCADO LIVRE", "Mercado Livre"],
    ["MERCADOLIVRE", "Mercado Livre"],
    ["AMAZON", "Amazon"],
    ["NETSHOES", "Netshoes"],
    ["MAGAZINE LUIZA", "Magalu - Magazine Luiza"],
    ["MAGALU", "Magalu - Magazine Luiza"],
    ["SHOPEE", "Shopee"],
    ["ZZ MALL", "ZZ Mall"],
    ["BAW", "BAW"],
    ["ALIEXPRESS", "AliExpress"],
    ["NATURA", "Natura"],
    ["AVON", "Avon"],
  ];

  for (const [chave, loja] of aliases) {
    if (t.includes(chave)) return normalizarNomeLoja(loja);
  }
  for (const loja of LOJAS_AFILIADAS) {
    if (t.includes(loja.toLocaleUpperCase("pt-BR"))) return loja;
  }
  return undefined;
}

function numeroPt(valor?: string) {
  if (!valor) return undefined;
  const n = Number(valor.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function detectarCodigoCupom(texto: string) {
  const regexes = [
    /(?:c[oó]digo\s+(?:do\s+)?cupom|cupom\s+(?:de\s+desconto\s+)?(?:é|e|:|-|use\s+o|use)?\s*)\s*([A-Z0-9][A-Z0-9_-]{3,39})\b/gi,
    /\bCUPOM\s+([A-Z0-9][A-Z0-9_-]{3,39})\b/gi,
  ];
  const proibidos = new Set([
    "VALIDO", "VÁLIDO", "APLICAVEL", "APLICÁVEL", "PESSOAL", "EXCLUSIVO",
    "DESCONTO", "BENEFICIO", "BENEFÍCIO", "SOMENTE", "ENQUANTO", "LIMITADO",
  ]);

  for (const regex of regexes) {
    for (const match of texto.matchAll(regex)) {
      const codigo = match[1]?.toLocaleUpperCase("pt-BR");
      if (codigo && !proibidos.has(codigo)) return codigo;
    }
  }
  return undefined;
}

function detectarPercentual(texto: string) {
  for (const match of texto.matchAll(/\b(\d{1,3}(?:[.,]\d{1,2})?)\s*%\s*(?:OFF|DE\s+DESCONTO|EM|NOS?|NAS?|DOS?|DAS?)?/gi)) {
    const n = numeroPt(match[1]);
    if (n != null && n > 0 && n <= 100) return n;
  }
  return undefined;
}

function detectarValorCupom(texto: string) {
  const padroes: Array<[RegExp, (v: string) => string]> = [
    [/limite(?:\s+de\s+desconto(?:\s+do\s+benef[ií]cio)?)?\s*(?:é\s+de|e\s+de|é|e|de|:)?\s*R\s*\$\s*([\d.]+(?:,\d{2})?)/i, (v) => `LIMITE DE R$${v}`],
    [/desconto\s+m[aá]x(?:imo|\.)?\s*(?:é\s+de|de|:)?\s*R\s*\$\s*([\d.]+(?:,\d{2})?)/i, (v) => `DESCONTO MÁX. R$${v}`],
    [/R\s*\$\s*([\d.]+(?:,\d{2})?)\s+de\s+desconto/i, (v) => `R$${v} DE DESCONTO`],
  ];
  for (const [regex, formatar] of padroes) {
    const m = texto.match(regex);
    if (m?.[1]) return formatar(m[1]);
  }
  return undefined;
}

function detectarValidade(texto: string) {
  // Caso comum: "até 23h59 do dia 20/09/2026"
  const horaAntes = Array.from(
    texto.matchAll(/(?:at[eé]|às|as)\s*(\d{1,2})\s*[h:]\s*(\d{2}).{0,45}?(\d{1,2})\/(\d{1,2})\/(\d{4})/gi)
  );
  if (horaAntes.length) {
    const m = horaAntes[horaAntes.length - 1];
    return {
      data: `${m[5]}-${m[4].padStart(2, "0")}-${m[3].padStart(2, "0")}`,
      hora: `${m[1].padStart(2, "0")}:${m[2]}`,
    };
  }

  // Captura todas as datas e escolhe a última, que em campanhas com intervalo é o término.
  const datas = Array.from(
    texto.matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*(?:às?|,|-)?\s*(\d{1,2})\s*[:h]\s*(\d{2}))?/gi)
  );
  if (!datas.length) return undefined;

  const m = datas[datas.length - 1];
  return {
    data: `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`,
    hora: m[4] && m[5] ? `${m[4].padStart(2, "0")}:${m[5]}` : "23:59",
  };
}

export function interpretarTextoCupom(textoOriginal: string): ResultadoLeituraCupom {
  const texto = textoBase(textoOriginal);
  const valores: Partial<CupomFormValues> = {};
  const camposDetectados: string[] = [];

  const loja = detectarLoja(texto);
  if (loja) {
    valores.loja = loja;
    camposDetectados.push("loja");
  }

  const codigo = detectarCodigoCupom(texto);
  if (codigo) {
    valores.nomeCupom = codigo;
    camposDetectados.push("código do cupom");
  }

  const percentual = detectarPercentual(texto);
  if (percentual != null) {
    valores.descontoPercentual = percentual;
    camposDetectados.push("desconto");
  }

  const valorCupom = detectarValorCupom(texto);
  if (valorCupom) {
    valores.valorCupom = valorCupom.toLocaleUpperCase("pt-BR");
    camposDetectados.push("valor/limite do cupom");
  }

  const urls = Array.from(texto.matchAll(/https?:\/\/[^\s)\]}]+/gi)).map((m) =>
    m[0].replace(/[.,;]+$/, "")
  );
  if (urls[0]) {
    valores.linkProdutos = urls[0];
    camposDetectados.push("link");
  }

  const validade = detectarValidade(texto);
  if (validade) camposDetectados.push("validade");

  return {
    valores,
    camposDetectados,
    validadeData: validade?.data,
    validadeHora: validade?.hora,
  };
}
