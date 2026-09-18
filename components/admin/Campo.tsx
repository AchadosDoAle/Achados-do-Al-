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
      <span className="text-sm font-semibold text-ink">
        {rotulo}
        {obrigatorio && <span className="text-accent"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {erro && (
        <span className="mt-1.5 block text-xs font-medium text-accent-dark">
          {erro}
        </span>
      )}
    </label>
  );
}

export const classeInput =
  "w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-brand focus:ring-4 focus:ring-brand/10";
