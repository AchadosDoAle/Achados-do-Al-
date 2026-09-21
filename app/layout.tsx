import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { NOME_MARCA, URL_SITE } from "@/lib/seo-brand";
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

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITE),
  applicationName: NOME_MARCA,
  title: {
    default: "Achado do Alê — Promoções, cupons e achadinhos",
    template: `%s | ${NOME_MARCA}`,
  },
  description:
    "Ofertas, cupons e achadinhos selecionados de Mercado Livre, Amazon, Magalu, Shopee e outras lojas para você economizar de verdade.",
  keywords: [
    "promoções",
    "ofertas",
    "cupons de desconto",
    "achadinhos",
    "Mercado Livre",
    "Amazon",
    "Magalu",
    "Shopee",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: URL_SITE,
    siteName: NOME_MARCA,
    title: "Achado do Alê — Promoções, cupons e achadinhos",
    description:
      "Ofertas e cupons selecionados para você encontrar bons preços sem precisar garimpar.",
    images: [
      {
        url: "/icon.png",
        width: 1254,
        height: 1254,
        alt: NOME_MARCA,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Achado do Alê — Promoções, cupons e achadinhos",
    description: "Ofertas e cupons selecionados todos os dias.",
    images: ["/icon.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  verification: GOOGLE_VERIFICATION
    ? {
        google: GOOGLE_VERIFICATION,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${inter.variable}`}>
      <body className="font-sans">
        {children}
        <AnalyticsTracker />
        {GA_ID ? <GoogleAnalytics measurementId={GA_ID} /> : null}
      </body>
    </html>
  );
}
