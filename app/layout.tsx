import type { Metadata } from "next";
import Script from "next/script";
import { Baloo_2, Inter } from "next/font/google";
import AnalyticsConsentGate from "@/components/AnalyticsConsentGate";
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

const GA_ID = "G-1SHEYDJB40";
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
      {GA_ID ? (
        <>
          <Script id="ga4-consent-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                wait_for_update: 500
              });
            `}
          </Script>
          <Script
            id="ga4-library"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function(){dataLayer.push(arguments);};
              window.gtag('js', new Date());
              window.gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      ) : null}
      <body className="font-sans">
        {children}
        <AnalyticsConsentGate measurementId={GA_ID} />
      </body>
    </html>
  );
}
