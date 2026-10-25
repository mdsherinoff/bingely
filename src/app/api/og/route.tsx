import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Preview card shown when a plan link is pasted into WhatsApp, iMessage,
// Slack, etc.: poster, title and finish date in the site's colours
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams
  const title = (q.get('title') ?? 'Your watch plan').slice(0, 80)
  const date = (q.get('date') ?? '').slice(0, 40)
  const line = (q.get('line') ?? '').slice(0, 90)
  const posterParam = q.get('poster')
  // Only TMDB images — never fetch arbitrary URLs on the server
  const poster =
    posterParam && posterParam.startsWith('https://image.tmdb.org/t/p/')
      ? posterParam
      : null

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#100c09',
        padding: 64,
        gap: 56,
        alignItems: 'center',
      }}
    >
      {poster && (
        <img
          src={poster}
          width={330}
          height={495}
          alt=""
          style={{
            borderRadius: 8,
            border: '2px solid #4a3a24',
            objectFit: 'cover',
          }}
        />
      )}
      <div
        style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }}
      >
        <div style={{ color: '#e0a43c', fontSize: 26, letterSpacing: 6 }}>
          WATCH PLAN
        </div>
        <div
          style={{
            color: '#f3e9d7',
            fontSize: title.length > 30 ? 60 : 76,
            lineHeight: 1.05,
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        {date && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginTop: 18,
            }}
          >
            <div style={{ color: '#b5a78f', fontSize: 26, letterSpacing: 4 }}>
              YOU&apos;LL FINISH ON
            </div>
            <div style={{ color: '#e0a43c', fontSize: 64, fontWeight: 700 }}>
              {date}
            </div>
          </div>
        )}
        {line && <div style={{ color: '#b5a78f', fontSize: 30 }}>{line}</div>}
        <div style={{ color: '#8d7f68', fontSize: 28, marginTop: 'auto' }}>
          Bingely
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, immutable' },
    }
  )
}
