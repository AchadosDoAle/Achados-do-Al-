/**
 * Reconhecimento conservador de bebidas alcoólicas.
 * O campo persistido no Supabase é a fonte principal.
 */
function normalizar(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

const TERMOS_ALCOOLICOS = [
  /\bcerveja(s)?\b/, /\bchopp?\b/, /\bvinho(s)?\b/, /\bespumante(s)?\b/,
  /\bchampagne\b|\bchampanhe\b/, /\bwhisk(e)?y\b/, /\bvodka\b/, /\bgin\b/,
  /\brum\b/, /\btequila\b/, /\bcachaca\b/, /\blicor(es)?\b/, /\bconhaque\b/,
  /\bbrandy\b/, /\bsake\b/, /\bsidra(s)?\b/, /\bvermouth\b|\bvermute\b/,
  /\baperitivo alcoolico\b/, /\bhard seltzer\b/, /\bice alcoolica\b/,
  /\bbebida alcoolica\b/, /\bdestilado(s)?\b/,
];

export function detectarBebidaAlcoolica(dados: {
  titulo?: string | null;
  categoria?: string | null;
  texto?: string | null;
}): boolean {
  const texto = normalizar([dados.titulo ?? "", dados.categoria ?? "", dados.texto ?? ""].join(" "));
  return TERMOS_ALCOOLICOS.some((termo) => termo.test(texto));
}

export function ofertaEhBebidaAlcoolica(oferta: {
  bebidaAlcoolica?: boolean | null;
  titulo?: string | null;
  categoria?: string | null;
}): boolean {
  return oferta.bebidaAlcoolica === true || (
    oferta.bebidaAlcoolica == null &&
    detectarBebidaAlcoolica({ titulo: oferta.titulo, categoria: oferta.categoria })
  );
}
