import type { Cupom } from "./types";
import { urlCurtaDoCupom } from "./cupom-share";

const FUSO_BRASILIA = "America/Sao_Paulo";
const SEPARADOR = "--------------------------------------------------------";

function formatarNumero(valor: number) {
  return Number.isInteger(valor)
    ? String(valor)
    : valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export function formatarValidadeRelatorioCupom(validade?: string) {
  if (!validade) return "SEM VALIDADE";

  const data = new Date(validade);
  if (Number.isNaN(data.getTime())) return validade;

  const formatador = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_BRASILIA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const partes = formatador.formatToParts(data);
  const obter = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  return `${obter("day")}/${obter("month")}/${obter("year")} às ${obter("hour")}:${obter("minute")}`;
}

function beneficioRelatorio(cupom: Cupom) {
  if (cupom.descontoPercentual != null) {
    return `${formatarNumero(cupom.descontoPercentual)}% DE DESCONTO`;
  }

  const valor = cupom.valorCupom?.trim();
  return valor || "DESCONTO NÃO INFORMADO";
}

function removerTrechosEmNegrito(texto?: string) {
  if (!texto) return "";

  return texto
    // O mini relatório é propositalmente enxuto: trechos destacados com **...**
    // ficam de fora para evitar mensagens muito longas no compartilhamento.
    .replace(/\*\*[\s\S]*?\*\*/g, "")
    .split(/\r?\n/)
    .map((linha) => linha.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function termosRelatorio(cupom: Cupom) {
  return (
    removerTrechosEmNegrito(cupom.observacoes) ||
    removerTrechosEmNegrito(cupom.descricao)
  );
}

export function montarRelatorioCupons(cupons: Cupom[]) {
  return cupons
    .map((cupom) => {
      const termos = termosRelatorio(cupom);
      const validade = formatarValidadeRelatorioCupom(cupom.validade);

      return [
        `${cupom.nomeCupom} - ${beneficioRelatorio(cupom)}`,
        termos ? `${termos} - ${validade}` : `VALIDADE: ${validade}`,
        urlCurtaDoCupom(cupom.id),
        SEPARADOR,
      ].join("\n");
    })
    .join("\n");
}
