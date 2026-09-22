"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, classeInput } from "./Campo";
import {
  CATEGORIAS_ADMIN,
  CATEGORIA_OUTROS,
  LOJAS,
  LOJAS_AFILIADAS,
  LOJA_OUTROS,
} from "@/lib/mock-data";
import { Oferta, OfertaFormValues, STATUS_LABEL, StatusOferta } from "@/lib/types";
import {
  salvarNovaOferta,
  atualizarOferta,
  reativarOfertaReportada,
} from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { linkParecePertencerALoja } from "@/lib/validar-link";
import { interpretarTextoOferta } from "@/lib/parse-oferta-texto";
import PreviaWhatsApp from "./PreviaWhatsApp";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

const STATUS_OPCOES_BASE: StatusOferta[] = ["rascunho", "agendada", "publicada", "expirada", "arquivada"];
const CATEGORIAS_DISPONIVEIS = CATEGORIAS_ADMIN;
const classeCard = "rounded-[22px] border border-brand/10 bg-white p-5 shadow-sm";
const paraCaixaAlta = (valor: string) => valor.toLocaleUpperCase("pt-BR");

const VALORES_INICIAIS: OfertaFormValues = {
  titulo: "",
  loja: LOJAS[0],
  categoria: CATEGORIAS_DISPONIVEIS[0] ?? "",
  marca: "",
  modelo: "",
  precoAntigo: undefined,
  precoAtual: undefined,
  precoPix: undefined,
  ofereceParcelamento: false,
  parcelas: undefined,
  valorParcela: undefined,
  parcelamentoSemJuros: false,
  cupom: "",
  cupomDescricao: "",
  linkCupom: "",
  freteGratis: false,
  freteCondicao: "",
  estoque: "",
  validadePromocao: "",
  voltagem: "",
  cor: "",
  tamanho: "",
  capacidade: "",
  linkProduto: "",
  usarLinkRedirecionamento: true,
  textoOriginal: "",
  textoPublicacao: "",
  observacoes: "",
  imagemPrincipal: "",
  status: "rascunho",
  agendadoPara: "",
};

function normalizarTextosOferta(valores: OfertaFormValues): OfertaFormValues {
  return {
    ...valores,
    titulo: paraCaixaAlta(valores.titulo),
    marca: paraCaixaAlta(valores.marca || ""),
    modelo: paraCaixaAlta(valores.modelo || ""),
    cupom: paraCaixaAlta(valores.cupom || ""),
    cupomDescricao: paraCaixaAlta(valores.cupomDescricao || ""),
    freteCondicao: paraCaixaAlta(valores.freteCondicao || ""),
    estoque: paraCaixaAlta(valores.estoque || ""),
    voltagem: paraCaixaAlta(valores.voltagem || ""),
    cor: paraCaixaAlta(valores.cor || ""),
    tamanho: paraCaixaAlta(valores.tamanho || ""),
    capacidade: paraCaixaAlta(valores.capacidade || ""),
    observacoes: paraCaixaAlta(valores.observacoes || ""),
    // O texto da publicação é mantido exatamente como foi colado/editado.
    textoPublicacao: valores.textoPublicacao || "",
  };
}

export default function OfferForm({ ofertaExistente }: { ofertaExistente?: Oferta }) {
  const router = useRouter();
  const supabase = criarClienteNavegador();
  const [valores, setValores] = useState<OfertaFormValues>(ofertaExistente ?? VALORES_INICIAIS);
  const statusOpcoes = STATUS_OPCOES_BASE.includes(valores.status)
    ? STATUS_OPCOES_BASE
    : [valores.status, ...STATUS_OPCOES_BASE];

  const lojaExistente = ofertaExistente?.loja ?? LOJAS[0];
  const lojaExistenteEhAfiliada = LOJAS_AFILIADAS.includes(lojaExistente);
  const [lojaSelecionada, setLojaSelecionada] = useState(
    lojaExistenteEhAfiliada ? lojaExistente : ofertaExistente ? LOJA_OUTROS : LOJAS[0]
  );
  const [lojaPersonalizada, setLojaPersonalizada] = useState(
    ofertaExistente && !lojaExistenteEhAfiliada && lojaExistente !== LOJA_OUTROS
      ? lojaExistente
      : ""
  );

  const categoriaExistente = ofertaExistente?.categoria ?? CATEGORIAS_DISPONIVEIS[0] ?? "";
  const categoriaExistenteNaLista = CATEGORIAS_DISPONIVEIS.includes(categoriaExistente);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(
    categoriaExistenteNaLista
      ? categoriaExistente
      : ofertaExistente
      ? CATEGORIA_OUTROS
      : CATEGORIAS_DISPONIVEIS[0] ?? ""
  );
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState(
    ofertaExistente && !categoriaExistenteNaLista ? categoriaExistente : ""
  );

  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");
  const [previewImagem, setPreviewImagem] = useState<string | undefined>(ofertaExistente?.imagemPrincipal);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [buscandoImagemAuto, setBuscandoImagemAuto] = useState(false);
  const [statusImagemAuto, setStatusImagemAuto] = useState("");
  const [resultadoLeitura, setResultadoLeitura] = useState("");
  const ofertaExistenteExpirada = ofertaExistente ? ofertaEstaExpirada(ofertaExistente) : false;

  function atualizarCampo<K extends keyof OfertaFormValues>(campo: K, valor: OfertaFormValues[K]) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  function prepararReativacaoNaHome() {
    setValores((atual) => ({
      ...atual,
      status: "publicada",
      validadePromocao: "",
      agendadoPara: "",
    }));
    setErroSalvar("");
  }

  function atualizarParcelamento(campo: "parcelas" | "valorParcela", valor: number | undefined) {
    setValores((atual) => {
      const parcelas = campo === "parcelas" ? valor : atual.parcelas;
      const valorParcela = campo === "valorParcela" ? valor : atual.valorParcela;
      const precoAtual =
        parcelas && parcelas > 0 && valorParcela && valorParcela > 0
          ? Math.round(parcelas * valorParcela * 100) / 100
          : undefined;
      return { ...atual, parcelas, valorParcela, precoAtual };
    });
  }

  function atualizarOfereceParcelamento(oferece: boolean) {
    setValores((atual) => ({
      ...atual,
      ofereceParcelamento: oferece,
      ...(oferece
        ? {}
        : {
            parcelas: undefined,
            valorParcela: undefined,
            parcelamentoSemJuros: false,
          }),
    }));
  }

  function reconhecerTexto() {
    const texto = (valores.textoPublicacao ?? "").trim();
    if (!texto) {
      setResultadoLeitura("Cole primeiro o texto da oferta.");
      return;
    }

    const resultado = interpretarTextoOferta(texto);
    setValores((atual) => ({ ...atual, ...resultado.valores, textoPublicacao: texto }));

    if (resultado.valores.loja) {
      if (LOJAS_AFILIADAS.includes(resultado.valores.loja)) {
        setLojaSelecionada(resultado.valores.loja);
        setLojaPersonalizada("");
      } else {
        setLojaSelecionada(LOJA_OUTROS);
        setLojaPersonalizada(resultado.valores.loja);
      }
    }

    if (resultado.valores.categoria) {
      if (CATEGORIAS_DISPONIVEIS.includes(resultado.valores.categoria)) {
        setCategoriaSelecionada(resultado.valores.categoria);
        setCategoriaPersonalizada("");
      } else {
        setCategoriaSelecionada(CATEGORIA_OUTROS);
        setCategoriaPersonalizada(resultado.valores.categoria);
      }
    }

    if (resultado.valores.linkProduto && !valores.imagemPrincipal) {
      void buscarImagemAutomaticamente(resultado.valores.linkProduto);
    }

    setResultadoLeitura(
      resultado.camposDetectados.length
        ? `Preenchido automaticamente: ${resultado.camposDetectados.join(", ")}. Revise os campos antes de salvar.`
        : "Não consegui identificar os dados principais. O texto foi mantido e você pode preencher os campos manualmente."
    );
  }

  function validar() {
    const novosErros: Record<string, string> = {};
    if (!valores.titulo.trim()) novosErros.titulo = "Informe o nome do produto.";
    if (lojaSelecionada === LOJA_OUTROS && !lojaPersonalizada.trim()) {
      novosErros.loja = "Informe o nome da loja.";
    } else if (!valores.loja) novosErros.loja = "Escolha a loja.";
    if (categoriaSelecionada === CATEGORIA_OUTROS && !categoriaPersonalizada.trim()) {
      novosErros.categoria = "Informe a categoria manualmente.";
    } else if (!valores.categoria) novosErros.categoria = "Escolha a categoria.";
    if (!valores.linkProduto.trim()) novosErros.linkProduto = "Cole o link do produto.";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    setErroSalvar("");
    try {
      const valoresParaSalvar = normalizarTextosOferta(valores);
      if (ofertaExistente) {
        await atualizarOferta(supabase, ofertaExistente.id, valoresParaSalvar);
        if (ofertaExistente.status === "expirada" && valoresParaSalvar.status === "publicada") {
          await reativarOfertaReportada(supabase, ofertaExistente.id);
        }
      } else {
        await salvarNovaOferta(supabase, valoresParaSalvar);
      }
      router.push("/admin/ofertas");
      router.refresh();
    } catch (erro) {
      console.error(erro);
      setErroSalvar("Não foi possível salvar a oferta. Confira sua conexão e tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  async function buscarImagemAutomaticamente(linkOverride?: string) {
    const linkBusca = linkOverride || valores.linkProduto;
    if (!linkBusca.trim()) {
      setStatusImagemAuto("Cole o link do produto antes de buscar a imagem.");
      return;
    }
    setBuscandoImagemAuto(true);
    setStatusImagemAuto("");
    try {
      const resposta = await fetch("/api/buscar-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: linkBusca }),
      });
      const dados = await resposta.json();
      if (dados.imagemUrl) {
        atualizarCampo("imagemPrincipal", dados.imagemUrl);
        setPreviewImagem(dados.imagemUrl);
        setStatusImagemAuto("✅ Imagem encontrada e adicionada!");
      } else {
        setStatusImagemAuto(`${dados.erro || "Não encontramos a imagem automaticamente."} Envie manualmente abaixo.`);
      }
    } catch (erro) {
      console.error(erro);
      setStatusImagemAuto("Não foi possível buscar a imagem automaticamente. Envie manualmente abaixo.");
    } finally {
      setBuscandoImagemAuto(false);
    }
  }

  async function aoEscolherImagem(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setPreviewImagem(URL.createObjectURL(arquivo));
    setEnviandoImagem(true);
    setErroImagem("");
    try {
      const nomeArquivo = `${crypto.randomUUID()}-${arquivo.name}`;
      const { error } = await supabase.storage.from("ofertas").upload(nomeArquivo, arquivo, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("ofertas").getPublicUrl(nomeArquivo);
      atualizarCampo("imagemPrincipal", data.publicUrl);
    } catch (erro) {
      console.error(erro);
      setErroImagem("Não foi possível enviar a imagem. Confira o Storage do Supabase e tente de novo.");
    } finally {
      setEnviandoImagem(false);
    }
  }

  const etapas = [
    ["#etapa-texto", "1", "Colar oferta"],
    ["#etapa-produto", "2", "Produto"],
    ["#etapa-preco", "3", "Preço"],
    ["#etapa-promocao", "4", "Promoção"],
    ["#etapa-detalhes", "5", "Detalhes"],
    ["#etapa-publicacao", "6", "Publicar"],
  ];

  return (
    <form onSubmit={aoEnviar} className="flex flex-col gap-5 pb-10">
      {ofertaExistenteExpirada && (
        <section className="rounded-[22px] border border-discount/50 bg-discount/10 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand/70">Arquivo de promoções</p>
              <h2 className="mt-1 font-display text-lg font-bold text-ink">Esta oferta está em “Veja o que já perdeu!”</h2>
              <p className="mt-1 max-w-2xl text-sm text-ink/60">
                Se a promoção voltou, atualize preço, link e condições. O botão abaixo prepara a oferta para voltar à Home e remove a validade antiga.
              </p>
            </div>
            <button
              type="button"
              onClick={prepararReativacaoNaHome}
              className="admin-btn-modern shrink-0 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white"
            >
              ↻ Reativar na Home
            </button>
          </div>
          {valores.status === "publicada" && !valores.validadePromocao && (
            <p className="mt-3 rounded-xl bg-trust/10 px-3 py-2 text-xs font-semibold text-trust">
              ✓ Pronta para voltar à Home. Revise os dados e clique em Salvar alterações.
            </p>
          )}
        </section>
      )}
      <section className="rounded-[22px] border border-brand/10 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Cadastro simplificado</p>
            <p className="mt-1 text-xs text-ink/50">Cole a oferta pronta primeiro; o site tenta preencher o restante para você.</p>
          </div>
          <span className="hidden rounded-full bg-brand/5 px-3 py-1 text-xs font-semibold text-brand sm:inline-flex">6 etapas</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {etapas.map(([href, numero, nome]) => (
            <a key={href} href={href} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-cream/60 px-3 py-2 text-xs font-semibold text-ink/75 transition hover:border-brand/30 hover:bg-brand/5 hover:text-brand">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">{numero}</span>
              <span className="truncate">{nome}</span>
            </a>
          ))}
        </div>
      </section>

      <section id="etapa-texto" className={`${classeCard} scroll-mt-28 border-brand/20 bg-brand/[0.025]`}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink">Cole o texto pronto da oferta</h2>
            <p className="text-sm text-ink/55">Pode colar exatamente o texto que você gerou fora do site, com emojis, preços, link e formatação.</p>
          </div>
          <span className="w-fit rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">Etapa 1</span>
        </div>

        <Campo rotulo="Texto da publicação">
          <textarea
            className={classeInput}
            rows={12}
            value={valores.textoPublicacao}
            onChange={(e) => atualizarCampo("textoPublicacao", e.target.value)}
            placeholder="Cole aqui a oferta completa..."
          />
        </Campo>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="button" onClick={reconhecerTexto} className="admin-btn-modern rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-light">
            ✨ Reconhecer texto e preencher campos
          </button>
          <p className="text-xs text-ink/50">O reconhecimento acontece no próprio site e não altera o texto que você colou.</p>
        </div>

        {resultadoLeitura && (
          <p className="mt-3 rounded-xl bg-trust/10 px-3 py-2 text-sm text-ink/75">{resultadoLeitura}</p>
        )}

        {valores.textoPublicacao && (
          <div className="mt-4 border-t border-ink/10 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">Prévia do texto</p>
            <PreviaWhatsApp texto={valores.textoPublicacao} />
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section id="etapa-produto" className={`${classeCard} scroll-mt-28`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-bold text-ink">Produto</h2><p className="text-sm text-ink/55">Revise o que foi reconhecido.</p></div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">Etapa 2</span>
          </div>
          <div className="flex flex-col gap-4">
            <Campo rotulo="Nome do produto" obrigatorio erro={erros.titulo}>
              <input className={`${classeInput} uppercase`} value={valores.titulo} onChange={(e) => atualizarCampo("titulo", paraCaixaAlta(e.target.value))} />
            </Campo>
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Loja" obrigatorio erro={erros.loja}>
                <div className="flex flex-col gap-2">
                  <select className={classeInput} value={lojaSelecionada} onChange={(e) => {
                    const nova = e.target.value; setLojaSelecionada(nova);
                    atualizarCampo("loja", nova === LOJA_OUTROS ? lojaPersonalizada : nova);
                  }}>
                    {LOJAS.map((loja) => <option key={loja} value={loja}>{loja}</option>)}
                  </select>
                  {lojaSelecionada === LOJA_OUTROS && <input className={classeInput} value={lojaPersonalizada} onChange={(e) => { setLojaPersonalizada(e.target.value); atualizarCampo("loja", e.target.value); }} placeholder="Digite o nome da loja" />}
                </div>
              </Campo>
              <Campo rotulo="Categoria" obrigatorio erro={erros.categoria}>
                <div className="flex flex-col gap-2">
                  <select className={classeInput} value={categoriaSelecionada} onChange={(e) => {
                    const nova = e.target.value; setCategoriaSelecionada(nova);
                    atualizarCampo("categoria", nova === CATEGORIA_OUTROS ? categoriaPersonalizada : nova);
                  }}>
                    {CATEGORIAS_DISPONIVEIS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {categoriaSelecionada === CATEGORIA_OUTROS && <input className={classeInput} value={categoriaPersonalizada} onChange={(e) => { setCategoriaPersonalizada(e.target.value); atualizarCampo("categoria", e.target.value); }} placeholder="Digite a categoria" />}
                </div>
              </Campo>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Marca"><input className={`${classeInput} uppercase`} value={valores.marca} onChange={(e) => atualizarCampo("marca", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Modelo"><input className={`${classeInput} uppercase`} value={valores.modelo} onChange={(e) => atualizarCampo("modelo", paraCaixaAlta(e.target.value))} /></Campo>
            </div>
          </div>
        </section>

        <section id="etapa-preco" className={`${classeCard} scroll-mt-28`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Preço e pagamento</h2>
              <p className="text-sm text-ink/55">Priorize o preço no Pix e informe parcelamento apenas quando existir.</p>
            </div>
            <span className="rounded-full bg-discount/25 px-3 py-1 text-xs font-semibold text-ink">Etapa 3</span>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Preço antigo (R$)">
                <input
                  type="number"
                  step="0.01"
                  className={classeInput}
                  value={valores.precoAntigo ?? ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "precoAntigo",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </Campo>

              <Campo rotulo="Preço no Pix (R$)">
                <input
                  type="number"
                  step="0.01"
                  className={`${classeInput} border-trust/40 bg-trust/5 font-semibold`}
                  value={valores.precoPix ?? ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "precoPix",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Preço preferencial à vista"
                />
              </Campo>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-cream p-4">
              <p className="text-sm font-semibold text-ink">O site oferece parcelamento?</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                    valores.ofereceParcelamento
                      ? "border-trust bg-trust/5 text-trust ring-2 ring-trust/10"
                      : "border-ink/10 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="oferece-parcelamento"
                    checked={Boolean(valores.ofereceParcelamento)}
                    onChange={() => atualizarOfereceParcelamento(true)}
                  />
                  Sim
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                    !valores.ofereceParcelamento
                      ? "border-brand bg-brand/5 text-brand ring-2 ring-brand/10"
                      : "border-ink/10 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="oferece-parcelamento"
                    checked={!valores.ofereceParcelamento}
                    onChange={() => atualizarOfereceParcelamento(false)}
                  />
                  Não
                </label>
              </div>
            </div>

            {valores.ofereceParcelamento && (
              <div className="rounded-2xl border border-brand/10 bg-brand/5 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Campo rotulo="Quantidade de parcelas">
                    <input
                      type="number"
                      min="1"
                      className={classeInput}
                      value={valores.parcelas ?? ""}
                      onChange={(e) =>
                        atualizarParcelamento(
                          "parcelas",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </Campo>
                  <Campo rotulo="Valor de cada parcela (R$)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={classeInput}
                      value={valores.valorParcela ?? ""}
                      onChange={(e) =>
                        atualizarParcelamento(
                          "valorParcela",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </Campo>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-ink">O parcelamento tem juros?</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                        !valores.parcelamentoSemJuros
                          ? "border-brand bg-white text-brand ring-2 ring-brand/10"
                          : "border-ink/10 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="juros"
                        checked={!valores.parcelamentoSemJuros}
                        onChange={() => atualizarCampo("parcelamentoSemJuros", false)}
                      />
                      Com juros
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                        valores.parcelamentoSemJuros
                          ? "border-trust bg-white text-trust ring-2 ring-trust/10"
                          : "border-ink/10 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="juros"
                        checked={Boolean(valores.parcelamentoSemJuros)}
                        onChange={() => atualizarCampo("parcelamentoSemJuros", true)}
                      />
                      Sem juros
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <Campo rotulo="Preço atual / total parcelado (R$)">
                    <input
                      type="number"
                      step="0.01"
                      className={`${classeInput} bg-white font-semibold`}
                      value={valores.precoAtual ?? ""}
                      readOnly
                      placeholder="Calculado automaticamente pelas parcelas"
                    />
                    <p className="mt-1 text-xs text-ink/50">
                      Calculado automaticamente: quantidade de parcelas × valor da parcela.
                    </p>
                  </Campo>
                </div>
              </div>
            )}

            {!valores.ofereceParcelamento && (
              <Campo rotulo="Preço atual (R$)">
                <input
                  type="number"
                  step="0.01"
                  className={classeInput}
                  value={valores.precoAtual ?? ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "precoAtual",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Opcional, use se houver preço diferente do Pix"
                />
              </Campo>
            )}
          </div>
        </section>

        <section id="etapa-promocao" className={`${classeCard} scroll-mt-28`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-bold text-ink">Promoção</h2><p className="text-sm text-ink/55">Cupom, frete, estoque e validade.</p></div>
            <span className="rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">Etapa 4</span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Cupom"><input className={`${classeInput} uppercase`} value={valores.cupom} onChange={(e) => atualizarCampo("cupom", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Link do cupom"><input type="url" className={classeInput} value={valores.linkCupom} onChange={(e) => atualizarCampo("linkCupom", e.target.value)} /></Campo>
            </div>
            <Campo rotulo="Descrição do cupom"><textarea className={`${classeInput} uppercase`} rows={2} value={valores.cupomDescricao} onChange={(e) => atualizarCampo("cupomDescricao", paraCaixaAlta(e.target.value))} /></Campo>
            <div className="rounded-2xl bg-cream p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-ink"><input type="checkbox" checked={valores.freteGratis} onChange={(e) => atualizarCampo("freteGratis", e.target.checked)} />Frete grátis</label>
              <div className="mt-3"><Campo rotulo="Condição do frete"><input className={`${classeInput} uppercase`} value={valores.freteCondicao ?? ""} onChange={(e) => atualizarCampo("freteCondicao", paraCaixaAlta(e.target.value))} /></Campo></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Estoque"><input className={`${classeInput} uppercase`} value={valores.estoque} onChange={(e) => atualizarCampo("estoque", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Validade da promoção"><input type="date" className={classeInput} value={valores.validadePromocao} onChange={(e) => atualizarCampo("validadePromocao", e.target.value)} /><p className="mt-1 text-xs text-ink/50">Depois dessa data, a oferta fica visualmente esgotada automaticamente.</p></Campo>
            </div>
          </div>
        </section>

        <section id="etapa-detalhes" className={`${classeCard} scroll-mt-28`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-bold text-ink">Detalhes e imagem</h2><p className="text-sm text-ink/55">Só revise o que for relevante para o produto.</p></div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">Etapa 5</span>
          </div>
          <details className="rounded-2xl border border-ink/10 bg-cream/70 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-ink">Características opcionais</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Campo rotulo="Voltagem"><input className={`${classeInput} uppercase`} value={valores.voltagem} onChange={(e) => atualizarCampo("voltagem", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Cor"><input className={`${classeInput} uppercase`} value={valores.cor} onChange={(e) => atualizarCampo("cor", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Tamanho"><input className={`${classeInput} uppercase`} value={valores.tamanho} onChange={(e) => atualizarCampo("tamanho", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Capacidade"><input className={`${classeInput} uppercase`} value={valores.capacidade} onChange={(e) => atualizarCampo("capacidade", paraCaixaAlta(e.target.value))} /></Campo>
            </div>
          </details>
          <div className="mt-4 rounded-2xl border border-dashed border-brand/20 bg-brand/5 p-4">
            <Campo rotulo="Imagem principal"><input type="file" accept="image/*" onChange={aoEscolherImagem} /></Campo>
            {enviandoImagem && <p className="mt-2 text-xs text-ink/50">Enviando imagem...</p>}
            {erroImagem && <p className="mt-2 text-xs text-accent-dark">{erroImagem}</p>}
            {previewImagem && <img src={previewImagem} alt="Prévia" className="mt-3 h-36 w-36 rounded-2xl object-cover ring-1 ring-ink/10" />}
          </div>
        </section>

        <section id="etapa-publicacao" className={`${classeCard} scroll-mt-28 xl:col-span-2`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-bold text-ink">Publicação</h2><p className="text-sm text-ink/55">Link, status e controles finais.</p></div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">Etapa 6</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Campo rotulo="Link do produto" obrigatorio erro={erros.linkProduto}><input className={classeInput} value={valores.linkProduto} onChange={(e) => atualizarCampo("linkProduto", e.target.value)} /></Campo>
              <button type="button" onClick={() => buscarImagemAutomaticamente()} disabled={buscandoImagemAuto} className="admin-btn-modern w-fit rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{buscandoImagemAuto ? "Buscando imagem..." : "🔍 Buscar foto automaticamente"}</button>
              {statusImagemAuto && <p className="text-xs text-ink/60">{statusImagemAuto}</p>}
              {valores.linkProduto && !linkParecePertencerALoja(valores.linkProduto, valores.loja) && <p className="rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent-dark">⚠️ Confira se o link pertence à loja selecionada.</p>}

            </div>
            <div className="flex flex-col gap-4">
              <Campo rotulo="Observações internas"><textarea className={`${classeInput} uppercase`} rows={3} value={valores.observacoes} onChange={(e) => atualizarCampo("observacoes", paraCaixaAlta(e.target.value))} /></Campo>
              <div className="grid gap-4 md:grid-cols-2">
                <Campo rotulo="Status da publicação" obrigatorio><select className={classeInput} value={valores.status} onChange={(e) => atualizarCampo("status", e.target.value as StatusOferta)}>{statusOpcoes.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></Campo>
                {valores.status === "agendada" && <Campo rotulo="Agendar para"><input type="datetime-local" className={classeInput} value={valores.agendadoPara} onChange={(e) => atualizarCampo("agendadoPara", e.target.value)} /></Campo>}
              </div>
            </div>
          </div>
        </section>
      </div>

      {erroSalvar && <p className="text-center text-sm text-accent-dark">{erroSalvar}</p>}
      <button type="submit" disabled={salvando} className="admin-btn-modern rounded-[18px] bg-accent px-6 py-3 text-center font-semibold text-white shadow-sm disabled:opacity-60">{salvando ? "Salvando..." : ofertaExistente ? "Salvar alterações" : "Salvar oferta"}</button>
    </form>
  );
}
