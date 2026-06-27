'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getChallengeById } from '@/lib/challenges'
import { useWatchPlan } from '@/hooks/useWatchPlan'
import { AvailabilityConfig, WatchGoal } from '@/types/media'
import { Button } from '@/components/ui'
import Link from 'next/link'
import {
  generateFinishBeforePlan,
  generateVacationPlan,
  generateListMoviePlan,
  MoviePlan,
} from '@/lib/scheduler'
import ListMovieResults from '@/components/results/ListMovieResults'
import { CustomList } from '@/types/media'

export default function ChallengeResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()

  const challenge = getChallengeById(id)

  const rawConfig = searchParams.get('config')
  const config: AvailabilityConfig | null = useMemo(() => {
    if (!rawConfig) return null
    try {
      return JSON.parse(decodeURIComponent(rawConfig))
    } catch {
      return null
    }
  }, [rawConfig])

  const rawGoal = searchParams.get('goal')
  const goal: WatchGoal = useMemo(() => {
    if (!rawGoal) return { mode: 'standard' }
    try {
      return JSON.parse(decodeURIComponent(rawGoal))
    } catch {
      return { mode: 'standard' }
    }
  }, [rawGoal])

  const totalItems = challenge?.itemCount ?? 0
  const avgRuntime = challenge
    ? Math.round(challenge.totalRuntime / challenge.itemCount)
    : 90

  const goalPlan = useMemo(() => {
    if (!config || !challenge) return null
    if (goal.mode === 'finish-before') {
      return generateFinishBeforePlan(
        goal.targetDate,
        totalItems,
        avgRuntime,
        'movie'
      )
    }
    if (goal.mode === 'vacation') {
      return generateVacationPlan(
        goal.startDate,
        goal.endDate,
        goal.hoursPerDay,
        totalItems,
        avgRuntime,
        'movie'
      )
    }
    return null
  }, [goal, config, challenge, totalItems, avgRuntime])

  const { plan: standardPlan, loading } = useWatchPlan(
    goal.mode === 'standard' ? config : null,
    totalItems,
    'movie',
    avgRuntime
  )

  const plan = goalPlan ?? standardPlan

  // Build exact items from challenge for the movie calendar
  const exactItems = useMemo(() => {
    if (!challenge) return null
    return challenge.items.map((i) => ({
      title: i.title,
      runtime: i.runtime,
    }))
  }, [challenge])

  const moviePlan: MoviePlan | null = useMemo(() => {
    if (!config || !exactItems) return null
    return generateListMoviePlan(config, exactItems)
  }, [config, exactItems])

  // Convert challenge to CustomList shape for ListMovieResults
  const challengeAsList: CustomList | null = useMemo(() => {
    if (!challenge) return null
    return {
      id: challenge.id,
      title: challenge.title,
      createdAt: new Date().toISOString(),
      items: challenge.items.map((i) => ({
        tmdbId: i.tmdbId,
        title: i.title,
        mediaType: i.mediaType,
        posterPath: null,
        runtime: i.runtime,
        releaseYear: i.year,
      })),
    }
  }, [challenge])

  if (loading) {
    return (
      <main className="bg-espresso flex min-h-screen items-center justify-center">
        <p className="text-parchment/30 animate-pulse font-mono text-xs tracking-widest">
          GENERATING YOUR PLAN...
        </p>
      </main>
    )
  }

  if (!plan || !challenge || !moviePlan || !challengeAsList) {
    return (
      <main className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-body text-rose">Failed to generate plan</p>
        <Button onClick={() => router.back()} variant="secondary">
          Go back
        </Button>
      </main>
    )
  }

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <Link
          href={`/challenges/${id}/plan`}
          className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
        >
          ← BACK TO PLANNER
        </Link>

        <div className="flex flex-col gap-4">
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            CHALLENGE PLAN
          </p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-parchment text-5xl leading-none">
                {challenge.title}
              </h1>
              <p className="font-body text-parchment/40 italic">
                {challenge.itemCount} films ·{' '}
                {Math.round(challenge.totalRuntime / 60)}h total
              </p>
            </div>
            <span className="text-gold/30 flex-shrink-0 font-mono text-4xl">
              {challenge.icon}
            </span>
          </div>
        </div>

        <ListMovieResults
          moviePlan={moviePlan}
          list={challengeAsList}
          exportPlan={plan}
        />
      </div>
    </main>
  )
}
