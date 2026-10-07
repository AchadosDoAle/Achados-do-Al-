"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Oferta } from "@/lib/types";
import {
  duplicarOferta,
  excluirOferta,
  listarOfertasPaginadas,
  listarOfertasParaBuscaAdmin,
  publicarOfertaAgora,
} from "@/lib/offers-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import Paginacao from "@/components/admin/Paginacao";
import { destaqueImperdivelAtivo, ofertaEstaExpirada } from "@/lib/oferta-status";
import { textoCorrespondeBusca } from "@/lib/admin-search";
import { formatarDataPublicacao } from "@/lib/datas";

const ITENS_POR_PAGINA = 30;

function podeRepublicar(oferta: Oferta) {
  if (oferta.status === "rascunho") return false;
  return (
    oferta.status === "expirada" ||
    oferta.status === "arquivada" ||
    (oferta.status === "publicada" && ofertaEstaExpirada(oferta))
  );
}

function ofertaCorrespondeBusca(oferta: Oferta, termo: string) {
  const vencida = ofertaEstaExpirada(oferta);
  return textoCorrespondeBusca(termo, [
    oferta.titulo,
    oferta.loja,
    oferta.categoria,
    oferta.marca,
    oferta.modelo,
    oferta.cupom,
    oferta.cupomDescricao,
    oferta.status,
    vencida ? "vencida expirada" : "",
    oferta.textoOriginal,
    oferta.textoPublicacao,
    oferta.observacoes,
    oferta.voltagem,
    oferta.cor,
    oferta.tamanho,
    oferta.capacidade,
    oferta.linkProduto,
    oferta.ofertaBlack ? "black friday oferta black" : "",
    oferta.destaqueImperdivel ? "promocao imperdivel destaque destaque home" : "",
    oferta.precoObservacao,
    oferta.criadoEm,
    oferta.publicadoEm,
  ]);
}

export default function ListaOfertasPage() {
  const supabase = criarClienteNavegador();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [resultadosBusca, setResultadosBusca] = useState<Oferta[] | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState("");
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);

  const emBusca = Boolean(buscaAplicada.trim());

  const ofertasVisiveis = useMemo(() => {
    if (!emBusca) return ofertas;
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return (resultadosBusca ?? []).slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [emBusca, ofertas, paginaAtual, resultadosBusca]);

  async function carregarPaginaNormal(pagina = paginaAtual) {
    setCarregando(true);
    try {
      const resultado = await listarOfertasPaginadas(supabase, pagina, ITENS_POR_PAGINA);
      const ultimaPagina = Math.max(1, Math.ceil(resultado.total / ITENS_POR_PAGINA));

      if (resultado.total > 0 && resultado.itens.length === 0 && pagina > ultimaPagina) {
        setPaginaAtual(ultimaPagina);
        return;
      }

      setOfertas(resultado.itens);
      setTotalItens(resultado.total);
      setResultadosBusca(null);
    } finally {
      setCarregando(false);
    }
  }

  async function executarBusca(termo: string, paginaPreferida = 1) {
    const termoLimpo = termo.trim();
    if (!termoLimpo) return;

    setCarregando(true);
    try {
      // A listagem normal traz somente 30 registros do Supabase. A carga completa
      // acontece apenas quando o usuário realmente faz uma pesquisa, preservando
      // a busca tolerante a acentos e por partes do texto que já existia no painel.
      const todas = await listarOfertasParaBuscaAdmin(supabase);
      const filtradas = todas.filter((oferta) => ofertaCorrespondeBusca(oferta, termoLimpo));
      const ultimaPagina = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));

      setResultadosBusca(filtradas);
      setOfertas([]);
      setTotalItens(filtradas.length);
      setPaginaAtual(Math.min(Math.max(1, paginaPreferida), ultimaPagina));
    } finally {
      setCarregando(false);
    }
  }

  function aoPesquisar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const termo = buscaDigitada.trim();

    if (!termo) {
      limparBusca();
      return;
    }

    setBuscaAplicada(termo);
    void executarBusca(termo, 1);
  }

  function limparBusca() {
    setBuscaDigitada("");
    setBuscaAplicada("");
    setResultadosBusca(null);
    setPaginaAtual(1);
    setCarregando(true);
  }

  async function recarregar() {
    if (emBusca) {
      await executarBusca(buscaAplicada, paginaAtual);
      return;
    }
    await carregarPaginaNormal(paginaAtual);
  }

  useEffect(() => {
    if (!buscaAplicada.trim()) {
      void carregarPaginaNormal(paginaAtual);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaAtual, buscaAplicada]);

  function mudarPagina(pagina: number) {
    setPaginaAtual(pagina);
    window.setTimeout(() => {
      document.getElementById("inicio-lista-ofertas")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  async function aoDuplicar(id: string) {
    await duplicarOferta(supabase, id);
    await recarregar();
  }

  async function aoPublicar(oferta: Oferta, republicar = false) {
    const acao = republicar ? "Republicar" : "Publicar";
    const detalheValidade = ofertaEstaExpirada(oferta) && oferta.validadePromocao
      ? "\n\nA validade antiga já venceu e será removida para a oferta voltar ao ar."
      : "";
    const confirmou = window.confirm(
      `${acao} \"${oferta.titulo}\" agora no site?${detalheValidade}`
    );
    if (!confirmou) return;

    setErroAcao("");
    setAcaoEmAndamento(oferta.id);
    try {
      await publicarOfertaAgora(supabase, oferta);
      await recarregar();
    } catch (erro) {
      console.error(erro);
      setErroAcao(
        `Não foi possível ${republicar ? "republicar" : "publicar"} a oferta. Tente novamente.`
      );
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function aoExcluir(id: string) {
    const confirmou = window.confirm(
      "Tem certeza que deseja excluir esta oferta? Essa ação não pode ser desfeita."
    );
    if (!confirmou) return;
    await excluirOferta(supabase, id);
    await recarregar();
  }

  return (
    <div>
      <div className="mb-5 grid gap-4 md:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.55fr)] md:items-stretch">
        <div className="flex flex-col items-start gap-3 md:justify-center md:pl-1">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Ofertas</h1>
            <p className="mt-1 text-sm text-ink/55">
              Gerencie rascunhos, agendamentos, publicações e ofertas vencidas.
            </p>
          </div>
          <Link
            href="/admin/ofertas/nova"
            className="admin-action rounded-[16px] border px-4 py-2.5 text-sm font-semibold shadow-sm"
          >
            + Nova oferta
          </Link>
        </div>

        <form
          onSubmit={aoPesquisar}
          className="rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm md:p-3.5"
        >
          <label htmlFor="pesquisa-ofertas" className="text-sm font-semibold text-ink">
            Pesquisar ofertas
          </label>
          <p className="mt-1 text-xs text-ink/50 md:truncate">
            Pesquise por parte do nome, loja, categoria, marca, modelo, cupom ou status. A busca ignora acentos.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row md:mt-2">
            <input
              id="pesquisa-ofertas"
              type="search"
              value={buscaDigitada}
              onChange={(evento) => setBuscaDigitada(evento.target.value)}
              placeholder="Ex.: relogio casio, samsung, mercado livre..."
              autoComplete="off"
              className="min-w-0 flex-1 rounded-[14px] border border-brand/20 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 md:py-2.5"
            />
            <button
              type="submit"
              className="admin-action rounded-[14px] border px-4 py-3 text-sm font-semibold md:py-2.5"
            >
              Pesquisar
            </button>
            {(buscaDigitada || buscaAplicada) && (
              <button
                type="button"
                onClick={limparBusca}
                className="admin-action-soft rounded-[14px] border px-4 py-3 text-sm font-semibold md:py-2.5"
              >
                Limpar
              </button>
            )}
          </div>
          {buscaAplicada && (
            <p className="mt-3 text-xs text-ink/55 md:mt-2">
              {totalItens} {totalItens === 1 ? "resultado" : "resultados"} para <strong>“{buscaAplicada}”</strong>.
            </p>
          )}
        </form>
      </div>

      {erroAcao && (
        <div className="mb-4 rounded-[16px] border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {erroAcao}
        </div>
      )}

      <div id="inicio-lista-ofertas" className="scroll-mt-4" />

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : !emBusca && totalItens === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhuma oferta cadastrada ainda. Toque em <strong>Nova oferta</strong> para começar.
        </div>
      ) : emBusca && totalItens === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhuma oferta encontrada para <strong>“{buscaAplicada}”</strong>. Tente outro termo ou limpe a pesquisa.
        </div>
      ) : (
        <>
          <ul className="grid gap-4 lg:grid-cols-2 lg:gap-3">
            {ofertasVisiveis.map((oferta) => {
              const expirada = ofertaEstaExpirada(oferta);
              const republicavel = podeRepublicar(oferta);
              const executando = acaoEmAndamento === oferta.id;
              const statusVisual = oferta.status === "arquivada"
                ? "arquivada"
                : expirada
                  ? "expirada"
                  : oferta.status;

              return (
                <li
                  key={oferta.id}
                  className="rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm md:p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-ink">{oferta.titulo}</p>
                      <p className="mt-1 text-sm text-ink/55">
                        {oferta.loja} · {oferta.categoria}
                      </p>
                    </div>
                    <StatusBadge status={statusVisual} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/60 md:mt-3 md:gap-2">
                    {oferta.precoPix != null && (
                      <div className="rounded-full bg-trust/10 px-3 py-1 text-trust">
                        Pix: {oferta.precoPix.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                    )}
                    {oferta.precoAtual != null && (
                      <div className="rounded-full bg-cream px-3 py-1">
                        Atual: {oferta.precoAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                    )}
                    {oferta.precoPix == null && oferta.precoAtual == null && (
                      <div className="rounded-full bg-cream px-3 py-1">Preço não informado</div>
                    )}
                    {oferta.precoAntigo ? (
                      <div className="rounded-full bg-brand/5 px-3 py-1">
                        Antes: {oferta.precoAntigo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </div>
                    ) : null}
                    {oferta.cupom ? <div className="rounded-full bg-trust/10 px-3 py-1 text-trust">Cupom: {oferta.cupom}</div> : null}
                    {oferta.ofertaBlack ? (
                      <div className="rounded-full bg-black px-3 py-1 font-bold text-[#f6c843]">OFERTA BLACK</div>
                    ) : null}
                    {destaqueImperdivelAtivo(oferta) ? (
                      <div className="rounded-full bg-amber-100 px-3 py-1 font-bold text-amber-800 ring-1 ring-amber-300/70">🔥 IMPERDÍVEL</div>
                    ) : null}
                  </div>

                  {oferta.publicadoEm && (
                    <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.06em] text-ink/40">
                      POSTADA EM: {formatarDataPublicacao(oferta.publicadoEm)}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium md:mt-3">
                    <Link
                      href={`/admin/ofertas/${oferta.id}/editar`}
                      className="admin-action-soft rounded-xl border px-3 py-2"
                    >
                      Editar
                    </Link>

                    {expirada && oferta.status !== "expirada" && oferta.status !== "arquivada" && (
                      <span className="rounded-xl bg-accent/10 px-3 py-2 text-accent-dark ring-1 ring-accent/20">
                        Validade vencida
                      </span>
                    )}

                    <button
                      onClick={() => aoDuplicar(oferta.id)}
                      disabled={executando}
                      className="admin-action-soft rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Duplicar
                    </button>
                    <button
                      onClick={() => aoExcluir(oferta.id)}
                      disabled={executando}
                      className="admin-action-soft rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Excluir
                    </button>

                    {oferta.status === "rascunho" && (
                      <button
                        onClick={() => aoPublicar(oferta)}
                        disabled={executando}
                        className="admin-action rounded-xl border px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {executando ? "PUBLICANDO..." : "PUBLICAR"}
                      </button>
                    )}

                    {republicavel && (
                      <button
                        onClick={() => aoPublicar(oferta, true)}
                        disabled={executando}
                        className="admin-action rounded-xl border px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {executando ? "REPUBLICANDO..." : "REPUBLICAR"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <Paginacao
            paginaAtual={paginaAtual}
            totalItens={totalItens}
            itensPorPagina={ITENS_POR_PAGINA}
            onChange={mudarPagina}
            carregando={carregando}
          />
        </>
      )}
    </div>
  );
}
