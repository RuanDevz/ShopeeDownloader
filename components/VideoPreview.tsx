'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Button from './ui/Button'
import Card from './ui/Card'

interface VideoData {
  videoUrl: string
  cover: string
  caption: string
}

interface VideoPreviewProps {
  data: VideoData
}

export default function VideoPreview({ data }: VideoPreviewProps) {
  const [downloading, setDownloading] = useState(false)
  const [dlError, setDlError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detecta se é mobile
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const hasWebShare = 'share' in navigator && 'canShare' in navigator
    setIsMobile(isMobileDevice && hasWebShare)
  }, [])

  async function handleDownload() {
    setDownloading(true)
    setDlError('')
    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(data.videoUrl)}`)

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setDlError(json.error ?? 'Erro no download')
        return
      }

      const blob = await res.blob()

      // Mobile: Abre direto na galeria do celular
      if (isMobile) {
        const file = new File([blob], 'shopee-video.mp4', { type: 'video/mp4' })
        try {
          await navigator.share({ files: [file], title: data.caption || 'Vídeo Shopee' })
        } catch (e) {
          // Se o usuário cancelou ou houve erro, faz fallback para download
          if (e instanceof Error && e.name !== 'AbortError') {
            downloadToDevice(blob)
          }
        }
        return
      }

      // Desktop: Download imediato
      downloadToDevice(blob)
    } catch {
      setDlError('Falha na conexão. Tente novamente.')
    } finally {
      setDownloading(false)
    }
  }

  function downloadToDevice(blob: Blob) {
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = 'shopee-video.mp4'
    a.click()
    URL.revokeObjectURL(objectUrl)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4">
        {data.cover && (
          <div className="relative w-full sm:w-40 h-52 sm:h-40 shrink-0 rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={data.cover}
              alt="Capa do vídeo"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {data.caption && (
            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
              {data.caption}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 mt-auto">
            <Button onClick={handleDownload} loading={downloading} size="md" className="w-full sm:w-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? 'Baixando...' : isMobile ? 'Salvar na Galeria' : 'Baixar Vídeo'}
            </Button>
          </div>

          {dlError && (
            <p className="text-xs text-red-500">{dlError}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
