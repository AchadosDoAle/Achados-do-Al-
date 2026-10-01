import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  alternates: { canonical: "/privacidade" },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />
      <Container className="p-4">
        <article className="mx-auto max-w-3xl rounded-xl2 bg-card p-6 ring-1 ring-white/5">
          <h1 className="font-display text-2xl font-bold text-text">
            Política de Privacidade
          </h1>
          <div className="mt-4 space-y-4 text-sm leading-7 text-text-muted">
            <p>
              O Achado do Alê mantém uma contagem operacional básica das páginas
              públicas visualizadas para medir o uso do site e alimentar os
              relatórios administrativos. Essa contagem básica registra apenas o
              caminho da página e o horário do acesso no banco do projeto. Ela não
              cria um identificador persistente do visitante e não grava, nessa
              trilha, nome, e-mail, telefone, referrer, tipo de dispositivo ou
              parâmetros UTM.
            </p>
            <p>
              Métricas adicionais de navegação somente são ativadas quando você
              aceita essa opção no aviso de privacidade. Elas podem incluir origem
              aproximada do tráfego, campanhas UTM, tipo de dispositivo e uma
              identificação técnica aleatória usada para medir sessões. O Google
              Analytics também permanece condicionado a esse consentimento.
            </p>
            <p>
              Não vendemos dados pessoais. Favoritos ficam armazenados no próprio
              navegador. Você pode limpar sua escolha de consentimento apagando os
              dados locais do site no navegador. Serviços de infraestrutura e
              métricas, como Supabase, Vercel e Google Analytics, podem processar
              dados de acordo com suas próprias políticas.
            </p>
          </div>
        </article>
      </Container>
      <Footer />
      <BottomNav />
    </main>
  );
}
