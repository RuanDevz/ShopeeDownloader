import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import ExtractForm from '@/components/ExtractForm'
import PlatformRecommendation from '@/components/PlatformRecommendation'
import { getSession } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Shopee Video Downloader — Baixe Vídeos do Shopee Grátis e Sem Marca D\'água',
  description:
    'Baixe vídeos do Shopee online grátis, sem instalar nada e sem marca d\'água. Cole qualquer link de produto Shopee e salve o vídeo em MP4 com qualidade original em segundos.',
  alternates: {
    canonical: 'https://www.shopeedownloader.com',
  },
  openGraph: {
    title: 'Shopee Video Downloader — Baixe Vídeos do Shopee Grátis',
    description: 'Cole o link do Shopee e baixe o vídeo em MP4, sem marca d\'água, sem instalar nada.',
    url: 'https://www.shopeedownloader.com',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CopiarLink',
  url: 'https://www.shopeedownloader.com',
  description: 'Baixe vídeos do Shopee online grátis, sem instalar nada e sem marca d\'água.',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1200',
  },
}

export default async function LandingPage() {
  const user = await getSession()

  const features = [
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      title: 'Rápido e Simples',
      desc: 'Cole o link do Shopee e o vídeo é extraído em segundos, sem complicação.',
    },
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      ),
      title: '100% Seguro',
      desc: 'Sem malware, sem propagandas intrusivas. Seu download é direto e seguro.',
    },
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      ),
      title: 'Qualidade Original',
      desc: 'Baixe o vídeo na qualidade original do CDN do Shopee, sem perda de qualidade.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Navbar user={user} />

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-br from-orange-50 via-white to-white">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#EE4D2D] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Grátis para começar — sem cadastro
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Baixe vídeos do{' '}
            <span className="text-[#EE4D2D]">Shopee</span>
            <br />sem marcas d&apos;água
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Cole qualquer link do Shopee e baixe o vídeo original em MP4 direto para o seu
            dispositivo. Rápido, seguro e sem instalação.
          </p>

          {/* URL Input — available immediately for everyone */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-6 mb-6 text-left">
            <ExtractForm large isLoggedIn={!!user} />
            <PlatformRecommendation />
          </div>

          <p className="text-xs text-gray-400">
            {user
              ? 'Logado como ' + user.email
              : '2 downloads gratuitos por dia sem conta • Entre com Google para 5/dia • Premium para ilimitados'}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Por que usar o CopiarLink?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#EE4D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#EE4D2D]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Quer downloads ilimitados?</h2>
          <p className="text-orange-100 mb-8">
            Entre com Google gratuitamente e ganhe 5 downloads/dia, ou ative o Premium para ilimitados.
          </p>
          {!user && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#EE4D2D] font-bold px-8 py-3.5 rounded-xl text-base hover:bg-orange-50 transition-all shadow-md"
            >
              Entrar com Google — é grátis
            </Link>
          )}
        </div>
      </section>

      <footer className="py-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} CopiarLink. Todos os direitos reservados.
          </p>
          <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-600">
            Preços
          </Link>
        </div>
      </footer>
    </div>
  )
}
