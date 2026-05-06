import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "Shopee Video Downloader — Baixe vídeos do Shopee",
  description:
    "Baixe vídeos do Shopee de forma rápida e fácil. Cole o link, extraia e salve no seu dispositivo.",
  keywords: ["shopee", "download", "vídeo", "baixar vídeo shopee"],
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
