'use client'

import { useState } from 'react'
import Image from 'next/image'
import Card from './ui/Card'
import Button from './ui/Button'

interface HistoryItem {
  id: string
  caption: string
  cover: string
  videoUrl: string
  createdAt: string
}

interface DownloadHistoryProps {
  items: HistoryItem[]
}

export default function DownloadHistory({ items }: DownloadHistoryProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  async function handleDownload(item: HistoryItem) {
    setDownloading(item.id)
    try {
      const res = await fetch(`/api/download?url=${encodeURIComponent(item.videoUrl)}`)
      if (!res.ok) return

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'shopee-video.mp4'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-sm">Nenhum download ainda</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center gap-4">
            {item.cover ? (
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <Image src={item.cover} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-16 h-16 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                {item.caption || 'Vídeo do Shopee'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              loading={downloading === item.id}
              onClick={() => handleDownload(item)}
              className="shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
