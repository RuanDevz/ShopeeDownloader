'use client'

import { useEffect, useState, useCallback } from 'react'
import Button from './ui/Button'

interface PixData {
  paymentId: string
  qrCodeBase64: string
  qrCode: string
  expiresAt: string
}

interface PixPaymentModalProps {
  onClose: () => void
  onSuccess?: () => void
  plan?: 'monthly' | 'annual'
}

export default function PixPaymentModal({ onClose, onSuccess, plan = 'monthly' }: PixPaymentModalProps) {
  const planLabel = plan === 'annual' ? 'R$ 60,00 / ano' : 'R$ 8,00 / mês'
  const accessLabel = plan === 'annual' ? 'Acesso por 365 dias' : 'Acesso por 30 dias'
  const [step, setStep] = useState<'loading' | 'qr' | 'checking' | 'success' | 'error'>('loading')
  const [pixData, setPixData] = useState<PixData | null>(null)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [timeLeft, setTimeLeft] = useState(1800)

  // Generate PIX on mount
  useEffect(() => {
    let cancelled = false

    async function generate() {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const json = await res.json()

        if (!cancelled) {
          if (!json.success) {
            setErrorMsg(json.error ?? 'Erro ao gerar PIX')
            setStep('error')
          } else {
            setPixData(json.data)
            setStep('qr')
          }
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('Falha na conexão. Tente novamente.')
          setStep('error')
        }
      }
    }

    generate()
    return () => { cancelled = true }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (step !== 'qr') return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setStep('error')
          setErrorMsg('QR Code expirado. Tente novamente.')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  // Poll payment status
  const pollStatus = useCallback(async (paymentId: string) => {
    const maxAttempts = 120
    let attempts = 0

    const interval = setInterval(async () => {
      attempts++
      try {
        const res = await fetch(`/api/payment-status?paymentId=${paymentId}`)
        const json = await res.json()

        if (json.status === 'approved') {
          clearInterval(interval)
          setStep('success')
          setTimeout(() => {
            onSuccess?.()
            window.location.reload()
          }, 2000)
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval)
        }
      } catch {
        // keep polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [onSuccess])

  useEffect(() => {
    if (step === 'qr' && pixData) {
      const cleanup = pollStatus(pixData.paymentId)
      return () => { cleanup.then(fn => fn()) }
    }
  }, [step, pixData, pollStatus])

  async function handleCopy() {
    if (!pixData) return
    try {
      await navigator.clipboard.writeText(pixData.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // fallback
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-[#EE4D2D] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">Ativar Premium</h2>
            <p className="text-orange-100 text-sm">{planLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-12 h-12 border-4 border-[#EE4D2D] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Gerando QR Code PIX...</p>
            </div>
          )}

          {step === 'qr' && pixData && (
            <div className="flex flex-col items-center gap-5">
              {/* Benefits */}
              <div className="w-full bg-green-50 rounded-xl p-4 space-y-1.5">
                {['Downloads ilimitados', 'Sem limite diário', accessLabel].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-green-700">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {b}
                  </div>
                ))}
              </div>

              {/* QR Code */}
              <div className="bg-white border-2 border-gray-100 rounded-xl p-3 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-48 h-48"
                />
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expira em <span className="font-mono font-bold text-[#EE4D2D]">{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
              </div>

              {/* Copy button */}
              <Button variant="outline" className="w-full" onClick={handleCopy}>
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Código copiado!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Copiar código PIX
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Após o pagamento, o Premium é ativado automaticamente em instantes.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">Pagamento confirmado!</p>
                <p className="text-sm text-gray-500 mt-1">Seu Premium está ativo. {accessLabel}.</p>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">{errorMsg || 'Algo deu errado'}</p>
              </div>
              <Button onClick={onClose} variant="outline">Fechar</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
