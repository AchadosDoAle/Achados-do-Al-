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

function anoCompleto(ano: string) {
  return ano.length === 2 ? `20${ano}` : ano;
}

function detectarValidade(texto: string) {
  // Formato muito comum nos termos do Mercado Livre:
  // "Cupom válido apenas 21/09/26 até às 23h59"
  // Também aceita 21/09/2026, 23:59, "às 23h59", "até 23h59" etc.
  const datas = Array.from(
    texto.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/gi)
  );

  if (datas.length) {
    // Em campanhas que trazem início e fim, a última data costuma ser o término.
    const m = datas[datas.length - 1];
    const indiceFim = (m.index ?? 0) + m[0].length;
    const trechoDepois = texto.slice(indiceFim, indiceFim + 80);

    // Procura o horário logo depois da data, inclusive em frases como
    // "21/09/26 até às 23h59".
    const horarioDepois = trechoDepois.match(
      /(?:\s|,|-)*(?:(?:at[eé]\s*)?(?:[àa]s?\s*)?)?(\d{1,2})\s*(?:h|:)\s*(\d{2})\b/i
    );

    let hora = horarioDepois?.[1];
    let minuto = horarioDepois?.[2];

    // Também cobre o formato inverso: "até 23h59 do dia 21/09/26".
    if (!hora || !minuto) {
      const trechoAntes = texto.slice(Math.max(0, (m.index ?? 0) - 80), m.index ?? 0);
      const horariosAntes = Array.from(
        trechoAntes.matchAll(/(\d{1,2})\s*(?:h|:)\s*(\d{2})/gi)
      );
      const ultimoHorario = horariosAntes[horariosAntes.length - 1];
      if (ultimoHorario) {
        hora = ultimoHorario[1];
        minuto = ultimoHorario[2];
      }
    }

    return {
      data: `${anoCompleto(m[3])}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`,
      hora:
        hora && minuto
          ? `${hora.padStart(2, "0")}:${minuto}`
          : "23:59",
    };
  }

  return undefined;
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
