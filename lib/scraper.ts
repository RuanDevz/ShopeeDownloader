export interface VideoData {
  videoUrl: string
  cover: string
  caption: string
}

const EXTRACTOR_URL = 'https://hwdahtwlpjlwrmkgimvq.supabase.co/functions/v1/shopee-extractor'

export async function scrapeShopeeVideo(inputUrl: string): Promise<VideoData> {
  const response = await fetch(EXTRACTOR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: inputUrl }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Extractor API error: HTTP ${response.status}${text ? ` — ${text}` : ''}`)
  }

  const json = await response.json()

  if (!json.success || !json.videoUrl) {
    throw new Error(json.error ?? 'No video URL returned from extractor')
  }

  return {
    videoUrl: json.videoUrl,
    cover: json.cover ?? '',
    caption: json.caption ?? '',
  }
}
