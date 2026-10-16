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
import { formatarDataPublicacao } from "@/lib/datas";

const STATUS_OPCOES_BASE: StatusOferta[] = ["rascunho", "agendada", "publicada", "expirada", "arquivada"];
const CATEGORIAS_DISPONIVEIS = CATEGORIAS_ADMIN;
// Ordena só a lista visual do cadastro, sem mudar a loja padrão de registros novos.
const LOJAS_PARA_SELECAO = [
  ...LOJAS.filter((loja) => loja !== LOJA_OUTROS).sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  ),
  LOJA_OUTROS,
];

function imagemTemUrlValida(url: string): boolean {
  try {
    const analisada = new URL(url.trim());
    return analisada.protocol === "https:" || analisada.protocol === "http:";
  } catch {
    return false;
  }
}

const classeCard = "rounded-[22px] border border-brand/10 bg-white p-5 shadow-sm";
const paraCaixaAlta = (valor: string) => valor.toLocaleUpperCase("pt-BR");

function datetimeLocalBrasilia(data: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);
  const get = (tipo: string) => partes.find((item) => item.type === tipo)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function agoraMais24h() {
  return datetimeLocalBrasilia(new Date(Date.now() + 24 * 60 * 60 * 1000));
}

const VALORES_INICIAIS: OfertaFormValues = {
  titulo: "",
  loja: LOJAS[0],
  categoria: "",
  marca: "",
  modelo: "",
  precoAntigo: undefined,
  precoAtual: undefined,
  precoPix: undefined,
  precoObservacao: "",
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
  ofertaBlack: false,
  destaqueImperdivel: false,
  destaqueAte: "",
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
    precoObservacao: paraCaixaAlta(valores.precoObservacao || ""),
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

  const categoriaExistente = ofertaExistente?.categoria ?? "";
  const categoriaExistenteNaLista = CATEGORIAS_DISPONIVEIS.includes(categoriaExistente);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(
    categoriaExistenteNaLista ? categoriaExistente : ofertaExistente ? CATEGORIA_OUTROS : ""
  );
  const [categoriaPersonalizada, setCategoriaPersonalizada] = useState(
    ofertaExistente && !categoriaExistenteNaLista ? categoriaExistente : ""
  );
  const [camposParaRevisar, setCamposParaRevisar] = useState<Array<"categoria" | "marca" | "modelo">>([]);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");
  const [previewImagem, setPreviewImagem] = useState<string | undefined>(ofertaExistente?.imagemPrincipal);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [erroPreviewImagem, setErroPreviewImagem] = useState(false);
  const [buscandoImagemAuto, setBuscandoImagemAuto] = useState(false);
  const [statusImagemAuto, setStatusImagemAuto] = useState("");
  const [resultadoLeitura, setResultadoLeitura] = useState("");
  const [colandoAreaTransferencia, setColandoAreaTransferencia] = useState(false);
  const ofertaExistenteExpirada = ofertaExistente ? ofertaEstaExpirada(ofertaExistente) : false;

  function atualizarCampo<K extends keyof OfertaFormValues>(campo: K, valor: OfertaFormValues[K]) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  function atualizarLinkImagemManual(link: string) {
    // O link da foto é salvo no mesmo campo já usado por upload e busca automática.
    const endereco = link.trim();
    atualizarCampo("imagemPrincipal", endereco);
    setErroImagem("");
    setErroPreviewImagem(false);
    // Não tenta exibir URLs incompletas enquanto o usuário digita.
    setPreviewImagem(
      imagemTemUrlValida(endereco) || endereco.startsWith("/") ? endereco : undefined
    );
  }

  function marcarCampoConferido(campo: "categoria" | "marca" | "modelo") {
    setCamposParaRevisar((atuais) => atuais.filter((item) => item !== campo));
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

  function selecionarBeneficioFrete(beneficio: "MELI+" | "AMAZON PRIME") {
    setValores((atual) => ({
      ...atual,
      freteGratis: true,
      freteCondicao: beneficio,
    }));
  }

  function limparBeneficioFrete() {
    setValores((atual) => {
      const condicaoAtual = paraCaixaAlta((atual.freteCondicao || "").trim());
      const veioDeBeneficio = condicaoAtual === "MELI+" || condicaoAtual === "AMAZON PRIME";
      return {
        ...atual,
        freteCondicao: veioDeBeneficio ? "" : atual.freteCondicao,
      };
    });
  }

  function atualizarFreteGratis(ativo: boolean) {
    setValores((atual) => {
      const condicaoAtual = paraCaixaAlta((atual.freteCondicao || "").trim());
      const veioDeBeneficio = condicaoAtual === "MELI+" || condicaoAtual === "AMAZON PRIME";
      return {
        ...atual,
        freteGratis: ativo,
        ...(!ativo && veioDeBeneficio ? { freteCondicao: "" } : {}),
      };
    });
  }

  function atualizarDestaqueImperdivel(ativo: boolean) {
    setValores((atual) => ({
      ...atual,
      destaqueImperdivel: ativo,
      destaqueAte: ativo ? atual.destaqueAte || agoraMais24h() : "",
    }));
    setErros((atuais) => {
      const proximo = { ...atuais };
      delete proximo.destaqueAte;
      return proximo;
    });
  }

  function reconhecerTextoRecebido(textoBruto: string) {
    const texto = textoBruto.trim();
    if (!texto) {
      setResultadoLeitura("Cole primeiro o texto da oferta.");
      return;
    }

    const resultado = interpretarTextoOferta(texto);
    const naoReconhecidos = (["categoria", "marca", "modelo"] as const).filter(
      (campo) => !String(resultado.valores[campo] ?? "").trim()
    );
    setCamposParaRevisar(naoReconhecidos);

    setValores((atual) => ({
      ...atual,
      ...(!ofertaExistente
        ? {
            categoria: resultado.valores.categoria ?? "",
            marca: resultado.valores.marca ?? "",
            modelo: resultado.valores.modelo ?? "",
          }
        : {}),
      ...resultado.valores,
      textoPublicacao: texto,
    }));

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
    } else if (!ofertaExistente) {
      // Não deixa uma categoria padrão silenciosa quando a leitura falha.
      // O usuário precisa escolher uma opção antes de conseguir publicar.
      setCategoriaSelecionada("");
      setCategoriaPersonalizada("");
    }

    if (resultado.valores.linkProduto && !valores.imagemPrincipal) {
      void buscarImagemAutomaticamente(resultado.valores.linkProduto);
    }

    const avisoRevisao = naoReconhecidos.length
      ? ` Atenção: não reconheci ${naoReconhecidos.join(", ")}; confira esses campos antes de publicar.`
      : "";
    setResultadoLeitura(
      resultado.camposDetectados.length
        ? `Preenchido automaticamente: ${resultado.camposDetectados.join(", ")}.${avisoRevisao}`
        : `Não consegui identificar os dados principais. O texto foi mantido e você pode preencher os campos manualmente.${avisoRevisao}`
    );
  }

  function reconhecerTexto() {
    reconhecerTextoRecebido(valores.textoPublicacao ?? "");
  }

  async function colarDaAreaTransferencia() {
    if (!navigator.clipboard?.readText) {
      setResultadoLeitura(
        "Seu navegador não permitiu a leitura automática da área de transferência. Cole o texto manualmente na caixa abaixo."
      );
      return;
    }

    setColandoAreaTransferencia(true);
    setResultadoLeitura("");
    try {
      const textoCopiado = await navigator.clipboard.readText();
      if (!textoCopiado.trim()) {
        setResultadoLeitura("A área de transferência está vazia.");
        return;
      }
      reconhecerTextoRecebido(textoCopiado);
    } catch (erro) {
      console.error(erro);
      setResultadoLeitura(
        "Não consegui acessar a área de transferência. Autorize a permissão do navegador ou cole o texto manualmente."
      );
    } finally {
      setColandoAreaTransferencia(false);
    }
  }

  function limparTextoColado() {
    atualizarCampo("textoPublicacao", "");
    setResultadoLeitura("");
    setCamposParaRevisar([]);
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
    if (valores.imagemPrincipal?.trim() &&
        !imagemTemUrlValida(valores.imagemPrincipal) &&
        !valores.imagemPrincipal.startsWith("/")) {
      novosErros.imagemPrincipal = "Cole o link completo da imagem (http:// ou https://).";
    }
    if (valores.destaqueImperdivel) {
      if (!valores.destaqueAte) {
        novosErros.destaqueAte = "Informe até quando a promoção ficará em destaque.";
      } else {
        const validade = new Date(`${valores.destaqueAte}:00-03:00`).getTime();
        const agora = Date.now();
        if (!Number.isFinite(validade) || validade <= agora) {
          novosErros.destaqueAte = "Escolha uma data e hora futuras.";
        } else if (validade > agora + 24 * 60 * 60 * 1000 + 2 * 60 * 1000) {
          novosErros.destaqueAte = "O destaque pode durar no máximo 24 horas.";
        }
      }
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
        setErroPreviewImagem(false);
        setStatusImagemAuto(
          dados.origem === "externa"
            ? `✅ Imagem encontrada pelo preview do link. ${dados.aviso || "Usando a imagem original da loja."}`
            : "✅ Imagem encontrada, copiada para o Storage e adicionada!"
        );
      } else {
        setStatusImagemAuto(`${dados.erro || "Não encontramos a imagem automaticamente."} Cole o link direto da imagem na Etapa 5 ou envie um arquivo.`);
      }
    } catch (erro) {
      console.error(erro);
      setStatusImagemAuto("Não foi possível buscar a imagem automaticamente. Cole o link direto da imagem na Etapa 5 ou envie um arquivo.");
    } finally {
      setBuscandoImagemAuto(false);
    }
  }

  async function aoEscolherImagem(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setPreviewImagem(URL.createObjectURL(arquivo));
    setErroPreviewImagem(false);
    setEnviandoImagem(true);
    setErroImagem("");
    try {
      const nomeArquivo = `${crypto.randomUUID()}-${arquivo.name}`;
      const { error } = await supabase.storage.from("ofertas").upload(nomeArquivo, arquivo, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("ofertas").getPublicUrl(nomeArquivo);
      atualizarCampo("imagemPrincipal", data.publicUrl);
      setPreviewImagem(data.publicUrl);
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
              className="admin-action admin-btn-modern shrink-0 rounded-xl border px-5 py-3 text-sm font-semibold"
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
            <a key={href} href={href} className="admin-action-soft flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D1A13A] text-[11px] font-bold text-ink">{numero}</span>
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

        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="flex min-w-0 flex-col">
            <Campo rotulo="Texto da publicação">
              <div className="mb-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={colarDaAreaTransferencia}
                  disabled={colandoAreaTransferencia}
                  className="admin-action rounded-xl border px-4 py-2 text-sm font-bold"
                >
                  {colandoAreaTransferencia ? "COLANDO..." : "COLAR"}
                </button>
                <button
                  type="button"
                  onClick={limparTextoColado}
                  className="admin-action-soft rounded-xl border px-4 py-2 text-sm font-bold"
                >
                  LIMPAR
                </button>
                <button
                  type="button"
                  onClick={reconhecerTexto}
                  className="admin-action-soft rounded-xl border px-4 py-2 text-sm font-bold"
                >
                  ✨ REPROCESSAR
                </button>
              </div>
              <textarea
                className={`${classeInput} min-h-[300px] flex-1 resize-y`}
                rows={12}
                value={valores.textoPublicacao}
                onChange={(e) => atualizarCampo("textoPublicacao", e.target.value)}
                onPaste={(e) => {
                  const texto = e.clipboardData.getData("text");
                  if (!texto.trim()) return;
                  e.preventDefault();
                  reconhecerTextoRecebido(texto);
                }}
                placeholder="Cole aqui a oferta completa..."
              />
            </Campo>
          </div>

          <div className="flex min-h-[360px] min-w-0 flex-col rounded-2xl border border-ink/10 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Prévia do texto</p>
              <span className="rounded-full bg-brand/5 px-2.5 py-1 text-[10px] font-semibold text-brand">AO LADO PARA GANHAR TEMPO</span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              {valores.textoPublicacao ? (
                <PreviaWhatsApp texto={valores.textoPublicacao} />
              ) : (
                <div className="flex h-full min-h-[260px] items-center justify-center rounded-xl border border-dashed border-ink/10 bg-cream/35 px-5 text-center text-sm text-ink/45">
                  Cole uma promoção à esquerda. A prévia aparece aqui sem ocupar outra linha da tela.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink/50">Ao usar COLAR, o reconhecimento já roda automaticamente. REPROCESSAR serve para textos editados manualmente.</p>
          {resultadoLeitura && (
            <p className="rounded-xl bg-trust/10 px-3 py-2 text-xs text-ink/75 sm:max-w-[60%]">{resultadoLeitura}</p>
          )}
        </div>
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
            {camposParaRevisar.length > 0 && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <strong>⚠️ Confira antes de publicar:</strong> não consegui reconhecer automaticamente {camposParaRevisar.join(", ")}.
                Os campos não reconhecidos ficam vazios para evitar cadastro incorreto.
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Loja" obrigatorio erro={erros.loja}>
                <div className="flex flex-col gap-2">
                  <select className={classeInput} value={lojaSelecionada} onChange={(e) => {
                    const nova = e.target.value; setLojaSelecionada(nova);
                    atualizarCampo("loja", nova === LOJA_OUTROS ? lojaPersonalizada : nova);
                  }}>
                    {LOJAS_PARA_SELECAO.map((loja) => <option key={loja} value={loja}>{loja}</option>)}
                  </select>
                  {lojaSelecionada === LOJA_OUTROS && <input className={classeInput} value={lojaPersonalizada} onChange={(e) => { setLojaPersonalizada(e.target.value); atualizarCampo("loja", e.target.value); }} placeholder="Digite o nome da loja" />}
                </div>
              </Campo>
              <Campo rotulo="Categoria" obrigatorio erro={erros.categoria}>
                <div className="flex flex-col gap-2">
                  <select
                    className={`${classeInput} ${
                      camposParaRevisar.includes("categoria") ? "border-amber-300 bg-amber-50/50" : ""
                    }`}
                    value={categoriaSelecionada}
                    onChange={(e) => {
                      const categoria = e.target.value;
                      setCategoriaSelecionada(categoria);
                      atualizarCampo(
                        "categoria",
                        categoria === CATEGORIA_OUTROS ? categoriaPersonalizada : categoria
                      );
                      if (categoria) marcarCampoConferido("categoria");
                    }}
                    aria-label="Categoria da oferta"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {CATEGORIAS_DISPONIVEIS.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                  {!categoriaSelecionada && (
                    <p className="text-xs font-medium text-amber-700">
                      Selecione uma categoria antes de publicar.
                    </p>
                  )}
                  {categoriaSelecionada === CATEGORIA_OUTROS && (
                    <input
                      className={classeInput}
                      value={categoriaPersonalizada}
                      onChange={(e) => {
                        setCategoriaPersonalizada(e.target.value);
                        atualizarCampo("categoria", e.target.value);
                        if (e.target.value.trim()) marcarCampoConferido("categoria");
                      }}
                      placeholder="Digite a categoria"
                    />
                  )}
                </div>
              </Campo>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Marca">
                <div className="flex flex-col gap-1.5">
                  <input
                    className={`${classeInput} uppercase ${camposParaRevisar.includes("marca") ? "border-amber-300 bg-amber-50/50" : ""}`}
                    value={valores.marca}
                    onChange={(e) => {
                      atualizarCampo("marca", paraCaixaAlta(e.target.value));
                      if (e.target.value.trim()) marcarCampoConferido("marca");
                    }}
                    placeholder="Ex.: SAMSUNG, MONDIAL, ADIDAS"
                  />
                  {camposParaRevisar.includes("marca") && <p className="text-xs font-medium text-amber-700">Marca não identificada automaticamente.</p>}
                </div>
              </Campo>
              <Campo rotulo="Modelo">
                <div className="flex flex-col gap-1.5">
                  <input
                    className={`${classeInput} uppercase ${camposParaRevisar.includes("modelo") ? "border-amber-300 bg-amber-50/50" : ""}`}
                    value={valores.modelo}
                    onChange={(e) => {
                      atualizarCampo("modelo", paraCaixaAlta(e.target.value));
                      if (e.target.value.trim()) marcarCampoConferido("modelo");
                    }}
                    placeholder="Ex.: GALAXY A55 5G, AFN-50"
                  />
                  {camposParaRevisar.includes("modelo") && <p className="text-xs font-medium text-amber-700">Modelo não identificado automaticamente.</p>}
                </div>
              </Campo>
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

            <Campo rotulo="Observação do preço">
              <input
                className={`${classeInput} uppercase`}
                value={valores.precoObservacao ?? ""}
                onChange={(e) => atualizarCampo("precoObservacao", paraCaixaAlta(e.target.value))}
                placeholder="Ex.: SOMENTE PARA MEMBROS, À VISTA NO BOLETO, COM CARTÃO DA LOJA..."
              />
              <p className="mt-1 text-xs text-ink/50">Opcional. Use para uma condição de preço que não cabe nos campos acima.</p>
            </Campo>
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
            <div className="rounded-2xl bg-cream p-3 sm:p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={valores.freteGratis}
                  onChange={(e) => atualizarFreteGratis(e.target.checked)}
                />
                Frete grátis
              </label>

              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">Benefício de frete grátis</p>
                    <p className="mt-0.5 text-xs text-ink/50">Opcional. Escolha somente se a oferta exigir um destes benefícios.</p>
                  </div>
                  {(paraCaixaAlta((valores.freteCondicao || "").trim()) === "MELI+" ||
                    paraCaixaAlta((valores.freteCondicao || "").trim()) === "AMAZON PRIME") && (
                    <button
                      type="button"
                      onClick={limparBeneficioFrete}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-brand transition hover:bg-brand/5"
                    >
                      Limpar seleção
                    </button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm font-semibold text-ink transition hover:border-brand/25 hover:bg-brand/[0.025]">
                    <input
                      type="radio"
                      name="beneficioFreteGratis"
                      value="MELI+"
                      checked={paraCaixaAlta((valores.freteCondicao || "").trim()) === "MELI+"}
                      onChange={() => selecionarBeneficioFrete("MELI+")}
                    />
                    <span className="min-w-0 break-words">MELI+</span>
                  </label>

                  <label className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-white px-3 py-3 text-sm font-semibold text-ink transition hover:border-brand/25 hover:bg-brand/[0.025]">
                    <input
                      type="radio"
                      name="beneficioFreteGratis"
                      value="AMAZON PRIME"
                      checked={paraCaixaAlta((valores.freteCondicao || "").trim()) === "AMAZON PRIME"}
                      onChange={() => selecionarBeneficioFrete("AMAZON PRIME")}
                    />
                    <span className="min-w-0 break-words">AMAZON PRIME</span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <Campo rotulo="Detalhes do frete grátis">
                  <input
                    className={`${classeInput} uppercase`}
                    value={valores.freteCondicao ?? ""}
                    onChange={(e) => atualizarCampo("freteCondicao", paraCaixaAlta(e.target.value))}
                    placeholder="Ex.: acima de R$ 79, MELI+ ou AMAZON PRIME"
                  />
                </Campo>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Campo rotulo="Estoque"><input className={`${classeInput} uppercase`} value={valores.estoque} onChange={(e) => atualizarCampo("estoque", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Validade da promoção"><input type="date" className={classeInput} value={valores.validadePromocao} onChange={(e) => atualizarCampo("validadePromocao", e.target.value)} /><p className="mt-1 text-xs text-ink/50">Depois dessa data, a oferta fica visualmente esgotada automaticamente.</p></Campo>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white px-4 py-3 transition hover:border-ink/20">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Oferta Black Friday</p>
                <p className="mt-0.5 text-xs leading-5 text-ink/50">
                  Opcional. Quando ativo, exibe a faixa preta <strong>OFERTA BLACK</strong> na página pública do produto.
                </p>
              </div>
              <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={Boolean(valores.ofertaBlack)}
                  onChange={(e) => atualizarCampo("ofertaBlack", e.target.checked)}
                />
                <span className="absolute inset-0 rounded-full bg-ink/15 transition-colors peer-checked:bg-black" />
                <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </span>
            </label>

            <div className="rounded-2xl border border-gold/25 bg-[#fff9ea] p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">🔥 Promoção imperdível na Home</p>
                  <p className="mt-0.5 text-xs leading-5 text-ink/55">
                    Coloca esta oferta no quadro principal da Home. Ao ativar outro produto, o destaque anterior sai automaticamente.
                  </p>
                </div>
                <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={Boolean(valores.destaqueImperdivel)}
                    onChange={(e) => atualizarDestaqueImperdivel(e.target.checked)}
                  />
                  <span className="absolute inset-0 rounded-full bg-ink/15 transition-colors peer-checked:bg-[#d9a62e]" />
                  <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </span>
              </label>

              {valores.destaqueImperdivel && (
                <div className="mt-4">
                  <Campo rotulo="Destaque válido até" erro={erros.destaqueAte}>
                    <input
                      type="datetime-local"
                      className={classeInput}
                      value={valores.destaqueAte ?? ""}
                      min={datetimeLocalBrasilia(new Date())}
                      max={agoraMais24h()}
                      onChange={(e) => atualizarCampo("destaqueAte", e.target.value)}
                    />
                    <p className="mt-1 text-xs text-ink/50">Máximo de 24 horas. Ao ativar, o painel sugere automaticamente 24h a partir de agora.</p>
                  </Campo>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="etapa-detalhes" className={`${classeCard} scroll-mt-28`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-bold text-ink">Detalhes e imagem</h2><p className="text-sm text-ink/55">Só revise o que for relevante para o produto.</p></div>
            <span className="rounded-full bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">Etapa 5</span>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-cream/70 p-4">
            <p className="text-sm font-semibold text-ink">Características opcionais</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Campo rotulo="Voltagem"><input className={`${classeInput} uppercase`} value={valores.voltagem} onChange={(e) => atualizarCampo("voltagem", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Cor"><input className={`${classeInput} uppercase`} value={valores.cor} onChange={(e) => atualizarCampo("cor", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Tamanho"><input className={`${classeInput} uppercase`} value={valores.tamanho} onChange={(e) => atualizarCampo("tamanho", paraCaixaAlta(e.target.value))} /></Campo>
              <Campo rotulo="Capacidade"><input className={`${classeInput} uppercase`} value={valores.capacidade} onChange={(e) => atualizarCampo("capacidade", paraCaixaAlta(e.target.value))} /></Campo>
            </div>
          </div>
          <div className="mt-4 space-y-4 rounded-2xl border border-dashed border-brand/20 bg-brand/5 p-4">
            <div>
              <Campo rotulo="Link direto da imagem (opcional)" erro={erros.imagemPrincipal}>
                <input
                  type="url"
                  className={classeInput}
                  value={valores.imagemPrincipal ?? ""}
                  placeholder="https://exemplo.com/imagens/produto.jpg"
                  onChange={(e) => atualizarLinkImagemManual(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </Campo>
              <p className="mt-1.5 text-xs text-ink/60">
                Se o link da oferta (ex.: tidd.ly) não fornecer a foto, cole aqui o endereço
                direto da imagem. A prévia aparece abaixo e o link é salvo como foto principal.
              </p>
            </div>
            <div className="border-t border-brand/10 pt-3">
              <Campo rotulo="Ou enviar arquivo do computador">
                <input type="file" accept="image/*" onChange={aoEscolherImagem} />
              </Campo>
            </div>
            {enviandoImagem && <p className="text-xs text-ink/60">Enviando imagem para o Supabase...</p>}
            {erroImagem && <p role="alert" className="text-xs text-accent-dark">{erroImagem}</p>}
            {erroPreviewImagem && (
              <p role="alert" className="text-xs text-accent-dark">
                A imagem não carregou. Confira se é um link público e direto da foto
                (não o link da página da loja) ou envie um arquivo do computador.
              </p>
            )}
            {previewImagem && (
              <img
                src={previewImagem}
                alt="Prévia da imagem principal do produto"
                className="h-36 w-36 rounded-2xl bg-white object-contain ring-1 ring-ink/10"
                onLoad={() => setErroPreviewImagem(false)}
                onError={() => setErroPreviewImagem(true)}
              />
            )}
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
              <button type="button" onClick={() => buscarImagemAutomaticamente()} disabled={buscandoImagemAuto} className="admin-action admin-btn-modern w-fit rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-60">{buscandoImagemAuto ? "Buscando imagem..." : "🔍 Buscar foto automaticamente"}</button>
              {statusImagemAuto && <p className="text-xs text-ink/60">{statusImagemAuto}</p>}
              {valores.linkProduto && !linkParecePertencerALoja(valores.linkProduto, valores.loja) && <p className="rounded-xl bg-accent/10 px-3 py-2 text-xs text-accent-dark">⚠️ Confira se o link pertence à loja selecionada.</p>}

            </div>
            <div className="flex flex-col gap-4">
              <Campo rotulo="Observações internas"><textarea className={`${classeInput} uppercase`} rows={3} value={valores.observacoes} onChange={(e) => atualizarCampo("observacoes", paraCaixaAlta(e.target.value))} /></Campo>
              <div className="grid gap-4 md:grid-cols-2">
                <Campo rotulo="Status da publicação" obrigatorio><select className={classeInput} value={valores.status} onChange={(e) => atualizarCampo("status", e.target.value as StatusOferta)}>{statusOpcoes.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></Campo>
                {valores.status === "agendada" && <Campo rotulo="Agendar para"><input type="datetime-local" className={classeInput} value={valores.agendadoPara} onChange={(e) => atualizarCampo("agendadoPara", e.target.value)} /></Campo>}
              </div>
              {ofertaExistente?.publicadoEm && (
                <div className="rounded-xl border border-ink/10 bg-cream px-3 py-2 text-xs text-ink/55">
                  Carimbo de postagem: <strong>{formatarDataPublicacao(ofertaExistente.publicadoEm)}</strong> · fixo e não editável.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {erroSalvar && <p className="text-center text-sm text-accent-dark">{erroSalvar}</p>}
      <button type="submit" disabled={salvando} className="admin-action admin-btn-modern rounded-[18px] border px-6 py-3 text-center font-semibold shadow-sm disabled:opacity-60">{salvando ? "Salvando..." : ofertaExistente ? "Salvar alterações" : "Salvar oferta"}</button>
    </form>
  );
}
