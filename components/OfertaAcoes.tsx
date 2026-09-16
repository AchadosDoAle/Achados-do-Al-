"use client";

import { useState } from "react";

export function BotaoCopiarCupom({ cupom }: { cupom: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(cupom);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button
      onClick={copiar}
      className="rounded-lg bg-trust/15 px-4 py-2 text-sm font-medium text-trust"
    >
      {copiado ? "Cupom copiado!" : `🏷️ Copiar cupom ${cupom}`}
    </button>
  );
}

export function BotaoCompartilhar({
  titulo,
  url,
}: {
  titulo: string;
  url: string;
}) {
  async function compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, url });
      } catch {
        // cancelado pelo usuário
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <button
      onClick={compartilhar}
      className="flex-1 rounded-xl2 bg-card px-4 py-3 text-sm font-medium text-text ring-1 ring-white/10 hover:ring-gold/40"
    >
      📤 Compartilhar
    </button>
  );
}
