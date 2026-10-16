"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Oferta } from "@/lib/types";

const INTERVALO_SLIDE = 7000;
const MAXIMO_CARDS = 5;

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

  // A cada 7 segundos avançamos um card. Pausa durante interação e se a aba não está visível.
  useEffect(() => {
    if (total < 2 || pausado) return;
    const temporizador = window.setInterval(() => {
      if (document.visibilityState !== "hidden") setIndice((anterior) => anterior + 1);
    }, INTERVALO_SLIDE);
    return () => window.clearInterval(temporizador);
  }, [total, pausado]);

  const proximo = () => setIndice((anterior) => (total ? (anterior + 1) % total : 0));
  const anterior = () => setIndice((anterior) => (total ? (anterior - 1 + total) % total : 0));

  const vencimentoDestaque = oferta && mostrandoDestaques ? timestampBrasilia(oferta.destaqueAte) : NaN;
  const vencimentoRecente = oferta && !mostrandoDestaques ? fimDaValidade(oferta.validadePromocao) : NaN;
  const vencimento = mostrandoDestaques ? vencimentoDestaque : vencimentoRecente;
  const temCronometro = Number.isFinite(vencimento) && (agora === 0 || vencimento > agora);
  const preco = oferta?.precoPix ?? oferta?.precoAtual;

  return (
    <div
      className="relative w-full min-w-0"
      aria-label="Carrossel de ofertas em destaque"
      aria-roledescription="carrossel"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) setPausado(false);
      }}
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold/15 via-transparent to-trust/10 blur-2xl" aria-hidden="true" />
      <div className="relative rounded-[1.75rem] border border-gold/20 bg-[#0A1727] p-4 shadow-2xl shadow-black/30 sm:p-5 lg:p-6">
        {oferta ? (
          <>
            <div key={oferta.id} className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-center lg:gap-6">
              <Link
                href={`/oferta/${oferta.slug}`}
                className="group relative flex min-h-[210px] items-center justify-center overflow-hidden rounded-2xl bg-white p-4 sm:min-h-[285px] lg:min-h-[320px]"
                aria-label={`Ver oferta: ${oferta.titulo}`}
              >
                {oferta.imagemPrincipal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={oferta.imagemPrincipal}
                    alt={oferta.titulo}
                    loading={posicao === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-[200px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.04] sm:h-[260px] lg:h-[310px]"
                  />
                ) : (
                  <span className="text-6xl" aria-hidden="true">🛍️</span>
                )}
              </Link>

              <div className="flex min-w-0 flex-col items-start py-1">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-gold sm:text-base">
                  🔥 OFERTA IMPERDÍVEL
                </p>
                {temCronometro ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-text-muted">Corra, dura apenas</span>
                    <span className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 font-mono text-xl font-bold tabular-nums tracking-wider text-gold-light" role="timer" aria-label="Tempo restante da oferta">
                      {agora ? textoCronometro(vencimento - agora) : "--:--:--"}
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-text-muted">{mostrandoDestaques ? "Atualizando as ofertas disponíveis..." : "Um dos achados mais recentes do site"}</p>
                )}
                <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.12em] text-gold-light">{oferta.loja}</p>
                <h2 className="mt-1 line-clamp-3 text-lg font-bold leading-snug text-text lg:text-xl">{oferta.titulo}</h2>

                <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  {oferta.precoAntigo != null && (
                    <span className="text-sm text-text-muted line-through">{precoEmReais(oferta.precoAntigo)}</span>
                  )}
                  {preco != null ? (
                    <span className="font-display text-3xl font-black leading-none text-trust lg:text-4xl">
                      {precoEmReais(preco)}
                      {oferta.precoPix != null && <span className="ml-1 text-xs font-semibold text-trust">no Pix</span>}
                    </span>
                  ) : (
                    <span className="text-base font-semibold text-text">Consulte o preço</span>
                  )}
                </div>

                {oferta.cupom && (
                  <div className="mt-4 max-w-full rounded-lg border border-dashed border-gold/40 bg-gold/10 px-3 py-2 text-xs font-bold text-gold-light break-words">
                    CUPOM DE DESCONTO: {oferta.cupom}
                  </div>
                )}

                <Link href={`/oferta/${oferta.slug}`} className="mt-5 inline-flex items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-bg transition hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                  Aproveitar oferta <span className="ml-2" aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {total > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <button type="button" onClick={anterior} aria-label="Oferta anterior" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xl font-bold text-text transition hover:bg-white/15">‹</button>
                <div className="flex flex-wrap items-center justify-center gap-2" aria-label={`${posicao + 1} de ${total} ofertas`}>
                  {slides.map((item, i) => (
                    <button key={item.id} type="button" onClick={() => setIndice(i)} aria-label={`Ver oferta ${i + 1}`} aria-current={posicao === i ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${posicao === i ? "w-7 bg-gold" : "w-2.5 bg-white/35 hover:bg-white/60"}`} />
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
    </div>
  );
}
