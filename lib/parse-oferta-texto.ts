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
    // Remove seletores invisíveis que costumam sobrar depois dos emojis
    // (ex.: ⚠️ deixa U+FE0F), evitando que uma linha de aviso seja
    // interpretada como nome do produto.
    .replace(/[\uFE0E\uFE0F\u200B-\u200D\u2060]/g, "")
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

function normalizarBusca(texto: string) {
  return limparMarkdown(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleUpperCase("pt-BR")
    .replace(/[^A-Z0-9+#.\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contemTermo(textoNormalizado: string, termo: string) {
  const alvo = normalizarBusca(termo);
  if (!alvo) return false;
  const escapado = alvo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|\\s)${escapado}(?=\\s|$)`, "i").test(textoNormalizado);
}

type RegraCategoria = {
  categoria: string;
  termos: string[];
};

const REGRAS_CATEGORIA: RegraCategoria[] = [
  { categoria: "Acessórios", termos: ["CAPA PARA CELULAR", "CAPA PARA IPHONE", "PELICULA CELULAR", "PELICULA", "BOLSA", "CARTEIRA", "CINTO", "BONÉ", "OCULOS", "MOCHILA", "POCHETE"] },
  { categoria: "Automotivo", termos: ["PNEU", "CAPACETE", "OLEO MOTOR", "LIMPA VIDRO", "ASPIRADOR AUTOMOTIVO", "CENTRAL MULTIMIDIA", "CARRO", "MOTOCICLETA", "AUTOMOTIVO"] },
  { categoria: "Bebês", termos: ["FRALDA", "MAMADEIRA", "CHUPETA", "CADEIRINHA BEBE", "CARRINHO DE BEBE", "BOLSA MATERNIDADE", "BERCO", "BEBE"] },
  { categoria: "Beleza", termos: ["MAQUIAGEM", "BATOM", "BASE FACIAL", "MASCARA CILIOS", "SKINCARE", "SHAMPOO", "CONDICIONADOR", "CREME CAPILAR", "SECADOR DE CABELO", "CHAPINHA", "ESCOVA SECADORA"] },
  { categoria: "Brinquedos", termos: ["BRINQUEDO", "BONECA", "BONECO", "LEGO", "HOT WHEELS", "NERF", "MASSINHA", "QUEBRA CABECA", "CARRINHO CONTROLE", "JOGO INFANTIL"] },
  { categoria: "Calçados", termos: ["TENIS", "SAPATO", "SANDALIA", "CHINELO", "BOTA", "SAPATILHA"] },
  { categoria: "Casa", termos: ["CHUVEIRO", "TOALHA", "LENCOL", "EDREDOM", "TRAVESSEIRO", "ROUPA DE CAMA", "VARAL", "ORGANIZADOR", "LIMPEZA"] },
  { categoria: "Celulares", termos: ["SMARTPHONE", "CELULAR", "IPHONE", "GALAXY S", "GALAXY A", "GALAXY M", "MOTO G", "MOTO EDGE", "REDMI NOTE", "POCO X", "POCO F"] },
  { categoria: "Cozinha", termos: ["PANELA", "FRIGIDEIRA", "ASSADEIRA", "PRATO", "TALHER", "COPO", "JOGO DE JANTAR", "GARRAFA TERMICA", "FACA", "FORMA", "UTENSILIO COZINHA"] },
  { categoria: "Decoração", termos: ["QUADRO", "TAPETE", "CORTINA", "ALMOFADA", "ESPELHO", "VASO DECORATIVO", "DECORACAO", "ABAJUR"] },
  { categoria: "Eletrodomésticos", termos: ["GELADEIRA", "REFRIGERADOR", "FOGAO", "FREEZER", "MICRO ONDAS", "MICROONDAS", "LAVA E SECA", "MAQUINA DE LAVAR", "LAVA LOUCAS", "AR CONDICIONADO"] },
  { categoria: "Eletroportáteis", termos: ["AIR FRYER", "FRITADEIRA", "CAFETEIRA", "LIQUIDIFICADOR", "BATEDEIRA", "MIXER", "SANDUICHEIRA", "TORRADEIRA", "ASPIRADOR", "VENTILADOR", "FERRO DE PASSAR", "PANELA ELETRICA"] },
  { categoria: "Eletrônicos", termos: ["TABLET", "E READER", "KINDLE", "PROJETOR", "CAMERA", "DRONE", "POWER BANK", "CARREGADOR", "CABO USB", "HUB USB", "FIRE TV", "CHROMECAST", "ECHO DOT", "ALEXA"] },
  { categoria: "Esporte", termos: ["BICICLETA", "ACADEMIA", "HALTER", "KIT PESOS", "BOLA FUTEBOL", "BOLA VOLEI", "RAQUETE", "ESPORTIVO", "ESPORTIVA"] },
  { categoria: "Ferramentas", termos: ["FURADEIRA", "PARAFUSADEIRA", "SERRA", "MARTELO", "CHAVE DE IMPACTO", "ESMERILHADEIRA", "LIXADEIRA", "FERRAMENTA"] },
  { categoria: "Games", termos: ["PLAYSTATION", "PS5", "PS4", "XBOX", "NINTENDO SWITCH", "CONSOLE", "CONTROLE GAMER", "CADEIRA GAMER", "GAMER"] },
  { categoria: "Informática", termos: ["NOTEBOOK", "LAPTOP", "COMPUTADOR", "MONITOR", "TECLADO", "MOUSE", "SSD", "HD EXTERNO", "IMPRESSORA", "ROTEADOR", "WEBCAM", "PLACA DE VIDEO", "PROCESSADOR", "MEMORIA RAM", "MESA DIGITALIZADORA"] },
  { categoria: "Infantil", termos: ["ROUPA INFANTIL", "CONJUNTO INFANTIL", "CAMISETA INFANTIL", "TENIS INFANTIL", "FANTASIA INFANTIL", "CRIANCA", "INFANTIL"] },
  { categoria: "Jardim", termos: ["MANGUEIRA", "CORTADOR DE GRAMA", "ROCADEIRA", "PODADOR", "JARDINAGEM", "JARDIM", "VASO PLANTA"] },
  { categoria: "Livros", termos: ["LIVRO", "BOX DE LIVROS", "LIVROS", "ROMANCE", "HQ ", "MANGA"] },
  { categoria: "Mercado", termos: ["CAFE", "CHOCOLATE", "BISCOITO", "ALIMENTO", "BEBIDA", "REFRIGERANTE", "CERVEJA SEM ALCOOL", "AZEITE", "ARROZ", "FEIJAO"] },
  { categoria: "Moda", termos: ["CAMISA", "CAMISETA", "CALCA", "VESTIDO", "JAQUETA", "MOLETOM", "SHORT", "BERMUDA", "BLUSA", "ROUPA"] },
  { categoria: "Móveis", termos: ["SOFA", "MESA DE JANTAR", "MESA ESCRITORIO", "CADEIRA ESCRITORIO", "GUARDA ROUPA", "ESTANTE", "RACK", "CRIADO MUDO", "CAMA BOX", "CADEIRA", "MESA"] },
  { categoria: "Papelaria", termos: ["CADERNO", "CANETA", "LAPIS", "PAPELARIA", "ESTOJO", "MOCHILA ESCOLAR", "MARCA TEXTO"] },
  { categoria: "Perfumaria", termos: ["PERFUME", "COLONIA", "EAU DE PARFUM", "EAU DE TOILETTE", "BODY SPLASH", "DESODORANTE COLONIA"] },
  { categoria: "Pet", termos: ["RACAO", "PETISCO PET", "AREIA GATO", "CACHORRO", "GATO", "PETSHOP"] },
  { categoria: "Relógios", termos: ["SMARTWATCH", "SMART WATCH", "SMARTBAND", "SMART BAND", "RELOGIO", "G SHOCK", "APPLE WATCH", "GALAXY WATCH", "MI BAND"] },
  { categoria: "Saúde", termos: ["TERMOMETRO", "MEDIDOR DE PRESSAO", "OXIMETRO", "INALADOR", "NEBULIZADOR", "BALANCA DIGITAL", "SAUDE"] },
  { categoria: "Suplementos", termos: ["WHEY", "CREATINA", "SUPLEMENTO", "PROTEINA", "PRE TREINO", "BCAA", "COLAGENO"] },
  { categoria: "TV e Áudio", termos: ["SMART TV", "TELEVISAO", "SOUNDBAR", "CAIXA DE SOM", "FONE DE OUVIDO", "FONE BLUETOOTH", "FONE", "HEADPHONE", "HEADSET", "EARBUD", "AIRPODS", "JBL", "HOME THEATER", "SMART SPEAKER", "TV "] },
  { categoria: "Utilidades", termos: ["LANTERNA", "PILHA", "EXTENSAO", "FILTRO DE LINHA", "CAIXA ORGANIZADORA", "ORGANIZADOR MULTIUSO", "UTILIDADE"] },
  { categoria: "Viagem", termos: ["MALA DE VIAGEM", "MALA BORDO", "NECESSAIRE", "ORGANIZADOR DE MALA", "TRAVESSEIRO VIAGEM", "CADEADO TSA", "VIAGEM"] },
];

function detectarCategoria(texto: string, titulo?: string) {
  const categoriaExplicita = primeiroMatch(texto, [/(?:^|\n)[^\n]*?\bCategoria\s*[:\-–—]?\s*([^\n|•]+)/i]);
  if (categoriaExplicita) {
    const normalizada = normalizarBusca(categoriaExplicita);
    const encontrada = CATEGORIAS_ADMIN.find((categoria) => normalizarBusca(categoria) === normalizada);
    if (encontrada) return encontrada;
  }

  const tituloNormalizado = normalizarBusca(titulo ?? "");
  const textoNormalizado = normalizarBusca(texto);
  let melhor: { categoria: string; pontos: number } | undefined;

  for (const regra of REGRAS_CATEGORIA) {
    if (!CATEGORIAS_ADMIN.includes(regra.categoria)) continue;
    let pontosTitulo = 0;
    let pontosTexto = 0;

    for (const termo of regra.termos) {
      const tamanho = Math.min(normalizarBusca(termo).length, 24);
      if (tituloNormalizado && contemTermo(tituloNormalizado, termo)) {
        pontosTitulo += 12 + tamanho / 4;
      } else if (contemTermo(textoNormalizado, termo)) {
        pontosTexto += 2 + tamanho / 12;
      }
    }

    const pontos = pontosTitulo > 0 ? pontosTitulo + Math.min(pontosTexto, 3) : pontosTexto;
    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) melhor = { categoria: regra.categoria, pontos };
  }

  return melhor?.categoria;
}

const MARCAS_CONHECIDAS: Array<[string, string]> = [
  ["BLACK+DECKER", "BLACK+DECKER"], ["BLACK DECKER", "BLACK+DECKER"], ["O BOTICARIO", "O BOTICÁRIO"], ["FISHER PRICE", "FISHER-PRICE"],
  ["NEW BALANCE", "NEW BALANCE"], ["WESTERN DIGITAL", "WESTERN DIGITAL"], ["MERCUSYS", "MERCUSYS"], ["INTELBRAS", "INTELBRAS"], ["LOGITECH", "LOGITECH"],
  ["THUNDERX3", "THUNDERX3"], ["WACOM", "WACOM"], ["REDRAGON", "REDRAGON"], ["HYPERX", "HYPERX"], ["CORSAIR", "CORSAIR"], ["RAZER", "RAZER"], ["MSI", "MSI"], ["GIGABYTE", "GIGABYTE"], ["FORTREK", "FORTREK"],
  ["ELECTROLUX", "ELECTROLUX"], ["BRASTEMP", "BRASTEMP"], ["BRITANIA", "BRITÂNIA"], ["MONDIAL", "MONDIAL"], ["PHILCO", "PHILCO"], ["PHILIPS", "PHILIPS"], ["PANASONIC", "PANASONIC"],
  ["SAMSUNG", "SAMSUNG"], ["MOTOROLA", "MOTOROLA"],
  ["XIAOMI", "XIAOMI"], ["POCO", "POCO"], ["REALME", "REALME"], ["APPLE", "APPLE"],
  ["LENOVO", "LENOVO"], ["ACER", "ACER"], ["ASUS", "ASUS"], ["DELL", "DELL"], ["POSITIVO", "POSITIVO"], ["MULTILASER", "MULTI"],
  ["KINGSTON", "KINGSTON"], ["SANDISK", "SANDISK"], ["SEAGATE", "SEAGATE"], ["EPSON", "EPSON"], ["CANON", "CANON"],
  ["JBL", "JBL"], ["EDIFIER", "EDIFIER"], ["QCY", "QCY"], ["ANKER", "ANKER"], ["BASEUS", "BASEUS"], ["SONY", "SONY"], ["AOC", "AOC"], ["TCL", "TCL"], ["LG", "LG"],
  ["OSTER", "OSTER"], ["ARNO", "ARNO"], ["WAP", "WAP"], ["TRAMONTINA", "TRAMONTINA"], ["BRINOX", "BRINOX"], ["ROCHEDO", "ROCHEDO"], ["MIDEA", "MIDEA"], ["CONSUL", "CONSUL"],
  ["CADENCE", "CADENCE"], ["MALLORY", "MALLORY"], ["MUELLER", "MUELLER"], ["SUGGAR", "SUGGAR"], ["ELGIN", "ELGIN"], ["AGRATTO", "AGRATTO"], ["GREE", "GREE"], ["HISENSE", "HISENSE"],
  ["ADIDAS", "ADIDAS"], ["NIKE", "NIKE"], ["PUMA", "PUMA"], ["MIZUNO", "MIZUNO"], ["ASICS", "ASICS"], ["OLYMPIKUS", "OLYMPIKUS"], ["VANS", "VANS"], ["CONVERSE", "CONVERSE"], ["HAVAIANAS", "HAVAIANAS"],
  ["NATURA", "NATURA"], ["AVON", "AVON"], ["EUDORA", "EUDORA"], ["LOREAL", "L'ORÉAL"], ["NIVEA", "NIVEA"], ["DOVE", "DOVE"], ["PANTENE", "PANTENE"], ["WELLA", "WELLA"], ["TRUSS", "TRUSS"],
  ["LEGO", "LEGO"], ["MATTEL", "MATTEL"], ["HASBRO", "HASBRO"], ["HOT WHEELS", "HOT WHEELS"], ["NERF", "NERF"],
  ["CASIO", "CASIO"], ["TECHNOS", "TECHNOS"], ["ORIENT", "ORIENT"], ["GARMIN", "GARMIN"], ["AMAZFIT", "AMAZFIT"], ["HUAWEI", "HUAWEI"], ["MORMAII", "MORMAII"], ["SECULUS", "SECULUS"], ["LINCE", "LINCE"],
  ["STANLEY", "STANLEY"], ["VONDER", "VONDER"], ["BOSCH", "BOSCH"], ["MAKITA", "MAKITA"], ["DEWALT", "DEWALT"], ["KARCHER", "KÄRCHER"],
  ["GOPRO", "GOPRO"], ["DJI", "DJI"], ["MAX TITANIUM", "MAX TITANIUM"], ["INTEGRALMEDICA", "INTEGRALMÉDICA"], ["GROWTH", "GROWTH"],
  ["NESTLE", "NESTLÉ"], ["LACTA", "LACTA"], ["GAROTO", "GAROTO"], ["3 CORACOES", "3 CORAÇÕES"],
];

function detectarMarca(titulo?: string, texto?: string, categoria?: string) {
  const explicita = primeiroMatch(texto ?? "", [
    /(?:^|\n)[^\n]*?\bMarca\s*[:\-–—]?\s*([^\n|•]{2,50}?)(?=\s+(?:Modelo|Ref(?:er[eê]ncia)?|Cor|Tamanho|Capacidade)\b|$)/i,
  ]);
  if (explicita) return limparMarkdown(explicita).replace(/[;,.]+$/, "").toLocaleUpperCase("pt-BR");

  const tituloNormalizado = normalizarBusca(titulo ?? "");
  for (const [chave, marca] of MARCAS_CONHECIDAS) {
    if (contemTermo(tituloNormalizado, chave)) return marca;
  }

  // Famílias de produto podem indicar a marca, mas só em categorias em que
  // isso é seguro. Ex.: "capa para iPhone" não deve virar marca APPLE.
  if (categoria === "Celulares") {
    if (contemTermo(tituloNormalizado, "IPHONE")) return "APPLE";
    if (contemTermo(tituloNormalizado, "GALAXY")) return "SAMSUNG";
    if (contemTermo(tituloNormalizado, "MOTO G") || contemTermo(tituloNormalizado, "MOTO EDGE")) return "MOTOROLA";
    if (contemTermo(tituloNormalizado, "REDMI")) return "XIAOMI";
    if (contemTermo(tituloNormalizado, "POCO")) return "POCO";
  }
  if (categoria === "Informática" && contemTermo(tituloNormalizado, "MACBOOK")) return "APPLE";
  if (categoria === "TV e Áudio" && contemTermo(tituloNormalizado, "AIRPODS")) return "APPLE";
  if (categoria === "Relógios") {
    if (contemTermo(tituloNormalizado, "APPLE WATCH")) return "APPLE";
    if (contemTermo(tituloNormalizado, "GALAXY WATCH")) return "SAMSUNG";
  }
  return undefined;
}

function limparModeloCandidato(valor: string) {
  let modelo = limparMarkdown(valor).toLocaleUpperCase("pt-BR");
  modelo = modelo
    .replace(/^[\s,:;\-–—]+|[\s,:;\-–—]+$/g, "")
    .replace(/^(?:SMARTPHONE|CELULAR|NOTEBOOK|TENIS|TÊNIS|RELOGIO|RELÓGIO|SMARTWATCH|TV|SMART TV)\s+/i, "")
    .replace(/^(?:\d+(?:[.,]\d+)?\s*(?:GB|TB|MB|L|ML|KG|CM|MM)|\d+\s*(?:POLEGADAS?|\"))\s+/i, "")
    .replace(/\s+(?:\d+(?:[.,]\d+)?\s*(?:GB|TB|MB|L|ML|KG)|BIVOLT|110V|127V|220V|PRETO|PRETA|BRANCO|BRANCA|AZUL|VERMELHO|VERMELHA|ROSA|VERDE|CINZA|MASCULINO|MASCULINA|FEMININO|FEMININA)(?:\s.*)?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return modelo;
}

function detectarModelo(titulo?: string, texto?: string, marca?: string, categoria?: string) {
  const explicito = primeiroMatch(texto ?? "", [
    /(?:^|\n)[^\n]*?\bModelo\s*[:\-–—]?\s*([^\n|•]+?)(?=\s+(?:Cor|Tamanho|Capacidade|Voltagem|Preco|Preço)\b|$)/i,
    /(?:^|\n)[^\n]*?\bRef(?:er[eê]ncia)?\.?\s*[:\-–—]?\s*([^\n|•]+?)(?=\s+(?:Cor|Tamanho|Capacidade|Voltagem|Preco|Preço)\b|$)/i,
  ]);
  if (explicito) {
    const limpo = limparModeloCandidato(explicito);
    if (limpo) return limpo;
  }

  const t = limparMarkdown(titulo ?? "").toLocaleUpperCase("pt-BR");
  if (!t) return undefined;

  const padroesConhecidos: RegExp[] = [];
  if (categoria === "Celulares") {
    padroesConhecidos.push(
      /\bIPHONE\s+\d{1,2}(?:\s+(?:PRO\s+MAX|PRO|PLUS|MINI|AIR))?\b/i,
      /\bGALAXY\s+(?:S|A|M|F)\d{1,3}(?:\s*(?:FE|ULTRA|PLUS|\+|5G))?\b/i,
      /\bGALAXY\s+Z\s+(?:FLIP|FOLD)\s*\d{0,2}\b/i,
      /\bMOTO\s+G\d{1,3}(?:\s+(?:POWER|PLAY|PLUS|5G))?\b/i,
      /\bEDGE\s+\d{1,3}(?:\s+(?:PRO|FUSION|NEO|ULTRA))?\b/i,
      /\b(?:REDMI\s+NOTE|REDMI|POCO)\s+[A-Z0-9]+(?:\s+(?:PRO|PLUS|ULTRA|5G|NFC|GT|FE))?\b/i
    );
  }
  if (categoria === "Relógios") {
    padroesConhecidos.push(/\b(?:APPLE\s+WATCH|GALAXY\s+WATCH|MI\s+BAND)\s+[A-Z0-9]+(?:\s+(?:PRO|ULTRA|CLASSIC))?\b/i);
  }
  if (categoria === "TV e Áudio") {
    padroesConhecidos.push(
      /\b(?:TUNE|FLIP|CHARGE|WAVE|LIVE|QUANTUM)\s+[A-Z0-9+\-]+\b/i,
      /\bAIRPODS\s+(?:PRO|MAX)?\s*\d*\b/i
    );
  }
  for (const regex of padroesConhecidos) {
    const match = t.match(regex)?.[0];
    if (match) return limparModeloCandidato(match);
  }

  if (marca) {
    const chavesMarca = MARCAS_CONHECIDAS.filter(([, canonica]) => canonica === marca).map(([chave]) => chave).sort((a, b) => b.length - a.length);
    const tituloNormalizado = normalizarBusca(t);
    for (const chave of chavesMarca) {
      const chaveNormalizada = normalizarBusca(chave);
      const indice = tituloNormalizado.indexOf(chaveNormalizada);
      if (indice < 0) continue;
      const resto = tituloNormalizado.slice(indice + chaveNormalizada.length).trim();
      const candidato = limparModeloCandidato(resto).split(" ").slice(0, 6).join(" ");
      if (!candidato || candidato.length < 2 || candidato.length > 55) continue;
      const temCodigo = /(?=.*[A-Z])(?=.*\d)[A-Z0-9][A-Z0-9+\-]{2,}/.test(candidato);
      const palavras = candidato.split(/\s+/).filter(Boolean);
      const temNomeCurtoDeModelo = palavras.length >= 1 && palavras.length <= 4 && !/^(PRO|PLUS|ULTRA|PRETO|BRANCO|AZUL|ROSA)$/i.test(candidato);
      if (temCodigo || temNomeCurtoDeModelo) return candidato;
    }
  }

  if (!marca) return undefined;

  const codigos = t.match(/\b(?=[A-Z0-9+\-]{3,}\b)(?=[A-Z0-9+\-]*[A-Z])(?=[A-Z0-9+\-]*\d)[A-Z0-9][A-Z0-9+\-]*\b/g) ?? [];
  const ignorar = /^(?:\d+(?:GB|TB|MB|W|V|HZ)|\d{3,4}P|4K|8K|5G|2K)$/i;
  const codigo = codigos.find((item) => !ignorar.test(item));
  return codigo ? limparModeloCandidato(codigo) : undefined;
}

function detectarTitulo(texto: string, loja?: string) {
  const linhas = texto
    .split(/\r?\n/)
    .map(limparMarkdown)
    .filter(Boolean)
    .filter((linha) => !/^https?:\/\//i.test(linha));

  const deveIgnorar = (linha: string) => {
    const l = linha.toLocaleUpperCase("pt-BR");

    if (/^(DE|POR)\s*:?\s*R?\$?/i.test(linha)) return true;
    if (/R\$\s*\d/.test(linha)) return true;
    if (/^CUPOM\b/i.test(linha)) return true;
    if (/^(CATEGORIA|MARCA|MODELO|COR|TAMANHO|CAPACIDADE|VOLTAGEM|REFER[EÊ]NCIA)\b/i.test(linha)) return true;
    if (/^COMPRE\s+AQUI\b/i.test(linha)) return true;
    if (/^VAGAS\s+NO\s+GRUPO\b/i.test(linha)) return true;
    if (/^FRETE\b/i.test(linha)) return true;
    if (/^OFERTA$/i.test(linha)) return true;

    // Avisos/rodapés comuns dos textos prontos nunca devem virar título.
    if (
      l.includes("SUJEIT") ||
      l.includes("CONDIÇÕES DE PAGAMENTO") ||
      l.includes("CONDICOES DE PAGAMENTO") ||
      l.includes("DISPONIBILIDADE") ||
      l.includes("ESTOQUE SUJEITO") ||
      l.includes("GRUPO DO WHATSAPP") ||
      l.includes("ACHADOSDOALE.COM/GRUPO")
    ) {
      return true;
    }

    if (loja && l === loja.toLocaleUpperCase("pt-BR")) return true;
    if (linha.length < 8 || linha.length > 150) return true;
    return false;
  };

  const candidatos = linhas.filter((linha) => !deveIgnorar(linha));
  if (!candidatos.length) return undefined;

  // Nos modelos usados no painel, o nome comercial da loja costuma vir
  // imediatamente antes do nome exato do produto. Essa linha tem prioridade
  // sobre chamadas publicitárias como "NO PRECINHO" ou "EM OFERTA".
  if (loja) {
    const lojaUpper = loja.toLocaleUpperCase("pt-BR");
    const indiceLoja = linhas.findIndex((linha) => {
      const l = linha.toLocaleUpperCase("pt-BR");
      return l === lojaUpper || l.includes(lojaUpper);
    });

    if (indiceLoja >= 0) {
      for (let i = indiceLoja + 1; i < Math.min(linhas.length, indiceLoja + 4); i += 1) {
        const linha = linhas[i];
        if (!deveIgnorar(linha)) return linha;
      }
    }
  }

  // Como fallback, reduz a pontuação de chamadas promocionais e favorece
  // nomes com características concretas de produto (marca/modelo/medidas).
  const pontuar = (linha: string) => {
    const l = linha.toLocaleUpperCase("pt-BR");
    let pontos = Math.min(linha.length, 100);

    if (/\b(NO PRECINHO|EM OFERTA|PROMOÇÃO|PROMOCAO|ACHADINHO|CORRE|APROVEITE)\b/.test(l)) {
      pontos -= 80;
    }
    if (/\b\d+(?:[.,]\d+)?\s*(W|V|L|ML|KG|GB|TB|CM|MM|UN|UNIDADES?)\b/.test(l)) {
      pontos += 25;
    }
    if (/\b(MASCULIN[AO]|FEMININ[AO]|BRANCO|BRANCA|PRETO|PRETA|BIVOLT|DRY-FIT|ULTRA|PRO|PLUS)\b/.test(l)) {
      pontos += 15;
    }

    return pontos;
  };

  return [...candidatos].sort((a, b) => pontuar(b) - pontuar(a))[0];
}


function detectarCupomOferta(texto: string) {
  // Se o próprio texto disser que não precisa de cupom, respeita isso.
  if (
    /\b(?:sem\s+(?:necessidade\s+de\s+)?cupom|n[aã]o\s+(?:precisa|necessita|tem)\s+(?:de\s+)?cupom|cupom\s+n[aã]o\s+necess[aá]rio|dispensa\s+cupom)\b/i.test(
      texto
    )
  ) {
    return "";
  }

  // Remove apenas marcações visuais para aceitar formatos comuns como:
  // "Cupom: *QUEIMADEESTOQUE2109*", "CUPOM - ABC123" e
  // "Use o cupom ABC123".
  const textoLimpo = texto
    .replace(/[\*_~`]/g, " ")
    .replace(/[\uFE0E\uFE0F\u200B-\u200D\u2060]/g, " ");

  const regexes = [
    /\b(?:use\s+(?:o\s+)?)?cupom\s*[:\-–—]\s*([A-Z0-9][A-Z0-9_\-]{3,39})(?=\s|$|[^A-Z0-9_\-])/i,
    /\buse\s+(?:o\s+)?cupom\s+([A-Z0-9][A-Z0-9_\-]{3,39})(?=\s|$|[^A-Z0-9_\-])/i,
    /\bcupom\s+([A-Z0-9][A-Z0-9_\-]{3,39})(?=\s|$|[^A-Z0-9_\-])/i,
  ];

  const termosGenericos = new Set([
    "DESCONTO",
    "VALIDO",
    "VÁLIDO",
    "APLICAVEL",
    "APLICÁVEL",
    "PESSOAL",
    "EXCLUSIVO",
    "PROMOCAO",
    "PROMOÇÃO",
  ]);

  for (const regex of regexes) {
    const match = textoLimpo.match(regex);
    const candidato = match?.[1]?.trim().toLocaleUpperCase("pt-BR");
    if (candidato && !termosGenericos.has(candidato)) return candidato;
  }

  return undefined;
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

  const categoria = detectarCategoria(texto, titulo);
  if (categoria) {
    valores.categoria = categoria;
    detectados.push("categoria");
  }

  const marca = detectarMarca(titulo, texto, categoria);
  if (marca) {
    valores.marca = marca;
    detectados.push("marca");
  }

  const modelo = detectarModelo(titulo, texto, marca, categoria);
  if (modelo) {
    valores.modelo = modelo;
    detectados.push("modelo");
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
    valores.ofereceParcelamento = true;
    valores.parcelas = Number(parcelasMatch[1]);
    valores.valorParcela = moedaParaNumero(parcelasMatch[2]);
    valores.parcelamentoSemJuros = /sem\s+juros/i.test(texto);
    if (valores.valorParcela != null) {
      valores.precoAtual =
        Math.round(Number(parcelasMatch[1]) * valores.valorParcela * 100) / 100;
    }
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

  const cupom = detectarCupomOferta(texto);
  if (cupom !== undefined) {
    valores.cupom = cupom;
    detectados.push(cupom ? "cupom" : "sem cupom");
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
