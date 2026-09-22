import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Container from "@/components/Container";
export const metadata: Metadata = { title: "Termos de Uso", alternates: { canonical: "/termos" } };
export default function Page() { return <main className="min-h-screen bg-bg pb-bottom-nav"><Header /><Container className="p-4"><article className="mx-auto max-w-3xl rounded-xl2 bg-card p-6 ring-1 ring-white/5"><h1 className="font-display text-2xl font-bold text-text">Termos de Uso</h1><p className="mt-4 whitespace-pre-line text-sm leading-7 text-text-muted">As promoções divulgadas podem expirar, mudar de preço ou ficar sem estoque. Sempre confira as condições finais na loja antes de concluir a compra. O Achado do Alê não é a loja vendedora e não controla pagamento, entrega, garantia ou estoque dos produtos.</p></article></Container><Footer /><BottomNav /></main>; }
