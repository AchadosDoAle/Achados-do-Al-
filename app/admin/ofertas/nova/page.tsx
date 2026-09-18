import OfferForm from "@/components/admin/OfferForm";

export default function NovaOfertaPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink">Nova oferta</h1>
        <p className="mt-1 text-sm text-ink/55">
          Preencha os blocos abaixo. No computador, o formulário usa duas colunas para ganhar espaço.
        </p>
      </div>
      <OfferForm />
    </div>
  );
}
