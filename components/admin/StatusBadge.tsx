import { STATUS_LABEL, StatusOferta } from "@/lib/types";

const CORES: Record<StatusOferta, string> = {
  rascunho: "bg-ink/10 text-ink/60",
  pronta_para_revisar: "bg-discount/20 text-[#5B4300]",
  aprovada: "bg-trust/10 text-trust",
  publicada: "bg-brand/10 text-brand",
  enviada_whatsapp: "bg-trust/10 text-trust",
  agendada: "bg-accent/10 text-accent-dark",
  expirada: "bg-ink/10 text-ink/40",
  arquivada: "bg-ink/10 text-ink/40",
};

export default function StatusBadge({ status }: { status: StatusOferta }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CORES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
