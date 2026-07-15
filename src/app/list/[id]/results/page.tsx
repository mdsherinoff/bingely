'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useResolvedList } from '@/hooks/useResolvedList'
import { useWatchPlan } from '@/hooks/useWatchPlan'
import { AvailabilityConfig, WatchGoal } from '@/types/media'
import CompletionCard from '@/components/results/CompletionCard'
import RuntimeCard from '@/components/results/RuntimeCard'
import FilmstripTimeline from '@/components/results/FilmstripTimeline'
import WeekRow from '@/components/results/WeekRow'
import MilestoneCard from '@/components/results/MilestoneCard'
import ExportButton from '@/components/results/ExportButton'
import ShareButton from '@/components/results/ShareButton'
import { Button } from '@/components/ui'
import Link from 'next/link'
import {
  generateFinishBeforePlan,
  generateVacationPlan,
  generateListPlan,
  generateListMoviePlan,
  generateMixedListPlan,
  MixedListPlan,
  MoviePlan,
} from '@/lib/scheduler'
import MixedListResults from '@/components/results/MixedListResults'
import ListMovieResults from '@/components/results/ListMovieResults'
import { decodeState } from '@/lib/urlState'

export default function ListResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { list, ready } = useResolvedList(id)

  const rawConfig = searchParams.get('config')
  const config: AvailabilityConfig | null = useMemo(() => {
    if (!rawConfig) return null
    return decodeState<AvailabilityConfig>(rawConfig)
  }, [rawConfig])

  const rawGoal = searchParams.get('goal')
  const goal: WatchGoal = useMemo(() => {
    if (!rawGoal) return { mode: 'standard' }
    return decodeState<WatchGoal>(rawGoal) ?? { mode: 'standard' }
  }, [rawGoal])

  const rawItems = searchParams.get('items')
  const exactItems: { title: string; runtime: number; mediaType: 'movie' | 'tv' }[] | null =
    useMemo(() => {
      if (!rawItems) return null
      return decodeState<{ title: string; runtime: number; mediaType: 'movie' | 'tv' }[]>(
        rawItems
      )
    }, [rawItems])

  const rawTitle = searchParams.get('title')

  // Carry every param forward so editing a shared plan pre-fills the
  // planner with these settings — and, since the visitor may not have
  // this list in their own localStorage, with the list itself too.
  const editHref = `/list/${id}/plan?${[
    rawConfig && `config=${rawConfig}`,
    rawGoal && `goal=${rawGoal}`,
    rawItems && `items=${rawItems}`,
    rawTitle && `title=${rawTitle}`,
  ]
    .filter(Boolean)
    .join('&')}`

  const totalItems = list?.items.length ?? 0
  const totalRuntime = list?.items.reduce((acc, i) => acc + i.runtime, 0) ?? 0
  const avgRuntime = totalItems > 0 ? Math.round(totalRuntime / totalItems) : 90
  const hasTV = list?.items.some((i) => i.mediaType === 'tv') ?? false

  const goalPlan = useMemo(() => {
    if (!config || !list) return null
    if (goal.mode === 'finish-before') {
      return generateFinishBeforePlan(
        goal.targetDate,
        totalItems,
        avgRuntime,
        hasTV ? 'tv' : 'movie'
      )
    }
    if (goal.mode === 'vacation') {
      return generateVacationPlan(
        goal.startDate,
        goal.endDate,
        goal.hoursPerDay,
        totalItems,
        avgRuntime,
        hasTV ? 'tv' : 'movie'
      )
    }
    return null
  }, [goal, config, list, totalItems, avgRuntime, hasTV])

  const { plan: standardPlan, loading } = useWatchPlan(
    goal.mode === 'standard' ? config : null,
    totalItems,
    hasTV ? 'tv' : 'movie',
    avgRuntime
  )

  const listPlan = useMemo(() => {
    if (!config || !exactItems) return null
    return generateListPlan(config, exactItems, config.pace)
  }, [config, exactItems])

  const plan = listPlan ?? goalPlan ?? standardPlan

  const allMovies = list?.items.every((i) => i.mediaType === 'movie') ?? false
  const allTV = list?.items.every((i) => i.mediaType === 'tv') ?? false
  const isMixed = !allMovies && !allTV

  const listMoviePlan: MoviePlan | null = useMemo(() => {
    if (!config || !list || !exactItems || !allMovies) return null
    return generateListMoviePlan(config, exactItems)
  }, [config, list, exactItems, allMovies])

  const mixedPlan: MixedListPlan | null = useMemo(() => {
    if (!config || !exactItems || !isMixed) return null
    return generateMixedListPlan(config, exactItems)
  }, [config, exactItems, isMixed])

  if (loading || !ready) {
    return (
      <main className="bg-espresso flex min-h-screen items-center justify-center">
        <p className="text-parchment-faint animate-pulse font-mono text-xs tracking-widest">
          GENERATING YOUR PLAN...
        </p>
      </main>
    )
  }

  if (!plan || !list) {
    return (
      <main className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-rose font-mono">Failed to generate plan</p>
        <Button onClick={() => router.back()} variant="secondary">
          Go back
        </Button>
      </main>
    )
  }

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/list/${id}/plan`}
            className="text-parchment-faint hover:text-parchment-dim w-fit font-mono text-xs tracking-widest transition-colors"
          >
            ← BACK TO PLANNER
          </Link>
          <Link
            href={editHref}
            className="border-line-strong text-parchment hover:border-gold/60 rounded-sm border px-4 py-2 font-sans text-sm transition-colors"
          >
            Edit this plan
          </Link>
        </div>

        {/* Header — always shown */}
        <div className="flex flex-col gap-4">
          <p className="text-gold font-mono text-xs tracking-widest">
            CUSTOM LIST PLAN
          </p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            {list.title}
          </h1>
          <p className="text-parchment-dim font-sans">
            {list.items.length} titles · {Math.round(totalRuntime / 60)}h total
          </p>
        </div>

        {/* Branch — all movies / mixed / all TV */}
        {listMoviePlan ? (
          <ListMovieResults
            moviePlan={listMoviePlan}
            list={list}
            exportPlan={plan}
          />
        ) : mixedPlan ? (
          <MixedListResults
            mixedPlan={mixedPlan}
            list={list}
            exportPlan={plan}
          />
        ) : (
          <>
            {/* existing all-TV week-by-week view */}
            <div className="grid gap-6 md:grid-cols-2">
              <CompletionCard plan={plan} title={list.title} />
              <RuntimeCard plan={plan} />
            </div>

            {plan.weeklyBlocks.length > 1 && (
              <FilmstripTimeline
                blocks={plan.weeklyBlocks}
                completionDate={plan.completionDate}
              />
            )}

            <div className="grid gap-10 md:grid-cols-3">
              <div className="flex flex-col gap-4 md:col-span-2">
                <h2 className="font-display text-parchment text-2xl">
                  Week by week
                </h2>
                <div className="flex max-h-[600px] flex-col gap-3 overflow-y-auto pr-2">
                  {plan.weeklyBlocks.map((block, i) => (
                    <WeekRow
                      key={block.week}
                      block={block}
                      totalEpisodes={plan.totalEpisodes}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="font-display text-parchment text-2xl">
                  Milestones
                </h2>
                <div className="flex flex-col">
                  {plan.milestones.map((m, i) => (
                    <MilestoneCard
                      key={m.percent}
                      milestone={m}
                      isLast={i === plan.milestones.length - 1}
                    />
                  ))}
                </div>
                <div className="border-line mt-2 flex flex-col gap-2 border-t pt-4">
                  <p className="text-parchment-faint mb-1 font-mono text-xs tracking-widest">
                    YOUR TITLES
                  </p>
                  {list.items.map((item, i) => (
                    <div key={item.tmdbId} className="flex items-center gap-2">
                      <span className="text-parchment-faint w-5 font-mono text-xs">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-parchment-dim flex-1 truncate font-mono text-xs">
                        {item.title}
                      </p>
                      <span className="text-parchment-faint flex-shrink-0 font-mono text-xs">
                        {item.runtime}m
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-line mt-2 flex flex-col gap-3 border-t pt-6">
                  <p className="text-parchment-faint font-mono text-xs tracking-widest">
                    EXPORT
                  </p>
                  <ExportButton
                    plan={plan}
                    title={list.title}
                    releaseYear={new Date().getFullYear().toString()}
                  />
                  <ShareButton />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
