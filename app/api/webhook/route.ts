import { NextRequest } from 'next/server'
import { getMpClient, PLAN_CONFIG, type PlanType } from '@/lib/mercadopago'
import { Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { Plan } from '@/lib/generated/prisma/client'
import crypto from 'crypto'

function verifySignature(request: NextRequest): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true

  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''

  // Mercado Livre sends data.id as query param in the URL
  const { searchParams } = new URL(request.url)
  const dataId = searchParams.get('data.id') ?? ''

  const parts: Record<string, string> = {}
  for (const part of xSignature.split(',')) {
    const [k, v] = part.split('=')
    if (k && v) parts[k.trim()] = v.trim()
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

export async function POST(request: NextRequest) {
  let rawBody = ''
  try {
    rawBody = await request.text()

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

    let payment
    try {
      const client = getMpClient()
      const paymentApi = new Payment(client)
      payment = await paymentApi.get({ id: paymentId })
    } catch (err) {
      console.error('[webhook] failed to fetch payment from MP API, paymentId=%s error:', paymentId, err)
      // Return 500 so Mercado Livre retries later
      return Response.json({ error: 'Failed to fetch payment' }, { status: 500 })
    }

    console.log('[webhook] payment status=%s paymentId=%s', payment.status, paymentId)

    if (payment.status !== 'approved') {
      return new Response(null, { status: 200 })
    }

    const userId = payment.metadata?.user_id as string | undefined
    if (!userId) {
      console.error('[webhook] no user_id in payment metadata, paymentId=%s metadata=%j', paymentId, payment.metadata)
      // Return 200 to avoid infinite retries — this payment cannot be linked to a user
      return new Response(null, { status: 200 })
    }

    const plan = (payment.metadata?.plan as PlanType | undefined) ?? 'monthly'
    const days = PLAN_CONFIG[plan]?.days ?? PLAN_CONFIG.monthly.days
    const premiumUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

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

    console.log('[webhook] premium activated userId=%s until=%s', userId, premiumUntil.toISOString())
    return new Response(null, { status: 200 })
  } catch (error) {
    console.error('[webhook] unhandled error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
