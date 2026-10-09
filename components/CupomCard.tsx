import { Cupom } from "@/lib/types";
import { cupomExpirado } from "@/lib/coupons-repo";
import BotaoNomeCupom from "./BotaoNomeCupom";
import BotaoCompartilharCupom from "./BotaoCompartilharCupom";
import TermosCupom from "./TermosCupom";
import { formatarDataPublicacao } from "@/lib/datas";

export default function CupomCard({ cupom }: { cupom: Cupom }) {
  const expirado = cupomExpirado(cupom);

  return (
    /* Entrada da página e hover ficam em elementos diferentes para não
       reiniciar a animação de fade/slide ao passar o mouse. */
    <div className="animar-entrada">
      <div
        className={`relative overflow-hidden rounded-xl2 bg-card p-4 ring-1 ring-white/5 ${
          cupom.relampago && !expirado ? "coupon-flash-card" : ""
        } ${expirado ? "grayscale" : ""}`}
      >
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

      <p className="text-xs font-medium text-text-muted">🏪 {cupom.loja}</p>

      {expirado ? (
        <p
          className="mt-1 font-display text-lg font-extrabold tracking-wide"
          style={{ color: cupom.corLoja }}
        >
          CUPOM {cupom.nomeCupom}
        </p>
      ) : (
        <BotaoNomeCupom
          nomeCupom={cupom.nomeCupom}
          cor={cupom.corLoja}
          link={cupom.linkProdutos}
        />
      )}

      {/* "Valor do cupom" (texto livre) tem prioridade; se não tiver,
          usa a porcentagem simples. */}
      {cupom.valorCupom ? (
        <p className="mt-1 text-xl font-bold text-text">{cupom.valorCupom}</p>
      ) : (
        cupom.descontoPercentual != null && (
          <p className="mt-1 text-2xl font-bold text-text">
            {cupom.descontoPercentual}% OFF
          </p>
        )
      )}

      {cupom.validade && (
        <p className="mt-2 text-xs text-text-muted">
          {expirado ? "Expirou em " : "Válido até "}
          {new Date(cupom.validade).toLocaleDateString("pt-BR")}
        </p>
      )}

      {cupom.publicadoEm && (
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.07em] text-text-muted/50">
          CUPOM POSTADO EM: {formatarDataPublicacao(cupom.publicadoEm)}
        </p>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
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
            className="block rounded-lg bg-gold py-2 text-center text-sm font-semibold text-bg sm:col-span-2"
          >
            Ver produtos com esse cupom
          </a>
        )}
      </div>
    </div>
    </div>
  );
}
