import { getMovieDetails, getTVDetails } from '@/services/tmdb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const type = request.nextUrl.searchParams.get('type') as 'movie' | 'tv'

  if (!type || !['movie', 'tv'].includes(type)) {
    return NextResponse.json(
      { error: 'Valid type required (movie or tv)' },
      { status: 400 }
    )
  }

  try {
    const details =
      type === 'movie'
        ? await getMovieDetails(Number(id))
        : await getTVDetails(Number(id))

    return NextResponse.json(details)
  } catch (error) {
    console.error('Media detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media details' },
      { status: 500 }
    )
  }
}
