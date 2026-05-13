import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getSession } from '@/lib/auth'
import PixPaymentTrigger from '@/components/PixPaymentTrigger'

export const metadata: Metadata = {
  title: 'Preços — Downloads Ilimitados a Partir de R$ 8/mês',
  description:
    'Planos do CopiarLink: grátis com 5 downloads/dia, Mensal R$ 8/mês ou Anual R$ 60/ano para downloads ilimitados de vídeos do Shopee. Ativação instantânea via PIX.',
  alternates: {
    canonical: 'https://www.copiarlink.com/pricing',
  },
  openGraph: {
    title: 'Preços CopiarLink — Downloads Ilimitados',
    description: 'Planos a partir de R$ 8/mês para downloads ilimitados de vídeos do Shopee. Ativação via PIX instantânea.',
    url: 'https://www.copiarlink.com/pricing',
  },
}

export default async function PricingPage() {
  const user = await getSession()

  const checkmark = (color = 'text-green-500') => (
    <svg className={`w-4 h-4 ${color} shrink-0`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )

  const xmark = (
    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Planos simples e transparentes</h1>
          <p className="text-gray-500 text-base sm:text-lg">Escolha o plano ideal para você</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Gratuito</h2>
              <p className="text-3xl font-bold text-gray-900">
                R$ 0
                <span className="text-sm font-normal text-gray-400">/sempre</span>
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {['5 downloads por dia', 'Extração de vídeos', 'Prévia do vídeo', 'Histórico básico'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  {checkmark()}
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-3 text-sm text-gray-400">
                {xmark}
                Limite diário
              </li>
            </ul>

            <Link
              href={user ? '/dashboard' : '/register'}
              className="block w-full text-center border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-all"
            >
              {user ? 'Usar grátis' : 'Começar grátis'}
            </Link>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Mensal</h2>
              <p className="text-3xl font-bold text-gray-900">
                R$ 8
                <span className="text-sm font-normal text-gray-400">/mês</span>
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Downloads ilimitados',
                'Extração de vídeos',
                'Prévia do vídeo',
                'Histórico completo',
                'Sem limite diário',
                'Ativação via PIX instantânea',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  {checkmark('text-[#EE4D2D]')}
                  {f}
                </li>
              ))}
            </ul>

            {user ? (
              <PixPaymentTrigger plan="monthly" label="Assinar Mensal via PIX" />
            ) : (
              <Link
                href="/register"
                className="block w-full text-center bg-[#EE4D2D] hover:bg-[#d44427] text-white font-bold py-3 rounded-xl transition-all shadow-md"
              >
                Criar conta e assinar
              </Link>
            )}

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pagamento seguro via PIX
            </div>
          </div>

          {/* Annual Plan */}
          <div className="bg-white rounded-2xl border-2 border-[#EE4D2D] p-6 sm:p-8 shadow-lg relative flex flex-col">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#EE4D2D] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                MELHOR VALOR
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Anual</h2>
              <p className="text-3xl font-bold text-gray-900">
                R$ 60
                <span className="text-sm font-normal text-gray-400">/ano</span>
              </p>
              <p className="text-xs text-green-600 font-semibold mt-1">Equivale a R$ 5/mês — economize 37%</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Downloads ilimitados',
                'Extração de vídeos',
                'Prévia do vídeo',
                'Histórico completo',
                'Sem limite diário',
                'Ativação via PIX instantânea',
                'Acesso por 365 dias',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  {checkmark('text-[#EE4D2D]')}
                  {f}
                </li>
              ))}
            </ul>

            {user ? (
              <PixPaymentTrigger plan="annual" label="Assinar Anual via PIX" />
            ) : (
              <Link
                href="/register"
                className="block w-full text-center bg-[#EE4D2D] hover:bg-[#d44427] text-white font-bold py-3 rounded-xl transition-all shadow-md"
              >
                Criar conta e assinar
              </Link>
            )}

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pagamento seguro via PIX
            </div>
          </div>
        </div>

        {/* PIX info */}
        <div className="mt-12 max-w-xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" viewBox="0 0 32 32" fill="currentColor">
              <path d="M24.255 10.745a5.99 5.99 0 00-4.252-1.76H12l-1.747 1.747 3.504 3.504h3.246a2.003 2.003 0 011.416.588l2.836 2.836v.68l-2.836 2.836a2.003 2.003 0 01-1.416.588h-3.246L10.253 23.27 12 25.015h8.003a5.99 5.99 0 004.252-1.76l4.493-4.493a4.008 4.008 0 000-5.523l-4.493-4.493zM10.253 23.27zm0 0zm0-14.285z" />
              <path d="M11.997 19.764a2.003 2.003 0 01-1.416-.588L7.745 16.34v-.68l2.836-2.836a2.003 2.003 0 011.416-.588h3.246l3.504-3.504L17 7 8.997 7a5.99 5.99 0 00-4.252 1.76L.252 13.253a4.008 4.008 0 000 5.523l4.493 4.493A5.99 5.99 0 008.997 25H17l1.747-1.747-3.504-3.504h-3.246z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Como funciona o pagamento PIX?</h3>
          <div className="text-sm text-gray-500 space-y-1.5 text-left max-w-sm mx-auto">
            <p>1. Clique em &quot;Assinar via PIX&quot;</p>
            <p>2. Um QR Code é gerado instantaneamente</p>
            <p>3. Pague no seu banco ou app de pagamentos</p>
            <p>4. O Premium é ativado em segundos automaticamente</p>
          </div>
        </div>
      </main>
    </div>
  )
}
