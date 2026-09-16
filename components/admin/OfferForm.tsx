"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Campo, classeInput } from "./Campo";
import { CATEGORIAS, LOJAS } from "@/lib/mock-data";
import { Oferta, OfertaFormValues, STATUS_LABEL, StatusOferta } from "@/lib/types";
import { salvarNovaOferta, atualizarOferta } from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { linkParecePertencerALoja } from "@/lib/validar-link";
import GerarComIA from "./GerarComIA";
import PreviaWhatsApp from "./PreviaWhatsApp";

const STATUS_OPCOES = Object.keys(STATUS_LABEL) as StatusOferta[];

const VALORES_INICIAIS: OfertaFormValues = {
  titulo: "",
  loja: LOJAS[0],
  categoria: CATEGORIAS[1] ?? "",
  marca: "",
  modelo: "",
  precoAntigo: undefined,
  precoAtual: 0,
  precoPix: undefined,
  parcelas: undefined,
  valorParcela: undefined,
  cupom: "",
  linkCupom: "",
  freteGratis: false,
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
  const [erros, setErros] = useState<Record<string, string>>({});
  const [previewImagem, setPreviewImagem] = useState<string | undefined>(
    ofertaExistente?.imagemPrincipal
  );
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");

  function atualizarCampo<K extends keyof OfertaFormValues>(
    campo: K,
    valor: OfertaFormValues[K]
  ) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  function validar(): boolean {
    const novosErros: Record<string, string> = {};
    if (!valores.titulo.trim()) novosErros.titulo = "Informe o nome do produto.";
    if (!valores.loja) novosErros.loja = "Escolha a loja.";
    if (!valores.categoria) novosErros.categoria = "Escolha a categoria.";
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
      if (ofertaExistente) {
        await atualizarOferta(supabase, ofertaExistente.id, valores);
      } else {
        await salvarNovaOferta(supabase, valores);
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

  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState("");

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

      const { data } = supabase.storage
        .from("ofertas")
        .getPublicUrl(nomeArquivo);

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
      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Produto
        </h2>
        <div className="flex flex-col gap-3">
          <Campo rotulo="Nome do produto" obrigatorio erro={erros.titulo}>
            <input
              className={classeInput}
              value={valores.titulo}
              onChange={(e) => atualizarCampo("titulo", e.target.value)}
              placeholder="Ex: Fritadeira elétrica Air Fryer 5L"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
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

            <Campo rotulo="Categoria" obrigatorio erro={erros.categoria}>
              <select
                className={classeInput}
                value={valores.categoria}
                onChange={(e) => atualizarCampo("categoria", e.target.value)}
              >
                {CATEGORIAS.filter((c) => c !== "Todos").map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Marca">
              <input
                className={classeInput}
                value={valores.marca}
                onChange={(e) => atualizarCampo("marca", e.target.value)}
              />
            </Campo>
            <Campo rotulo="Modelo">
              <input
                className={classeInput}
                value={valores.modelo}
                onChange={(e) => atualizarCampo("modelo", e.target.value)}
              />
            </Campo>
          </div>
        </div>
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Preço e pagamento
        </h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
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

          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Quantidade de parcelas">
              <input
                type="number"
                className={classeInput}
                value={valores.parcelas ?? ""}
                onChange={(e) =>
                  atualizarCampo(
                    "parcelas",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </Campo>
            <Campo rotulo="Valor de cada parcela (R$)">
              <input
                type="number"
                step="0.01"
                className={classeInput}
                value={valores.valorParcela ?? ""}
                onChange={(e) =>
                  atualizarCampo(
                    "valorParcela",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              />
            </Campo>
          </div>
        </div>
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Promoção
        </h2>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Cupom">
              <input
                className={classeInput}
                value={valores.cupom}
                onChange={(e) => atualizarCampo("cupom", e.target.value)}
              />
            </Campo>
            <Campo rotulo="Link do cupom">
              <input
                className={classeInput}
                value={valores.linkCupom}
                onChange={(e) => atualizarCampo("linkCupom", e.target.value)}
              />
            </Campo>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={valores.freteGratis}
              onChange={(e) => atualizarCampo("freteGratis", e.target.checked)}
            />
            Frete grátis
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Estoque">
              <input
                className={classeInput}
                placeholder="Ex: últimas unidades"
                value={valores.estoque}
                onChange={(e) => atualizarCampo("estoque", e.target.value)}
              />
            </Campo>
            <Campo rotulo="Validade da promoção">
              <input
                type="date"
                className={classeInput}
                value={valores.validadePromocao}
                onChange={(e) =>
                  atualizarCampo("validadePromocao", e.target.value)
                }
              />
            </Campo>
          </div>
        </div>
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Características
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Voltagem">
            <input
              className={classeInput}
              value={valores.voltagem}
              onChange={(e) => atualizarCampo("voltagem", e.target.value)}
            />
          </Campo>
          <Campo rotulo="Cor">
            <input
              className={classeInput}
              value={valores.cor}
              onChange={(e) => atualizarCampo("cor", e.target.value)}
            />
          </Campo>
          <Campo rotulo="Tamanho">
            <input
              className={classeInput}
              value={valores.tamanho}
              onChange={(e) => atualizarCampo("tamanho", e.target.value)}
            />
          </Campo>
          <Campo rotulo="Capacidade">
            <input
              className={classeInput}
              value={valores.capacidade}
              onChange={(e) => atualizarCampo("capacidade", e.target.value)}
            />
          </Campo>
        </div>
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Mídia
        </h2>
        <div className="flex flex-col gap-3">
          <Campo rotulo="Imagem principal">
            <input type="file" accept="image/*" onChange={aoEscolherImagem} />
          </Campo>
          {enviandoImagem && (
            <p className="text-xs text-ink/50">Enviando imagem...</p>
          )}
          {erroImagem && (
            <p className="text-xs text-accent-dark">{erroImagem}</p>
          )}
          {previewImagem && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImagem}
              alt="Pré-visualização da imagem do produto"
              className="h-32 w-32 rounded-lg object-cover ring-1 ring-ink/10"
            />
          )}
          <p className="text-xs text-ink/50">
            A imagem é enviada e guardada de verdade assim que você escolhe o
            arquivo — não precisa fazer mais nada.
          </p>
        </div>
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Publicação
        </h2>
        <div className="flex flex-col gap-3">
          <Campo rotulo="Link do produto" obrigatorio erro={erros.linkProduto}>
            <input
              className={classeInput}
              value={valores.linkProduto}
              onChange={(e) => atualizarCampo("linkProduto", e.target.value)}
              placeholder="Cole aqui o link de afiliado"
            />
          </Campo>
          {valores.linkProduto &&
            !linkParecePertencerALoja(valores.linkProduto, valores.loja) && (
              <p className="text-xs text-accent-dark">
                ⚠️ Esse link não parece ser do domínio oficial de{" "}
                {valores.loja}. Confira antes de publicar.
              </p>
            )}

          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={valores.usarLinkRedirecionamento}
              onChange={(e) =>
                atualizarCampo("usarLinkRedirecionamento", e.target.checked)
              }
            />
            <span>
              Usar link de redirecionamento próprio (
              <code>seudominio.com/r/id-da-oferta</code>) em vez do link
              direto, para registrar cliques. O link final é sempre mostrado
              na prévia abaixo antes de publicar.
            </span>
          </label>

          <Campo rotulo="Texto original da oferta">
            <textarea
              className={classeInput}
              rows={3}
              value={valores.textoOriginal}
              onChange={(e) => atualizarCampo("textoOriginal", e.target.value)}
              placeholder="Cole aqui o texto ou a descrição que você recebeu do fornecedor"
            />
          </Campo>

          <Campo rotulo="Observações">
            <textarea
              className={classeInput}
              rows={2}
              value={valores.observacoes}
              onChange={(e) => atualizarCampo("observacoes", e.target.value)}
            />
          </Campo>

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

          {valores.status === "agendada" && (
            <Campo rotulo="Agendar publicação para">
              <input
                type="datetime-local"
                className={classeInput}
                value={valores.agendadoPara}
                onChange={(e) =>
                  atualizarCampo("agendadoPara", e.target.value)
                }
              />
              <p className="mt-1 text-xs text-ink/50">
                Horário de Brasília. Uma rotina automática publica a oferta
                assim que a data chegar (veja a Etapa 9).
              </p>
            </Campo>
          )}
        </div>
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Gerar oferta com IA
        </h2>
        <GerarComIA
          valores={valores}
          onTextoGerado={(texto) => atualizarCampo("textoPublicacao", texto)}
        />
      </section>

      <section className="rounded-xl2 bg-white p-4 ring-1 ring-ink/10">
        <h2 className="mb-3 font-display text-base font-bold text-ink">
          Prévia e edição da publicação
        </h2>
        <Campo rotulo="Texto final (edite à vontade antes de publicar)">
          <textarea
            className={classeInput}
            rows={10}
            value={valores.textoPublicacao}
            onChange={(e) => atualizarCampo("textoPublicacao", e.target.value)}
            placeholder='Toque em "Gerar publicação" acima ou escreva manualmente aqui'
          />
        </Campo>
        <div className="mt-3">
          <PreviaWhatsApp texto={valores.textoPublicacao || ""} />
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
          : ofertaExistente
          ? "Salvar alterações"
          : "Salvar oferta"}
      </button>
    </form>
  );
}