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
import { salvarNovaOferta, atualizarOferta } from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { linkParecePertencerALoja } from "@/lib/validar-link";
import GerarComIA from "./GerarComIA";
import PreviaWhatsApp from "./PreviaWhatsApp";

const STATUS_OPCOES = Object.keys(STATUS_LABEL) as StatusOferta[];
const CATEGORIAS_DISPONIVEIS = CATEGORIAS_ADMIN;

const VALORES_INICIAIS: OfertaFormValues = {
  titulo: "",
  loja: LOJAS[0],
  categoria: CATEGORIAS_DISPONIVEIS[0] ?? "",
  marca: "",
  modelo: "",
  precoAntigo: undefined,
  precoAtual: 0,
  precoPix: undefined,
  parcelas: undefined,
  valorParcela: undefined,
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
  usarLinkRedirecionamento: false,
  textoOriginal: "",
  textoPublicacao: "",
  observacoes: "",
  imagemPrincipal: "",
  status: "rascunho",
  agendadoPara: "",
};

const classeCard = "rounded-[22px] border border-brand/10 bg-white p-5 shadow-sm";

const paraCaixaAlta = (valor: string) => valor.toLocaleUpperCase("pt-BR");

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
    textoOriginal: paraCaixaAlta(valores.textoOriginal || ""),
    observacoes: paraCaixaAlta(valores.observacoes || ""),
    textoPublicacao: paraCaixaAlta(valores.textoPublicacao || ""),
  };
}

export default function OfferForm({
  ofertaExistente,
}: {
  ofertaExistente?: Oferta;
}) {
  const router = useRouter();
  const supabase = criarClienteNavegador();
  const [valores, setValores] = useState<OfertaFormValues>(
    ofertaExistente ?? VALORES_INICIAIS
  );

  const lojaExistente = ofertaExistente?.loja ?? LOJAS[0];
  const lojaExistenteEhAfiliada = LOJAS_AFILIADAS.includes(lojaExistente);
  const [lojaSelecionada, setLojaSelecionada] = useState(
    lojaExistenteEhAfiliada ? lojaExistente : ofertaExistente ? LOJA_OUTROS : LOJAS[0]
  );
  const [lojaPersonalizada, setLojaPersonalizada] = useState(
    ofertaExistente &&
      !lojaExistenteEhAfiliada &&
      lojaExistente !== LOJA_OUTROS
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
  const [previewImagem, setPreviewImagem] = useState<string | undefined>(
    ofertaExistente?.imagemPrincipal
  );
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [buscandoImagemAuto, setBuscandoImagemAuto] = useState(false);
  const [statusImagemAuto, setStatusImagemAuto] = useState("");

  function atualizarCampo<K extends keyof OfertaFormValues>(
    campo: K,
    valor: OfertaFormValues[K]
  ) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarParcelamento(
    campo: "parcelas" | "valorParcela",
    valor: number | undefined
  ) {
    setValores((atual) => {
      const parcelas = campo === "parcelas" ? valor : atual.parcelas;
      const valorParcela = campo === "valorParcela" ? valor : atual.valorParcela;

      const precoAtual =
        parcelas && parcelas > 0 && valorParcela && valorParcela > 0
          ? Math.round(parcelas * valorParcela * 100) / 100
          : atual.precoAtual;

      return {
        ...atual,
        parcelas,
        valorParcela,
        precoAtual,
      };
    });
  }

  function validar(): boolean {
    const novosErros: Record<string, string> = {};
    if (!valores.titulo.trim()) novosErros.titulo = "Informe o nome do produto.";
    if (lojaSelecionada === LOJA_OUTROS && !lojaPersonalizada.trim()) {
      novosErros.loja = "Informe o nome da loja.";
    } else if (!valores.loja) {
      novosErros.loja = "Escolha a loja.";
    }
    if (categoriaSelecionada === CATEGORIA_OUTROS && !categoriaPersonalizada.trim()) {
      novosErros.categoria = "Informe a categoria manualmente.";
    } else if (!valores.categoria) {
      novosErros.categoria = "Escolha a categoria.";
    }
    if (!valores.precoAtual || valores.precoAtual <= 0)
      novosErros.precoAtual = "Informe o preço atual.";
    if (!valores.linkProduto.trim())
      novosErros.linkProduto = "Cole o link do produto.";
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
      } else {
        await salvarNovaOferta(supabase, valoresParaSalvar);
      }
      router.push("/admin/ofertas");
      router.refresh();
    } catch (erro) {
      console.error(erro);
      setErroSalvar(
        "Não foi possível salvar a oferta. Confira sua conexão e tente de novo."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function buscarImagemAutomaticamente() {
    if (!valores.linkProduto.trim()) {
      setStatusImagemAuto("Cole o link do produto antes de buscar a imagem.");
      return;
    }
    setBuscandoImagemAuto(true);
    setStatusImagemAuto("");
    try {
      const resposta = await fetch("/api/buscar-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: valores.linkProduto }),
      });
      const dados = await resposta.json();
      if (dados.imagemUrl) {
        atualizarCampo("imagemPrincipal", dados.imagemUrl);
        setPreviewImagem(dados.imagemUrl);
        setStatusImagemAuto("✅ Imagem encontrada e adicionada!");
      } else {
        setStatusImagemAuto(
          `${dados.erro || "Não encontramos a imagem automaticamente."} Envie manualmente abaixo.`
        );
      }
    } catch (erro) {
      console.error(erro);
      setStatusImagemAuto(
        "Não foi possível buscar a imagem automaticamente. Envie manualmente abaixo."
      );
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
      const { error } = await supabase.storage
        .from("ofertas")
        .upload(nomeArquivo, arquivo, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from("ofertas").getPublicUrl(nomeArquivo);

      atualizarCampo("imagemPrincipal", data.publicUrl);
    } catch (erro) {
      console.error(erro);
      setErroImagem(
        "Não foi possível enviar a imagem. Confira se você rodou o supabase/storage.sql e tente de novo."
      );
    } finally {
      setEnviandoImagem(false);
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
              {ofertaExistente ? "Atualize a oferta" : "Cadastre uma nova oferta"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Tudo foi reorganizado em blocos para ficar mais rápido de preencher no PC,
              sem perder a harmonia no celular.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-3 text-xs text-white/90 sm:w-fit">
            <div className="rounded-xl bg-white/10 px-3 py-2">🧾 Produto e preço</div>
            <div className="rounded-xl bg-white/10 px-3 py-2">🏷️ Promoção e mídia</div>
            <div className="rounded-xl bg-white/10 px-3 py-2">📣 Publicação</div>
            <div className="rounded-xl bg-white/10 px-3 py-2">🤖 IA e prévia</div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Produto</h2>
              <p className="text-sm text-ink/55">Dados principais da oferta e classificação.</p>
            </div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">
              Etapa 1
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <Campo rotulo="Nome do produto" obrigatorio erro={erros.titulo}>
              <input
                className={`${classeInput} uppercase`}
                value={valores.titulo}
                onChange={(e) => atualizarCampo("titulo", paraCaixaAlta(e.target.value))}
                placeholder="Ex: Fritadeira elétrica Air Fryer 5L"
              />
            </Campo>

            <div className="grid gap-4 md:grid-cols-2">
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

              <Campo rotulo="Categoria" obrigatorio erro={erros.categoria}>
                <div className="flex flex-col gap-2">
                  <select
                    className={classeInput}
                    value={categoriaSelecionada}
                    onChange={(e) => {
                      const novaCategoria = e.target.value;
                      setCategoriaSelecionada(novaCategoria);
                      atualizarCampo(
                        "categoria",
                        novaCategoria === CATEGORIA_OUTROS
                          ? categoriaPersonalizada
                          : novaCategoria
                      );
                    }}
                  >
                    {CATEGORIAS_DISPONIVEIS.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>

                  {categoriaSelecionada === CATEGORIA_OUTROS && (
                    <input
                      className={classeInput}
                      value={categoriaPersonalizada}
                      onChange={(e) => {
                        setCategoriaPersonalizada(e.target.value);
                        atualizarCampo("categoria", e.target.value);
                      }}
                      placeholder="Digite a categoria manualmente"
                    />
                  )}
                </div>
              </Campo>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Marca">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.marca}
                  onChange={(e) => atualizarCampo("marca", paraCaixaAlta(e.target.value))}
                />
              </Campo>
              <Campo rotulo="Modelo">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.modelo}
                  onChange={(e) => atualizarCampo("modelo", paraCaixaAlta(e.target.value))}
                />
              </Campo>
            </div>
          </div>
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Preço e pagamento</h2>
              <p className="text-sm text-ink/55">Preencha o valor principal e as condições de pagamento.</p>
            </div>
            <span className="rounded-full bg-discount/25 px-3 py-1 text-xs font-semibold text-ink">
              Etapa 2
            </span>
          </div>

          <div className="flex flex-col gap-4">
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
              <Campo rotulo="Preço atual (R$)" obrigatorio erro={erros.precoAtual}>
                <input
                  type="number"
                  step="0.01"
                  className={classeInput}
                  value={valores.precoAtual || ""}
                  onChange={(e) =>
                    atualizarCampo("precoAtual", Number(e.target.value))
                  }
                />
                <p className="mt-1 text-xs text-ink/50">
                  Se você preencher quantidade de parcelas + valor da parcela, este total é calculado automaticamente.
                </p>
              </Campo>
            </div>

            <Campo rotulo="Preço no Pix (R$)">
              <input
                type="number"
                step="0.01"
                className={classeInput}
                value={valores.precoPix ?? ""}
                onChange={(e) =>
                  atualizarCampo(
                    "precoPix",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </Campo>

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
          </div>
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Promoção</h2>
              <p className="text-sm text-ink/55">Cupom, estoque, frete e validade da oferta.</p>
            </div>
            <span className="rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">
              Etapa 3
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Cupom">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.cupom}
                  onChange={(e) => atualizarCampo("cupom", paraCaixaAlta(e.target.value))}
                  placeholder="Ex: ALE15"
                />
              </Campo>
              <Campo rotulo="Link do cupom">
                <input
                  type="url"
                  className={classeInput}
                  value={valores.linkCupom}
                  onChange={(e) => atualizarCampo("linkCupom", e.target.value)}
                  placeholder="https://..."
                />
              </Campo>
            </div>

            <Campo rotulo="Descrição do cupom">
              <textarea
                className={`${classeInput} uppercase`}
                rows={3}
                value={valores.cupomDescricao}
                onChange={(e) => atualizarCampo("cupomDescricao", paraCaixaAlta(e.target.value))}
                placeholder="Ex: 15% OFF em ferramentas, compra mínima de R$ 99 e limite de R$ 40 de desconto."
              />
              <p className="mt-1 text-xs text-ink/50">
                Essa descrição será exibida na página pública do produto junto com o cupom.
              </p>
            </Campo>

            <div className="rounded-2xl bg-cream p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={valores.freteGratis}
                  onChange={(e) => atualizarCampo("freteGratis", e.target.checked)}
                />
                Frete grátis
              </label>

              <div className="mt-3">
                <Campo rotulo="Condição do frete (opcional)">
                  <input
                    className={`${classeInput} uppercase`}
                    value={valores.freteCondicao ?? ""}
                    onChange={(e) => atualizarCampo("freteCondicao", paraCaixaAlta(e.target.value))}
                    placeholder="Ex: Frete grátis para assinantes Meli+ ou Amazon Prime"
                  />
                  <p className="mt-1 text-xs text-ink/50">
                    Use quando o frete grátis depender de assinatura, valor mínimo, região ou outra regra.
                  </p>
                </Campo>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Estoque">
                <input
                  className={`${classeInput} uppercase`}
                  placeholder="Ex: últimas unidades"
                  value={valores.estoque}
                  onChange={(e) => atualizarCampo("estoque", paraCaixaAlta(e.target.value))}
                />
              </Campo>
              <Campo rotulo="Validade da promoção">
                <input
                  type="date"
                  className={classeInput}
                  value={valores.validadePromocao}
                  onChange={(e) => atualizarCampo("validadePromocao", e.target.value)}
                />
              </Campo>
            </div>
          </div>
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Características e mídia</h2>
              <p className="text-sm text-ink/55">Detalhes técnicos e imagem principal do produto.</p>
            </div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">
              Etapa 4
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Voltagem">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.voltagem}
                  onChange={(e) => atualizarCampo("voltagem", paraCaixaAlta(e.target.value))}
                />
              </Campo>
              <Campo rotulo="Cor">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.cor}
                  onChange={(e) => atualizarCampo("cor", paraCaixaAlta(e.target.value))}
                />
              </Campo>
              <Campo rotulo="Tamanho">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.tamanho}
                  onChange={(e) => atualizarCampo("tamanho", paraCaixaAlta(e.target.value))}
                />
              </Campo>
              <Campo rotulo="Capacidade">
                <input
                  className={`${classeInput} uppercase`}
                  value={valores.capacidade}
                  onChange={(e) => atualizarCampo("capacidade", paraCaixaAlta(e.target.value))}
                />
              </Campo>
            </div>

            <div className="rounded-2xl border border-dashed border-brand/20 bg-brand/5 p-4">
              <Campo rotulo="Imagem principal">
                <input type="file" accept="image/*" onChange={aoEscolherImagem} />
              </Campo>
              {enviandoImagem && (
                <p className="mt-2 text-xs text-ink/50">Enviando imagem...</p>
              )}
              {erroImagem && (
                <p className="mt-2 text-xs text-accent-dark">{erroImagem}</p>
              )}
              {previewImagem && (
                <img
                  src={previewImagem}
                  alt="Pré-visualização da imagem do produto"
                  className="mt-3 h-36 w-36 rounded-2xl object-cover ring-1 ring-ink/10"
                />
              )}
              <p className="mt-3 text-xs text-ink/50">
                A imagem é enviada e guardada assim que você escolhe o arquivo.
              </p>
            </div>
          </div>
        </section>

        <section className={`${classeCard} xl:col-span-2`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Publicação</h2>
              <p className="text-sm text-ink/55">Link do produto, observações, status e agendamento.</p>
            </div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">
              Etapa 5
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Campo rotulo="Link do produto" obrigatorio erro={erros.linkProduto}>
                <input
                  className={classeInput}
                  value={valores.linkProduto}
                  onChange={(e) => atualizarCampo("linkProduto", e.target.value)}
                  placeholder="Cole aqui o link de afiliado"
                />
              </Campo>
              <button
                type="button"
                onClick={buscarImagemAutomaticamente}
                disabled={buscandoImagemAuto}
                className="w-fit rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {buscandoImagemAuto
                  ? "Buscando imagem..."
                  : "🔍 Buscar foto do produto automaticamente"}
              </button>
              {statusImagemAuto && <p className="text-xs text-ink/60">{statusImagemAuto}</p>}
              {valores.linkProduto &&
                !linkParecePertencerALoja(valores.linkProduto, valores.loja) && (
                  <p className="rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent-dark">
                    ⚠️ Esse link não parece ser do domínio oficial de {valores.loja}. Confira antes de publicar.
                  </p>
                )}

              <label className="flex items-start gap-2 rounded-xl bg-cream px-3 py-3 text-sm text-ink">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={valores.usarLinkRedirecionamento}
                  onChange={(e) =>
                    atualizarCampo("usarLinkRedirecionamento", e.target.checked)
                  }
                />
                <span>
                  Usar link de redirecionamento próprio (<code>seudominio.com/r/id-da-oferta</code>)
                  para registrar cliques.
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-4">
              <Campo rotulo="Texto original da oferta">
                <textarea
                  className={`${classeInput} uppercase`}
                  rows={4}
                  value={valores.textoOriginal}
                  onChange={(e) => atualizarCampo("textoOriginal", paraCaixaAlta(e.target.value))}
                  placeholder="Cole aqui o texto ou a descrição recebida do fornecedor"
                />
              </Campo>

              <Campo rotulo="Observações">
                <textarea
                  className={`${classeInput} uppercase`}
                  rows={3}
                  value={valores.observacoes}
                  onChange={(e) => atualizarCampo("observacoes", paraCaixaAlta(e.target.value))}
                />
              </Campo>

              <div className="grid gap-4 md:grid-cols-2">
                <Campo rotulo="Status da publicação" obrigatorio>
                  <select
                    className={classeInput}
                    value={valores.status}
                    onChange={(e) =>
                      atualizarCampo("status", e.target.value as StatusOferta)
                    }
                  >
                    {STATUS_OPCOES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </Campo>

                {valores.status === "agendada" ? (
                  <Campo rotulo="Agendar publicação para">
                    <input
                      type="datetime-local"
                      className={classeInput}
                      value={valores.agendadoPara}
                      onChange={(e) => atualizarCampo("agendadoPara", e.target.value)}
                    />
                    <p className="mt-1 text-xs text-ink/50">Horário de Brasília.</p>
                  </Campo>
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Gerar oferta com IA</h2>
              <p className="text-sm text-ink/55">Use a IA para acelerar o texto de publicação.</p>
            </div>
            <span className="rounded-full bg-trust/10 px-3 py-1 text-xs font-semibold text-trust">
              Etapa 6
            </span>
          </div>
          <GerarComIA
            valores={valores}
            onTextoGerado={(texto) => atualizarCampo("textoPublicacao", paraCaixaAlta(texto))}
          />
        </section>

        <section className={classeCard}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Prévia e edição da publicação</h2>
              <p className="text-sm text-ink/55">Edite o texto final antes de publicar.</p>
            </div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">
              Etapa 7
            </span>
          </div>
          <Campo rotulo="Texto final (edite à vontade antes de publicar)">
            <textarea
              className={`${classeInput} uppercase`}
              rows={10}
              value={valores.textoPublicacao}
              onChange={(e) => atualizarCampo("textoPublicacao", paraCaixaAlta(e.target.value))}
              placeholder='Toque em "Gerar publicação" acima ou escreva manualmente aqui'
            />
          </Campo>
          <div className="mt-4">
            <PreviaWhatsApp texto={valores.textoPublicacao || ""} />
          </div>
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
          : ofertaExistente
          ? "Salvar alterações"
          : "Salvar oferta"}
      </button>
    </form>
  );
}
