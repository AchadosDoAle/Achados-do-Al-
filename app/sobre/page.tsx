import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
export const metadata: Metadata = { title: "Sobre o Achado do Alê", alternates: { canonical: "/sobre" } };
export default function Page() { return <main className="min-h-screen bg-bg pb-bottom-nav"><Header /><Container className="p-4"><article className="mx-auto max-w-3xl rounded-xl2 bg-card p-6 ring-1 ring-white/5"><h1 className="font-display text-2xl font-bold text-text">Sobre o Achado do Alê</h1><p className="mt-4 whitespace-pre-line text-sm leading-7 text-text-muted">O Achado do Alê reúne promoções, cupons e achadinhos de diferentes lojas em um só lugar. Nosso objetivo é facilitar a comparação e o acesso às ofertas. Preços, estoque, frete e condições são definidos pelas lojas parceiras e podem mudar a qualquer momento.</p></article></Container><Footer /><BottomNav /></main>; }
