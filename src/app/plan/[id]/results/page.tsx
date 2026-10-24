'use client'

import { use, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMediaDetails } from '@/hooks/useMediaDetails'
import CompletionCard from '@/components/results/CompletionCard'
import RuntimeCard from '@/components/results/RuntimeCard'
import FilmstripTimeline from '@/components/results/FilmstripTimeline'
import MilestoneCard from '@/components/results/MilestoneCard'
import WeekRow from '@/components/results/WeekRow'
import ExportButton from '@/components/results/ExportButton'
import ShareButton from '@/components/results/ShareButton'
import PlanActionBar from '@/components/results/PlanActionBar'
import PlanUnavailable from '@/components/results/PlanUnavailable'
import { useAchievements } from '@/hooks/useAchievements'
import AchievementToast from '@/components/achievements/AchievementToast'
import { buildTitlePlan, generateMoviePlan, MoviePlan } from '@/lib/scheduler'
import {
  AvailabilityConfig,
  MediaType,
  WatchGoal,
  NewSeasonGoal,
} from '@/types/media'
import MovieResults from '@/components/results/MovieResults'
import TVCalendar from '@/components/results/TVCalendar'
import { decodeState, toQuery } from '@/lib/urlState'

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
    return decodeState<AvailabilityConfig>(rawConfig)
  }, [rawConfig])

  const rawGoal = searchParams.get('goal')
  const goal: WatchGoal = useMemo(() => {
    if (!rawGoal) return { mode: 'standard' }
    return decodeState<WatchGoal>(rawGoal) ?? { mode: 'standard' }
  }, [rawGoal])

  const { media, loading: mediaLoading } = useMediaDetails(Number(id), type)
  const totalEpisodes = media?.episodeCount ?? 1
  const runtime = media?.runtime ?? config?.episodeRuntime ?? 24

  // Same builder the planner preview uses, so the estimate shown before
  // generating always matches this plan
  const plan = useMemo(() => {
    if (!config || !media) return null
    return buildTitlePlan(config, goal, totalEpisodes, type, runtime)
  }, [goal, config, media, totalEpisodes, type, runtime])

  const { unlock, newUnlock, clearNewUnlock } = useAchievements()

  const loading = mediaLoading

  useEffect(() => {
    if (!plan || !media) return

    unlock('first-plan')

    if (media.mediaType === 'tv') {
      if ((media.episodeCount ?? 0) >= 100) unlock('marathon-runner')
      if ((media.episodeCount ?? 0) >= 500) unlock('anime-survivor')
    }

    if (plan.pace === 'hardcore') unlock('hardcore')
    if (plan.totalWeeks <= 2) unlock('speed-runner')

    if (config) {
      const activeDays = Object.entries(config.schedule)
        .filter(([, d]) => d.enabled)
        .map(([day]) => day)
      const onlyWeekends = activeDays.every((d) =>
        ['Saturday', 'Sunday'].includes(d)
      )
      if (onlyWeekends) unlock('weekend-warrior')
    }
  }, [plan, media, config, unlock])

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
        <p className="text-parchment-faint animate-pulse font-mono text-xs tracking-widest">
          GENERATING YOUR PLAN...
        </p>
      </main>
    )
  }

  if (!plan || !media) {
    return (
      <PlanUnavailable
        retryHref={`/plan/${id}?type=${type}`}
        onBack={() => router.back()}
      />
    )
  }

  return (
    <main
      id="main-content"
      className="bg-espresso relative min-h-screen overflow-hidden px-6 py-12"
    >
      {/* Ambient glow from the title's own backdrop */}
      {media.backdropPath && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[440px] overflow-hidden"
        >
          <img
            src={media.backdropPath}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-40 blur-2xl"
          />
          <div className="from-espresso/10 via-espresso/60 to-espresso absolute inset-0 bg-gradient-to-b" />
        </div>
      )}

      <div className="relative mx-auto flex max-w-5xl flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <p className="text-gold font-mono text-xs tracking-widest">
            WATCH PLAN
          </p>

          <div className="flex items-start justify-between gap-4">
            <div className="my-auto flex min-w-0 flex-col gap-2">
              <h1 className="font-display text-parchment text-4xl leading-none sm:text-5xl md:text-6xl">
                {media.title}
              </h1>

              <p className="text-parchment-dim font-mono text-sm sm:text-base">
                {media.releaseYear} · {media.genres.slice(0, 3).join(', ')}
              </p>

              {goal.mode === 'finish-before' && (
                <p className="text-rose font-mono text-xs tracking-widest">
                  ◈ FINISH BEFORE ·{' '}
                  {new Date(goal.targetDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}

              {goal.mode === 'vacation' && (
                <p className="text-rose font-mono text-xs tracking-widest">
                  ◉ VACATION MODE · {goal.hoursPerDay}h/day
                </p>
              )}

              {goal.mode === 'new-season' && (
                <p className="text-rose font-mono text-xs tracking-widest">
                  ◆ NEW SEASON PREP ·{' '}
                  {(goal as NewSeasonGoal).seasonName || 'Catch up plan'}
                </p>
              )}

              <div className="mt-4">
                <PlanActionBar
                  title={media.title}
                  editHref={`/plan/${id}${toQuery({
                    type,
                    config: rawConfig,
                    goal: rawGoal,
                  })}`}
                />
              </div>
            </div>

            {media.posterPath && (
              <div className="border-line aspect-[2/3] w-20 flex-shrink-0 overflow-hidden rounded-sm border sm:w-32 md:w-48">
                <img
                  src={media.posterPath}
                  alt={`${media.title} poster`}
                  className="poster-color h-full w-full object-cover"
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

            {/* Filmstrip timeline — one frame per week */}
            {plan.mediaType === 'tv' && plan.weeklyBlocks.length > 1 && (
              <FilmstripTimeline
                blocks={plan.weeklyBlocks}
                completionDate={plan.completionDate}
              />
            )}

            {/* TV Calendar */}
            {plan.mediaType === 'tv' && config && (
              <div className="flex flex-col gap-4">
                <h2 className="font-display text-parchment text-2xl">
                  Viewing calendar
                </h2>
                <div className="border-line rounded-sm border p-6">
                  <TVCalendar
                    config={config}
                    weeklyBlocks={plan.weeklyBlocks}
                  />
                </div>
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

                <div className="border-line mt-4 flex flex-col gap-3 border-t pt-6">
                  <p className="text-parchment-faint font-mono text-xs tracking-widest">
                    EXPORT
                  </p>

                  <ExportButton
                    plan={plan}
                    title={media.title}
                    releaseYear={media.releaseYear}
                    posterUrl={media.posterPath}
                    genres={media.genres}
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
