import { NextRequest } from 'next/server'
import { requireSession } from '@/lib/auth'
import { getPaymentStatus } from '@/lib/mercadopago'

export async function GET(request: NextRequest) {
  try {
    const user = await requireSession()
    void user

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId || !/^\d+$/.test(paymentId)) {
      return Response.json({ success: false, error: 'ID inválido' }, { status: 400 })
    }

    const status = await getPaymentStatus(paymentId)

    return Response.json({ success: true, status })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro'

    if (message === 'Unauthorized') {
      return Response.json({ success: false, error: 'Não autenticado' }, { status: 401 })
    }

    return Response.json({ success: false, error: message }, { status: 500 })
  }
}
