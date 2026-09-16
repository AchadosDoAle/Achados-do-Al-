"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, classeInput } from "./Campo";
import { LOJAS } from "@/lib/mock-data";
import { Cupom, CupomFormValues, PALETA_CORES_LOJA } from "@/lib/types";
import { salvarNovoCupom, atualizarCupom } from "@/lib/coupons-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";

const VALORES_INICIAIS: CupomFormValues = {
  loja: LOJAS[0],
  nomeCupom: "",
  descontoPercentual: undefined,
  linkProdutos: "",
  corLoja: PALETA_CORES_LOJA[0].cor,
  validade: "",
  ativo: true,
};

export default function CupomForm({
  cupomExistente,
}: {
  cupomExistente?: Cupom;
}) {
  const router = useRouter();
  const supabase = criarClienteNavegador();
  const [valores, setValores] = useState<CupomFormValues>(
    cupomExistente ?? VALORES_INICIAIS
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");

  function atualizarCampo<K extends keyof CupomFormValues>(
    campo: K,
    valor: CupomFormValues[K]
  ) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  function validar(): boolean {
    const novosErros: Record<string, string> = {};
    if (!valores.loja) novosErros.loja = "Escolha a loja.";
    if (!valores.nomeCupom.trim())
      novosErros.nomeCupom = "Informe o nome/código do cupom.";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    setErroSalvar("");
    try {
      if (cupomExistente) {
        await atualizarCupom(supabase, cupomExistente.id, valores);
      } else {
        await salvarNovoCupom(supabase, valores);
      }
      router.push("/admin/cupons");
      router.refresh();
    } catch (erro) {
      console.error(erro);
      setErroSalvar(
        "Não foi possível salvar o cupom. Confira sua conexão e tente de novo."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-4 pb-10">
      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <div className="flex flex-col gap-3">
          <Campo rotulo="Loja" obrigatorio erro={erros.loja}>
            <select
              className={classeInput}
              value={valores.loja}
              onChange={(e) => atualizarCampo("loja", e.target.value)}
            >
              {LOJAS.map((loja) => (
                <option key={loja} value={loja}>
                  {loja}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            rotulo="Nome / código do cupom"
            obrigatorio
            erro={erros.nomeCupom}
          >
            <input
              className={classeInput}
              value={valores.nomeCupom}
              onChange={(e) => atualizarCampo("nomeCupom", e.target.value)}
              placeholder="Ex: PORTO15OFF"
            />
          </Campo>

          <Campo rotulo="Desconto (%)">
            <input
              type="number"
              step="0.01"
              className={classeInput}
              value={valores.descontoPercentual ?? ""}
              onChange={(e) =>
                atualizarCampo(
                  "descontoPercentual",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </Campo>

          <Campo rotulo="Link (ou lista) dos produtos exclusivos deste cupom">
            <textarea
              className={classeInput}
              rows={3}
              value={valores.linkProdutos}
              onChange={(e) => atualizarCampo("linkProdutos", e.target.value)}
              placeholder="Cole o link da promoção, ou liste os produtos que o cupom vale"
            />
          </Campo>

          <Campo rotulo="Validade do cupom">
            <input
              type="datetime-local"
              className={classeInput}
              value={valores.validade}
              onChange={(e) => atualizarCampo("validade", e.target.value)}
            />
            <p className="mt-1 text-xs text-ink/50">
              Depois dessa data, o cupom aparece cinza com a tarja
              "ESGOTADO" automaticamente. Deixe em branco para não vencer.
            </p>
          </Campo>

          <div>
            <span className="text-sm font-medium text-ink">
              Cor da loja (a palavra "CUPOM" fica nessa cor)
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PALETA_CORES_LOJA.map((opcao) => (
                <button
                  key={opcao.cor}
                  type="button"
                  onClick={() => atualizarCampo("corLoja", opcao.cor)}
                  title={opcao.nome}
                  className={`h-9 w-9 rounded-full ring-2 ${
                    valores.corLoja === opcao.cor
                      ? "ring-ink"
                      : "ring-transparent"
                  }`}
                  style={{ backgroundColor: opcao.cor }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={valores.ativo}
              onChange={(e) => atualizarCampo("ativo", e.target.checked)}
            />
            Ativo (visível na página pública de cupons)
          </label>
        </div>
      </section>

      {erroSalvar && (
        <p className="text-center text-sm text-accent-dark">{erroSalvar}</p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="rounded-xl2 bg-accent py-3 text-center font-medium text-white disabled:opacity-60"
      >
        {salvando
          ? "Salvando..."
          : cupomExistente
          ? "Salvar alterações"
          : "Salvar cupom"}
      </button>
    </form>
  );
}
