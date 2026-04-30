import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'
import { Plan } from '@/lib/generated/prisma/client'

const FREE_DAILY_LIMIT = 5
const ANON_DAILY_LIMIT = 2

export interface AnonUsageStatus {
  allowed: boolean
  used: number
  limit: number
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.JWT_SECRET ?? '')).digest('hex').slice(0, 32)
}

export interface UsageStatus {
  allowed: boolean
  used: number
  limit: number | null
  isPremium: boolean
}

function todayDate(): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d
}

async function isPremiumUser(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, premiumUntil: true },
  })
  if (!sub || sub.plan !== Plan.PREMIUM) return false
  if (!sub.premiumUntil) return false
  return sub.premiumUntil > new Date()
}

export async function checkAndIncrementUsage(userId: string): Promise<UsageStatus> {
  const premium = await isPremiumUser(userId)
  const today = todayDate()

  const usage = await prisma.usageLog.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { downloadCount: true },
  })

  const currentCount = usage?.downloadCount ?? 0

  if (!premium && currentCount >= FREE_DAILY_LIMIT) {
    return { allowed: false, used: currentCount, limit: FREE_DAILY_LIMIT, isPremium: false }
  }

  await prisma.usageLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { downloadCount: { increment: 1 } },
    create: { userId, date: today, downloadCount: 1 },
  })

  return {
    allowed: true,
    used: currentCount + 1,
    limit: premium ? null : FREE_DAILY_LIMIT,
    isPremium: premium,
  }
}

export async function checkAndIncrementAnonymous(ip: string): Promise<AnonUsageStatus> {
  const ipHash = hashIp(ip)
  const today = todayDate()

  const log = await prisma.anonymousUsageLog.findUnique({
    where: { ipHash_date: { ipHash, date: today } },
    select: { downloadCount: true },
  })

  const used = log?.downloadCount ?? 0

  if (used >= ANON_DAILY_LIMIT) {
    return { allowed: false, used, limit: ANON_DAILY_LIMIT }
  }

  await prisma.anonymousUsageLog.upsert({
    where: { ipHash_date: { ipHash, date: today } },
    update: { downloadCount: { increment: 1 } },
    create: { ipHash, date: today, downloadCount: 1 },
  })

  return { allowed: true, used: used + 1, limit: ANON_DAILY_LIMIT }
}

export async function getAnonymousUsageStatus(ip: string): Promise<AnonUsageStatus> {
  const ipHash = hashIp(ip)
  const today = todayDate()

  const log = await prisma.anonymousUsageLog.findUnique({
    where: { ipHash_date: { ipHash, date: today } },
    select: { downloadCount: true },
  })

  const used = log?.downloadCount ?? 0
  return { allowed: used < ANON_DAILY_LIMIT, used, limit: ANON_DAILY_LIMIT }
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const premium = await isPremiumUser(userId)
  const today = todayDate()

  const usage = await prisma.usageLog.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { downloadCount: true },
  })

  const used = usage?.downloadCount ?? 0

  return {
    allowed: premium || used < FREE_DAILY_LIMIT,
    used,
    limit: premium ? null : FREE_DAILY_LIMIT,
    isPremium: premium,
  }
}
