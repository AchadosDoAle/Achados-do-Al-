export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-brand px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 font-display text-lg font-bold tracking-tight">
          <span aria-hidden="true">🏷️</span>
          Achado do Alê
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold">
          <span aria-hidden="true">🔥</span>
          Achadinhos de hoje
        </span>
      </div>

      <label className="mt-3 flex items-center gap-2 rounded-xl2 bg-white px-4 py-2.5 text-ink">
        <span aria-hidden="true">🔎</span>
        <input
          type="search"
          placeholder="Buscar produtos, lojas, cupons..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink/50"
        />
      </label>
    </header>
  );
}
