export interface VideoData {
  videoUrl: string
  cover: string
  caption: string
}

const BLOCKED_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^0\./,
  /^localhost$/i,
  /^metadata\.google\.internal$/i,
]

function isBlockedHost(hostname: string): boolean {
  return BLOCKED_PATTERNS.some((p) => p.test(hostname))
}

async function resolveShortUrl(shortUrl: string): Promise<string> {
  const parsed = new URL(shortUrl)
  if (isBlockedHost(parsed.hostname)) {
    throw new Error('Invalid URL host')
  }

  const response = await fetch(shortUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(10_000),
  })

  const finalUrl = response.url
  const finalParsed = new URL(finalUrl)

  if (isBlockedHost(finalParsed.hostname)) {
    throw new Error('Redirect target is not allowed')
  }

  const allowed = [
    'shopee.com',
    'shopee.com.br',
    'shopee.co.id',
    'shopee.com.my',
    'shopee.com.ph',
    'shopee.com.sg',
    'shopee.com.th',
    'shopee.vn',
    'shopee.tw',
  ]

  const isAllowed = allowed.some(
    (d) =>
      finalParsed.hostname === d || finalParsed.hostname.endsWith(`.${d}`)
  )

  if (!isAllowed) {
    throw new Error('Redirect target is not a Shopee domain')
  }

  return finalUrl
}

function extractFromJson(html: string): Partial<VideoData> {
  // Try window.__NEXT_DATA__ or similar embedded JSON
  const jsonPatterns = [
    /<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i,
    /window\.__initial_store__\s*=\s*({[\s\S]*?});\s*<\/script>/i,
    /<script[^>]+type="application\/json"[^>]*>([\s\S]*?)<\/script>/i,
  ]

  for (const pattern of jsonPatterns) {
    const match = html.match(pattern)
    if (!match) continue

    try {
      const json = JSON.parse(match[1])
      const str = JSON.stringify(json)

      const videoMatch = str.match(/"(https?:\/\/[^"]*?\.mp4[^"]*?)"/i)
      const coverMatch = str.match(/"(https?:\/\/[^"]*?(?:jpg|jpeg|png|webp)[^"]*?)"/i)
      const captionMatch =
        str.match(/"title"\s*:\s*"([^"]{5,200})"/) ||
        str.match(/"name"\s*:\s*"([^"]{5,200})"/) ||
        str.match(/"description"\s*:\s*"([^"]{5,200})"/)

      if (videoMatch) {
        return {
          videoUrl: videoMatch[1],
          cover: coverMatch ? coverMatch[1] : '',
          caption: captionMatch ? captionMatch[1] : '',
        }
      }
    } catch {
      // continue to next pattern
    }
  }

  return {}
}

function extractFromRegex(html: string): Partial<VideoData> {
  // Match Shopee CDN video URLs
  const videoPatterns = [
    /https:\/\/down-[^"'\s]+\.mp4[^"'\s]*/gi,
    /https:\/\/cf-shopee[^"'\s]+\.mp4[^"'\s]*/gi,
    /https:\/\/[^"'\s]*susercontent\.com[^"'\s]+\.mp4[^"'\s]*/gi,
    /"(https?:\/\/[^"]*?\.mp4(?:\?[^"]*)?)"/.source,
  ]

  let videoUrl = ''
  for (const pattern of videoPatterns) {
    const re = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern
    const match = re.exec(html)
    if (match) {
      videoUrl = match[1] ?? match[0]
      break
    }
  }

  const coverPatterns = [
    /https:\/\/[^"'\s]*susercontent\.com[^"'\s]+\.jpg[^"'\s]*/gi,
    /"og:image"\s+content="([^"]+)"/i,
    /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i,
  ]

  let cover = ''
  for (const pattern of coverPatterns) {
    const match = pattern instanceof RegExp ? pattern.exec(html) : null
    if (match) {
      cover = match[1] ?? match[0]
      break
    }
  }

  const captionPatterns = [
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i,
    /<meta[^>]+name="description"[^>]+content="([^"]{5,200})"/i,
    /<title>([^<]{5,200})<\/title>/i,
  ]

  let caption = ''
  for (const pattern of captionPatterns) {
    const match = pattern.exec(html)
    if (match?.[1]) {
      caption = match[1].trim()
      break
    }
  }

  return { videoUrl, cover, caption }
}

function validateVideoUrl(url: string): void {
  if (!url) throw new Error('No video URL found in this page')

  const parsed = new URL(url)

  if (isBlockedHost(parsed.hostname)) {
    throw new Error('Video URL host is not allowed')
  }

  const allowedCdnPatterns = [
    /\.susercontent\.com$/,
    /^down-[a-z0-9-]+\./,
    /cf-shopee/,
    /shopee\./,
  ]

  const isAllowedCdn = allowedCdnPatterns.some((p) => p.test(parsed.hostname))
  if (!isAllowedCdn) {
    throw new Error('Video URL is not from Shopee CDN')
  }

  if (!parsed.pathname.includes('.mp4')) {
    throw new Error('URL does not point to an mp4 video')
  }
}

export async function scrapeShopeeVideo(inputUrl: string): Promise<VideoData> {
  // Resolve short URL if needed
  const resolvedUrl = inputUrl.includes('shp.ee')
    ? await resolveShortUrl(inputUrl)
    : inputUrl

  const parsedResolved = new URL(resolvedUrl)
  if (isBlockedHost(parsedResolved.hostname)) {
    throw new Error('Invalid URL host')
  }

  // Fetch the page
  const response = await fetch(resolvedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: HTTP ${response.status}`)
  }

  const html = await response.text()

  // Try JSON extraction first, fall back to regex
  const fromJson = extractFromJson(html)
  const fromRegex = extractFromRegex(html)

  const videoUrl = fromJson.videoUrl || fromRegex.videoUrl || ''
  const cover = fromJson.cover || fromRegex.cover || ''
  const caption = fromJson.caption || fromRegex.caption || ''

  validateVideoUrl(videoUrl)

  return {
    videoUrl: videoUrl.replace(/&amp;/g, '&'),
    cover: cover.replace(/&amp;/g, '&'),
    caption: caption.replace(/&amp;/g, '&').slice(0, 500),
  }
}
