import { Cupom } from "@/lib/types";
import { cupomExpirado } from "@/lib/coupons-repo";
import BotaoNomeCupom from "./BotaoNomeCupom";
import BotaoCompartilharCupom from "./BotaoCompartilharCupom";
import TermosCupom from "./TermosCupom";
import { formatarDataPublicacao } from "@/lib/datas";

function formatarDataHoraValidade(valor?: string) {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function minutosAteValor(valor?: string) {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return Math.round((data.getTime() - Date.now()) / 60000);
}

export default function CupomCard({ cupom }: { cupom: Cupom }) {
  const expirado = cupomExpirado(cupom);
  const minutosAteVencer = minutosAteValor(cupom.validade);
  const pertoDeVencer = !expirado && minutosAteVencer != null && minutosAteVencer > 0 && minutosAteVencer <= 60;
  const validadeFormatada = formatarDataHoraValidade(cupom.validade);

  return (
    <div
      className={`coupon-ticket-card relative overflow-hidden rounded-[26px] bg-card p-4 ring-1 ring-white/5 animar-entrada ${
        cupom.relampago && !expirado ? "coupon-flash-card" : ""
      } ${expirado ? "grayscale" : ""}`}
    >
      <div className="coupon-ticket-surface relative rounded-[22px] border border-white/8 bg-white/[0.03] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.20)]">
        {cupom.relampago && !expirado && (
          <span className="absolute right-3 top-3 z-[2] rounded-full bg-amber-400/15 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-amber-300 ring-1 ring-amber-300/20">
            ⚡ Relâmpago
          </span>
        )}

        {expirado && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="w-40 -rotate-45 bg-danger py-1 text-center text-xs font-bold tracking-widest text-white shadow-lg">
              ESGOTADO
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">🏪 {cupom.loja}</p>
            {expirado ? (
              <p className="mt-1 font-display text-lg font-extrabold tracking-wide text-white">
                CUPOM <span style={{ color: cupom.corLoja }}>{cupom.nomeCupom}</span>
              </p>
            ) : (
              <BotaoNomeCupom nomeCupom={cupom.nomeCupom} cor={cupom.corLoja} link={cupom.linkProdutos} />
            )}
          </div>
        </div>

        <div className="coupon-ticket-divider my-4" aria-hidden="true" />

        <div className="grid gap-3 md:grid-cols-[1.1fr_auto] md:items-start">
          <div>
            {cupom.valorCupom ? (
              <p className="text-xl font-black text-text">{cupom.valorCupom}</p>
            ) : (
              cupom.descontoPercentual != null && (
                <p className="text-2xl font-black text-text">{cupom.descontoPercentual}% OFF</p>
              )
            )}

            {cupom.validade && validadeFormatada && (
              <p className="mt-2 text-xs text-text-muted">
                {expirado ? "Expirou em " : "Válido até "}
                {validadeFormatada}
              </p>
            )}

            {pertoDeVencer && (
              <p className="mt-2 text-sm font-semibold text-orange-400">
                ⏰ Este cupom vai vencer em menos de 1 hora!
              </p>
            )}

            {cupom.publicadoEm && (
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.07em] text-text-muted/55">
                CUPOM POSTADO EM: {formatarDataPublicacao(cupom.publicadoEm)}
              </p>
            )}
          </div>

          <div className="coupon-ticket-stamp inline-flex min-w-[108px] items-center justify-center self-start rounded-2xl border border-dashed border-white/12 bg-white/[0.04] px-4 py-3 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Desconto</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <BotaoCompartilharCupom cupom={cupom} />
          <TermosCupom
            nomeCupom={cupom.nomeCupom}
            descricao={cupom.descricao}
            observacoes={cupom.observacoes}
          />

          {!expirado && cupom.linkProdutos && /^https?:\/\//i.test(cupom.linkProdutos.trim()) && (
            <a
              href={cupom.linkProdutos}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="block rounded-xl bg-gold py-2 text-center text-sm font-semibold text-bg transition-transform duration-150 hover:-translate-y-0.5 sm:col-span-2"
            >
              Ver produtos com esse cupom
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
