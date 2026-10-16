"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent } from "react";
import type { Oferta } from "@/lib/types";

const INTERVALO_SLIDE = 7000;
const DURACAO_TRANSICAO = 680;
const MAXIMO_CARDS = 5;
type Direcao = 1 | -1;
type CardSaindo = { oferta: Oferta; posicao: number; eraDestaque: boolean };

function precoEmReais(valor: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

// O repositório converte destaqueAte em horário local de Brasília, sem fuso.
function timestampBrasilia(valor?: string) {
  if (!valor) return NaN;
  if (/Z$|[+-]\d{2}:?\d{2}$/.test(valor)) return new Date(valor).getTime();
  const data = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor) ? `${valor}:00` : valor;
  return new Date(`${data}-03:00`).getTime();
}

function fimDaValidade(valor?: string) {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor.slice(0, 10))) return NaN;
  return new Date(`${valor.slice(0, 10)}T23:59:59-03:00`).getTime();
}

function textoCronometro(restanteMs: number) {
  const segundos = Math.max(0, Math.floor(restanteMs / 1000));
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const seg = segundos % 60;
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
}

function SlideCard({oferta, posicao, eraDestaque, agora, saindo = false}: {oferta: Oferta; posicao: number; eraDestaque: boolean; agora: number; saindo?: boolean}) {
  const vencimentoDestaque = eraDestaque ? timestampBrasilia(oferta.destaqueAte) : NaN;
  const vencimentoRecente = !eraDestaque ? fimDaValidade(oferta.validadePromocao) : NaN;
  const vencimento = eraDestaque ? vencimentoDestaque : vencimentoRecente;
  const temCronometro = Number.isFinite(vencimento) && (agora === 0 || vencimento > agora);
  const preco = oferta.precoPix ?? oferta.precoAtual;
  return (
  <div className="grid h-full min-h-0 w-full grid-cols-1 grid-rows-[205px_minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:grid-rows-1 sm:gap-5 lg:gap-6">
              <Link
                href={`/oferta/${oferta.slug}`}
                className="group relative flex h-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 sm:p-4"
                aria-label={`Ver oferta: ${oferta.titulo}`} tabIndex={saindo ? -1 : undefined}
              >
                {oferta.imagemPrincipal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={oferta.imagemPrincipal}
                    alt={oferta.titulo}
                    loading={posicao === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="block h-full max-h-full w-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="text-6xl" aria-hidden="true">🛍️</span>
                )}
              </Link>

              <div className="grid h-full min-h-0 min-w-0 grid-rows-[24px_44px_18px_76px_54px_38px_44px] content-between overflow-hidden py-1">
                <p className="min-w-0 truncate text-sm font-black uppercase tracking-[0.1em] text-gold sm:text-base">
                  🔥 OFERTA IMPERDÍVEL
                </p>
                {temCronometro ? (
                  <div className="flex h-full min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 overflow-hidden">
                    <span className="shrink-0 text-xs font-medium text-text-muted sm:text-sm">Corra, dura apenas</span>
                    <span className="shrink-0 rounded-lg border border-gold/30 bg-gold/10 px-2 py-1 font-mono text-base font-bold tabular-nums tracking-wide text-gold-light sm:text-lg" role="timer" aria-label="Tempo restante da oferta">
                      {agora ? textoCronometro(vencimento - agora) : "--:--:--"}
                    </span>
                  </div>
                ) : (
                  <p className="line-clamp-2 self-center text-xs text-text-muted sm:text-sm">{eraDestaque ? "Atualizando as ofertas disponíveis..." : "Um dos achados mais recentes do site"}</p>
                )}
                <p className="min-w-0 truncate text-xs font-extrabold uppercase tracking-[0.1em] text-gold-light">{oferta.loja}</p>
                <h2 className="line-clamp-3 h-full min-w-0 overflow-hidden text-base font-bold leading-[1.4] text-text sm:text-lg lg:text-xl">{oferta.titulo}</h2>

                <div className="flex h-full min-w-0 flex-wrap content-center items-baseline gap-x-3 gap-y-1 overflow-hidden">
                  {oferta.precoAntigo != null && (
                    <span className="shrink-0 text-xs text-text-muted line-through sm:text-sm">{precoEmReais(oferta.precoAntigo)}</span>
                  )}
                  {preco != null ? (
                    <span className="font-display text-2xl font-black leading-none text-trust sm:text-3xl lg:text-4xl">
                      {precoEmReais(preco)}
                      {oferta.precoPix != null && <span className="ml-1 whitespace-nowrap text-[10px] font-semibold text-trust sm:text-xs">no Pix</span>}
                    </span>
                  ) : (
                    <span className="text-base font-semibold text-text">Consulte o preço</span>
                  )}
                </div>

                <div className="flex h-full min-w-0 items-center overflow-hidden">
                  {oferta.cupom ? (
                    <span className="block max-w-full truncate rounded-lg border border-dashed border-gold/40 bg-gold/10 px-2.5 py-2 text-[11px] font-bold text-gold-light sm:text-xs" title={`CUPOM DE DESCONTO: ${oferta.cupom}`}>CUPOM DE DESCONTO: {oferta.cupom}</span>
                  ) : <span aria-hidden="true" className="block h-full" />}
                </div>

                <Link href={`/oferta/${oferta.slug}`} tabIndex={saindo ? -1 : undefined} className="inline-flex h-full w-fit items-center justify-center self-end rounded-xl bg-gold px-4 text-sm font-extrabold text-bg transition hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:px-5">
                  Aproveitar oferta <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
  );
}

export default function DestaquesCarousel({
  destaques,
  recentes,
}: {
  destaques: Oferta[];
  recentes: Oferta[];
}) {
  const [agora, setAgora] = useState(0);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [direcao, setDirecao] = useState<Direcao>(1);
  const [saindo, setSaindo] = useState<CardSaindo | null>(null);
  const transicaoAtiva = useRef(false);
  const timerTransicao = useRef<number | null>(null);

  // Atualiza o relógio no cliente, evitando desencontro de hidratação no servidor.
  useEffect(() => {
    const atualizar = () => setAgora(Date.now());
    atualizar();
    const temporizador = window.setInterval(atualizar, 1000);
    return () => window.clearInterval(temporizador);
  }, []);

  const destaquesVigentes = destaques
    .filter((item) => {
      const validade = timestampBrasilia(item.destaqueAte);
      return item.destaqueImperdivel && Number.isFinite(validade) && (agora === 0 || validade > agora);
    })
    .slice(0, MAXIMO_CARDS);
  const mostrandoDestaques = destaquesVigentes.length > 0;
  const slides = mostrandoDestaques ? destaquesVigentes : recentes.slice(0, MAXIMO_CARDS);
  const total = slides.length;
  const posicao = total > 0 ? indice % total : 0;
  const oferta = slides[posicao];

  const atualRef = useRef({ slides, posicao, mostrandoDestaques });
  atualRef.current = { slides, posicao, mostrandoDestaques };

  const navegar = useCallback((destino: number, sentido: Direcao) => {
    const atual = atualRef.current;
    const quantidade = atual.slides.length;
    if (quantidade < 2 || transicaoAtiva.current) return;
    const proximoIndice = ((destino % quantidade) + quantidade) % quantidade;
    if (proximoIndice === atual.posicao) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setSaindo(null); setIndice(proximoIndice); return; }
    transicaoAtiva.current = true;
    setSaindo({ oferta: atual.slides[atual.posicao], posicao: atual.posicao, eraDestaque: atual.mostrandoDestaques });
    setDirecao(sentido);
    setIndice(proximoIndice);
    if (timerTransicao.current !== null) window.clearTimeout(timerTransicao.current);
    timerTransicao.current = window.setTimeout(() => { setSaindo(null); transicaoAtiva.current = false; timerTransicao.current = null; }, DURACAO_TRANSICAO);
  }, []);
  useEffect(() => () => { if (timerTransicao.current !== null) window.clearTimeout(timerTransicao.current); }, []);
  useEffect(() => {
    if (total < 2 || pausado) return;
    const timer = window.setInterval(() => { if (document.visibilityState !== "hidden") navegar(atualRef.current.posicao + 1, 1); }, INTERVALO_SLIDE);
    return () => window.clearInterval(timer);
  }, [total, pausado, navegar]);
  const proximo = () => navegar(atualRef.current.posicao + 1, 1);
  const anterior = () => navegar(atualRef.current.posicao - 1, -1);

  return (
    <div
      className="relative w-full min-w-0"
      aria-label="Carrossel de ofertas em destaque"
      aria-roledescription="carrossel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={(evento: FocusEvent<HTMLDivElement>) => {
        if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setPausado(false);
      }}
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold/15 via-transparent to-trust/10 blur-2xl" aria-hidden="true" />
      <div className="relative rounded-[1.75rem] border border-gold/20 bg-[#0A1727] p-4 shadow-2xl shadow-black/30 sm:p-5 lg:p-6">
        {oferta ? (
          <>
            <div className="relative isolate h-[635px] overflow-hidden rounded-2xl sm:h-[390px] lg:h-[408px]" aria-live="off">
              {saindo && (
                <div key={`saida-${saindo.oferta.id}`} aria-hidden="true" className={`pointer-events-none absolute inset-0 z-10 h-full ale-carousel-saida-${direcao === 1 ? "esquerda" : "direita"}`}>
                  <SlideCard oferta={saindo.oferta} posicao={saindo.posicao} eraDestaque={saindo.eraDestaque} agora={agora} saindo />
                </div>
              )}
              <div key={`entrada-${oferta.id}-${indice}`} className={`h-full ${saindo ? `ale-carousel-entrada-${direcao === 1 ? "direita" : "esquerda"}` : ""}`}>
                <SlideCard oferta={oferta} posicao={posicao} eraDestaque={mostrandoDestaques} agora={agora} />
              </div>
            </div>

            {total > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <button type="button" onClick={anterior} aria-label="Oferta anterior" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xl font-bold text-text transition hover:bg-white/15">‹</button>
                <div className="flex flex-wrap items-center justify-center gap-2" aria-label={`${posicao + 1} de ${total} ofertas`}>
                  {slides.map((item, i) => (
                    <button key={item.id} type="button" onClick={() => navegar(i, i >= posicao ? 1 : -1)} aria-label={`Ver oferta ${i + 1}`} aria-current={posicao === i ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${posicao === i ? "w-7 bg-gold" : "w-2.5 bg-white/35 hover:bg-white/60"}`} />
                  ))}
                </div>
                <button type="button" onClick={proximo} aria-label="Próxima oferta" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xl font-bold text-text transition hover:bg-white/15">›</button>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
            <span className="text-5xl">✨</span>
            <h2 className="mt-4 font-display text-xl font-bold text-text">Em breve, novos achadinhos!</h2>
            <p className="mt-2 text-sm text-text-muted">Assim que uma oferta for publicada, ela aparecerá aqui.</p>
          </div>
        )}
      </div>
      <style jsx global>{`
        @keyframes ale-entra-direita { from { opacity: 0; transform: translate3d(12%,0,0) scale(.985); } to { opacity: 1; transform: none; } }
        @keyframes ale-entra-esquerda { from { opacity: 0; transform: translate3d(-12%,0,0) scale(.985); } to { opacity: 1; transform: none; } }
        @keyframes ale-sai-esquerda { from { opacity: 1; transform: none; } to { opacity: 0; transform: translate3d(-12%,0,0) scale(.985); } }
        @keyframes ale-sai-direita { from { opacity: 1; transform: none; } to { opacity: 0; transform: translate3d(12%,0,0) scale(.985); } }
        .ale-carousel-entrada-direita { animation: ale-entra-direita 680ms cubic-bezier(.22,1,.36,1) both; }
        .ale-carousel-entrada-esquerda { animation: ale-entra-esquerda 680ms cubic-bezier(.22,1,.36,1) both; }
        .ale-carousel-saida-esquerda { animation: ale-sai-esquerda 680ms cubic-bezier(.4,0,.2,1) both; }
        .ale-carousel-saida-direita { animation: ale-sai-direita 680ms cubic-bezier(.4,0,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .ale-carousel-entrada-direita, .ale-carousel-entrada-esquerda, .ale-carousel-saida-esquerda, .ale-carousel-saida-direita { animation: none !important; } }
      `}</style>
    </div>
  );
}
