import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";

const BASE_URL = 'https://www.shopeedownloader.com'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EE4D2D',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Shopee Video Downloader — Baixe Vídeos do Shopee Grátis',
    template: '%s | ShopeeDownloader',
  },
  description:
    'Baixe vídeos do Shopee online grátis, sem instalar nada. Cole o link e salve em MP4 com qualidade original, sem marca d\'água. Rápido, seguro e fácil.',
  keywords: [
    'baixar vídeo shopee',
    'shopee video downloader',
    'como baixar vídeo do shopee',
    'shopee downloader',
    'baixar vídeo shopee grátis',
    'download video shopee',
    'extrair vídeo shopee',
    'salvar vídeo shopee',
    'shopee video download online',
    'shopee video sem marca dagua',
    'baixar video shopee online',
    'shopee downloader gratis',
    'video shopee mp4',
    'como salvar video shopee',
  ],
  authors: [{ name: 'ShopeeDownloader', url: BASE_URL }],
  creator: 'ShopeeDownloader',
  publisher: 'ShopeeDownloader',
  category: 'technology',
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'ShopeeDownloader',
    title: 'Shopee Video Downloader — Baixe Vídeos do Shopee Grátis',
    description:
      'Baixe vídeos do Shopee online grátis, sem instalar nada. Cole o link e salve em MP4 com qualidade original, sem marca d\'água.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shopee Video Downloader — Baixe Vídeos do Shopee Grátis',
    description:
      'Cole o link do Shopee e baixe o vídeo em MP4, sem marca d\'água. Grátis e online.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R7FPC68S9Y"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R7FPC68S9Y');
          `}
        </Script>
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
