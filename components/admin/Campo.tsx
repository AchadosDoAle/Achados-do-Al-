export function Campo({
  rotulo,
  obrigatorio,
  erro,
  children,
}: {
  rotulo: string;
  obrigatorio?: boolean;
  erro?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">
        {rotulo}
        {obrigatorio && <span className="text-accent"> *</span>}
      </span>
      <div className="mt-1">{children}</div>
      {erro && <span className="mt-1 block text-xs text-accent-dark">{erro}</span>}
    </label>
  );
}

export const classeInput =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand";
