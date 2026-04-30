import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { downloadUrlSchema } from '@/lib/validators'
import { getUsageStatus, getAnonymousUsageStatus } from '@/lib/limiter'

function getIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url') ?? ''

    const parsed = downloadUrlSchema.safeParse({ url })
    if (!parsed.success) {
      return Response.json(
        { success: false, error: 'URL de vídeo inválida' },
        { status: 400 }
      )
    }

    // Verifica quota (contagem já foi feita no /api/extract)
    if (user) {
      const usage = await getUsageStatus(user.id)
      if (!usage.isPremium && usage.used === 0) {
        return Response.json(
          { success: false, error: 'Limite diário atingido. Faça upgrade.' },
          { status: 403 }
        )
      }
    } else {
      const ip = getIp(request)
      const anon = await getAnonymousUsageStatus(ip)
      if (!anon.allowed && anon.used === 0) {
        return Response.json(
          { success: false, error: 'Limite gratuito atingido. Entre com Google para continuar.', requiresAuth: true },
          { status: 403 }
        )
      }
    }

    const videoUrl = parsed.data.url

    // Proxy the video stream from Shopee CDN
    const upstream = await fetch(videoUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://shopee.com.br/',
      },
      signal: AbortSignal.timeout(30_000),
    })

    if (!upstream.ok) {
      return Response.json(
        { success: false, error: 'Falha ao buscar vídeo do CDN' },
        { status: 502 }
      )
    }

    const contentType = upstream.headers.get('content-type') ?? 'video/mp4'
    const contentLength = upstream.headers.get('content-length')

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': 'attachment; filename="shopee-video.mp4"',
      'Cache-Control': 'no-store',
    }

    if (contentLength) headers['Content-Length'] = contentLength

    return new Response(upstream.body, { status: 200, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro no download'
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
