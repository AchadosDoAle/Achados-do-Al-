import { Cupom } from "@/lib/types";
import { cupomExpirado } from "@/lib/coupons-repo";
import BotaoNomeCupom from "./BotaoNomeCupom";
import BotaoCompartilharCupom from "./BotaoCompartilharCupom";

export default function CupomCard({ cupom }: { cupom: Cupom }) {
  const expirado = cupomExpirado(cupom);

  return (
    <div
      className={`relative overflow-hidden rounded-xl2 bg-card p-4 ring-1 ring-white/5 animar-entrada transition-transform duration-200 hover:-translate-y-1 ${
        expirado ? "grayscale" : ""
      }`}
    >
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

      {cupom.descricao && (
        <p className="mt-1 whitespace-pre-wrap text-xs text-text-muted">
          {cupom.descricao}
        </p>
      )}

      {cupom.observacoes && (
        <p className="mt-2 whitespace-pre-wrap text-[11px] italic text-text-muted/70">
          📋 {cupom.observacoes}
        </p>
      )}

      {cupom.validade && (
        <p className="mt-2 text-xs text-text-muted">
          {expirado ? "Expirou em " : "Válido até "}
          {new Date(cupom.validade).toLocaleDateString("pt-BR")}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <BotaoCompartilharCupom cupom={cupom} />

        {!expirado && cupom.linkProdutos && /^https?:\/\//i.test(cupom.linkProdutos.trim()) && (
          <a
            href={cupom.linkProdutos}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="block flex-1 rounded-lg bg-gold py-2 text-center text-sm font-semibold text-bg"
          >
            Ver produtos com esse cupom
          </a>
        )}
      </div>
    </div>
  );
}
