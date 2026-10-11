import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "App para iOS — Em breve",
  description: "A versão do Achados do Alê para iPhone está em desenvolvimento.",
  robots: { index: false, follow: true },
};

export default function AplicativoIOSPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071626] px-4 py-12 text-white sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(32,74,107,0.45),transparent_65%)]" />
      <section aria-labelledby="titulo-ios" className="relative mx-auto w-full max-w-[820px] text-center">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-[#c8d8e8] transition-colors hover:border-gold/50 hover:text-gold"
        >
          <span aria-hidden="true">←</span> Voltar ao Achados do Alê
        </Link>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.23em] text-gold">Aplicativo para iPhone</p>
        <h1 id="titulo-ios" className="font-display text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
          EM BREVE!
        </h1>

        <div className="mx-auto mt-7 max-w-[720px] overflow-hidden rounded-[24px] border border-[#3a5672]/50 bg-[#0c2034] shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
          <Image
            src="/ios-em-breve-construcao.gif"
            alt="Animação de um prédio em construção com um guindaste em movimento"
            width={720}
            height={405}
            unoptimized
            priority
            className="h-auto w-full"
          />
        </div>
        <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-[#b7cbe0]">
          Estamos preparando a versão do Achados do Alê para iOS. Em breve, também no seu iPhone.
        </p>
      </section>
    </main>
  );
}
