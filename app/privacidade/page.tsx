import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
export const metadata: Metadata = { title: "Política de Privacidade", alternates: { canonical: "/privacidade" } };
export default function Page() { return <main className="min-h-screen bg-bg pb-bottom-nav"><Header /><Container className="p-4"><article className="mx-auto max-w-3xl rounded-xl2 bg-card p-6 ring-1 ring-white/5"><h1 className="font-display text-2xl font-bold text-text">Política de Privacidade</h1><p className="mt-4 whitespace-pre-line text-sm leading-7 text-text-muted">Usamos métricas anônimas de navegação somente quando você aceita essa opção no aviso de privacidade. Elas podem incluir páginas acessadas, origem aproximada do tráfego, campanhas UTM e tipo de dispositivo. Não vendemos dados pessoais. Favoritos ficam armazenados no próprio navegador. Você pode limpar o consentimento apagando os dados locais do site no navegador. Serviços de infraestrutura e métricas, como Supabase, Vercel e Google Analytics, podem processar dados de acordo com suas próprias políticas.</p></article></Container><Footer /><BottomNav /></main>; }
