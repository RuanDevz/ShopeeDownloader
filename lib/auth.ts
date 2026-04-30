import { getSessionPayload } from '@/lib/session'

export interface SessionUser {
  id: string
  email: string
}

export async function getSession(): Promise<SessionUser | null> {
  const payload = await getSessionPayload()
  if (!payload) return null
  return { id: payload.sub, email: payload.email }
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) throw new Error('Unauthorized')
  return user
}
