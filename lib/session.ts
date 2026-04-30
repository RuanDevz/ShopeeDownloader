import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const SESSION_COOKIE = 'session'
const SESSION_DURATION_SECS = 7 * 24 * 60 * 60 // 7 dias

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não configurado')
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  sub: string   // userId
  email: string
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (!payload.sub || !payload['email']) return null
    return { sub: payload.sub, email: payload['email'] as string }
  } catch {
    return null
  }
}

// Lê e verifica o token do cookie da request (usado no proxy — sem next/headers)
export async function verifyRequestSession(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

// Lê a sessão no contexto de Server Components / Route Handlers
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export function sessionCookieOptions(maxAge = SESSION_DURATION_SECS) {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}

export function buildSessionCookieHeader(token: string): string {
  const opts = sessionCookieOptions()
  const parts = [
    `${opts.name}=${token}`,
    `Max-Age=${opts.maxAge}`,
    `Path=${opts.path}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (opts.secure) parts.push('Secure')
  return parts.join('; ')
}

export function buildClearCookieHeader(): string {
  return `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
}
