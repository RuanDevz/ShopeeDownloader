import { NextRequest, after } from 'next/server'
import { getMpClient, PLAN_CONFIG, type PlanType } from '@/lib/mercadopago'
import { Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { Plan } from '@/lib/generated/prisma/client'
import crypto from 'crypto'

// Increase Vercel function timeout to 60s (requires Pro) or 30s (Hobby max)
export const maxDuration = 60

function verifySignature(request: NextRequest): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true

  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''
  const { searchParams } = new URL(request.url)
  const dataId = searchParams.get('data.id') ?? ''

  const parts: Record<string, string> = {}
  for (const part of xSignature.split(',')) {
    const idx = part.indexOf('=')
    if (idx > 0) parts[part.slice(0, idx).trim()] = part.slice(idx + 1).trim()
  }

  const ts = parts['ts'] ?? ''
  const v1 = parts['v1'] ?? ''

  if (!ts || !v1) {
    console.warn('[webhook] missing ts or v1 in x-signature:', xSignature)
    return false
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  if (expected !== v1) {
    console.warn('[webhook] signature mismatch — manifest:', manifest)
    return false
  }

  return true
}

async function processPayment(paymentId: string) {
  let payment
  try {
    const client = getMpClient()
    const paymentApi = new Payment(client)
    payment = await paymentApi.get({ id: paymentId })
  } catch (err) {
    console.error('[webhook] failed to fetch payment from MP API paymentId=%s', paymentId, err)
    return
  }

  console.log('[webhook] payment status=%s paymentId=%s metadata=%j', payment.status, paymentId, payment.metadata)

  if (payment.status !== 'approved') {
    console.log('[webhook] skipping non-approved payment status=%s paymentId=%s', payment.status, paymentId)
    return
  }

  // Primary: look up userId from our own payments table — always reliable
  const localPayment = await prisma.payment.findUnique({
    where: { mpPaymentId: paymentId },
    select: { userId: true },
  })

  // Fallback: try metadata (MP SDK may use snake_case or camelCase)
  const meta = payment.metadata as Record<string, unknown> | undefined
  const userId = localPayment?.userId
    ?? (meta?.user_id ?? meta?.userId) as string | undefined

  if (!userId) {
    console.error('[webhook] cannot resolve userId for paymentId=%s localPayment=%j meta=%j', paymentId, localPayment, meta)
    return
  }

  console.log('[webhook] resolved userId=%s paymentId=%s source=%s', userId, paymentId, localPayment ? 'db' : 'metadata')

  const meta_plan = (meta?.plan as PlanType | undefined) ?? 'monthly'
  const plan: PlanType = ['monthly', 'annual'].includes(meta_plan) ? meta_plan : 'monthly'
  const days = PLAN_CONFIG[plan].days
  const premiumUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  try {
    await prisma.$transaction([
      prisma.subscription.upsert({
        where: { userId },
        update: { plan: Plan.PREMIUM, premiumUntil, mpPaymentId: paymentId },
        create: { userId, plan: Plan.PREMIUM, premiumUntil, mpPaymentId: paymentId },
      }),
      prisma.payment.updateMany({
        where: { mpPaymentId: paymentId },
        data: { status: 'approved' },
      }),
    ])
    console.log('[webhook] premium activated userId=%s plan=%s until=%s', userId, plan, premiumUntil.toISOString())
  } catch (err) {
    console.error('[webhook] DB error userId=%s paymentId=%s', userId, paymentId, err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody)
    } catch {
      console.error('[webhook] invalid JSON body')
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('[webhook] received type=%s id=%s live=%s', body.type, (body.data as Record<string, unknown>)?.id, body.live_mode)

    if (!verifySignature(request)) {
      console.error('[webhook] signature verification failed')
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (body.type !== 'payment') {
      return new Response(null, { status: 200 })
    }

    const paymentId = String((body.data as Record<string, unknown>)?.id ?? '')
    if (!paymentId || !/^\d+$/.test(paymentId)) {
      console.error('[webhook] invalid payment id:', paymentId)
      return Response.json({ error: 'Invalid payment id' }, { status: 400 })
    }

    // Respond 200 immediately — process in background so Vercel never times out
    after(() => processPayment(paymentId))

    return new Response(null, { status: 200 })
  } catch (error) {
    console.error('[webhook] unhandled error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
