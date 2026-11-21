import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Termos de Uso | Achado do Alê",
  description:
    "Termos de Uso do Achado do Alê: natureza do serviço de divulgação de ofertas, links de afiliados, compras em lojas externas, responsabilidades, propriedade intelectual e regras de utilização.",
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
            Regras de utilização e transparência
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
            Termos de Uso
          </h1>
          <p className="mt-2 text-xs text-text-muted">
            Última atualização: 20/11/2026
          </p>
          <p className="mt-5 text-sm leading-8 text-text-muted">
            Estes Termos regulam o acesso e a utilização do site
            <strong className="text-text"> achadosdoale.com</strong>, mantido pelo
            projeto <strong className="text-text">Achado do Alê</strong>, idealizado
            e administrado por Alexandre do Nascimento. Ao navegar ou utilizar
            os recursos do site, o usuário declara que teve a oportunidade de
            consultar este documento. Se não concordar com suas disposições,
            deverá deixar de utilizar os recursos facultativos da plataforma,
            sem prejuízo dos direitos que a legislação lhe assegura.
          </p>
          <p className="mt-3 text-sm leading-8 text-text-muted">
            Leia também a <Link className="font-semibold text-gold hover:underline" href="/privacidade">Política de Privacidade</Link> e a
            <Link className="font-semibold text-gold hover:underline" href="/afiliados"> Transparência sobre Links de Afiliados</Link>.
            Esses documentos complementam estes Termos e tratam, respectivamente,
            do tratamento de dados pessoais e das relações de indicação comercial.
          </p>

          <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm leading-7 text-text-muted">
            <strong className="text-text">Em resumo:</strong> o Achado do Alê é
            um projeto independente de divulgação e curadoria de ofertas. Em regra,
            não vende os produtos anunciados, não recebe o pagamento da compra e
            não realiza a entrega. A contratação acontece diretamente com o
            vendedor ou plataforma externa. Alguns links podem gerar comissão
            para o projeto, sem taxa adicional de indicação cobrada do usuário.
            Os limites de responsabilidade descritos aqui não afastam deveres
            que a legislação atribua ao próprio Achado do Alê.
          </div>

          <div className="mt-8 space-y-8">
            <Secao titulo="1. Identificação, objeto e natureza do serviço">
              <p>
                O Achado do Alê é um projeto digital independente que organiza,
                seleciona, divulga e compartilha informações sobre produtos,
                preços, promoções, cupons, campanhas e oportunidades de compra
                disponibilizadas por lojas, vendedores, fabricantes, marketplaces
                e outras plataformas de terceiros.
              </p>
              <p>
                O serviço consiste, principalmente, em pesquisa, curadoria,
                apresentação de informações e direcionamento do usuário aos
                ambientes externos em que a oferta poderá ser consultada ou
                contratada. Salvo quando isso for expressamente informado em
                uma funcionalidade específica, o Achado do Alê não atua como
                loja, marketplace transacional, representante comercial do
                vendedor, fabricante, importador, distribuidor ou prestador
                do serviço anunciado.
              </p>
              <p>
                A exibição de um produto ou estabelecimento não significa,
                por si só, que exista sociedade, representação, vínculo de
                agência, exclusividade, patrocínio ou endosso institucional
                entre o Achado do Alê e a marca ou vendedor.
              </p>
            </Secao>

            <Secao titulo="2. Informações sobre ofertas, preços, cupons e estoque">
              <p>
                As informações divulgadas são obtidas de fontes públicas,
                materiais de parceiros, programas de afiliados, lojas ou
                ferramentas de consulta e podem conter limitações, atrasos
                de atualização ou divergências. Preços, descontos, frete,
                parcelamento, condições de pagamento, validade, estoque,
                elegibilidade, benefícios e regras de cupons podem ser
                alterados, suspensos ou encerrados pelo respectivo fornecedor
                a qualquer momento.
              </p>
              <p>
                Salvo indicação expressa em contrário, a publicação de uma
                oferta não constitui reserva de estoque, promessa de venda,
                garantia de preço, confirmação de disponibilidade ou proposta
                comercial emitida pelo Achado do Alê. A contratação e a
                confirmação das condições acontecem no ambiente do vendedor,
                conforme a legislação aplicável.
              </p>
              <p>
                Antes de pagar, confira diretamente na página final da loja
                a identificação do vendedor, o preço total, o frete, os
                tributos eventualmente informados, o prazo de entrega, as
                condições de pagamento, a aplicação do cupom, a política de
                troca e devolução e os demais detalhes da oferta. Em caso de
                divergência, guarde registros da oferta e procure o fornecedor
                responsável pela contratação, sem prejuízo dos direitos
                previstos no Código de Defesa do Consumidor.
              </p>
              <p>
                O Achado do Alê poderá corrigir, atualizar, sinalizar,
                suspender ou remover publicações com informações incorretas,
                expiradas, indisponíveis, suspeitas ou que contrariem a lei,
                os direitos de terceiros ou as regras editoriais do projeto.
              </p>
            </Secao>

            <Secao titulo="3. Compras, vendedores e responsabilidades na contratação">
              <p>
                Em regra, o Achado do Alê não é parte da compra realizada
                fora de seu domínio: não recebe o pedido, não define o contrato
                de venda, não processa o pagamento, não emite a nota fiscal
                da mercadoria, não separa ou envia o produto e não administra
                a conta do consumidor na loja externa. A identidade do
                fornecedor e as condições efetivas da contratação devem ser
                verificadas no ambiente em que o pedido é concluído.
              </p>
              <p>
                Quando a compra for concluída diretamente com loja, vendedor
                ou marketplace externo, caberá a cada participante da cadeia
                de fornecimento responder pelas obrigações que a legislação
                lhe atribuir, conforme sua efetiva atuação. Isso pode abranger
                oferta, publicidade, descrição, qualidade, segurança,
                autenticidade, procedência, estoque, preço contratado,
                pagamento, faturamento, entrega, garantia, assistência,
                cancelamento, reembolso, troca, devolução e atendimento
                pós-venda.
              </p>
              <p>
                O Achado do Alê não tem acesso operacional para alterar pedidos,
                liberar pagamentos, determinar entregas, emitir notas fiscais
                de terceiros, conceder garantia em nome do vendedor ou
                autorizar reembolsos de compras realizadas fora da plataforma.
                Solicitações relacionadas à execução da compra devem ser
                encaminhadas inicialmente ao vendedor ou à plataforma
                responsável, utilizando os canais oficiais da contratação.
              </p>
              <p>
                Essa delimitação descreve a função efetivamente exercida pelo
                projeto e não representa transferência automática de
                responsabilidade, renúncia de direitos do consumidor ou
                exoneração prévia do Achado do Alê por atos, informações,
                publicidade, serviços ou omissões próprios. Eventual
                responsabilidade será apurada conforme os fatos, a participação
                de cada agente e a legislação aplicável, inclusive o CDC.
              </p>
            </Secao>

            <Secao titulo="4. Dever de cautela e segurança na decisão de compra">
              <p>
                A decisão de comprar é livre e cabe ao usuário avaliar se o
                produto, o preço, o vendedor e as condições atendem às suas
                necessidades. Recomendamos conferir a reputação do
                estabelecimento, o endereço eletrônico, os dados do vendedor,
                as formas de pagamento disponibilizadas dentro do ambiente
                oficial e a coerência do preço anunciado.
              </p>
              <p>
                Desconfie de solicitações de pagamento fora do fluxo oficial,
                transferências para pessoas sem relação aparente com o
                vendedor, links recebidos de fontes desconhecidas, páginas
                com erros ou domínios que imitem marcas conhecidas e ofertas
                com valores ou condições extraordinariamente discrepantes.
                Não compartilhe senhas, códigos de autenticação ou dados
                bancários em canais não verificados.
              </p>
              <p>
                O Achado do Alê pode realizar verificações editoriais e
                utilizar fontes disponíveis, mas não consegue auditar
                continuamente todos os vendedores, páginas, anúncios,
                transações ou alterações feitas por terceiros. A publicação
                ou o redirecionamento não constitui certificação, garantia
                absoluta de idoneidade ou promessa de que uma oferta jamais
                será alterada ou fraudada. Se identificar indício de golpe,
                avise o projeto pelos canais oficiais e não efetue o pagamento
                até esclarecer a situação.
              </p>
              <p>
                Essas orientações não reduzem os deveres legais dos
                fornecedores, não transferem ao consumidor riscos que a lei
                atribua a terceiros e não afastam direitos assegurados pela
                legislação de consumo.
              </p>
            </Secao>

            <Secao titulo="5. Links externos, redirecionamentos e serviços de terceiros">
              <p>
                Links de ofertas, cupons e produtos podem direcionar o usuário
                a páginas, aplicativos, lojas, marketplaces, redes sociais,
                serviços de pagamento ou outros ambientes que não são
                controlados pelo Achado do Alê. Alguns acessos podem passar
                por uma rota intermediária do próprio projeto para registrar
                o clique, medir o desempenho ou aplicar identificadores de
                afiliados, antes do redirecionamento ao destino.
              </p>
              <p>
                Após o redirecionamento, o usuário passa a interagir com o
                serviço externo, sujeito aos termos, avisos de privacidade,
                políticas, sistemas de segurança e procedimentos do respectivo
                terceiro. O Achado do Alê não controla a disponibilidade,
                conteúdo, segurança, práticas, alterações, transações ou
                atendimento desses ambientes.
              </p>
              <p>
                A inclusão de um link não significa aprovação irrestrita
                de todo o conteúdo do destino. O usuário deve conferir o
                endereço final e as informações do fornecedor antes de
                fornecer dados pessoais, credenciais ou realizar pagamentos.
                Problemas em serviços externos devem ser comunicados também
                ao respectivo operador, sem prejuízo de eventual comunicação
                ao Achado do Alê quando envolver a publicação ou o link aqui
                disponibilizado.
              </p>
            </Secao>

            <Secao titulo="6. Publicidade, parcerias e programas de afiliados">
              <p>
                O Achado do Alê pode participar de programas de afiliados,
                parcerias comerciais, campanhas patrocinadas ou outras
                modalidades lícitas de remuneração. Alguns links contêm
                identificadores de indicação e, se uma compra atender aos
                critérios do programa, o projeto poderá receber comissão
                da loja ou da rede de afiliação. Essa remuneração não gera,
                por si só, cobrança adicional ao usuário pelo Achado do Alê.
              </p>
              <p>
                A existência de link de afiliado ou relação publicitária
                será informada de maneira clara nos locais e formatos
                pertinentes. Conteúdos patrocinados ou publicitários deverão
                ser identificados de modo compatível com a legislação e
                as normas de autorregulamentação aplicáveis. A remuneração
                não deve ser interpretada como garantia de menor preço,
                avaliação independente de todos os aspectos do produto ou
                endosso de qualidade.
              </p>
              <p>
                A atribuição de comissão depende das regras do programa,
                que podem incluir prazo, categoria, dispositivo, cookies,
                disponibilidade de estoque, cancelamento ou validação da
                compra. O Achado do Alê não controla integralmente esses
                critérios nem garante que toda visita ou aquisição gere
                remuneração. Mais informações estão na página
                <Link className="font-semibold text-gold hover:underline" href="/afiliados"> Transparência sobre Links de Afiliados</Link>.
              </p>
            </Secao>

            <Secao titulo="7. Cupons, ofertas relâmpago e validade">
              <p>
                Cupons podem ser limitados a determinados usuários, contas,
                regiões, categorias, formas de pagamento, quantidades,
                períodos ou valores mínimos. A indicação de um código ou
                benefício não garante sua aceitação pelo vendedor. A loja
                ou plataforma de origem define e valida as regras de uso,
                podendo encerrar ou alterar a campanha.
              </p>
              <p>
                Ofertas relâmpago, contagens regressivas e avisos de validade
                são recursos informativos baseados nos dados disponíveis
                ao projeto. Não substituem a confirmação do prazo e das
                condições no ambiente oficial da loja. Se o cupom não
                funcionar ou a oferta tiver terminado, o usuário poderá
                comunicar o problema pelos canais disponibilizados no site.
              </p>
            </Secao>

            <Secao titulo="8. Produtos regulados, restrições etárias e conteúdo sensível">
              <p>
                Determinados produtos ou serviços podem estar sujeitos a
                restrições legais de idade, publicidade, comercialização,
                prescrição, autorização ou uso. O usuário deve observar
                a legislação aplicável e as regras do fornecedor. O Achado
                do Alê poderá restringir, sinalizar ou remover conteúdos
                quando necessário para cumprir a lei, proteger públicos
                vulneráveis ou atender às políticas do projeto.
              </p>
              <p>
                Conteúdos relativos a bebidas alcoólicas, quando admitidos,
                destinam-se exclusivamente ao público legalmente autorizado.
                É proibida a venda e o fornecimento de bebidas alcoólicas
                a crianças e adolescentes, nos termos da legislação
                brasileira. Avisos de idade não substituem os controles
                legais que cabem aos fabricantes, anunciantes, vendedores
                e demais responsáveis pela comercialização.
              </p>
            </Secao>

            <Secao titulo="9. Uso permitido e condutas proibidas">
              <p>
                O usuário deve utilizar o site de forma lícita, respeitosa
                e compatível com sua finalidade. É proibido, entre outras
                condutas:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>utilizar o site para fraude, estelionato, violação de direitos ou qualquer atividade ilícita;</li>
                <li>tentar acessar áreas administrativas, contas, sistemas, dados ou recursos sem autorização;</li>
                <li>explorar vulnerabilidades, contornar controles de segurança, interferir na infraestrutura ou comprometer a disponibilidade do serviço;</li>
                <li>distribuir vírus, códigos maliciosos, spam ou conteúdo destinado a prejudicar usuários ou sistemas;</li>
                <li>realizar coleta automatizada abusiva, raspagem em escala, engenharia reversa ou reprodução sistemática do conteúdo sem autorização, ressalvadas hipóteses legalmente permitidas;</li>
                <li>utilizar marcas, imagens, textos ou dados de terceiros de forma ilícita ou enganosa;</li>
                <li>falsificar a origem de acessos, cliques, avaliações, denúncias ou comunicações.</li>
              </ul>
              <p>
                O Achado do Alê poderá adotar medidas técnicas proporcionais
                para proteger o serviço, investigar abusos, limitar acessos
                automatizados maliciosos e preservar evidências, respeitados
                os direitos dos usuários e a legislação aplicável.
              </p>
            </Secao>

            <Secao titulo="10. Disponibilidade, manutenção e alterações do serviço">
              <p>
                O projeto busca manter o site acessível e funcional, mas
                não garante disponibilidade ininterrupta, ausência de erros,
                compatibilidade com todos os dispositivos ou funcionamento
                permanente de recursos que dependam de fornecedores externos,
                redes, navegadores ou serviços de terceiros.
              </p>
              <p>
                Funcionalidades como busca, favoritos, filtros, notificações,
                relatórios públicos, cupons, compartilhamento e redirecionamento
                podem ser corrigidas, atualizadas, suspensas ou descontinuadas
                por razões técnicas, de segurança, operacionais, legais ou
                comerciais. Sempre que razoavelmente possível, o projeto
                buscará reduzir impactos e preservar informações e direitos
                dos usuários.
              </p>
              <p>
                Esta previsão não afasta deveres de informação, segurança,
                continuidade ou reparação que sejam legalmente exigíveis
                em uma situação concreta.
              </p>
            </Secao>

            <Secao titulo="11. Propriedade intelectual, marcas e notificações">
              <p>
                A marca Achado do Alê, sua identidade visual, organização,
                textos originais, elementos gráficos, código e demais
                criações próprias são protegidos pela legislação aplicável.
                Nenhuma disposição destes Termos concede licença ampla para
                copiar, republicar, explorar comercialmente ou modificar
                esses materiais sem autorização, ressalvadas as limitações
                e exceções legais.
              </p>
              <p>
                Marcas, nomes empresariais, fotografias, descrições e
                materiais de produtos pertencem aos respectivos titulares
                ou licenciantes. Quando exibidos, destinam-se à identificação
                e divulgação da oferta. Sua presença não significa que o
                titular patrocine ou endosse o Achado do Alê.
              </p>
              <p>
                Titulares de direitos ou pessoas que identifiquem conteúdo
                aparentemente ilícito, informação incorreta, fraude,
                violação de marca, imagem ou outro problema podem encaminhar
                uma notificação pelos canais oficiais, indicando a URL
                específica, a descrição objetiva do problema, a identificação
                do direito alegado e elementos suficientes para análise.
                O projeto poderá solicitar informações adicionais, restringir
                temporariamente o conteúdo quando justificável e adotar
                providências compatíveis com a lei. O recebimento de uma
                denúncia não implica reconhecimento automático de infração.
              </p>
            </Secao>

            <Secao titulo="12. Privacidade, cookies e métricas">
              <p>
                O tratamento de dados pessoais, cookies, identificadores,
                métricas, registros técnicos e preferências é descrito
                na <Link className="font-semibold text-gold hover:underline" href="/privacidade">Política de Privacidade</Link>.
                O Achado do Alê deverá observar as bases legais, os deveres
                de transparência, a segurança e os direitos dos titulares
                previstos na Lei Geral de Proteção de Dados Pessoais (LGPD).
              </p>
              <p>
                Lojas, redes de afiliados, plataformas de pagamento e
                demais terceiros podem tratar dados de forma própria
                quando o usuário acessa seus ambientes. O tratamento
                realizado por esses terceiros é explicado em suas
                respectivas políticas, sem prejuízo das responsabilidades
                que a lei atribuir a cada agente.
              </p>
            </Secao>

            <Secao titulo="13. Crianças, adolescentes e capacidade para contratar">
              <p>
                O site é destinado ao público em geral, mas determinadas
                ofertas e funcionalidades podem ter restrições específicas.
                Crianças e adolescentes devem utilizar serviços digitais
                conforme sua idade, a legislação aplicável e a orientação
                de pais ou responsáveis. Quando o tratamento de dados
                envolver crianças ou adolescentes, será observado seu
                melhor interesse e os requisitos legais pertinentes.
              </p>
              <p>
                O usuário não deve realizar contratação para a qual não
                tenha capacidade legal, nem fornecer informações falsas
                sobre idade ou identidade. A compra de produtos sujeitos
                a restrição etária depende do cumprimento dos requisitos
                legais pelo consumidor e pelo fornecedor. O Achado do Alê
                não substitui a verificação de idade que compete aos
                responsáveis pela venda.
              </p>
            </Secao>

            <Secao titulo="14. Comunicações, correções e atendimento">
              <p>
                Dúvidas sobre o funcionamento do site, pedidos de correção
                de ofertas, comunicação de cupons expirados ou notificações
                sobre links suspeitos podem ser encaminhados pelos canais
                oficiais informados no rodapé do site. Para solicitações
                relacionadas a dados pessoais, consulte também os canais
                indicados na Política de Privacidade.
              </p>
              <p>
                Ao comunicar um problema, sempre que possível informe
                o endereço da página, a loja ou oferta envolvida, a data
                da ocorrência e uma descrição objetiva. Não envie senhas,
                dados completos de cartão, códigos de autenticação ou
                documentos pessoais desnecessários. O contato com o
                Achado do Alê não substitui a abertura de reclamação
                perante o vendedor, a plataforma de compra ou os órgãos
                competentes quando a questão envolver a transação externa.
              </p>
            </Secao>

            <Secao titulo="15. Limites legais de responsabilidade">
              <p>
                Na extensão permitida pela legislação, o Achado do Alê
                não assume obrigações próprias de vendedores, fabricantes,
                transportadores, instituições de pagamento ou plataformas
                externas por operações que não realiza nem controla.
                Também não garante resultados comerciais, economia mínima,
                aceitação de cupons, disponibilidade de estoque ou
                desempenho de serviços de terceiros.
              </p>
              <p>
                O projeto não exclui nem limita responsabilidade por
                danos decorrentes de seus próprios atos ou omissões
                quando a legislação determinar sua responsabilização,
                nem pretende afastar direitos indisponíveis, regras
                de ordem pública, deveres de informação, segurança,
                transparência ou reparação previstos no ordenamento
                jurídico brasileiro.
              </p>
              <p>
                Nenhuma cláusula destes Termos deve ser interpretada
                como renúncia antecipada do consumidor, inversão do
                ônus da prova em seu prejuízo, exclusão de garantia
                legal, transferência automática de responsabilidade
                ou autorização para prática abusiva. A análise de
                eventual responsabilidade dependerá das circunstâncias
                concretas, da atividade efetivamente exercida e das
                normas aplicáveis.
              </p>
            </Secao>

            <Secao titulo="16. Aplicativos e outros canais oficiais">
              <p>
                O projeto poderá disponibilizar aplicativos oficiais
                e canais complementares. Cada aplicativo poderá conter
                avisos, permissões, funcionalidades e condições
                adicionais, que deverão ser lidos em conjunto com
                estes Termos e com a Política de Privacidade. Em caso
                de divergência sobre uma funcionalidade específica,
                prevalecerão as informações específicas apresentadas
                para aquela funcionalidade, desde que compatíveis
                com a legislação.
              </p>
              <p>
                O Achado do Alê não se responsabiliza por aplicativos,
                perfis, grupos ou páginas que imitem sua identidade
                sem autorização. Para evitar fraudes, utilize apenas
                os endereços e canais divulgados no próprio domínio
                oficial e em seus perfis identificados.
              </p>
            </Secao>

            <Secao titulo="17. Atualização, interpretação e validade das disposições">
              <p>
                Estes Termos podem ser atualizados para refletir
                alterações legais, regulatórias, operacionais,
                tecnológicas ou nas funcionalidades do projeto.
                A versão vigente ficará disponível nesta página,
                acompanhada da data de atualização. Alterações
                relevantes serão comunicadas de forma adequada
                quando exigido pela legislação ou pela natureza
                da mudança.
              </p>
              <p>
                Se alguma disposição for considerada inválida ou
                inexequível, as demais permanecerão aplicáveis
                na medida permitida pela lei. A eventual tolerância
                quanto ao descumprimento de uma regra não significa
                renúncia de direito nem alteração permanente destes
                Termos.
              </p>
              <p>
                Estes Termos devem ser interpretados de boa-fé,
                em conjunto com a legislação brasileira e sem
                prejuízo de normas obrigatórias de proteção ao
                consumidor e de proteção de dados.
              </p>
            </Secao>

            <Secao titulo="18. Legislação aplicável e solução de conflitos">
              <p>
                Estes Termos são regidos pelas leis da República
                Federativa do Brasil, especialmente, conforme a
                matéria, pelo Código de Defesa do Consumidor
                (Lei nº 8.078/1990), pelo Decreto nº 7.962/2013
                sobre comércio eletrônico, pelo Código Civil
                (Lei nº 10.406/2002), pelo Marco Civil da Internet
                (Lei nº 12.965/2014), pela Lei Geral de Proteção
                de Dados Pessoais (Lei nº 13.709/2018), pelo
                Estatuto da Criança e do Adolescente e pelas
                normas de publicidade aplicáveis.
              </p>
              <p>
                As partes poderão buscar solução direta e de boa-fé
                para questões relacionadas ao uso do site. Isso
                não impede o usuário de recorrer aos órgãos de
                defesa do consumidor, à Autoridade Nacional de
                Proteção de Dados, às autoridades competentes
                ou ao Poder Judiciário. Fica preservado o foro
                legalmente competente, inclusive o domicílio
                do consumidor quando a legislação assim assegurar.
              </p>
            </Secao>

            <Secao titulo="19. Contato e documentos relacionados">
              <p>
                Para assuntos sobre o funcionamento do Achado do Alê,
                utilize os canais oficiais informados no rodapé do site.
                Para conhecer o projeto, consulte a página
                <Link className="font-semibold text-gold hover:underline" href="/sobre"> Sobre o Achado do Alê</Link>.
              </p>
              <p>
                Consulte também a <Link className="font-semibold text-gold hover:underline" href="/privacidade">Política de Privacidade</Link> e a
                <Link className="font-semibold text-gold hover:underline" href="/afiliados"> Transparência sobre Links de Afiliados</Link>.
                Em caso de dúvidas jurídicas sobre uma compra, o consumidor
                deve buscar orientação adequada e contatar o fornecedor
                responsável pela transação.
              </p>
            </Secao>
          </div>

          <div className="mt-8 rounded-xl border border-white/10 bg-bg-secondary/50 p-4 text-xs leading-6 text-text-muted">
            Este documento foi elaborado para refletir a natureza e as
            funcionalidades informadas do projeto e oferecer transparência
            aos usuários. Não substitui parecer jurídico individualizado.
            A aplicação das normas depende das circunstâncias concretas,
            da estrutura operacional efetiva e de eventuais alterações
            legislativas ou regulatórias. Recomenda-se revisão por advogado
            habilitado antes de tratar esta versão como instrumento jurídico
            definitivo.
          </div>
        </article>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
