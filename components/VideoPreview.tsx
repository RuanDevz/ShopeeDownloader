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
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    // Detect if the browser supports sharing files (mobile Web Share API)
    try {
      const testFile = new File([''], 'test.mp4', { type: 'video/mp4' })
      setCanShare('share' in navigator && 'canShare' in navigator && navigator.canShare({ files: [testFile] }))
    } catch {
      setCanShare(false)
    }
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

      // On mobile: use Web Share API → "Salvar na Galeria" option appears
      if (canShare) {
        const file = new File([blob], 'shopee-video.mp4', { type: 'video/mp4' })
        try {
          await navigator.share({ files: [file], title: data.caption || 'Vídeo Shopee' })
          return
        } catch (e) {
          // User cancelled share sheet — don't show error
          if (e instanceof Error && e.name === 'AbortError') return
          // Share failed, fall through to regular download
        }
      }

      // Desktop / fallback: trigger <a download>
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = 'shopee-video.mp4'
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      setDlError('Falha na conexão. Tente novamente.')
    } finally {
      setDownloading(false)
    }
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
              {downloading ? 'Baixando...' : canShare ? 'Salvar na Galeria' : 'Baixar Vídeo'}
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
