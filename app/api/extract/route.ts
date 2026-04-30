import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { scrapeShopeeVideo } from '@/lib/scraper'
import {
  checkAndIncrementUsage,
  checkAndIncrementAnonymous,
} from '@/lib/limiter'
import { extractUrlSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'

// Rate-limit em memória por IP para evitar flood na extração
const ipBurst = new Map<string, { count: number; resetAt: number }>()

function burstCheck(ip: string): boolean {
  const now = Date.now()
  const e = ipBurst.get(ip)
  if (!e || now > e.resetAt) { ipBurst.set(ip, { count: 1, resetAt: now + 60_000 }); return true }
  if (e.count >= 15) return false
  e.count++
  return true
}

function getIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const ip = getIp(request)

    if (!burstCheck(ip)) {
      return Response.json(
        { success: false, error: 'Muitas requisições. Aguarde 1 minuto.' },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const parsed = extractUrlSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message ?? 'URL inválida' },
        { status: 400 }
      )
    }

    const user = await getSession()

    // ── Usuário autenticado ──
    if (user) {
      const usage = await checkAndIncrementUsage(user.id)
      if (!usage.allowed) {
        return Response.json(
          {
            success: false,
            error: `Limite diário atingido (${usage.limit}/dia). Faça upgrade para Premium.`,
            limitReached: true,
            requiresUpgrade: true,
          },
          { status: 403 }
        )
      }

      const videoData = await scrapeShopeeVideo(parsed.data.url)

      await prisma.downloadHistory.create({
        data: {
          userId: user.id,
          originalUrl: parsed.data.url,
          videoUrl: videoData.videoUrl,
          cover: videoData.cover || null,
          caption: videoData.caption || null,
        },
      })

      return Response.json({
        success: true,
        data: videoData,
        usage: { used: usage.used, limit: usage.limit, isPremium: usage.isPremium },
      })
    }

    // ── Usuário anônimo ──
    const anon = await checkAndIncrementAnonymous(ip)
    if (!anon.allowed) {
      return Response.json(
        {
          success: false,
          error: `Limite gratuito atingido (${anon.limit} downloads/dia sem conta). Entre com Google para continuar.`,
          limitReached: true,
          requiresAuth: true,
        },
        { status: 403 }
      )
    }

    const videoData = await scrapeShopeeVideo(parsed.data.url)

    return Response.json({
      success: true,
      data: videoData,
      usage: { used: anon.used, limit: anon.limit, isPremium: false, isAnon: true },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao processar URL'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
