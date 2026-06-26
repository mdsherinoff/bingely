'use client'

import { use, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMediaDetails } from '@/hooks/useMediaDetails'
import { useWatchPlan } from '@/hooks/useWatchPlan'
import CompletionCard from '@/components/results/CompletionCard'
import RuntimeCard from '@/components/results/RuntimeCard'
import ProgressChart from '@/components/results/ProgressChart'
import MilestoneCard from '@/components/results/MilestoneCard'
import WeekRow from '@/components/results/WeekRow'
import { Button } from '@/components/ui'
import Link from 'next/link'
import ExportButton from '@/components/results/ExportButton'
import ShareButton from '@/components/results/ShareButton'
import { useAchievements } from '@/hooks/useAchievements'
import AchievementToast from '@/components/achievements/AchievementToast'
import { generateFinishBeforePlan, generateVacationPlan } from '@/lib/scheduler'
import {
  generateNewSeasonPlan,
  generateMoviePlan,
  MoviePlan,
} from '@/lib/scheduler'
import {
  AvailabilityConfig,
  MediaType,
  WatchGoal,
  NewSeasonGoal,
} from '@/types/media'
import MovieResults from '@/components/results/MovieResults'

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = (searchParams.get('type') || 'tv') as MediaType

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

  const { media, loading: mediaLoading } = useMediaDetails(Number(id), type)
  const totalEpisodes = media?.episodeCount ?? 1
  const runtime = media?.runtime ?? config?.episodeRuntime ?? 24

  const standardPlan = useWatchPlan(
    goal.mode === 'standard' ? config : null,
    totalEpisodes,
    type,
    runtime
  )

  const goalPlan = useMemo(() => {
    if (!config || !media) return null

    if (goal.mode === 'finish-before') {
      return generateFinishBeforePlan(
        goal.targetDate,
        totalEpisodes,
        config.episodeRuntime,
        type,
        runtime
      )
    }

    if (goal.mode === 'vacation') {
      return generateVacationPlan(
        goal.startDate,
        goal.endDate,
        goal.hoursPerDay,
        totalEpisodes,
        config.episodeRuntime,
        type,
        runtime
      )
    }

    if (goal.mode === 'new-season') {
      const newSeasonGoal = goal as NewSeasonGoal
      return generateNewSeasonPlan(
        newSeasonGoal.targetDate,
        newSeasonGoal.currentEpisode,
        totalEpisodes,
        config.episodeRuntime,
        type
      )
    }

    return null
  }, [goal, config, media, totalEpisodes, type, runtime])

  const plan = goalPlan ?? standardPlan.plan
  const planLoading = goal.mode === 'standard' ? standardPlan.loading : false

  const { unlock, newUnlock, clearNewUnlock } = useAchievements()

  const loading = mediaLoading || planLoading

  useEffect(() => {
    if (!plan || !media) return

    unlock('first-plan')

    if (media.mediaType === 'tv') {
      if ((media.episodeCount ?? 0) >= 100) unlock('marathon-runner')
      if ((media.episodeCount ?? 0) >= 500) unlock('anime-survivor')
    }

    if (plan.pace === 'hardcore') unlock('hardcore')
    if (plan.totalWeeks <= 2) unlock('speed-runner')

    if (rawConfig) {
      try {
        const parsedConfig = JSON.parse(
          decodeURIComponent(rawConfig)
        ) as AvailabilityConfig
        const activeDays = Object.entries(parsedConfig.schedule)
          .filter(([, d]) => d.enabled)
          .map(([day]) => day)
        const onlyWeekends = activeDays.every((d) =>
          ['Saturday', 'Sunday'].includes(d)
        )
        if (onlyWeekends) unlock('weekend-warrior')
      } catch {}
    }
  }, [plan, media])

  const moviePlan: MoviePlan | null = useMemo(() => {
    if (type !== 'movie' || !config || !media?.runtime) return null
    return generateMoviePlan(config, media.runtime)
  }, [type, config, media])

  if (loading) {
    return (
      <main
        id="main-content"
        className="bg-espresso flex min-h-screen items-center justify-center"
      >
        <p className="text-parchment/30 animate-pulse font-mono text-xs tracking-widest">
          GENERATING YOUR PLAN...
        </p>
      </main>
    )
  }

  if (!plan || !media) {
    return (
      <main
        id="main-content"
        className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-4"
      >
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
        {/* Back link */}
        <Link
          href={`/plan/${id}?type=${type}`}
          className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
        >
          ← BACK TO PLANNER
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4">
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            WATCH PLAN
          </p>

          <div className="flex items-start justify-between gap-4">
            <div className="my-auto flex min-w-0 flex-col gap-2">
              <h1 className="font-display text-parchment text-4xl leading-none sm:text-5xl md:text-6xl">
                {media.title}
              </h1>

              <p className="font-body text-parchment/40 text-sm italic sm:text-base">
                {media.releaseYear} · {media.genres.slice(0, 3).join(', ')}
              </p>

              {goal.mode === 'finish-before' && (
                <p className="text-rose/70 font-mono text-xs tracking-widest">
                  ◈ FINISH BEFORE ·{' '}
                  {new Date(goal.targetDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}

              {goal.mode === 'vacation' && (
                <p className="text-rose/70 font-mono text-xs tracking-widest">
                  ◉ VACATION MODE · {goal.hoursPerDay}h/day
                </p>
              )}

              {goal.mode === 'new-season' && (
                <p className="text-rose/70 font-mono text-xs tracking-widest">
                  ◆ NEW SEASON PREP ·{' '}
                  {(goal as NewSeasonGoal).seasonName || 'Catch up plan'}
                </p>
              )}
            </div>

            {media.posterPath && (
              <div className="border-gold/10 aspect-[2/3] w-20 flex-shrink-0 overflow-hidden rounded-sm border sm:w-32 md:w-48">
                <img
                  src={media.posterPath}
                  alt={`${media.title} poster`}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {type === 'movie' && moviePlan ? (
          <MovieResults moviePlan={moviePlan} media={media} exportPlan={plan} />
        ) : (
          <>
            {/* Top row — completion + runtime */}
            <div className="grid gap-6 md:grid-cols-2">
              <CompletionCard plan={plan} title={media.title} />
              <div className="flex flex-col gap-4">
                <RuntimeCard plan={plan} />
              </div>
            </div>

            {/* Progress chart */}
            {plan.mediaType === 'tv' && plan.weeklyBlocks.length > 1 && (
              <div className="border-gold/10 rounded-sm border p-6">
                <ProgressChart blocks={plan.weeklyBlocks} />
              </div>
            )}

            {/* Bottom row — weekly breakdown + milestones + export */}
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

                <div className="border-gold/10 mt-4 flex flex-col gap-3 border-t pt-6">
                  <p className="text-parchment/30 font-mono text-xs tracking-widest">
                    EXPORT
                  </p>

                  <ExportButton
                    plan={plan}
                    title={media.title}
                    releaseYear={media.releaseYear}
                  />

                  <ShareButton />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AchievementToast achievement={newUnlock} onDismiss={clearNewUnlock} />
    </main>
  )
}
