import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getUsageStatus } from '@/lib/limiter'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import ExtractForm from '@/components/ExtractForm'
import DownloadHistory from '@/components/DownloadHistory'
import Card from '@/components/ui/Card'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [usage, history, sub] = await Promise.all([
    getUsageStatus(user.id),
    prisma.downloadHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, caption: true, cover: true, videoUrl: true, createdAt: true },
    }),
    prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { plan: true, premiumUntil: true },
    }),
  ])

  const premiumUntil = sub?.premiumUntil
    ? new Date(sub.premiumUntil).toLocaleDateString('pt-BR')
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Welcome + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {usage.isPremium ? (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Premium
              {premiumUntil && <span className="opacity-70">até {premiumUntil}</span>}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2 rounded-full">
              Plano Gratuito
            </div>
          )}
        </div>

        {/* Usage Card */}
        {!usage.isPremium && (
          <Card className="bg-gradient-to-r from-orange-50 to-white border-orange-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Downloads hoje</p>
              <span className="text-sm font-bold text-[#EE4D2D]">
                {usage.used} / {usage.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#EE4D2D] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((usage.used / (usage.limit ?? 5)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Reseta à meia-noite. Faça{' '}
              <a href="/pricing" className="text-[#EE4D2D] hover:underline font-medium">
                upgrade para Premium
              </a>{' '}
              para downloads ilimitados.
            </p>
          </Card>
        )}

        {/* Extractor */}
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-4">Extrair vídeo</h2>
          <ExtractForm />
        </Card>

        {/* Download History */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">
            Histórico de downloads
          </h2>
          <DownloadHistory
            items={(history ?? []).map((h) => ({
              id: h.id,
              caption: h.caption ?? '',
              cover: h.cover ?? '',
              videoUrl: h.videoUrl,
              createdAt: h.createdAt.toISOString(),
            }))}
          />
        </div>
      </main>
    </div>
  )
}
