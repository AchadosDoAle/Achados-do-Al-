import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
import { LINK_CANAL_WHATSAPP, REDES_SOCIAIS } from "@/lib/seo-brand";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade do Achado do Alê para o site e aplicativos Android e iOS, com informações sobre LGPD, cookies, métricas, compartilhamento, segurança e direitos dos titulares.",
  alternates: { canonical: "/privacidade" },
};

const instagram = REDES_SOCIAIS.find(
  (rede) => rede.nome.toLowerCase() === "instagram"
)?.url;

const secoes = [
  ["abrangencia", "1. Abrangência"],
  ["controlador", "2. Controlador e contato"],
  ["dados", "3. Dados tratados"],
  ["finalidades", "4. Finalidades e bases legais"],
  ["cookies", "5. Cookies e armazenamento local"],
  ["apps", "6. Aplicativos Android e iOS"],
  ["compartilhamento", "7. Compartilhamento e operadores"],
  ["transferencias", "8. Transferências internacionais"],
  ["afiliados", "9. Links de afiliados e lojas"],
  ["retencao", "10. Retenção e eliminação"],
  ["seguranca", "11. Segurança"],
  ["direitos", "12. Direitos dos titulares"],
  ["criancas", "13. Crianças e adolescentes"],
  ["alteracoes", "14. Alterações desta política"],
  ["legislacao", "15. Legislação e autoridade"],
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-white/10 pt-6 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-bold text-text">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-text-muted">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <article className="mx-auto max-w-4xl rounded-xl2 bg-card p-5 ring-1 ring-white/5 sm:p-7">
          <div className="border-b border-white/10 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Privacidade e proteção de dados
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold text-text sm:text-3xl">
              Política de Privacidade
            </h1>
            <p className="mt-3 text-sm leading-7 text-text-muted">
              Esta Política explica como o <strong className="text-text">Achado do Alê</strong> trata dados e informações no site
              <strong className="text-text"> achadosdoale.com</strong>, nos aplicativos móveis destinados aos clientes para
              <strong className="text-text"> Android e iOS</strong> e, quando aplicável, nas ferramentas administrativas vinculadas ao mesmo ecossistema.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                Última atualização: 06/10/2026
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                Aplicável ao site, Android e iOS
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm leading-6 text-text-muted">
            <strong className="text-text">Resumo:</strong> o Achado do Alê não vende dados pessoais. O site mantém uma contagem operacional mínima de páginas visualizadas; métricas detalhadas e Google Analytics dependem de consentimento. Compras são concluídas nas lojas parceiras, que possuem políticas próprias. Favoritos e preferências podem ficar armazenados localmente no navegador ou no aplicativo.
          </div>

          <nav aria-label="Índice da Política de Privacidade" className="mt-6 rounded-xl border border-white/10 bg-bg-secondary/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Nesta política</p>
            <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              {secoes.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="text-sm text-text-muted transition hover:text-gold">
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <div className="mt-7 space-y-7">
            <Section id="abrangencia" title="1. Abrangência">
              <p>
                Esta Política se aplica à navegação no site, às páginas de ofertas e cupons, aos links intermediários de redirecionamento, aos recursos de favoritos, avisos de promoções, métricas, notificações e aos aplicativos móveis oficiais do Achado do Alê para Android e iOS.
              </p>
              <p>
                O tratamento realizado por lojas, marketplaces, redes sociais, sistemas operacionais, lojas de aplicativos e outros serviços de terceiros é regido também pelas políticas desses terceiros.
              </p>
            </Section>

            <Section id="controlador" title="2. Controlador e contato">
              <p>
                O controlador das operações próprias descritas nesta Política é o <strong className="text-text">Achado do Alê</strong>, projeto administrado por <strong className="text-text">Alexandre do Nascimento</strong>, responsável por definir as finalidades essenciais do tratamento no site e nas soluções oficiais do projeto.
              </p>
              <p>
                Para dúvidas de privacidade ou exercício de direitos, o titular pode utilizar os canais oficiais identificados no rodapé do site. O canal público atualmente disponível é o perfil oficial do projeto no Instagram
                {instagram ? (
                  <>
                    {" "}
                    <a className="text-gold underline" href={instagram} target="_blank" rel="noopener noreferrer">
                      @achados.do.ale
                    </a>
                  </>
                ) : null}
                . O canal do WhatsApp do projeto também pode ser acessado pelo
                {" "}
                <a className="text-gold underline" href={LINK_CANAL_WHATSAPP} target="_blank" rel="noopener noreferrer">
                  link oficial
                </a>
                , observadas as funcionalidades disponíveis no próprio canal.
              </p>
              <p>
                Para solicitações formais relacionadas à LGPD, informe no contato que se trata de uma <strong className="text-text">solicitação de privacidade/LGPD</strong> e forneça apenas os dados necessários para localizar a informação ou confirmar a titularidade.
              </p>
            </Section>

            <Section id="dados" title="3. Dados e informações que podem ser tratados">
              <p>Conforme o recurso utilizado, podem ser tratados os seguintes grupos de dados e informações:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong className="text-text">Contagem operacional básica:</strong> caminho da página pública acessada e data/hora do evento. Essa trilha não cria identificador persistente e não registra, por essa rotina, nome, e-mail, telefone, referrer, dispositivo ou parâmetros UTM.</li>
                <li><strong className="text-text">Métricas opcionais, mediante consentimento:</strong> identificador técnico aleatório de visitante, páginas acessadas, primeira e última atividade, origem/referrer, tipo de dispositivo e parâmetros de campanha UTM.</li>
                <li><strong className="text-text">Google Analytics 4, mediante consentimento:</strong> eventos e métricas de navegação processados pelo Google. Dados agregados disponibilizados pelo serviço podem incluir informações estatísticas sobre audiência quando disponíveis e permitidas pelas configurações do Google e do usuário.</li>
                <li><strong className="text-text">Cliques em ofertas e cupons:</strong> identificador da oferta/cupom, data/hora e informação de origem do clique ou redirecionamento, para relatórios de desempenho.</li>
                <li><strong className="text-text">Avisos de promoção incorreta ou encerrada:</strong> motivo do aviso e um identificador pseudonimizado gerado para evitar votos repetidos e abuso. Para formar esse identificador, o servidor pode utilizar temporariamente dados técnicos como IP, user-agent e um identificador aleatório de navegador; o banco recebe o hash resultante, e não o IP/user-agent em formato bruto nessa tabela.</li>
                <li><strong className="text-text">Favoritos e preferências:</strong> podem ser armazenados localmente no navegador ou no aplicativo, sem criação obrigatória de conta de cliente.</li>
                <li><strong className="text-text">Dados de administradores autorizados:</strong> nome, e-mail, identificador de usuário, papel/permissão e dados técnicos necessários à autenticação e segurança do painel administrativo.</li>
                <li><strong className="text-text">Dados técnicos de infraestrutura:</strong> registros de servidor, segurança, disponibilidade e diagnóstico podem ser tratados pelos provedores de hospedagem, banco de dados e plataforma conforme suas funções e políticas.</li>
              </ul>
              <p>
                O Achado do Alê não solicita, como requisito normal para navegar nas ofertas, dados como CPF, RG, endereço residencial ou dados bancários. Pagamentos e compras são realizados diretamente nos ambientes das lojas parceiras.
              </p>
            </Section>

            <Section id="finalidades" title="4. Finalidades do tratamento e bases legais">
              <p>Os dados podem ser utilizados para:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>entregar o site e os aplicativos, exibir ofertas, cupons e conteúdos e manter recursos essenciais;</li>
                <li>contabilizar visualizações, cliques e desempenho das ofertas de forma operacional;</li>
                <li>medir audiência e origem do tráfego quando houver consentimento para métricas adicionais;</li>
                <li>proteger o serviço contra abuso, fraude, automação indevida, repetição de avisos e acesso não autorizado;</li>
                <li>administrar usuários autorizados, autenticação, permissões e auditoria do painel;</li>
                <li>enviar notificações quando o usuário optar por habilitá-las no aplicativo ou dispositivo;</li>
                <li>cumprir obrigações legais, regulatórias, judiciais e exercer direitos em processos;</li>
                <li>melhorar desempenho, estabilidade, conteúdo, experiência e segurança do projeto.</li>
              </ul>
              <p>
                Dependendo da operação, o tratamento pode se apoiar em <strong className="text-text">consentimento</strong>, <strong className="text-text">legítimo interesse</strong>, <strong className="text-text">execução de procedimentos necessários ao serviço</strong>, <strong className="text-text">cumprimento de obrigação legal ou regulatória</strong> e <strong className="text-text">exercício regular de direitos</strong>, conforme a LGPD e a natureza concreta da atividade.
              </p>
              <p>
                Quando a base for consentimento, ele poderá ser recusado ou revogado sem impedir o uso das funções que não dependam desse consentimento.
              </p>
            </Section>

            <Section id="cookies" title="5. Cookies, identificadores e armazenamento local">
              <p>O projeto utiliza mecanismos diferentes conforme a finalidade:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong className="text-text">Preferência de métricas:</strong> a escolha de aceitar ou recusar métricas adicionais é armazenada localmente no navegador para evitar pedir a mesma decisão a cada acesso.</li>
                <li><strong className="text-text">Identificador de métricas opcionais:</strong> quando as métricas detalhadas são aceitas, um identificador técnico aleatório pode ser mantido no armazenamento local para medir sessões e recorrência.</li>
                <li><strong className="text-text">Cookie antirrepetição de avisos:</strong> ao reportar problema em uma oferta, pode ser criado o cookie técnico <code className="text-text">achado_reporter</code>, com duração de até 1 ano, usado para reduzir abuso e avisos repetidos.</li>
                <li><strong className="text-text">Autenticação administrativa:</strong> sessões e tokens estritamente necessários podem ser utilizados para manter administradores autenticados com segurança.</li>
                <li><strong className="text-text">Google Analytics:</strong> o armazenamento de Analytics permanece negado por padrão e só é habilitado após consentimento do visitante.</li>
              </ul>
              <p>
                O usuário pode apagar cookies e armazenamento local pelas configurações do navegador. Isso pode remover favoritos, preferências e a escolha de consentimento, fazendo com que algumas configurações precisem ser refeitas.
              </p>
            </Section>

            <Section id="apps" title="6. Aplicativos Android e iOS">
              <p>
                Esta Política também abrange os aplicativos móveis oficiais do Achado do Alê para Android e iOS. Os aplicativos podem acessar o mesmo banco de ofertas e cupons utilizado pelo site e exibir os mesmos conteúdos públicos.
              </p>
              <p>
                Conforme os recursos habilitados, os aplicativos podem tratar identificadores técnicos de instalação, versão do aplicativo, sistema operacional, eventos de uso, favoritos/preferências locais e <strong className="text-text">token de notificação push</strong> para entregar alertas solicitados pelo usuário. O envio de notificações depende da permissão concedida no próprio sistema Android ou iOS e pode ser desativado a qualquer momento nas configurações do dispositivo ou do aplicativo.
              </p>
              <p>
                A instalação e distribuição dos aplicativos também envolve as plataformas <strong className="text-text">Google Play</strong> e/ou <strong className="text-text">Apple App Store</strong>, que podem tratar dados próprios de conta, dispositivo, diagnóstico e loja de aplicativos de acordo com suas políticas independentes. O Achado do Alê não controla essas operações de plataforma.
              </p>
              <p>
                O aplicativo administrativo, quando utilizado, é restrito a usuários autorizados e pode tratar dados de autenticação, perfil e logs necessários à segurança e gestão das publicações.
              </p>
            </Section>

            <Section id="compartilhamento" title="7. Compartilhamento de dados e operadores">
              <p>
                Dados podem ser processados por fornecedores estritamente necessários à operação do serviço, observadas as finalidades aplicáveis. Entre os serviços utilizados ou previstos no ecossistema estão:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li><strong className="text-text">Supabase:</strong> banco de dados, autenticação, armazenamento de imagens, funções e recursos em tempo real;</li>
                <li><strong className="text-text">Vercel:</strong> hospedagem, execução do site, distribuição, logs técnicos e rotinas agendadas;</li>
                <li><strong className="text-text">Google Analytics 4:</strong> métricas opcionais de audiência mediante consentimento;</li>
                <li><strong className="text-text">Google Search Console:</strong> verificação e informações de presença do domínio em pesquisa, quando configurado;</li>
                <li><strong className="text-text">Meta/WhatsApp:</strong> acesso a canal, compartilhamento e integrações de comunicação quando habilitadas;</li>
                <li><strong className="text-text">lojas e marketplaces parceiros:</strong> destino dos links de ofertas, cupons e compras;</li>
                <li><strong className="text-text">Google Play e Apple App Store:</strong> distribuição e serviços de plataforma dos aplicativos móveis.</li>
              </ul>
              <p>
                O Achado do Alê não comercializa listas de dados pessoais. O compartilhamento pode ocorrer ainda quando exigido por lei, ordem judicial, autoridade competente, investigação de fraude ou defesa de direitos.
              </p>
            </Section>

            <Section id="transferencias" title="8. Transferências internacionais de dados">
              <p>
                Alguns provedores de tecnologia utilizados pelo projeto possuem infraestrutura, empresas afiliadas, suporte ou processamento em mais de um país. Por isso, determinadas operações podem envolver transferência internacional de dados ou acesso remoto a partir do exterior.
              </p>
              <p>
                As transferências devem observar a LGPD e a regulamentação da ANPD, incluindo mecanismos legalmente admitidos e salvaguardas compatíveis com a natureza dos dados. A região exata de processamento pode variar conforme a configuração contratada do provedor, disponibilidade técnica e serviço utilizado. Informações adicionais sobre os destinos e mecanismos efetivamente aplicáveis podem ser solicitadas pelos canais de privacidade do projeto.
              </p>
            </Section>

            <Section id="afiliados" title="9. Links de afiliados, redirecionamentos e lojas parceiras">
              <p>
                Alguns links são de afiliado. Quando uma compra elegível é concluída após um desses links, o Achado do Alê pode receber comissão sem custo adicional para o usuário.
              </p>
              <p>
                Para medir desempenho, determinados links passam primeiro por uma rota do próprio Achado do Alê que registra o clique e, em seguida, redireciona para a loja. Ao sair do domínio ou do aplicativo e entrar no ambiente da loja, passam a valer também os termos, cookies, políticas de privacidade e práticas de tratamento da respectiva empresa.
              </p>
              <p>
                O Achado do Alê não processa o pagamento da compra, não recebe dados do cartão e não controla estoque, entrega, garantia, cadastro, pagamento ou pós-venda realizados pela loja.
              </p>
            </Section>

            <Section id="retencao" title="10. Retenção, anonimização e eliminação">
              <p>
                Dados são mantidos pelo período necessário às finalidades descritas, ao funcionamento e segurança do serviço, à elaboração de estatísticas, ao cumprimento de obrigações legais e ao exercício de direitos. Os prazos podem variar conforme a categoria do dado e a necessidade operacional ou legal.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>preferências locais e consentimento permanecem no dispositivo até serem apagados pelo usuário ou pela aplicação;</li>
                <li>o cookie técnico de prevenção de avisos repetidos pode permanecer por até 1 ano;</li>
                <li>tokens de notificação podem ser mantidos enquanto forem válidos e necessários para notificações habilitadas;</li>
                <li>contas administrativas são mantidas enquanto houver autorização de acesso e pelo tempo adicional necessário a segurança, auditoria ou obrigações legais;</li>
                <li>registros de métricas e cliques podem ser conservados para histórico estatístico e gestão do projeto, preferencialmente com minimização e agregação quando adequadas.</li>
              </ul>
              <p>
                Quando o tratamento deixar de ser necessário e não houver fundamento legítimo para conservação, os dados deverão ser eliminados, anonimizados ou mantidos apenas nas hipóteses autorizadas pela legislação.
              </p>
            </Section>

            <Section id="seguranca" title="11. Segurança e prevenção de incidentes">
              <p>
                O projeto adota medidas técnicas e administrativas compatíveis com sua estrutura, incluindo conexão HTTPS, autenticação administrativa, controle de permissões, políticas de acesso no banco de dados, segregação de credenciais, validação de rotas e mecanismos de prevenção a abuso.
              </p>
              <p>
                Nenhum serviço conectado à internet é absolutamente imune a incidentes. Caso ocorra incidente de segurança com risco ou dano relevante, serão avaliadas e adotadas as medidas previstas na legislação e regulamentação aplicáveis, inclusive comunicações à ANPD e aos titulares quando exigidas.
              </p>
              <p>
                Credenciais administrativas, chaves privadas e tokens de integração não devem ser publicados e são destinados exclusivamente às rotinas internas autorizadas.
              </p>
            </Section>

            <Section id="direitos" title="12. Direitos dos titulares de dados">
              <p>Nos termos da LGPD, o titular pode, quando aplicável, solicitar:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>confirmação da existência de tratamento;</li>
                <li>acesso aos dados pessoais;</li>
                <li>correção de dados incompletos, inexatos ou desatualizados;</li>
                <li>anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
                <li>portabilidade, observadas a regulamentação e os segredos comercial e industrial;</li>
                <li>eliminação dos dados tratados com consentimento, ressalvadas as hipóteses legais de conservação;</li>
                <li>informação sobre entidades públicas e privadas com as quais houve compartilhamento;</li>
                <li>informação sobre a possibilidade de não fornecer consentimento e suas consequências;</li>
                <li>revogação do consentimento;</li>
                <li>oposição ao tratamento, quando cabível;</li>
                <li>revisão de decisões tomadas unicamente com base em tratamento automatizado que afetem seus interesses, quando houver;</li>
                <li>peticionamento perante a Autoridade Nacional de Proteção de Dados e órgãos de defesa do consumidor, conforme a legislação.</li>
              </ul>
              <p>
                Para proteger o próprio titular, poderá ser solicitada comprovação razoável de identidade antes do atendimento de pedidos que envolvam acesso, alteração ou eliminação de dados pessoais.
              </p>
            </Section>

            <Section id="criancas" title="13. Crianças e adolescentes">
              <p>
                O Achado do Alê não exige cadastro de cliente para consultar ofertas e não tem como finalidade coletar deliberadamente dados pessoais de crianças. Caso seja identificado tratamento de dados de criança ou adolescente, deverão ser observados o melhor interesse e os requisitos legais aplicáveis.
              </p>
              <p>
                Pais ou responsáveis que entendam que dados de criança ou adolescente foram tratados indevidamente podem solicitar avaliação e, quando cabível, eliminação pelos canais de privacidade.
              </p>
            </Section>

            <Section id="alteracoes" title="14. Alterações desta Política">
              <p>
                Esta Política pode ser atualizada para refletir mudanças legais, regulatórias, técnicas, de fornecedores, funcionalidades do site ou dos aplicativos Android e iOS. A data da última atualização será indicada no início da página.
              </p>
              <p>
                Mudanças relevantes que dependam de novo consentimento serão tratadas de forma compatível com a legislação aplicável.
              </p>
            </Section>

            <Section id="legislacao" title="15. Legislação, ANPD e referências oficiais">
              <p>
                Esta Política é estruturada considerando a <strong className="text-text">Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD)</strong>, o <strong className="text-text">Marco Civil da Internet (Lei nº 12.965/2014)</strong> e regulamentações aplicáveis da Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
              <div className="flex flex-col gap-2">
                <a className="text-gold underline" href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados" target="_blank" rel="noopener noreferrer">
                  ANPD — Titular de Dados e direitos
                </a>
                <a className="text-gold underline" href="https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados" target="_blank" rel="noopener noreferrer">
                  ANPD — Transferência Internacional de Dados
                </a>
                <a className="text-gold underline" href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noopener noreferrer">
                  Texto oficial da LGPD
                </a>
                <a className="text-gold underline" href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm" target="_blank" rel="noopener noreferrer">
                  Texto oficial do Marco Civil da Internet
                </a>
              </div>
              <p className="rounded-xl border border-white/10 bg-bg-secondary/50 p-4 text-xs leading-6">
                Esta página descreve as práticas técnicas atuais do projeto e busca fornecer transparência em linguagem acessível. A aplicação de normas pode variar conforme o caso concreto e eventuais mudanças legais ou operacionais.
              </p>
            </Section>
          </div>
        </article>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
