"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, classeInput } from "./Campo";
import { LOJAS, LOJAS_AFILIADAS, LOJA_OUTROS } from "@/lib/mock-data";
import { Cupom, CupomFormValues, PALETA_CORES_LOJA } from "@/lib/types";
import { salvarNovoCupom, atualizarCupom } from "@/lib/coupons-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";

const VALORES_INICIAIS: CupomFormValues = {
  loja: LOJAS[0],
  nomeCupom: "",
  descontoPercentual: undefined,
  valorCupom: "",
  descricao: "",
  observacoes: "",
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
  const lojaExistente = cupomExistente?.loja ?? LOJAS[0];
  const lojaExistenteEhAfiliada = LOJAS_AFILIADAS.includes(lojaExistente);
  const [lojaSelecionada, setLojaSelecionada] = useState(
    lojaExistenteEhAfiliada ? lojaExistente : cupomExistente ? LOJA_OUTROS : LOJAS[0]
  );
  const [lojaPersonalizada, setLojaPersonalizada] = useState(
    cupomExistente &&
      !lojaExistenteEhAfiliada &&
      lojaExistente !== LOJA_OUTROS
      ? lojaExistente
      : ""
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
    if (lojaSelecionada === LOJA_OUTROS && !lojaPersonalizada.trim()) {
      novosErros.loja = "Informe o nome da loja.";
    } else if (!valores.loja) {
      novosErros.loja = "Escolha a loja.";
    }
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
    } catch (erro: any) {
      console.error(erro);
      setErroSalvar(
        `Não foi possível salvar o cupom${
          erro?.message ? `: ${erro.message}` : ""
        }. Confira se a tabela "coupons" já existe no Supabase (rode supabase/coupons.sql).`
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
            <div className="flex flex-col gap-2">
              <select
                className={classeInput}
                value={lojaSelecionada}
                onChange={(e) => {
                  const novaLoja = e.target.value;
                  setLojaSelecionada(novaLoja);
                  atualizarCampo(
                    "loja",
                    novaLoja === LOJA_OUTROS ? lojaPersonalizada : novaLoja
                  );
                }}
              >
                {LOJAS.map((loja) => (
                  <option key={loja} value={loja}>
                    {loja}
                  </option>
                ))}
              </select>

              {lojaSelecionada === LOJA_OUTROS && (
                <input
                  className={classeInput}
                  value={lojaPersonalizada}
                  onChange={(e) => {
                    setLojaPersonalizada(e.target.value);
                    atualizarCampo("loja", e.target.value);
                  }}
                  placeholder="Digite o nome da loja"
                  autoFocus
                />
              )}
            </div>
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
            <p className="mt-1 text-xs text-ink/50">
              Use este campo só quando o desconto for uma porcentagem
              simples. Para descontos em reais ou regras mais específicas,
              use o campo "Valor do cupom" abaixo.
            </p>
          </Campo>

          <Campo rotulo="Valor do cupom">
            <input
              className={classeInput}
              value={valores.valorCupom}
              onChange={(e) => atualizarCampo("valorCupom", e.target.value)}
              placeholder='Ex: "10% OFF" ou "R$30,00 de desconto"'
            />
            <p className="mt-1 text-xs text-ink/50">
              Texto livre que aparece em destaque no card do cupom — use
              quando não for uma simples porcentagem. Ex: "Receba R$30,00 de
              desconto para compras a partir de R$99".
            </p>
          </Campo>

          <Campo rotulo="Descrição do cupom (se houver)">
            <textarea
              className={classeInput}
              rows={3}
              value={valores.descricao}
              onChange={(e) => atualizarCampo("descricao", e.target.value)}
              placeholder={
                "Ex: Tecnologia | Compra mínima: R$149 | Desconto máx.: R$200\nVálido somente em 16.09, enquanto durarem os estoques."
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
            <p className="mt-1 text-xs text-ink/50">
              Se for um link, ele abre automaticamente quando alguém tocar
              no nome do cupom na página pública.
            </p>
          </Campo>

          <Campo rotulo="Observações / termos de uso">
            <textarea
              className={classeInput}
              rows={3}
              value={valores.observacoes}
              onChange={(e) => atualizarCampo("observacoes", e.target.value)}
              placeholder="Ex: Não cumulativo com outras promoções. Válido 1 uso por CPF. Frete não incluso."
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
