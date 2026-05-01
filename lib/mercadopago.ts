import { MercadoPagoConfig, Payment } from 'mercadopago'

export type PlanType = 'monthly' | 'annual'

export const PLAN_CONFIG: Record<PlanType, { price: number; days: number; label: string }> = {
  monthly: { price: 8,  days: 30,  label: 'Plano Mensal — Shopee Video Downloader (30 dias)' },
  annual:  { price: 60, days: 365, label: 'Plano Anual — Shopee Video Downloader (365 dias)' },
}

export function getMpClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
    options: { timeout: 10000 },
  })
}

export interface PixPaymentResult {
  paymentId: string
  qrCodeBase64: string
  qrCode: string
  expiresAt: string
  plan: PlanType
  days: number
  price: number
}

export async function createPixPayment(
  userEmail: string,
  userId: string,
  plan: PlanType = 'monthly'
): Promise<PixPaymentResult> {
  const { price, days, label } = PLAN_CONFIG[plan]
  const client = getMpClient()
  const payment = new Payment(client)

  const result = await payment.create({
    body: {
      payment_method_id: 'pix',
      transaction_amount: price,
      description: label,
      payer: { email: userEmail },
      metadata: { user_id: userId, plan },
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  })

  const txData = result.point_of_interaction?.transaction_data
  if (!txData?.qr_code_base64 || !txData?.qr_code) {
    throw new Error('Falha ao gerar QR Code PIX')
  }

  return {
    paymentId: String(result.id),
    qrCodeBase64: txData.qr_code_base64,
    qrCode: txData.qr_code,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    plan,
    days,
    price,
  }
}

export async function getPaymentStatus(paymentId: string): Promise<string> {
  const client = getMpClient()
  const payment = new Payment(client)
  const result = await payment.get({ id: paymentId })
  return result.status ?? 'unknown'
}
