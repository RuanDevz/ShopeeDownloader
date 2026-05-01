import { NextRequest } from 'next/server'
import { requireSession } from '@/lib/auth'
import { createPixPayment, PREMIUM_PRICE_BRL } from '@/lib/mercadopago'
import { prisma } from '@/lib/prisma'
import { Plan } from '@/lib/generated/prisma/client'

export async function POST(_request: NextRequest) {
  try {
    const user = await requireSession()

    // Verifica se já tem Premium ativo
    const sub = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { plan: true, premiumUntil: true },
    })

    if (sub?.plan === Plan.PREMIUM && sub.premiumUntil && sub.premiumUntil > new Date()) {
      return Response.json(
        { success: false, error: 'Você já tem Premium ativo.' },
        { status: 400 }
      )
    }

    const result = await createPixPayment(user.email, user.id)

    await prisma.payment.create({
      data: {
        userId: user.id,
        mpPaymentId: result.paymentId,
        status: 'pending',
        amount: PREMIUM_PRICE_BRL,
      },
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    let message = 'Erro ao gerar PIX'

    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'object' && error !== null) {
      const e = error as Record<string, unknown>
      message = String(e.message ?? e.error ?? e.cause ?? JSON.stringify(error))
    }

    if (message === 'Unauthorized') {
      return Response.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    console.error('[checkout] MercadoPago error:', error)
    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
