import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString('hex')
  const next = request.nextUrl.searchParams.get('next') ?? '/dashboard'

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'select_account',
  })

  const response = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`)

  // Usa headers.append para garantir que os cookies são setados no redirect
  const secure = process.env.NODE_ENV === 'production'
  const base = `HttpOnly; SameSite=Lax; Max-Age=600; Path=/${secure ? '; Secure' : ''}`
  response.headers.append('Set-Cookie', `oauth_state=${state}; ${base}`)
  response.headers.append('Set-Cookie', `oauth_next=${encodeURIComponent(next)}; ${base}`)

  return response
}
