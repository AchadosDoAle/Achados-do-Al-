import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Termos de Uso | Achado do Alê",
  description:
    "Condições de uso do site Achado do Alê, incluindo divulgação de ofertas, cupons, redirecionamentos, programas de afiliados e direitos dos usuários.",
  alternates: { canonical: "/termos" },
};

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-6">
      <h2 className="font-display text-lg font-bold text-text sm:text-xl">
        {titulo}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-8 text-text-muted">
        {children}
      </div>
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
            Informações importantes ao usuário
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            Termos de Uso
          </h1>
          <p className="mt-2 text-xs text-text-muted">
            Última atualização: 07/10/2026
          </p>
          <p className="mt-5 text-sm leading-8 text-text-muted">
            Estes Termos explicam as regras de utilização do site
            <strong className="text-text"> achadosdoale.com</strong>, mantido
            pelo projeto Achado do Alê, e descrevem como funcionam nossas
            divulgações de promoções, cupons e redirecionamentos para outras lojas.
            Leia também a <Link className="font-semibold text-gold hover:underline" href="/afiliados">Transparência sobre Links de Afiliados</Link> e
            a <Link className="font-semibold text-gold hover:underline" href="/privacidade">Política de Privacidade</Link>,
            que são documentos separados.
          </p>

          <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm leading-7 text-text-muted">
            <strong className="text-text">Em resumo:</strong> o Achado do Alê
            organiza e divulga ofertas. Em regra, as compras são realizadas nas
            lojas de terceiros, que definem preços, estoque, pagamento,
            entrega e condições comerciais. Alguns links podem gerar comissões
            de afiliados ao projeto, sem cobrança de taxa de indicação ao usuário.
          </div>

          <div className="mt-8 space-y-8">
            <Secao titulo="1. Sobre o serviço">
              <p>
                O Achado do Alê reúne informações sobre produtos, preços,
                descontos, cupons e oportunidades de compra de diferentes
                vendedores. O conteúdo tem finalidade informativa e de
                divulgação comercial, podendo incluir links patrocinados ou
                de afiliados.
              </p>
              <p>
                A consulta das ofertas não garante disponibilidade, reserva
                de estoque, desconto efetivo ou conclusão de uma compra.
              </p>
            </Secao>

            <Secao titulo="2. Preços, cupons e disponibilidade">
              <p>
                Preços anunciados, percentuais de desconto, frete, validade,
                parcelamento, benefícios de programas de fidelidade e estoque
                podem mudar sem aviso prévio. Algumas promoções dependem de
                condições específicas, como forma de pagamento, região,
                assinatura, conta elegível, pedido mínimo ou uso de código.
              </p>
              <p>
                Antes de concluir a compra, confira <strong className="text-text">no site ou aplicativo oficial da loja</strong> o
                valor final e todas as condições aplicáveis. Em caso de
                divergência, o usuário deve considerar as informações
                apresentadas no ambiente de contratação da loja, sem prejuízo
                de seus direitos legais.
              </p>
            </Secao>

            <Secao titulo="3. Compras e responsabilidade dos vendedores">
              <p>
                O Achado do Alê normalmente não é o vendedor dos produtos
                anunciados e não processa o pagamento dessas compras. A
                identificação do vendedor, a cobrança, o envio, a emissão
                fiscal, o atendimento, a garantia, as trocas e devoluções
                seguem as condições da loja e a legislação aplicável.
              </p>
              <p>
                Nada nestes Termos limita ou exclui direitos assegurados aos
                consumidores pela legislação brasileira, nem afasta
                responsabilidades que sejam legalmente atribuídas a cada
                parte envolvida.
              </p>
            </Secao>

            <Secao titulo="4. Programas de afiliados e transparência comercial">
              <p>
                Alguns links de ofertas e cupons possuem identificadores de
                afiliados. Se uma compra atender aos critérios do programa,
                o Achado do Alê poderá receber uma comissão da loja ou da
                plataforma de afiliação. <strong className="text-text">O usuário não paga ao Achado do Alê
                uma taxa adicional por utilizar esses links.</strong>
              </p>
              <p>
                Ao optar por acessar esses links, você fica informado de que
                poderá haver uma indicação comercial. Para entender o
                funcionamento, as condições de atribuição e as práticas de
                transparência, consulte a página
                <Link className="font-semibold text-gold hover:underline" href="/afiliados"> Links de Afiliados</Link>.
                A simples navegação não substitui consentimentos específicos
                exigidos pela legislação de proteção de dados.
              </p>
            </Secao>

            <Secao titulo="5. Links e serviços de terceiros">
              <p>
                Ao selecionar uma promoção, você poderá passar por uma página
                intermediária do Achado do Alê e ser direcionado a um site ou
                aplicativo de terceiro. Esses ambientes possuem regras,
                políticas de privacidade, meios de pagamento e atendimento
                próprios. Recomendamos verificar o domínio e a identificação
                do vendedor antes de fornecer dados ou efetuar pagamentos.
              </p>
            </Secao>

            <Secao titulo="6. Uso adequado da plataforma">
              <p>
                O usuário se compromete a não empregar os serviços para
                fraudes, tentativas de invasão, exploração de falhas,
                distribuição de software malicioso ou atividades contrárias
                à lei. A consulta e o compartilhamento legítimo de ofertas
                são permitidos, respeitados direitos de terceiros.
              </p>
              <p>
                Recursos como busca, favoritos, notificações e links de
                compartilhamento podem ser alterados ou ficar temporariamente
                indisponíveis por manutenção ou limitações técnicas.
              </p>
            </Secao>

            <Secao titulo="7. Conteúdo, marcas e propriedade intelectual">
              <p>
                A identidade visual, os textos autorais e os elementos
                originais do Achado do Alê são protegidos na forma da lei.
                Nomes comerciais, marcas, fotografias e demais materiais de
                terceiros pertencem aos respectivos titulares e podem ser
                exibidos para identificação de produtos e ofertas.
              </p>
              <p>
                A presença de determinada marca não implica endosso,
                patrocínio ou parceria direta, salvo quando essa relação
                estiver indicada expressamente.
              </p>
            </Secao>

            <Secao titulo="8. Dados pessoais, cookies e métricas">
              <p>
                A forma como o site trata dados, preferências, métricas e
                tecnologias de rastreamento é detalhada na
                <Link className="font-semibold text-gold hover:underline" href="/privacidade"> Política de Privacidade</Link>.
                O tratamento de dados pessoais deve observar a LGPD e as
                escolhas do usuário quando o consentimento for necessário.
              </p>
            </Secao>

            <Secao titulo="9. Aplicativos Android e iOS">
              <p>
                O projeto também desenvolve aplicativos para Android e iOS,
                cuja disponibilização pública será informada em seus canais
                oficiais. Quando lançados, poderão utilizar os mesmos serviços
                de promoções e cupons, observadas as regras das respectivas
                lojas de aplicativos e os avisos específicos apresentados
                em cada versão.
              </p>
            </Secao>

            <Secao titulo="10. Atualização dos Termos e funcionamento">
              <p>
                Estes Termos poderão ser atualizados para refletir mudanças
                nos serviços, nas parcerias ou nas exigências legais. A data
                da última atualização será indicada nesta página. Quando
                cabível, alterações relevantes serão comunicadas de modo
                apropriado.
              </p>
              <p>
                O projeto busca manter as informações atualizadas, mas não
                garante operação ininterrupta nem ausência absoluta de erros.
                Isso não afeta direitos previstos na legislação aplicável.
              </p>
            </Secao>

            <Secao titulo="11. Dúvidas e contato">
              <p>
                Para dúvidas sobre o funcionamento do Achado do Alê,
                utilize os canais oficiais informados no rodapé do site.
                Conheça também a <Link className="font-semibold text-gold hover:underline" href="/sobre">história do projeto</Link>.
                Para assuntos relacionados a dados pessoais, consulte a
                Política de Privacidade.
              </p>
            </Secao>
          </div>
        </article>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
