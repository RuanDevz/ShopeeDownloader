'use client'

import { useState } from 'react'
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
  const [copied, setCopied] = useState(false)
  const [dlError, setDlError] = useState('')

  async function handleDownload() {
    setDownloading(true)
    setDlError('')
    try {
      const res = await fetch(
        `/api/download?url=${encodeURIComponent(data.videoUrl)}`
      )

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setDlError(json.error ?? 'Erro no download')
        return
      }

      const blob = await res.blob()
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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-5">
        {data.cover && (
          <div className="relative w-full sm:w-40 h-48 sm:h-40 shrink-0 rounded-xl overflow-hidden bg-gray-100">
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

          <div className="flex flex-wrap gap-2 mt-auto">
            <Button onClick={handleDownload} loading={downloading} size="md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? 'Baixando...' : 'Baixar Vídeo'}
            </Button>

            <Button variant="outline" size="md" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copiado!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Copiar Link
                </>
              )}
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
