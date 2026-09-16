import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[rgba(245,185,66,.22)] bg-[#07111f]/95 backdrop-blur">
      <div className="site-shell flex min-h-20 items-center gap-6 py-3 max-md:flex-wrap max-md:gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5b942] text-2xl text-[#07111f]">%</span>
          <span>Achados <span className="text-[#f5b942]">do Alê</span></span>
        </Link>
        <div className="order-3 flex w-full items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-[#07111f] md:order-none md:flex-1">
          <span aria-hidden>⌕</span>
          <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Buscar produtos, lojas, cupons..." aria-label="Buscar" />
        </div>
        <Link href="/#ofertas" className="hidden rounded-full border border-[#f5b942]/40 bg-[#f5b942] px-5 py-3 text-sm font-bold text-[#07111f] transition hover:bg-[#ffd66b] md:block">
          ✦ Achadinhos de hoje
        </Link>
      </div>
    </header>
  );
}
