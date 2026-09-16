import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LINK_CANAL_WHATSAPP =
  "https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J";

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

FORMATO OBRIGATÓRIO (siga exatamente esta estrutura, sem markdown, sem
transformar links em hiperlink, links sempre em texto puro):

[Título curto e chamativo com emojis]

🏁 [NOME DA LOJA]

🪩 [NOME DO PRODUTO EM MAIÚSCULAS QUANDO FIZER SENTIDO]

❌ *~DE R$ XX,XX~* (omita esta linha se não houver preço antigo)
💵 *POR R$ XX,XX*
💳 *OU EM ATÉ X VEZES SEM JUROS* (omita se não houver parcelamento)
Cupom: *CUPOM* (omita se não houver cupom)

[Descrição 1 — uma frase]
[Descrição 2 — uma frase]
[Descrição 3 — uma frase]

⚠️ *PREÇO, CUPOM, PARCELAMENTO, FRETE E ESTOQUE SUJEITOS À DISPONIBILIDADE. A OFERTA PODE ENCERRAR A QUALQUER MOMENTO!*

🛒 *COMPRE AQUI:*
[link do produto em texto puro]

📲 *VAGAS NO GRUPO DO WHATSAPP NESSE LINK:*
${LINK_CANAL_WHATSAPP}

REGRAS IMPORTANTES:
- Use linguagem simples, natural e persuasiva, sem exageros falsos.
- NUNCA invente especificação, característica ou vantagem que não esteja
  nos dados abaixo. Se faltar um dado necessário para o formato, escreva
  uma frase neutra no lugar em vez de inventar.
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
final, se necessária). Não explique o que você fez.`;
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
