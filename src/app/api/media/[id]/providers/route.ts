import { getWatchProviders } from '@/services/tmdb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const type = request.nextUrl.searchParams.get('type')
  const region = (
    request.nextUrl.searchParams.get('region') ?? 'US'
  ).toUpperCase()

  if (type !== 'movie' && type !== 'tv') {
    return NextResponse.json(
      { error: 'Valid type required (movie or tv)' },
      { status: 400 }
    )
  }
  if (!/^[A-Z]{2}$/.test(region) || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid id or region' }, { status: 400 })
  }

  try {
    const providers = await getWatchProviders(Number(id), type, region)
    return NextResponse.json(providers, {
      headers: {
        'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=86400',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch watch providers' },
      { status: 502 }
    )
  }
}
