import { NextRequest, NextResponse } from 'next/server'
import { verifyRequestSession } from '@/lib/session'

const PUBLIC_PAGES = new Set(['/', '/login', '/pricing'])

// Rotas de API acessíveis sem autenticação
const PUBLIC_API_PREFIXES = ['/api/auth/', '/api/webhook', '/api/extract', '/api/download']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicApi = PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))

  // Rotas de API públicas (auth + anônimas) passam direto
  if (isPublicApi) return NextResponse.next({ request })

  const session = await verifyRequestSession(request)

  // Protege todas as outras rotas de API
  if (pathname.startsWith('/api/')) {
    if (!session) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.next({ request })
  }

  // Redireciona usuários não autenticados para login (páginas protegidas)
  if (!PUBLIC_PAGES.has(pathname) && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Redireciona usuários logados para fora da página de login
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
