import type { Cupom } from "@/lib/types";
import { cupomExpirado } from "@/lib/coupons-repo";
import BotaoNomeCupom from "./BotaoNomeCupom";
import BotaoCompartilharCupom from "./BotaoCompartilharCupom";
import TermosCupom from "./TermosCupom";
import AvisoCupomVencendo from "./AvisoCupomVencendo";
import { formatarDataPublicacao } from "@/lib/datas";

function formatarValidade(valor: string) {
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

export default function CupomCard({ cupom }: { cupom: Cupom }) {
  const expirado = cupomExpirado(cupom);
  const ativoRelampago = Boolean(cupom.relampago && !expirado);
  const beneficio =
    cupom.valorCupom?.trim() ||
    (cupom.descontoPercentual != null ? `${cupom.descontoPercentual}% OFF` : "Confira as condições");

  // Entrada na montagem e hover são de elementos diferentes.
  return (
    <div className="animar-entrada coupon-voucher-entrance">
      <article
        className={`coupon-voucher ${ativoRelampago ? "coupon-voucher-flash" : "coupon-voucher-regular"} ${
          expirado ? "coupon-voucher-expired" : ""
        }`}
      >
        <header className="coupon-voucher-head">
          <div className="coupon-voucher-topline">
            <span className="coupon-voucher-store" title={cupom.loja}>
              {cupom.loja}
            </span>
            {ativoRelampago && (
              <span className="coupon-voucher-flash-label">⚡ Relâmpago</span>
            )}
          </div>

          {expirado ? (
            <p className="coupon-voucher-code font-display">
              <span className="coupon-voucher-prefix">CUPOM </span>
              <span style={{ color: cupom.corLoja }}>{cupom.nomeCupom}</span>
            </p>
          ) : (
            <BotaoNomeCupom
              nomeCupom={cupom.nomeCupom}
              cor={cupom.corLoja}
              link={cupom.linkProdutos}
            />
          )}
          {expirado && <span className="coupon-voucher-expired-label">ESGOTADO</span>}
        </header>

        <div className="coupon-voucher-perforation" aria-hidden="true" />

        <div className="coupon-voucher-content">
          <p className="coupon-voucher-benefit-label">Benefício</p>
          <p className="coupon-voucher-benefit">{beneficio}</p>

          <div className="coupon-voucher-details">
            {cupom.validade ? (
              <p>
                {expirado ? "Expirou em " : "Válido até "}
                <strong>{formatarValidade(cupom.validade)}</strong>
              </p>
            ) : (
              <p>Sem data de validade informada</p>
            )}

            {/* Relógio client-side: aviso muda sozinho quando faltar 1 hora. */}
            {!expirado && <AvisoCupomVencendo validade={cupom.validade} />}

            {cupom.publicadoEm && (
              <p className="coupon-voucher-posted">
                CUPOM POSTADO EM: {formatarDataPublicacao(cupom.publicadoEm)}
              </p>
            )}
          </div>
        </div>

        <footer className="coupon-voucher-actions">
          <BotaoCompartilharCupom cupom={cupom} />
          <TermosCupom
            nomeCupom={cupom.nomeCupom}
            descricao={cupom.descricao}
            observacoes={cupom.observacoes}
          />
          {!expirado &&
            cupom.linkProdutos &&
            /^https?:\/\//i.test(cupom.linkProdutos.trim()) && (
              <a
                href={cupom.linkProdutos}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="coupon-voucher-products sm:col-span-2"
              >
                Ver produtos com esse cupom
              </a>
            )}
        </footer>
      </article>
    </div>
  );
}
