import { generateWatchPlan } from '@/lib/scheduler'
import { AvailabilityConfig } from '@/types/media'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      config,
      totalEpisodes,
      mediaType,
      runtime,
    }: {
      config: AvailabilityConfig
      totalEpisodes: number
      mediaType: 'movie' | 'tv'
      runtime?: number
    } = body

    if (!config || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const plan = generateWatchPlan(config, totalEpisodes, mediaType, runtime)
    return NextResponse.json(plan)
  } catch (error) {
    console.error('Plan generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
