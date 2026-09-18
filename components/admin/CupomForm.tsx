"use client";

import { useMemo, useState } from "react";
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

const classeCard = "rounded-[22px] border border-brand/10 bg-white p-5 shadow-sm";
const FUSO_BRASILIA = "America/Sao_Paulo";

const paraCaixaAlta = (valor: string) => valor.toLocaleUpperCase("pt-BR");

function normalizarTextosCupom(valores: CupomFormValues): CupomFormValues {
  return {
    ...valores,
    nomeCupom: paraCaixaAlta(valores.nomeCupom),
    valorCupom: paraCaixaAlta(valores.valorCupom || ""),
    descricao: paraCaixaAlta(valores.descricao || ""),
    observacoes: paraCaixaAlta(valores.observacoes || ""),
  };
}

function extrairDataHoraBrasilia(valor?: string) {
  if (!valor) return { data: "", hora: "" };

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    const [parteData = "", parteHora = ""] = valor.split("T");
    return { data: parteData, hora: parteHora.slice(0, 5) };
  }

  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_BRASILIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);

  const get = (type: string) => partes.find((item) => item.type === type)?.value ?? "";

  return {
    data: `${get("year")}-${get("month")}-${get("day")}`,
    hora: `${get("hour")}:${get("minute")}`,
  };
}

function montarIsoBrasilia(data: string, hora: string) {
  if (!data) return "";
  const horaFinal = hora || "23:59";
  return new Date(`${data}T${horaFinal}:00-03:00`).toISOString();
}

export default function CupomForm({
  cupomExistente,
}: {
  cupomExistente?: Cupom;
}) {
  const router = useRouter();
  const supabase = criarClienteNavegador();
  const valoresBase = useMemo(() => cupomExistente ?? VALORES_INICIAIS, [cupomExistente]);
  const [valores, setValores] = useState<CupomFormValues>(valoresBase);
  const validadeInicial = useMemo(
    () => extrairDataHoraBrasilia(cupomExistente?.validade),
    [cupomExistente?.validade]
  );
  const [validadeData, setValidadeData] = useState(validadeInicial.data);
  const [validadeHora, setValidadeHora] = useState(validadeInicial.hora);

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
    if (validadeHora && !validadeData) {
      novosErros.validade = "Escolha a data para salvar o horário.";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    setErroSalvar("");
    try {
      const valoresParaSalvar: CupomFormValues = {
        ...normalizarTextosCupom(valores),
        validade: montarIsoBrasilia(validadeData, validadeHora),
      };

      if (cupomExistente) {
        await atualizarCupom(supabase, cupomExistente.id, valoresParaSalvar);
      } else {
        await salvarNovoCupom(supabase, valoresParaSalvar);
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
    <form onSubmit={aoEnviar} className="flex flex-col gap-6 pb-10">
      <section className="rounded-[26px] bg-gradient-to-r from-brand to-brand-light p-5 text-white shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
              Painel administrativo
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">
              {cupomExistente ? "Atualize o cupom" : "Cadastre um novo cupom"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Layout mais atual, dividido em blocos e com validade separada em data + horário no fuso de Brasília.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90">
            ⏰ Fuso considerado: <strong>GMT de Brasília</strong>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Identificação do cupom</h2>
              <p className="text-sm text-ink/55">Loja, código do cupom e resumo do benefício.</p>
            </div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">
              Etapa 1
            </span>
          </div>

          <div className="flex flex-col gap-4">
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

            <Campo rotulo="Nome / código do cupom" obrigatorio erro={erros.nomeCupom}>
              <input
                className={`${classeInput} uppercase`}
                value={valores.nomeCupom}
                onChange={(e) => atualizarCampo("nomeCupom", paraCaixaAlta(e.target.value))}
                placeholder="Ex: PORTO15OFF"
              />
            </Campo>

            <div className="grid gap-4 md:grid-cols-2">
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
                  Use para porcentagens simples.
                </p>
              </Campo>

              <Campo rotulo="Valor do cupom">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.valorCupom}
                  onChange={(e) => atualizarCampo("valorCupom", paraCaixaAlta(e.target.value))}
                  placeholder='Ex: "R$40 OFF"'
                />
                <p className="mt-1 text-xs text-ink/50">
                  Texto livre que aparece em destaque no card.
                </p>
              </Campo>
            </div>
          </div>
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Links e termos</h2>
              <p className="text-sm text-ink/55">Descrição, produtos participantes e observações.</p>
            </div>
            <span className="rounded-full bg-discount/25 px-3 py-1 text-xs font-semibold text-ink">
              Etapa 2
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Campo rotulo="Descrição do cupom (se houver)">
              <textarea
                className={`${classeInput} uppercase`}
                rows={4}
                value={valores.descricao}
                onChange={(e) => atualizarCampo("descricao", paraCaixaAlta(e.target.value))}
                placeholder={
                  "Ex: Tecnologia | Compra mínima: R$149 | Desconto máx.: R$200\nVálido enquanto durarem os estoques."
                }
              />
            </Campo>

            <Campo rotulo="Link (ou lista) dos produtos exclusivos deste cupom">
              <textarea
                className={classeInput}
                rows={4}
                value={valores.linkProdutos}
                onChange={(e) => atualizarCampo("linkProdutos", e.target.value)}
                placeholder="Cole o link da promoção, ou liste os produtos que o cupom vale"
              />
              <p className="mt-1 text-xs text-ink/50">
                Se for link, ele abre automaticamente na página pública.
              </p>
            </Campo>

            <Campo rotulo="Observações / termos de uso">
              <textarea
                className={`${classeInput} uppercase`}
                rows={4}
                value={valores.observacoes}
                onChange={(e) => atualizarCampo("observacoes", paraCaixaAlta(e.target.value))}
                placeholder="Ex: Não cumulativo. 1 uso por CPF. Frete não incluso."
              />
            </Campo>
          </div>
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Validade e cor</h2>
              <p className="text-sm text-ink/55">Salvamento mais confiável na edição dos cupons.</p>
            </div>
            <span className="rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">
              Etapa 3
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Data de validade" erro={erros.validade}>
                <input
                  type="date"
                  className={classeInput}
                  value={validadeData}
                  onChange={(e) => setValidadeData(e.target.value)}
                />
              </Campo>

              <Campo rotulo="Horário de validade">
                <input
                  type="time"
                  className={classeInput}
                  value={validadeHora}
                  onChange={(e) => setValidadeHora(e.target.value)}
                />
              </Campo>
            </div>

            <p className="rounded-xl bg-brand/5 px-3 py-3 text-xs text-ink/70">
              Depois dessa data e horário, o cupom aparece cinza com a tarja <strong>ESGOTADO</strong>.
              Deixe em branco para não vencer. O sistema considera o fuso <strong>GMT de Brasília</strong>.
            </p>

            <div>
              <span className="text-sm font-semibold text-ink">
                Cor da loja (a palavra "CUPOM" fica nessa cor)
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {PALETA_CORES_LOJA.map((opcao) => (
                  <button
                    key={opcao.cor}
                    type="button"
                    onClick={() => atualizarCampo("corLoja", opcao.cor)}
                    title={opcao.nome}
                    className={`h-10 w-10 rounded-full ring-2 transition ${
                      valores.corLoja === opcao.cor ? "ring-ink" : "ring-transparent"
                    }`}
                    style={{ backgroundColor: opcao.cor }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Exibição</h2>
              <p className="text-sm text-ink/55">Controle visual do cupom na página pública.</p>
            </div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">
              Etapa 4
            </span>
          </div>

          <label className="flex items-center gap-2 rounded-xl bg-cream px-3 py-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={valores.ativo}
              onChange={(e) => atualizarCampo("ativo", e.target.checked)}
            />
            Ativo (visível na página pública de cupons)
          </label>
        </section>
      </div>

      {erroSalvar && <p className="text-center text-sm text-accent-dark">{erroSalvar}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="rounded-[18px] bg-accent px-6 py-3 text-center font-semibold text-white shadow-sm disabled:opacity-60"
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
