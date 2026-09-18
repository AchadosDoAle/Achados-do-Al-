"use client";

import { useState } from "react";
import { classeInput } from "./Campo";
import { ESTILO_LABEL, EstiloTexto, OfertaFormValues } from "@/lib/types";

const ESTILOS = Object.keys(ESTILO_LABEL) as EstiloTexto[];

const COMANDOS_RAPIDOS = [
  "Deixa mais engraçado",
  "Faz mais curto",
  "Deixa mais urgente",
  "Não menciona frete",
  "Coloca o cupom em destaque",
  "Faz versão para Instagram",
];

export default function GerarComIA({
  valores,
  onTextoGerado,
}: {
  valores: OfertaFormValues;
  onTextoGerado: (texto: string) => void;
}) {
  const [estilo, setEstilo] = useState<EstiloTexto>("minimalista");
  const [comando, setComando] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState("");

  async function gerar(comandoExtra?: string) {
    setCarregando(true);
    setAviso("");
    try {
      const resposta = await fetch("/api/gerar-oferta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oferta: valores,
          estilo,
          comando: comandoExtra ?? comando,
          textoAtual: valores.textoPublicacao,
        }),
      });

      if (!resposta.ok) {
        throw new Error("Falha ao gerar texto");
      }

      const dados = await resposta.json();
      onTextoGerado(dados.texto);
      if (dados.avisos) setAviso(dados.avisos);
    } catch (erro) {
      console.error(erro);
      setAviso(
        "Não consegui gerar o texto agora. Confira se a chave de IA está configurada (veja o README) e tente de novo."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <span className="text-sm font-medium text-ink">Estilo do texto</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {ESTILOS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setEstilo(opcao)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                estilo === opcao
                  ? "bg-brand text-white"
                  : "bg-cream text-ink/70 ring-1 ring-ink/10"
              }`}
            >
              {ESTILO_LABEL[opcao]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => gerar()}
        disabled={carregando}
        className="rounded-lg bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {carregando
          ? "Gerando..."
          : valores.textoPublicacao
          ? "Gerar publicação de novo"
          : "Gerar publicação"}
      </button>

      {valores.textoPublicacao && (
        <>
          <div>
            <span className="text-sm font-medium text-ink">
              Comandos rápidos
            </span>
            <div className="mt-1 flex flex-wrap gap-2">
              {COMANDOS_RAPIDOS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={carregando}
                  onClick={() => gerar(c)}
                  className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-ink/10"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              className={`${classeInput} uppercase`}
              placeholder='Ou digite um comando, ex: "troca o título"'
              value={comando}
              onChange={(e) => setComando(e.target.value.toLocaleUpperCase("pt-BR"))}
            />
            <button
              type="button"
              disabled={carregando || !comando.trim()}
              onClick={() => gerar()}
              className="shrink-0 rounded-lg bg-cream px-3 text-sm font-medium text-ink ring-1 ring-ink/10"
            >
              Aplicar
            </button>
          </div>
        </>
      )}

      {aviso && <p className="text-xs text-accent-dark">{aviso}</p>}
    </div>
  );
}
