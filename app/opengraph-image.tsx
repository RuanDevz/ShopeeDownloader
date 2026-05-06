import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7f5 0%, #ffffff 60%, #fff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo icon */}
        <div
          style={{
            background: '#EE4D2D',
            width: '96px',
            height: '96px',
            borderRadius: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            boxShadow: '0 8px 32px rgba(238,77,45,0.3)',
          }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v13M5 13l7 7 7-7" />
          </svg>
        </div>

        <div
          style={{
            fontSize: '58px',
            fontWeight: 800,
            color: '#111827',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}
        >
          Baixe vídeos do{' '}
          <span style={{ color: '#EE4D2D' }}>Shopee</span>
          {' '}grátis
        </div>

        <div
          style={{
            fontSize: '26px',
            color: '#6B7280',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
            marginBottom: '40px',
          }}
        >
          Cole o link, extraia e salve em MP4 · Sem marca d&apos;água · Qualidade original
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['Grátis para começar', '100% Online', 'Sem instalação'].map((tag) => (
            <div
              key={tag}
              style={{
                background: '#FFF0ED',
                color: '#EE4D2D',
                border: '1.5px solid #FECDBB',
                borderRadius: '100px',
                padding: '8px 20px',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '20px',
            color: '#9CA3AF',
            fontWeight: 500,
          }}
        >
          shopeedownloader.com
        </div>
      </div>
    ),
    { ...size }
  )
}
