import { MercadoPagoConfig, Payment } from 'mercadopago'

export const PREMIUM_PRICE_BRL = 19.9
export const PREMIUM_DAYS = 30

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
}

export async function createPixPayment(
  userEmail: string,
  userId: string
): Promise<PixPaymentResult> {
  const client = getMpClient()
  const payment = new Payment(client)

  const result = await payment.create({
    body: {
      payment_method_id: 'pix',
      transaction_amount: PREMIUM_PRICE_BRL,
      description: 'Plano Premium — Shopee Video Downloader (30 dias)',
      payer: {
        email: userEmail,
      },
      metadata: {
        user_id: userId,
      },
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
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
  }
}

export async function getPaymentStatus(paymentId: string): Promise<string> {
  const client = getMpClient()
  const payment = new Payment(client)
  const result = await payment.get({ id: paymentId })
  return result.status ?? 'unknown'
}
