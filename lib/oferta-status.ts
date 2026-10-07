import { Oferta } from "./types";

function hojeEmBrasilia() {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const pegar = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  return `${pegar("year")}-${pegar("month")}-${pegar("day")}`;
}

export function dataPromocaoJaPassou(validade?: string) {
  if (!validade) return false;
  const dataValidade = validade.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataValidade)) return false;
  return dataValidade < hojeEmBrasilia();
}

export function ofertaEstaExpirada(oferta: Pick<Oferta, "status" | "validadePromocao">) {
  return oferta.status === "expirada" || dataPromocaoJaPassou(oferta.validadePromocao);
}


function dataHoraBrasiliaParaTimestamp(valor?: string) {
  if (!valor) return NaN;
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(valor)) return new Date(valor).getTime();
  const complementoSegundos = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor) ? ":00" : "";
  return new Date(`${valor}${complementoSegundos}-03:00`).getTime();
}

export function destaqueImperdivelAtivo(
  oferta: Pick<Oferta, "destaqueImperdivel" | "destaqueAte">
) {
  if (!oferta.destaqueImperdivel || !oferta.destaqueAte) return false;
  const limite = dataHoraBrasiliaParaTimestamp(oferta.destaqueAte);
  return Number.isFinite(limite) && limite > Date.now();
}
