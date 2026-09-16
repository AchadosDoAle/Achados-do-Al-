"use client";

import { useState } from "react";

export default function PreviaWhatsApp({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function compartilhar() {
    // Compartilhamento nativo do celular — forma 100% oficial de mandar
    // a publicação pronta para o WhatsApp (canal, grupo ou contato),
    // sem depender de nenhuma API não oficial.
    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
      } catch {
        // usuário cancelou o compartilhamento, nada a fazer
      }
    } else {
      await copiar();
    }
  }

  if (!texto) {
    return (
      <p className="rounded-lg bg-cream p-3 text-sm text-ink/50">
        A prévia aparece aqui depois de gerar ou escrever o texto da
        publicação.
      </p>
    );
  }

  return (
    <div>
      <div
        className="whitespace-pre-wrap rounded-lg rounded-tl-none bg-[#DCF8C6] p-3 text-sm text-[#111]"
        style={{ fontFamily: "system-ui" }}
      >
        {texto}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={copiar}
          className="flex-1 rounded-lg bg-trust/10 py-2 text-sm font-medium text-trust"
        >
          {copiado ? "Copiado!" : "Copiar publicação"}
        </button>
        <button
          type="button"
          onClick={compartilhar}
          className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-white"
        >
          Enviar para WhatsApp
        </button>
      </div>
    </div>
  );
}
