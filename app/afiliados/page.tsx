import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
export const metadata: Metadata = { title: "Transparência sobre links de afiliado", alternates: { canonical: "/afiliados" } };
export default function Page() { return <main className="min-h-screen bg-bg pb-bottom-nav"><Header /><Container className="p-4"><article className="mx-auto max-w-3xl rounded-xl2 bg-card p-6 ring-1 ring-white/5"><h1 className="font-display text-2xl font-bold text-text">Transparência sobre links de afiliado</h1><p className="mt-4 whitespace-pre-line text-sm leading-7 text-text-muted">Alguns links do Achado do Alê são links de afiliado. Isso significa que o projeto pode receber uma comissão quando uma compra elegível é feita por meio desses links, sem custo adicional para você. A seleção e apresentação das ofertas não alteram o preço cobrado pela loja.</p></article></Container><Footer /><BottomNav /></main>; }
