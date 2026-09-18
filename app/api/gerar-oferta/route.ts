import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINK_CANAL_WHATSAPP = "https://achadosdoale.com/grupo";

const MODELO_PADRAO = "claude-sonnet-5";

function montarPrompt({
  oferta,
  estilo,
  comando,
  textoAtual,
}: {
  oferta: any;
  estilo: string;
  comando?: string;
  textoAtual?: string;
}) {
  const dadosConhecidos = Object.entries(oferta)
    .filter(([, valor]) => valor !== undefined && valor !== "")
    .map(([chave, valor]) => `- ${chave}: ${valor}`)
    .join("\n");

  return `Você escreve publicações promocionais em português do Brasil para o
canal "Achado do Alê", que divulga achadinhos e ofertas de afiliados.

Siga MUITO de perto o exemplo abaixo — é o padrão exato de tom, estrutura,
pontuação e uso de emojis que o canal usa (só troque os dados pelos da
oferta atual, nunca copie o produto do exemplo):

---
🫙🔥 *POTES ELECTROLUX COM QUALIDADE!*

🏁 *MERCADO LIVRE*

🪩 *KIT COM 10 POTES HERMÉTICOS ELECTROLUX DE PLÁSTICO*

❌ ~De: R$ 129,00~
💵 *Por R$ 71,00 no Pix*

🎟️ Use o cupom: *DESCONTOEMCASA*
💳 Selecione o pagamento via Pix

🫙 Kit com 10 potes herméticos
✨ Ideais para organizar e conservar alimentos
🏠 Perfeitos para deixar a cozinha mais prática e organizada

🛒 Compre aqui:
https://meli.la/1rQRQWZ

⚠️ *PARA GARANTIR O VALOR, USE O CUPOM E SELECIONE PIX.*
⚠️ *PREÇO, CUPOM, CONDIÇÕES DE PAGAMENTO E ESTOQUE SUJEITOS À DISPONIBILIDADE.*

📲 *VAGAS NO GRUPO DO WHATSAPP NESSE LINK:*
${LINK_CANAL_WHATSAPP}
---

REGRAS DE MONTAGEM (adapte de acordo com os dados que a oferta realmente
tem — nunca invente um dado que falta):

1. Título: 1 ou 2 emojis relacionados ao produto (não fixos, escolha
   conforme o item) + frase curta e chamativa em CAIXA ALTA, negrito.
2. 🏁 *[LOJA]* em negrito.
3. 🪩 *[NOME DO PRODUTO]* em negrito.
4. Se houver preço antigo: "❌ ~De: R$ XX,XX~" (til simples, sem negrito,
   só riscado).
5. Preço atual: "💵 *Por R$ XX,XX*". Se esse valor for especificamente o
   preço no Pix, acrescente "no Pix" no final da linha, ex:
   "💵 *Por R$ XX,XX no Pix*". Se não houver preço no Pix, só "*Por R$ XX,XX*".
6. Se houver cupom: "🎟️ Use o cupom: *CÓDIGO*".
7. Linha de pagamento: se houver preço no Pix, "💳 Selecione o pagamento
   via Pix". Se em vez disso houver parcelamento, respeite obrigatoriamente
   o campo parcelamentoSemJuros: se for true, use algo como
   "💳 Ou parcele em até Xx sem juros"; se for false, use algo como
   "💳 Ou parcele em Xx de R$ XX,XX com juros". Nunca deduza que é sem juros
   comparando valores. Se não houver Pix nem parcelamento, omita esta linha.
8. Exatamente 3 linhas de descrição, cada uma com um emoji relevante ao
   produto no início (varie os emojis conforme o item — não repita os do
   exemplo se não fizerem sentido para o produto atual).
9. "🛒 Compre aqui:" seguido do link do produto em texto puro (nunca em
   markdown, nunca como hiperlink).
10. Linha(s) de aviso: se houver cupom E preço no Pix ao mesmo tempo,
    inclua "⚠️ *PARA GARANTIR O VALOR, USE O CUPOM E SELECIONE PIX.*"
    antes do aviso padrão. Sempre inclua o aviso padrão:
    "⚠️ *PREÇO, CUPOM, CONDIÇÕES DE PAGAMENTO E ESTOQUE SUJEITOS À
    DISPONIBILIDADE.*"
11. Por último, sempre: "📲 *VAGAS NO GRUPO DO WHATSAPP NESSE LINK:*"
    seguido de ${LINK_CANAL_WHATSAPP} em texto puro.

REGRAS GERAIS:
- Use linguagem simples, natural e persuasiva, sem exageros falsos.
- NUNCA invente especificação, característica, cupom ou vantagem que não
  esteja nos dados abaixo. Se faltar um dado necessário, omita a linha
  correspondente em vez de inventar.
- Corrija a ortografia e a gramática do texto original, se houver.
- Estilo pedido para esta publicação: ${estilo}.
- Ao final da sua resposta, se algum dado importante estiver faltando
  (por exemplo, preço, loja ou link), acrescente uma linha começando
  exatamente com "AVISOS:" seguida de uma frase curta explicando o que
  falta. Se não faltar nada, não inclua essa linha.

DADOS DA OFERTA:
${dadosConhecidos}

${textoAtual ? `TEXTO ATUAL (a ser editado, não recriado do zero):\n${textoAtual}\n` : ""}
${comando ? `COMANDO DO USUÁRIO PARA ESTE PEDIDO: "${comando}"` : "Gere a publicação completa seguindo o formato acima."}

Responda apenas com o texto final da publicação (e a linha "AVISOS:" no
final, se necessária). Não explique o que você fez, e não copie o produto
do exemplo — use somente os DADOS DA OFERTA informados acima.`;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        erro:
          "ANTHROPIC_API_KEY não configurada. Veja o README para saber como configurar.",
      },
      { status: 500 }
    );
  }

  const corpo = await req.json();
  const prompt = montarPrompt(corpo);

  const resposta = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || MODELO_PADRAO,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!resposta.ok) {
    const erro = await resposta.text();
    console.error("Erro da API da Anthropic:", erro);
    return NextResponse.json(
      { erro: "Falha ao gerar o texto com a IA." },
      { status: 502 }
    );
  }

  const dados = await resposta.json();
  // Modelos mais novos às vezes mandam um bloco de "pensamento" (thinking)
  // antes do texto de verdade — por isso procuramos o bloco do tipo "text"
  // em vez de assumir que é sempre o primeiro item da lista.
  const blocoDeTexto = dados.content?.find(
    (bloco: any) => bloco.type === "text"
  );
  const textoCompleto: string = blocoDeTexto?.text ?? "";

  const [texto, blocoAvisos] = textoCompleto.split(/\nAVISOS:/);

  return NextResponse.json({
    texto: texto.trim(),
    avisos: blocoAvisos?.trim(),
  });
}
