import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Sobre o Achado do Alê | Nossa história",
  description:
    "Conheça a história do Achado do Alê, projeto independente criado por Alexandre do Nascimento em agosto de 2026, e os próximos passos para Android e iOS.",
  alternates: { canonical: "/sobre" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-xl2 bg-card p-5 ring-1 ring-white/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            Conheça nossa história
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            Sobre o Achado do Alê
          </h1>
          <p className="mt-4 text-base leading-8 text-text-muted">
            O <strong className="text-text">Achado do Alê</strong> reúne promoções,
            cupons de desconto e oportunidades de compra de diferentes lojas em
            um único lugar. Nosso objetivo é facilitar a descoberta, a consulta
            e a comparação de ofertas, com uma experiência simples, organizada
            e acessível.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Início do projeto</p>
              <p className="mt-1 font-display text-lg font-bold text-gold">Agosto de 2026</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Desenvolvimento</p>
              <p className="mt-1 font-display text-lg font-bold text-text">Independente</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-bg-secondary/50 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Próximos passos</p>
              <p className="mt-1 font-display text-lg font-bold text-text">App Android</p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-8 text-text-muted">
            <section className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-bold text-text">Como surgiu a ideia</h2>
              <p className="mt-3">
                O projeto nasceu da percepção de que havia espaço para uma
                comunidade de ofertas e afiliados mais robusta, prática e bem
                estruturada. Em vez de apenas compartilhar promoções de forma
                dispersa, a proposta foi construir uma plataforma capaz de
                concentrar os melhores achados, organizar cupons e tornar a
                experiência de quem busca economizar mais ágil.
              </p>
              <p className="mt-3">
                Foi assim que, em <strong className="text-text">agosto de 2026</strong>,
                a ideia começou a se transformar no site Achado do Alê.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-bold text-text">Quem está por trás</h2>
              <p className="mt-3">
                O Achado do Alê foi idealizado e desenvolvido por
                <strong className="text-text"> Alexandre do Nascimento</strong>,
                brasileiro, administrador, com MBA em Finanças Corporativas e
                Mercado Financeiro, servidor público municipal concursado e
                atualmente pós-graduando em Inteligência Artificial.
              </p>
              <p className="mt-3">
                Unindo o interesse por tecnologia, inovação e oportunidades de
                negócio digital, Alexandre decidiu tirar a ideia do papel e
                desenvolver uma solução própria para reunir promoções e cupons
                em uma plataforma mais completa.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-bold text-text">Um projeto construído de forma independente</h2>
              <p className="mt-3">
                O desenvolvimento do site foi realizado de forma individual,
                com o apoio de ferramentas de inteligência artificial nas
                etapas de planejamento, programação, revisão e aprimoramento
                da plataforma.
              </p>
              <p className="mt-3">
                Durante essa jornada, amigos e colegas de trabalho contribuíram
                com opiniões, sugestões e percepções sobre a experiência de uso.
                Essas contribuições ajudaram a orientar melhorias, enquanto
                a concepção, as decisões e a condução do projeto permaneceram
                sob responsabilidade de seu criador.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-bold text-text">Do site aos aplicativos</h2>
              <p className="mt-3">
                O trabalho não parou na versão web. O projeto também avançou
                para o desenvolvimento de aplicativos para
                <strong className="text-text"> Android e iOS</strong>, pensados
                para facilitar o acesso às promoções e aos cupons pelo celular.
              </p>
              <p className="mt-3">
                Os aplicativos ainda não foram publicados. O lançamento do
                <strong className="text-text"> aplicativo Android está previsto para breve</strong>,
                enquanto a disponibilização da versão iOS será comunicada
                quando houver novidades.
              </p>
            </section>

            <section className="border-t border-white/10 pt-6">
              <h2 className="font-display text-xl font-bold text-text">Nosso compromisso</h2>
              <p className="mt-3">
                Queremos reunir ofertas de maneira clara e organizada, para
                que cada pessoa possa avaliar as oportunidades e decidir
                onde comprar. Os preços, estoques, prazos, fretes e demais
                condições são definidos pelas respectivas lojas e podem
                mudar a qualquer momento.
              </p>
              <p className="mt-3">
                Alguns links podem fazer parte de programas de afiliados.
                Explicamos com transparência como funcionam essas parcerias
                em uma página específica, separada da Política de Privacidade.
              </p>
              <Link
                href="/afiliados"
                className="mt-4 inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
              >
                Entenda como funcionam os links de afiliados →
              </Link>
            </section>
          </div>
        </article>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
