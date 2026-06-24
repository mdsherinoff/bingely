import { getTrending } from '@/services/tmdb'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const results = await getTrending()
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trending' },
      { status: 500 }
    )
  }
}
