import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
