import CupomForm from "@/components/admin/CupomForm";

export default function NovoCupomPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-bold text-ink">Novo cupom</h1>
        <p className="mt-1 text-sm text-ink/55">
          Agora com data e horário separados para evitar perda da validade ao editar.
        </p>
      </div>
      <CupomForm />
    </div>
  );
}
