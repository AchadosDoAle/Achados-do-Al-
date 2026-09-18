import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Achado do Alê — Achadinhos e ofertas todo dia",
  description:
    "Ofertas e cupons selecionados de Mercado Livre, Amazon, Netshoes, Magalu, Shopee, ZZ Mall, BAW, AliExpress, Natura, Avon e outras lojas.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
