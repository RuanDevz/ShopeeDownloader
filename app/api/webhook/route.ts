import { NextRequest } from 'next/server'
import { getMpClient, PREMIUM_DAYS } from '@/lib/mercadopago'
import { Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { Plan } from '@/lib/generated/prisma/client'
import crypto from 'crypto'

function verifySignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // skip in dev if not set

  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''
  const { searchParams } = new URL(request.url)
  const dataId = searchParams.get('data.id') ?? ''

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(',').find((p) => p.startsWith('ts='))?.replace('ts=', '') ?? ''};`
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.split('=') as [string, string])
  )

  const expected = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex')

  return parts['v1'] === expected
}

export async function POST(request: NextRequest) {
  let rawBody = ''
  try {
    rawBody = await request.text()
    const body = JSON.parse(rawBody)

    if (!verifySignature(request, rawBody)) {
      return Response.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (body.type !== 'payment') {
      return new Response(null, { status: 200 })
    }

    const paymentId = String(body.data?.id ?? '')
    if (!paymentId || !/^\d+$/.test(paymentId)) {
      return Response.json({ error: 'Invalid payment id' }, { status: 400 })
    }

    const client = getMpClient()
    const paymentApi = new Payment(client)
    const payment = await paymentApi.get({ id: paymentId })

    if (payment.status !== 'approved') {
      return new Response(null, { status: 200 })
    }

    const userId = payment.metadata?.user_id as string | undefined
    if (!userId) {
      console.error('Webhook: no user_id in payment metadata', paymentId)
      return Response.json({ error: 'No user_id' }, { status: 400 })
    }

    const premiumUntil = new Date(Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000)

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

    return new Response(null, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
