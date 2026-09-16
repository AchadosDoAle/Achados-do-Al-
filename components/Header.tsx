export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-brand px-4 pb-4 pt-5 text-white">
      <div className="flex items-center justify-between">
        <span className="font-display text-xl font-bold tracking-tight">
          Achado do Alê
        </span>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          Achadinhos de hoje
        </span>
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-xl2 bg-white px-4 py-3 text-ink">
        <span aria-hidden="true">🔎</span>
        <input
          type="search"
          placeholder="Buscar produto, loja ou cupom"
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/50"
        />
      </label>
    </header>
  );
}
