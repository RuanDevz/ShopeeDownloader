'use client'

import { useState, useTransition } from 'react'
import Button from './ui/Button'
import VideoPreview from './VideoPreview'
import PixPaymentModal from './PixPaymentModal'
import GoogleSignInButton from './GoogleSignInButton'

interface VideoData {
  videoUrl: string
  cover: string
  caption: string
}

interface UsageInfo {
  used: number
  limit: number | null
  isPremium: boolean
  isAnon?: boolean
}

interface ExtractFormProps {
  isLoggedIn?: boolean
  large?: boolean
}

export default function ExtractForm({ isLoggedIn = false, large = false }: ExtractFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [showPixModal, setShowPixModal] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUrl(text.trim())
        setError('')
      }
    } catch {
      setError('Não foi possível acessar a área de transferência. Cole manualmente.')
    }
  }

  function handleExtract() {
    const trimmed = url.trim()
    if (!trimmed) return
    setError('')
    setVideoData(null)
    setShowAuthPrompt(false)
    setUrl('')

    startTransition(async () => {
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        })

        const json = await res.json()

        if (!json.success) {
          if (json.requiresAuth) { setShowAuthPrompt(true); return }
          if (json.requiresUpgrade) { setShowPixModal(true); return }
          setError(json.error ?? 'Erro desconhecido')
          return
        }

        setVideoData(json.data)
        setUsage(json.usage)
      } catch {
        setError('Falha na conexão. Tente novamente.')
      }
    })
  }

  const inputClass = large
    ? 'w-full rounded-xl border border-gray-200 bg-white pl-5 pr-24 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent shadow-sm'
    : 'w-full rounded-xl border border-gray-200 bg-white pl-4 pr-20 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent'

  const pasteBtnClass = large
    ? 'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors'
    : 'absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors'

  return (
    <div className="w-full space-y-4">
      <div className={`flex gap-3 ${large ? 'flex-col sm:flex-row' : 'flex-row'}`}>
        <div className="relative flex-1">
          <input
            className={inputClass}
            placeholder="Cole o link do Shopee aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isPending && handleExtract()}
          />
          <button
            type="button"
            onClick={handlePaste}
            className={pasteBtnClass}
            aria-label="Colar link"
          >
            <svg className={large ? 'w-4 h-4' : 'w-3.5 h-3.5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Colar
          </button>
        </div>
        <Button
          onClick={handleExtract}
          loading={isPending}
          disabled={!url.trim()}
          size={large ? 'lg' : 'md'}
          className={large ? 'w-full sm:w-auto shrink-0' : 'shrink-0'}
        >
          {isPending ? 'Extraindo...' : 'Extrair'}
        </Button>
      </div>

      {/* Erro */}
      {error && (
        <p className="text-sm text-red-500 pl-1">{error}</p>
      )}

      {/* Prompt de autenticação (anônimo atingiu o limite) */}
      {showAuthPrompt && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#EE4D2D] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Limite gratuito atingido</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Entre com Google para ter <strong>5 downloads/dia</strong> grátis ou ative o <strong>Premium</strong> para ilimitados.
              </p>
            </div>
          </div>
          <div className="max-w-xs">
            <GoogleSignInButton />
          </div>
        </div>
      )}

      {/* Barra de uso do usuário logado */}
      {usage && !usage.isPremium && !usage.isAnon && isLoggedIn && (
        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span><strong>{usage.used}/{usage.limit}</strong> downloads hoje</span>
          </div>
          <button onClick={() => setShowPixModal(true)} className="text-xs font-semibold text-[#EE4D2D] hover:underline">
            Upgrade →
          </button>
        </div>
      )}

      {/* Uso anônimo */}
      {usage?.isAnon && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500">
            <strong>{usage.used}/{usage.limit}</strong> downloads gratuitos usados hoje
          </p>
          <a href="/login" className="text-xs font-semibold text-[#EE4D2D] hover:underline">
            Entrar para mais →
          </a>
        </div>
      )}

      {/* Premium ativo */}
      {usage?.isPremium && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-green-700 font-medium">Premium ativo — ilimitado</span>
        </div>
      )}

      {videoData && <VideoPreview data={videoData} />}

      {showPixModal && <PixPaymentModal onClose={() => setShowPixModal(false)} />}
    </div>
  )
}
