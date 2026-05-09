'use client'

import { useState, useEffect } from 'react'

type Platform = 'ios' | 'android' | 'other'

const TELEGRAM_URL = 'https://t.me/shopee_downlaoder_bot'

export default function PlatformRecommendation() {
  const [platform, setPlatform] = useState<Platform | null>(null)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(ua) || (ua.includes('mac') && 'ontouchend' in document)
    const isAndroid = /android/.test(ua)
    setPlatform(isIOS ? 'ios' : isAndroid ? 'android' : 'other')
  }, [])

  if (platform === null || platform === 'other') return null

  if (platform === 'ios') {
    return (
      <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-gray-900">Você está no iOS</p>
          <p className="text-xs text-gray-600 mt-0.5">
            Recomendamos baixar os vídeos diretamente aqui pelo site — é a forma mais rápida e simples no seu iPhone ou iPad.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-left">
      <svg className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.538-.196 1.006.128.832.938z"/>
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Você está no Android</p>
        <p className="text-xs text-gray-600 mt-0.5 mb-2">
          Para Android, recomendamos usar nosso bot do Telegram — é mais rápido e os vídeos vão direto para sua galeria.
        </p>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Entrar no Telegram
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  )
}
