export default function Hero() {
  return (
    <section className="site-shell py-8 md:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-[#f5b942]/25 bg-gradient-to-br from-[#102b48] via-[#0b1a2d] to-[#07111f] px-6 py-10 shadow-2xl md:px-12 md:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[.25em] text-[#f5b942]">Bem-vindo ao Achados do Alê</p>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">Achadinhos que <span className="text-[#f5b942]">valem a pena</span></h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">Ofertas, cupons e oportunidades selecionadas para você economizar de verdade.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
            <span className="rounded-full border border-[#f5b942]/30 px-4 py-2">✓ Ofertas conferidas</span>
            <span className="rounded-full border border-[#f5b942]/30 px-4 py-2">⌑ Cupons exclusivos</span>
            <span className="rounded-full border border-[#f5b942]/30 px-4 py-2">⚡ Economia real</span>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#f5b942]/10 blur-3xl" />
      </div>
    </section>
  );
}
