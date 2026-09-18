import Link from "next/link";
import OfferForm from "@/components/admin/OfferForm";

export default function NovaOfertaPage() {
  return (
    <div>
      <section className="mb-5 rounded-[24px] border border-brand/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ink/45">
              <Link href="/admin/ofertas" className="transition hover:text-brand">Ofertas</Link>
              <span>/</span>
              <span>Nova oferta</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Nova oferta</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink/55">
              Cadastre o produto por etapas. No computador, os blocos ficam em duas colunas; no celular, eles se reorganizam automaticamente.
            </p>
          </div>

          <Link
            href="/admin/ofertas"
            className="inline-flex w-fit items-center rounded-xl border border-ink/10 bg-cream px-4 py-2 text-sm font-semibold text-ink/70 transition hover:border-brand/25 hover:text-brand"
          >
            ← Voltar para ofertas
          </Link>
        </div>
      </section>

      <OfferForm />
    </div>
  );
}
