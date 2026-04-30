import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signSession, sessionCookieOptions } from '@/lib/session'
import { Plan } from '@/lib/generated/prisma/client'

interface GoogleTokens {
  access_token: string
  id_token: string
  error?: string
}

interface GoogleUser {
  sub: string
  email: string
  name?: string
  picture?: string
  email_verified?: boolean
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const storedState = request.cookies.get('oauth_state')?.value
  const next = request.cookies.get('oauth_next')?.value ?? '/dashboard'

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
  }

  try {
    // Troca código por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10_000),
    })

    const tokens: GoogleTokens = await tokenRes.json()
    if (!tokenRes.ok || tokens.error) {
      throw new Error(`Token exchange failed: ${tokens.error ?? tokenRes.status}`)
    }

    // Busca informações do usuário
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      signal: AbortSignal.timeout(10_000),
    })

    const googleUser: GoogleUser = await userInfoRes.json()

    if (!googleUser.email || !googleUser.email_verified) {
      throw new Error('Email Google não verificado')
    }

    // Busca ou cria usuário
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleUser.sub }, { email: googleUser.email }],
      },
      select: { id: true, email: true },
    })

    if (!user) {
      user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name ?? null,
            avatarUrl: googleUser.picture ?? null,
            googleId: googleUser.sub,
          },
          select: { id: true, email: true },
        })
        await tx.subscription.create({
          data: { userId: created.id, plan: Plan.FREE },
        })
        return created
      })
    } else {
      // Atualiza dados do Google se necessário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          name: googleUser.name ?? undefined,
          avatarUrl: googleUser.picture ?? undefined,
        },
      })
    }

    const token = await signSession({ sub: user.id, email: user.email })
    const cookieOpts = sessionCookieOptions()

    const response = NextResponse.redirect(new URL(next, request.url))
    response.cookies.set(cookieOpts.name, token, cookieOpts)
    response.cookies.delete('oauth_state')
    response.cookies.delete('oauth_next')

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=auth', request.url))
  }
}
