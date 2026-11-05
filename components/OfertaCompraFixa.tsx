"use client";

function formatar(valor?: number) {
  return valor == null ? "Ver preço" : valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function OfertaCompraFixa({ href, expirada, preco }: { href: string; expirada: boolean; preco?: number }) {
  if (expirada) return null;
  return (
    <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-white/10 bg-bg/95 px-3 py-2.5 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Melhor preço</p>
          <p className="truncate text-lg font-extrabold text-trust">{formatar(preco)}</p>
        </div>
        <a href={href} target="_blank" rel="noopener noreferrer nofollow sponsored" className="shrink-0 rounded-xl bg-gold px-3 py-3 text-center text-xs font-extrabold text-bg sm:px-5 sm:text-sm">
          Acessar promoção
        </a>
      </div>
    </div>
  );
}
