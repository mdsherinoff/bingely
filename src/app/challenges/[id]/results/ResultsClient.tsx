'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getChallengeById } from '@/lib/challenges'
import { AvailabilityConfig } from '@/types/media'
import {
  generateListMoviePlan,
  generateListPlan,
  MoviePlan,
} from '@/lib/scheduler'
import ListMovieResults from '@/components/results/ListMovieResults'
import PlanActionBar from '@/components/results/PlanActionBar'
import PlanUnavailable from '@/components/results/PlanUnavailable'
import { filmEvents } from '@/lib/ics'
import { CustomList } from '@/types/media'
import { decodeState, toQuery } from '@/lib/urlState'

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
    return decodeState<AvailabilityConfig>(rawConfig)
  }, [rawConfig])

  // Build exact items from challenge for the movie calendar
  const exactItems = useMemo(() => {
    if (!challenge) return null
    return challenge.items.map((i) => ({
      title: i.title,
      runtime: i.runtime,
    }))
  }, [challenge])

  // Films are scheduled session by session into real free slots; the
  // week-based plan only backs the summary stats in the PDF export
  const moviePlan: MoviePlan | null = useMemo(() => {
    if (!config || !exactItems) return null
    return generateListMoviePlan(config, exactItems)
  }, [config, exactItems])

  const plan = useMemo(() => {
    if (!config || !exactItems) return null
    return generateListPlan(config, exactItems, config.pace)
  }, [config, exactItems])

  const editHref = `/challenges/${id}/plan${toQuery({ config: rawConfig })}`

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

  if (!plan || !challenge || !moviePlan || !challengeAsList) {
    return (
      <PlanUnavailable
        retryHref={challenge ? `/challenges/${id}/plan` : '/challenges'}
        onBack={() => router.back()}
      />
    )
  }

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div className="flex flex-col gap-4">
          <p className="text-gold font-mono text-xs tracking-widest">
            CHALLENGE PLAN
          </p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-parchment text-5xl leading-none">
                {challenge.title}
              </h1>
              <p className="text-parchment-dim font-sans">
                {challenge.itemCount} films ·{' '}
                {Math.round(challenge.totalRuntime / 60)}h total
              </p>
              {config?.together && (
                <p className="text-gold font-mono text-xs tracking-widest">
                  ◎◎ PLANNED FOR TWO · SHARED FREE TIME ONLY
                </p>
              )}
              <div className="mt-2">
                <PlanActionBar
                  editHref={editHref}
                  title={challenge.title}
                  calendarEvents={() =>
                    filmEvents(
                      moviePlan.sessions,
                      challenge.items.map((i) => i.title)
                    )
                  }
                />
              </div>
            </div>
            <span className="text-gold/60 flex-shrink-0 font-mono text-4xl">
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
