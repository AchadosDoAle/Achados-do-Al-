import { Cupom } from "@/lib/types";
import { cupomExpirado } from "@/lib/coupons-repo";

export default function CupomCard({ cupom }: { cupom: Cupom }) {
  const expirado = cupomExpirado(cupom);

  return (
    <div
      className={`relative overflow-hidden rounded-xl2 bg-card p-4 ring-1 ring-white/5 ${
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

      <p
        className="mt-1 font-display text-lg font-extrabold tracking-wide"
        style={{ color: cupom.corLoja }}
      >
        CUPOM {cupom.nomeCupom}
      </p>

      {cupom.descontoPercentual != null && (
        <p className="mt-1 text-2xl font-bold text-text">
          {cupom.descontoPercentual}% OFF
        </p>
      )}

      {cupom.validade && (
        <p className="mt-2 text-xs text-text-muted">
          {expirado ? "Expirou em " : "Válido até "}
          {new Date(cupom.validade).toLocaleDateString("pt-BR")}
        </p>
      )}

      {!expirado && cupom.linkProdutos && (
        <a
          href={cupom.linkProdutos}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="mt-3 block rounded-lg bg-gold py-2 text-center text-sm font-semibold text-bg"
        >
          Ver produtos com esse cupom
        </a>
      )}
    </div>
  );
}
