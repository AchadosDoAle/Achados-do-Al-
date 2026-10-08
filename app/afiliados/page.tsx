import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Transparência sobre Links de Afiliados",
  description:
    "Entenda como funcionam os programas de afiliados e como o Achado do Alê pode receber comissões por compras elegíveis realizadas em lojas parceiras.",
  alternates: { canonical: "/afiliados" },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-6">
      <h2 className="font-display text-lg font-bold text-text sm:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-8 text-text-muted">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <article className="mx-auto max-w-4xl rounded-xl2 bg-card p-5 ring-1 ring-white/5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            Transparência comercial
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            Transparência sobre Links de Afiliados
          </h1>
          <p className="mt-4 text-sm leading-8 text-text-muted">
            O Achado do Alê reúne promoções, cupons e oportunidades de compra.
            Alguns links apresentados no site e, quando disponibilizados, nos
            aplicativos Android e iOS são <strong className="text-text">links de afiliados</strong>.
            A seguir, explicamos como essas indicações funcionam e de que modo
            elas podem contribuir para a manutenção do projeto.
          </p>

          <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm leading-7 text-text-muted">
            <strong className="text-text">Em resumo:</strong> quando você acessa
            uma loja por um link de afiliado e faz uma compra que cumpre as regras
            do programa, o Achado do Alê pode receber uma comissão pela indicação.
            <strong className="text-text"> Nós não cobramos uma taxa adicional de indicação de você.</strong>
          </div>

          <div className="mt-8 space-y-8">
            <Section title="1. O que é um programa de afiliados?">
              <p>
                Um programa de afiliados é uma parceria comercial em que uma loja
                ou plataforma permite que outras pessoas e projetos divulguem
                produtos e serviços por meio de links de indicação. Esses links
                possuem informações que ajudam a identificar a origem do acesso
                ou de uma compra.
              </p>
              <p>
                Quando uma compra atende aos critérios do programa — como prazo
                de atribuição, categoria do produto e demais condições comerciais —
                a empresa parceira pode remunerar o afiliado com uma comissão.
                A comissão não é garantida em toda visita ou compra.
              </p>
            </Section>

            <Section title="2. Como funciona uma indicação pelo Achado do Alê?">
              <p>
                Ao clicar em uma oferta, cupom ou botão para visitar uma loja,
                você pode passar por um link do próprio Achado do Alê e, em
                seguida, ser redirecionado ao endereço da loja. A plataforma
                de afiliados pode reconhecer essa indicação por identificadores
                na URL ou por outros mecanismos de atribuição utilizados pela
                loja, observadas as regras de privacidade aplicáveis.
              </p>
              <p>
                Se você concluir uma compra elegível, o Achado do Alê poderá
                receber uma comissão da loja ou da plataforma responsável.
                A navegação e a compra são decisões suas e não criam obrigação
                de adquirir qualquer produto.
              </p>
            </Section>

            <Section title="3. O usuário paga mais por isso?">
              <p>
                <strong className="text-text">O Achado do Alê não cobra do usuário uma taxa adicional por acessar links de afiliados.</strong>
                Os valores dos produtos, descontos, cupons, frete e condições
                de pagamento são definidos pelas próprias lojas. Esses valores
                podem mudar sem aviso prévio e devem ser conferidos na loja
                antes de finalizar o pedido.
              </p>
              <p>
                Nossa eventual comissão é uma remuneração pela indicação e não
                constitui uma cobrança direta do Achado do Alê ao comprador.
              </p>
            </Section>

            <Section title="4. Quem vende, entrega e presta atendimento?">
              <p>
                O Achado do Alê é uma plataforma de divulgação e indicação
                comercial. Em regra, não é o vendedor dos produtos anunciados.
                A compra, o pagamento, a emissão de documentos fiscais, o envio,
                o estoque, a garantia e o atendimento após a venda são realizados
                pelas lojas e pelos fornecedores envolvidos, conforme a
                legislação aplicável e suas responsabilidades legais.
              </p>
              <p>
                Antes de comprar, confira na loja o preço final, a disponibilidade,
                as condições do cupom, o prazo de entrega e a identificação do vendedor.
              </p>
            </Section>

            <Section title="5. Por que utilizamos links de afiliados?">
              <p>
                As comissões, quando recebidas, ajudam a custear a operação,
                a infraestrutura, a manutenção e o desenvolvimento do Achado do
                Alê. Dessa forma, o projeto pode continuar reunindo ofertas e
                disponibilizando cupons para consulta gratuita.
              </p>
              <p>
                A existência de um vínculo de afiliação é informada de forma
                transparente. Uma oferta divulgada não representa promessa
                de disponibilidade, economia garantida ou manutenção de preço.
              </p>
            </Section>

            <Section title="6. Rastreamento de links e dados pessoais">
              <p>
                Lojas e plataformas de afiliados podem usar parâmetros de URL,
                cookies ou tecnologias semelhantes para atribuir uma indicação.
                O tratamento de dados feito por essas empresas segue suas
                políticas e responsabilidades próprias.
              </p>
              <p>
                Para saber como o Achado do Alê trata dados pessoais e quais
                escolhas você pode fazer, consulte nossa
                <Link href="/privacidade" className="font-semibold text-gold hover:underline"> Política de Privacidade</Link>.
                A ciência sobre relações de afiliação não substitui consentimento
                específico quando ele for exigido por lei.
              </p>
            </Section>

            <Section title="7. Ciência e concordância com estas condições">
              <p>
                <strong className="text-text">Ao acessar e utilizar as promoções,
                ofertas e cupons do Achado do Alê, inclusive por meio de links
                para lojas externas, o usuário declara estar ciente de que
                essas indicações podem integrar programas de afiliados e gerar
                comissões para o projeto em compras elegíveis.</strong>
              </p>
              <p>
                Ao optar por acessar uma promoção ou utilizar seus links,
                o usuário declara concordar com a possibilidade de indicação
                comercial e com as informações de afiliação aqui apresentadas.
                Isso não elimina direitos assegurados
                ao consumidor nem substitui eventuais consentimentos que a
                legislação exija para finalidades específicas.
              </p>
            </Section>

            <Section title="8. Abrangência e atualização">
              <p>
                Estas informações se aplicam ao site
                <strong className="text-text"> achadosdoale.com</strong> e, quando
                estiverem disponíveis ao público, aos aplicativos oficiais
                Achado do Alê para Android e iOS. O conteúdo poderá ser revisto
                para acompanhar mudanças na plataforma ou nas parcerias comerciais.
              </p>
            </Section>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-bg-secondary/50 p-4 text-sm leading-7 text-text-muted">
            Conheça também os <Link href="/termos" className="font-semibold text-gold hover:underline">Termos de Uso</Link> e
            a <Link href="/privacidade" className="font-semibold text-gold hover:underline">Política de Privacidade</Link>.
            São documentos separados, com finalidades diferentes.
          </div>
        </article>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
