"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cupom } from "@/lib/types";
import {
  cupomExpirado,
  excluirCupom,
  listarCuponsPaginados,
  listarCuponsParaBuscaAdmin,
} from "@/lib/coupons-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import Paginacao from "@/components/admin/Paginacao";
import { textoCorrespondeBusca } from "@/lib/admin-search";
import { formatarDataPublicacao } from "@/lib/datas";
import { montarRelatorioCupons } from "@/lib/cupom-relatorio";

const ITENS_POR_PAGINA = 30;

function cupomCorrespondeBusca(cupom: Cupom, termo: string) {
  const expirado = cupomExpirado(cupom);
  return textoCorrespondeBusca(termo, [
    cupom.nomeCupom,
    cupom.loja,
    cupom.descricao,
    cupom.observacoes,
    cupom.valorCupom,
    cupom.descontoPercentual,
    cupom.validade,
    cupom.ativo ? "ativo" : "inativo arquivado",
    expirado ? "vencido vencida expirado expirada esgotado" : "",
    cupom.linkProdutos,
    cupom.criadoEm,
    cupom.publicadoEm,
    cupom.relampago ? "cupom relampago relâmpago" : "",
  ]);
}

export default function ListaCuponsPage() {
  const supabase = criarClienteNavegador();
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [resultadosBusca, setResultadosBusca] = useState<Cupom[] | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [cuponsSelecionados, setCuponsSelecionados] = useState<Record<string, Cupom>>({});
  const [feedbackRelatorio, setFeedbackRelatorio] = useState("");

  const emBusca = Boolean(buscaAplicada.trim());

  const selecionados = useMemo(
    () => Object.values(cuponsSelecionados),
    [cuponsSelecionados]
  );
  const relatorioSelecionados = useMemo(
    () => montarRelatorioCupons(selecionados),
    [selecionados]
  );

  const cuponsVisiveis = useMemo(() => {
    if (!emBusca) return cupons;
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    return (resultadosBusca ?? []).slice(inicio, inicio + ITENS_POR_PAGINA);
  }, [cupons, emBusca, paginaAtual, resultadosBusca]);

  async function carregarPaginaNormal(pagina = paginaAtual) {
    setCarregando(true);
    try {
      const resultado = await listarCuponsPaginados(supabase, pagina, ITENS_POR_PAGINA);
      const ultimaPagina = Math.max(1, Math.ceil(resultado.total / ITENS_POR_PAGINA));

      if (resultado.total > 0 && resultado.itens.length === 0 && pagina > ultimaPagina) {
        setPaginaAtual(ultimaPagina);
        return;
      }

      setCupons(resultado.itens);
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
      const todos = await listarCuponsParaBuscaAdmin(supabase);
      const filtrados = todos.filter((cupom) => cupomCorrespondeBusca(cupom, termoLimpo));
      const ultimaPagina = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));

      setResultadosBusca(filtrados);
      setCupons([]);
      setTotalItens(filtrados.length);
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
      document.getElementById("inicio-lista-cupons")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  function alternarSelecao(cupom: Cupom) {
    setCuponsSelecionados((atual) => {
      const proximo = { ...atual };
      if (proximo[cupom.id]) delete proximo[cupom.id];
      else proximo[cupom.id] = cupom;
      return proximo;
    });
  }

  function selecionarVisiveis() {
    setCuponsSelecionados((atual) => {
      const proximo = { ...atual };
      for (const cupom of cuponsVisiveis) proximo[cupom.id] = cupom;
      return proximo;
    });
  }

  function limparSelecao() {
    setCuponsSelecionados({});
    setFeedbackRelatorio("");
  }

  async function copiarRelatorio() {
    if (!relatorioSelecionados) return;
    try {
      await navigator.clipboard.writeText(relatorioSelecionados);
      setFeedbackRelatorio("Relatório copiado!");
      window.setTimeout(() => setFeedbackRelatorio(""), 2200);
    } catch {
      setFeedbackRelatorio("Não foi possível copiar automaticamente.");
    }
  }

  async function compartilharRelatorio() {
    if (!relatorioSelecionados) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Cupons selecionados — Achado do Alê",
          text: relatorioSelecionados,
        });
        setFeedbackRelatorio("Compartilhado!");
      } else {
        await navigator.clipboard.writeText(relatorioSelecionados);
        setFeedbackRelatorio("Relatório copiado para compartilhar!");
      }
      window.setTimeout(() => setFeedbackRelatorio(""), 2200);
    } catch {
      // Cancelamento do menu de compartilhamento não deve gerar erro visual.
    }
  }

  async function aoExcluir(id: string) {
    const confirmou = window.confirm("Excluir este cupom?");
    if (!confirmou) return;
    await excluirCupom(supabase, id);
    setCuponsSelecionados((atual) => {
      const proximo = { ...atual };
      delete proximo[id];
      return proximo;
    });
    await recarregar();
  }

  return (
    <div>
      <div className="mb-5 grid gap-4 md:grid-cols-[minmax(230px,0.72fr)_minmax(0,1.55fr)] md:items-stretch">
        <div className="flex flex-col items-start gap-3 md:justify-center md:pl-1">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Cupons</h1>
            <p className="mt-1 text-sm text-ink/55">
              Gerencie cupons com uma visualização mais atual e direta.
            </p>
          </div>
          <Link
            href="/admin/cupons/novo"
            className="admin-action rounded-[16px] border px-4 py-2.5 text-sm font-semibold shadow-sm"
          >
            + Novo cupom
          </Link>
        </div>

        <form
          onSubmit={aoPesquisar}
          className="rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm md:p-3.5"
        >
          <label htmlFor="pesquisa-cupons" className="text-sm font-semibold text-ink">
            Pesquisar cupons
          </label>
          <p className="mt-1 text-xs text-ink/50 md:truncate">
            Pesquise por parte do cupom, loja, descrição, desconto ou status. A busca ignora acentos.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row md:mt-2">
            <input
              id="pesquisa-cupons"
              type="search"
              value={buscaDigitada}
              onChange={(evento) => setBuscaDigitada(evento.target.value)}
              placeholder="Ex.: shopee, beleza20, inativo..."
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

      <section className="mb-5 rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm md:p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-ink">Mini relatório de cupons</h2>
              <span className="rounded-full bg-brand/8 px-2.5 py-1 text-xs font-semibold text-brand">
                {selecionados.length} selecionado{selecionados.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink/50">
              Marque os cupons nos cards. A seleção continua mesmo ao trocar de página.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selecionarVisiveis}
              disabled={cuponsVisiveis.length === 0}
              className="admin-action-soft rounded-xl border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45"
            >
              Selecionar desta tela
            </button>
            {selecionados.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={copiarRelatorio}
                  className="admin-action-soft rounded-xl border px-3 py-2 text-xs font-semibold"
                >
                  Copiar relatório
                </button>
                <button
                  type="button"
                  onClick={compartilharRelatorio}
                  className="admin-action rounded-xl border px-3 py-2 text-xs font-semibold"
                >
                  Compartilhar selecionados
                </button>
                <button
                  type="button"
                  onClick={limparSelecao}
                  className="admin-action-soft rounded-xl border px-3 py-2 text-xs font-semibold"
                >
                  Limpar seleção
                </button>
              </>
            )}
          </div>
        </div>

        {selecionados.length > 0 && (
          <div className="mt-4">
            <label htmlFor="relatorio-cupons-selecionados" className="text-xs font-semibold text-ink/65">
              Prévia do relatório
            </label>
            <textarea
              id="relatorio-cupons-selecionados"
              readOnly
              value={relatorioSelecionados}
              rows={Math.min(12, Math.max(4, selecionados.length * 3))}
              className="mt-2 w-full resize-y rounded-[14px] border border-brand/15 bg-cream/35 px-3 py-3 font-mono text-xs leading-5 text-ink outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-ink/45">
                Os links usam o endereço curto do Achado do Alê e passam pelo seu site antes do redirecionamento.
              </p>
              {feedbackRelatorio && (
                <p className="text-xs font-semibold text-trust">{feedbackRelatorio}</p>
              )}
            </div>
          </div>
        )}
      </section>

      <div id="inicio-lista-cupons" className="scroll-mt-4" />

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : !emBusca && totalItens === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhum cupom cadastrado ainda.
        </div>
      ) : emBusca && totalItens === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhum cupom encontrado para <strong>“{buscaAplicada}”</strong>. Tente outro termo ou limpe a pesquisa.
        </div>
      ) : (
        <>
          <ul className="grid gap-4 lg:grid-cols-2 lg:gap-3">
            {cuponsVisiveis.map((cupom) => {
              const expirado = cupomExpirado(cupom);
              return (
                <li
                  key={cupom.id}
                  className="rounded-[22px] border border-brand/10 bg-white p-4 shadow-sm md:p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <label
                        className="mt-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-brand/15 bg-cream/50 transition hover:border-accent"
                        title="Selecionar cupom para o relatório"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(cuponsSelecionados[cupom.id])}
                          onChange={() => alternarSelecao(cupom)}
                          className="h-4 w-4 cursor-pointer accent-brand"
                          aria-label={`Selecionar cupom ${cupom.nomeCupom}`}
                        />
                      </label>
                      <div className="min-w-0">
                        <p className="break-words text-base font-bold" style={{ color: cupom.corLoja }}>
                          CUPOM {cupom.nomeCupom}
                        </p>
                        <p className="mt-1 text-sm text-ink/55">{cupom.loja}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {expirado && (
                        <span className="rounded-full bg-ink/10 px-2.5 py-1 text-xs font-medium text-ink/50">
                          Esgotado
                        </span>
                      )}
                      {!cupom.ativo && (
                        <span className="rounded-full bg-ink/10 px-2.5 py-1 text-xs font-medium text-ink/50">
                          Inativo
                        </span>
                      )}
                      {cupom.relampago && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-300/70">
                          ⚡ Relâmpago
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/60 md:mt-3 md:gap-2">
                    {cupom.descontoPercentual ? (
                      <div className="rounded-full bg-discount/25 px-3 py-1 font-medium text-ink">
                        {cupom.descontoPercentual}% OFF
                      </div>
                    ) : null}
                    {cupom.valorCupom ? (
                      <div className="rounded-full bg-brand/5 px-3 py-1">{cupom.valorCupom}</div>
                    ) : null}
                    {cupom.validade ? (
                      <div className="rounded-full bg-cream px-3 py-1">
                        Validade configurada
                      </div>
                    ) : (
                      <div className="rounded-full bg-cream px-3 py-1">Sem validade</div>
                    )}
                  </div>

                  {cupom.publicadoEm && (
                    <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.06em] text-ink/40">
                      POSTADO EM: {formatarDataPublicacao(cupom.publicadoEm)}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium md:mt-3">
                    <Link
                      href={`/admin/cupons/${cupom.id}/editar`}
                      className="admin-action-soft rounded-xl border px-3 py-2"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => aoExcluir(cupom.id)}
                      className="admin-action-soft rounded-xl border px-3 py-2"
                    >
                      Excluir
                    </button>
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
