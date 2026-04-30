import { z } from 'zod'

const ALLOWED_DOMAINS = [
  'shp.ee',
  'shopee.com',
  'shopee.com.br',
  'shopee.co.id',
  'shopee.com.my',
  'shopee.com.ph',
  'shopee.com.sg',
  'shopee.com.th',
  'shopee.vn',
  'shopee.tw',
  'br.shp.ee'
]

function isAllowedShopeeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    return ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

export const extractUrlSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine(isAllowedShopeeUrl, {
      message: 'Only Shopee URLs are allowed (shp.ee or shopee domains)',
    }),
})

export const downloadUrlSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine((url) => {
      try {
        const parsed = new URL(url)
        const hostname = parsed.hostname.toLowerCase()
        return (
          hostname.endsWith('.susercontent.com') ||
          hostname.endsWith('.shopee.com') ||
          hostname.includes('down-') ||
          hostname.includes('cf-shopee') ||
          /\.(shopee|susercontent)\./.test(hostname)
        )
      } catch {
        return false
      }
    }, 'URL must be from Shopee CDN'),
})

export type ExtractUrlInput = z.infer<typeof extractUrlSchema>
export type DownloadUrlInput = z.infer<typeof downloadUrlSchema>
