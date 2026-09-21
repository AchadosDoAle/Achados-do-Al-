import {
  CATEGORIAS_ADMIN,
  LOJAS_AFILIADAS,
  normalizarNomeLoja,
} from "./mock-data";
import { OfertaFormValues } from "./types";

export type ResultadoLeituraOferta = {
  valores: Partial<OfertaFormValues>;
  camposDetectados: string[];
};

function limparMarkdown(texto: string) {
  return texto
    .replace(/[\*_~`]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function moedaParaNumero(valor?: string) {
  if (!valor) return undefined;
  const normalizado = valor.replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : undefined;
}

function primeiroMatch(texto: string, regexes: RegExp[]) {
  for (const regex of regexes) {
    const match = texto.match(regex);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

function detectarLoja(texto: string) {
  const textoNormalizado = texto.toLocaleUpperCase("pt-BR");

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
    if (textoNormalizado.includes(chave)) return normalizarNomeLoja(loja);
  }

  for (const loja of LOJAS_AFILIADAS) {
    if (textoNormalizado.includes(loja.toLocaleUpperCase("pt-BR"))) return loja;
  }

  return undefined;
}

function detectarCategoria(texto: string) {
  const t = texto.toLocaleUpperCase("pt-BR");
  const regras: Array<[string, string[]]> = [
    ["Celulares", ["CELULAR", "SMARTPHONE", "IPHONE", "GALAXY"]],
    ["TV e Áudio", ["TELEVISÃO", "TELEVISAO", "SMART TV", "CAIXA DE SOM", "SOUNDBAR", "FONE"]],
    ["Informática", ["NOTEBOOK", "COMPUTADOR", "MONITOR", "TECLADO", "MOUSE", "SSD", "HD ", "IMPRESSORA"]],
    ["Games", ["PLAYSTATION", "XBOX", "NINTENDO", "CONSOLE", "GAMER"]],
    ["Eletrodomésticos", ["GELADEIRA", "FOGÃO", "FOGAO", "MICRO-ONDAS", "MICROONDAS", "LAVA E SECA", "MÁQUINA DE LAVAR", "MAQUINA DE LAVAR", "AIR FRYER", "FRITADEIRA"]],
    ["Cozinha", ["PANELA", "PRATO", "TALHER", "COPO", "JOGO DE JANTAR", "CAFETEIRA", "LIQUIDIFICADOR"]],
    ["Ferramentas", ["FURADEIRA", "PARAFUSADEIRA", "SERRA", "MARTELO", "FERRAMENTA", "CHAVE DE IMPACTO"]],
    ["Automotivo", ["PNEU", "CARRO", "MOTO", "AUTOMOTIVO", "CAPACETE"]],
    ["Perfumaria", ["PERFUME", "COLÔNIA", "COLONIA", "EAU DE"]],
    ["Beleza", ["MAQUIAGEM", "BATOM", "SHAMPOO", "CONDICIONADOR", "CREME", "SKINCARE"]],
    ["Moda", ["CAMISA", "CAMISETA", "CALÇA", "CALCA", "VESTIDO", "JAQUETA", "MOLETOM"]],
    ["Calçados", ["TÊNIS", "TENIS", "SAPATO", "SANDÁLIA", "SANDALIA", "CHINELO"]],
    ["Esporte", ["BICICLETA", "ACADEMIA", "HALTER", "BOLA", "ESPORT"]],
    ["Infantil", ["BRINQUEDO", "BONECA", "CARRINHO INFANTIL", "CRIANÇA", "CRIANCA"]],
    ["Bebês", ["BEBÊ", "BEBE", "FRALDA", "MAMADEIRA", "CARRINHO DE BEB"]],
    ["Pet", ["PET", "CACHORRO", "GATO", "RAÇÃO", "RACAO"]],
    ["Móveis", ["SOFÁ", "SOFA", "MESA", "CADEIRA", "GUARDA-ROUPA", "ESTANTE"]],
    ["Casa", ["CHUVEIRO", "LUMINÁRIA", "LUMINARIA", "CAMA", "TOALHA", "LENÇOL", "LENCOL", "DECORAÇÃO", "DECORACAO"]],
    ["Saúde", ["MEDIDOR", "TERMÔMETRO", "TERMOMETRO", "SAÚDE", "SAUDE"]],
    ["Suplementos", ["WHEY", "CREATINA", "SUPLEMENTO", "PROTEÍNA", "PROTEINA"]],
    ["Mercado", ["CAFÉ", "CAFE", "CHOCOLATE", "ALIMENTO", "BEBIDA"]],
    ["Papelaria", ["CADERNO", "CANETA", "PAPELARIA", "MOCHILA ESCOLAR"]],
    ["Livros", ["LIVRO", "BOX DE LIVROS"]],
  ];

  for (const [categoria, palavras] of regras) {
    if (palavras.some((p) => t.includes(p)) && CATEGORIAS_ADMIN.includes(categoria)) {
      return categoria;
    }
  }
  return undefined;
}

function detectarTitulo(texto: string, loja?: string) {
  const linhas = texto
    .split(/\r?\n/)
    .map(limparMarkdown)
    .filter(Boolean)
    .filter((linha) => !/^https?:\/\//i.test(linha));

  const ignorar = [
    /^DE\s*:/i,
    /^POR\s+/i,
    /^COMPRE AQUI/i,
    /^PREÇO/i,
    /^PRECO/i,
    /^VAGAS NO GRUPO/i,
    /^OFERTA$/i,
  ];

  const candidatos = linhas.filter((linha) => {
    if (ignorar.some((r) => r.test(linha))) return false;
    if (loja && linha.toLocaleUpperCase("pt-BR") === loja.toLocaleUpperCase("pt-BR")) return false;
    if (/R\$\s*\d/.test(linha)) return false;
    if (linha.length < 12 || linha.length > 150) return false;
    return true;
  });

  const detalhados = candidatos.filter((l) => !/\bEM OFERTA\b|\bPROMOÇÃO\b|\bPROMOCAO\b/i.test(l));
  const base = detalhados.length ? detalhados : candidatos;
  if (!base.length) return undefined;

  return base.sort((a, b) => b.length - a.length)[0];
}

export function interpretarTextoOferta(texto: string): ResultadoLeituraOferta {
  const valores: Partial<OfertaFormValues> = {};
  const detectados: string[] = [];

  const loja = detectarLoja(texto);
  if (loja) {
    valores.loja = loja;
    detectados.push("loja");
  }

  const titulo = detectarTitulo(texto, loja);
  if (titulo) {
    valores.titulo = titulo.toLocaleUpperCase("pt-BR");
    detectados.push("produto");
  }

  const categoria = detectarCategoria(`${titulo ?? ""}\n${texto}`);
  if (categoria) {
    valores.categoria = categoria;
    detectados.push("categoria");
  }

  // Para preços, removemos só a marcação visual (negrito/tachado) e
  // normalizamos espaços. Assim frases como "~De R$ 414,47~",
  // "DE: R$ 414,47" e "DE R$ 414,47" sempre alimentam Preço antigo.
  const textoPrecos = texto
    .replace(/\u00A0/g, " ")
    .replace(/[\*_~`]/g, " ");

  const precoAntigo = moedaParaNumero(
    primeiroMatch(textoPrecos, [
      /\bDE\s*:?\s*R\s*\$\s*([\d.]+,\d{2})/i,
      /(?:preço|preco)\s*(?:antigo|de)\s*:?\s*R\s*\$\s*([\d.]+,\d{2})/i,
    ])
  );
  if (precoAntigo != null) {
    valores.precoAntigo = precoAntigo;
    detectados.push("preço antigo");
  }

  const precoPix = moedaParaNumero(
    primeiroMatch(textoPrecos, [
      /R\$\s*([\d.]+,\d{2})\s*(?:à\s*vista\s*)?(?:no\s*)?pix/i,
      /pix\s*:?\s*R\$\s*([\d.]+,\d{2})/i,
    ])
  );
  if (precoPix != null) {
    valores.precoPix = precoPix;
    detectados.push("preço no Pix");
  }

  const precoAtual = moedaParaNumero(
    primeiroMatch(textoPrecos, [
      /(?:^|\n)[^\n]*?\bPor\s*:?\s*R\$\s*([\d.]+,\d{2})/i,
      /(?:preço|preco)\s*(?:atual|final)\s*:?\s*R\$\s*([\d.]+,\d{2})/i,
    ])
  );
  if (precoAtual != null) {
    valores.precoAtual = precoAtual;
    detectados.push("preço atual");
  }

  const parcelasMatch = texto.match(/\b(\d{1,2})\s*x\s*(?:de\s*)?R\$\s*([\d.]+,\d{2})/i);
  if (parcelasMatch) {
    valores.parcelas = Number(parcelasMatch[1]);
    valores.valorParcela = moedaParaNumero(parcelasMatch[2]);
    valores.parcelamentoSemJuros = /sem\s+juros/i.test(texto);
    detectados.push("parcelamento");
  }

  const urls = Array.from(texto.matchAll(/https?:\/\/[^\s)\]}]+/gi)).map((m) =>
    m[0].replace(/[.,;]+$/, "")
  );
  const linkProduto = urls.find((url) => !/achadosdoale\.com\/grupo/i.test(url));
  if (linkProduto) {
    valores.linkProduto = linkProduto;
    detectados.push("link do produto");
  }

  const voltagem = primeiroMatch(texto, [/(?:voltagem|tensão|tensao)\s*(?:de\s*)?(BIVOLT|110\s*V|127\s*V|220\s*V)/i, /\b(BIVOLT|110V|127V|220V)\b/i]);
  if (voltagem) {
    valores.voltagem = voltagem.toLocaleUpperCase("pt-BR").replace(/\s+/g, "");
    detectados.push("voltagem");
  }

  const modelo = primeiroMatch(texto, [/(?:^|\n)[^\n]*?\bModelo\s+([^\n]+)/i]);
  if (modelo) {
    valores.modelo = limparMarkdown(modelo).toLocaleUpperCase("pt-BR");
    detectados.push("modelo");
  }

  const cor = primeiroMatch(texto, [/(?:^|\n)[^\n]*?\bCor\s+([^\n]+)/i]);
  if (cor) {
    valores.cor = limparMarkdown(cor).toLocaleUpperCase("pt-BR");
    detectados.push("cor");
  }

  const capacidade = primeiroMatch(`${titulo ?? ""}\n${texto}`, [/\b(\d+(?:[.,]\d+)?\s*(?:L|ML|KG|GB|TB))\b/i]);
  if (capacidade) {
    valores.capacidade = capacidade.toLocaleUpperCase("pt-BR").replace(/\s+/g, " ");
    detectados.push("capacidade");
  }

  const cupom = primeiroMatch(texto, [/(?:cupom|use o cupom)\s*:?\s*([A-Z0-9_-]{4,30})/i]);
  if (cupom) {
    valores.cupom = cupom.toLocaleUpperCase("pt-BR");
    detectados.push("cupom");
  }

  if (/frete\s+grátis|frete\s+gratis/i.test(texto)) {
    valores.freteGratis = true;
    const linhaFrete = texto
      .split(/\r?\n/)
      .map(limparMarkdown)
      .find((linha) => /frete/i.test(linha));
    if (linhaFrete && /(meli\+|prime|assinante|acima de|regi)/i.test(linhaFrete)) {
      valores.freteCondicao = linhaFrete.toLocaleUpperCase("pt-BR");
    }
    detectados.push("frete");
  }

  const validade = texto.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if (validade) {
    valores.validadePromocao = `${validade[3]}-${validade[2]}-${validade[1]}`;
    detectados.push("validade");
  }

  valores.textoPublicacao = texto;

  return { valores, camposDetectados: detectados };
}
