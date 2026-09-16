// Integração com a WhatsApp Business Platform Cloud API (oficial da Meta).
//
// IMPORTANTE — leia antes de usar:
// A Cloud API oficial permite enviar mensagens para NÚMEROS DE TELEFONE
// individuais que já deram opt-in (ex: uma lista de clientes que topou
// receber avisos). Ela NÃO permite publicar automaticamente no seu canal
// do WhatsApp nem em grupos comuns — isso não existe hoje como recurso
// oficial da Meta. Para o canal, use os botões "Copiar" e "Enviar para
// WhatsApp" (Etapa 5), que são 100% oficiais e sem risco de bloqueio.

const VERSAO_API = "v20.0";

function baseUrl() {
  return `https://graph.facebook.com/${VERSAO_API}/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;
}

export async function testarConexaoWhatsApp() {
  const resposta = await fetch(
    `${baseUrl()}?fields=display_phone_number,verified_name`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
    }
  );

  const dados = await resposta.json();
  if (!resposta.ok) {
    return { ok: false as const, erro: dados?.error?.message ?? "Falha desconhecida" };
  }
  return { ok: true as const, numero: dados.display_phone_number, nome: dados.verified_name };
}

export async function enviarMensagemTemplate({
  paraTelefone,
  nomeTemplate,
  idioma = "pt_BR",
  parametros = [],
}: {
  paraTelefone: string;
  nomeTemplate: string;
  idioma?: string;
  parametros?: string[];
}) {
  const resposta = await fetch(`${baseUrl()}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: paraTelefone,
      type: "template",
      template: {
        name: nomeTemplate,
        language: { code: idioma },
        components: parametros.length
          ? [
              {
                type: "body",
                parameters: parametros.map((texto) => ({
                  type: "text",
                  text: texto,
                })),
              },
            ]
          : undefined,
      },
    }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) {
    return {
      ok: false as const,
      erro: dados?.error?.message ?? "Falha ao enviar mensagem",
    };
  }
  return { ok: true as const, idExterno: dados.messages?.[0]?.id };
}
