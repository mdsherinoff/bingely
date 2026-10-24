'use client'

import { useState, use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMediaDetails } from '@/hooks/useMediaDetails'
import { defaultSchedule, weeklyMinutes } from '@/lib/scheduleUtils'
import {
  AvailabilityConfig,
  PaceMode,
  WeekSchedule,
  MediaType,
  WatchGoal,
} from '@/types/media'
import MediaSummary from '@/components/plan/MediaSummary'
import DaySelector from '@/components/plan/DaySelector'
import PaceSelector from '@/components/plan/PaceSelector'
import { Button } from '@/components/ui'
import GoalModeSelector from '@/components/plan/GoalModeSelector'
import {
  buildTitlePlan,
  checkFeasibility,
  generateMoviePlan,
  PlanFeasibility,
} from '@/lib/scheduler'
import FeasibilityIndicator from '@/components/plan/FeasibilityIndicator'
import SmartSuggestions from '@/components/plan/SmartSuggestions'
import PlannerSkeleton from '@/components/plan/PlannerSkeleton'
import { encodeState, decodeState } from '@/lib/urlState'

const PACES: PaceMode[] = ['casual', 'balanced', 'binge', 'hardcore']

// A goal whose date fields are blank or unparseable can't produce a
// meaningful plan yet (the user is still filling it in)
function goalIsComplete(goal: WatchGoal): boolean {
  const valid = (d: string) => Boolean(d) && !Number.isNaN(Date.parse(d))
  switch (goal.mode) {
    case 'finish-before':
      return valid(goal.targetDate)
    case 'vacation':
      return valid(goal.startDate) && valid(goal.endDate) && goal.hoursPerDay > 0
    case 'new-season':
      return valid(goal.targetDate) && goal.currentEpisode >= 1
    default:
      return true
  }
}

export default function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = (searchParams.get('type') || 'tv') as MediaType

  const { media, loading, error } = useMediaDetails(Number(id), type)

  // Arriving via "Edit this plan" on a results page pre-fills these
  // instead of the defaults, so editing someone else's plan starts from
  // what they chose.
  const rawConfig = searchParams.get('config')
  const initialConfig = rawConfig ? decodeState<AvailabilityConfig>(rawConfig) : null
  const rawGoal = searchParams.get('goal')
  const initialGoal = rawGoal ? decodeState<WatchGoal>(rawGoal) : null

  const [schedule, setSchedule] = useState<WeekSchedule>(
    initialConfig?.schedule ?? defaultSchedule()
  )
  const [pace, setPace] = useState<PaceMode>(initialConfig?.pace ?? 'balanced')
  const [episodeRuntime, setEpisodeRuntime] = useState<number | null>(
    initialConfig?.episodeRuntime ?? null
  )
  const [goal, setGoal] = useState<WatchGoal>(initialGoal ?? { mode: 'standard' })

  const isTV = media?.mediaType === 'tv'
  const runtime =
    episodeRuntime ?? media?.episodeRuntime ?? media?.runtime ?? 24
  const hasFreeTime = weeklyMinutes(schedule) > 0
  // Goal modes only apply to series; a film is always planned into your
  // free slots, so ignore any goal carried over in the URL
  const effectiveGoal: WatchGoal = isTV ? goal : { mode: 'standard' }
  // Standard plans need free time to schedule into; goal-based plans
  // (finish-before, vacation, …) work out the pace themselves
  const canPlan =
    goalIsComplete(effectiveGoal) &&
    (effectiveGoal.mode !== 'standard' || hasFreeTime)

  const config: AvailabilityConfig = useMemo(
    () => ({ schedule, pace, episodeRuntime: runtime }),
    [schedule, pace, runtime]
  )

  // Built with the same function as the results page, so this preview
  // always matches the plan the user gets
  const preview = useMemo(() => {
    if (!media || !canPlan) return null
    if (!isTV) {
      const moviePlan = generateMoviePlan(config, media.runtime ?? runtime)
      if (moviePlan.totalSessions === 0) return null
      return {
        headline: moviePlan.completionDate,
        detail:
          moviePlan.totalSessions === 1
            ? 'In one sitting'
            : `Across ${moviePlan.totalSessions} sessions`,
      }
    }
    const plan = buildTitlePlan(
      config,
      effectiveGoal,
      media.episodeCount ?? 1,
      'tv',
      media.runtime ?? undefined
    )
    return {
      headline: plan.completionDate,
      detail: `${plan.episodesPerWeek} eps / week · ${plan.totalWeeks} week${plan.totalWeeks === 1 ? '' : 's'}`,
    }
  }, [media, canPlan, isTV, config, effectiveGoal, runtime])

  // What each pace would mean for this exact show, in place of the
  // abstract "uses 60% of your free time"
  const paceEstimates = useMemo(() => {
    if (!media || !isTV || goal.mode !== 'standard' || !hasFreeTime)
      return undefined
    return Object.fromEntries(
      PACES.map((p) => {
        const plan = buildTitlePlan(
          { ...config, pace: p },
          { mode: 'standard' },
          media.episodeCount ?? 1,
          'tv'
        )
        return [p, `${plan.episodesPerWeek} eps / wk · ${plan.totalWeeks} wks`]
      })
    ) as Partial<Record<PaceMode, string>>
  }, [media, isTV, goal.mode, hasFreeTime, config])

  const handleGenerate = () => {
    if (!canPlan) return
    const encoded = encodeState(config)
    const goalEncoded = encodeState(effectiveGoal)
    router.push(
      `/plan/${id}/results?type=${type}&config=${encoded}&goal=${goalEncoded}`
    )
  }

  const feasibility: PlanFeasibility | null = useMemo(() => {
    if ((goal.mode !== 'finish-before' && goal.mode !== 'new-season') || !media)
      return null
    if (!goalIsComplete(goal)) return null

    const remainingEpisodes =
      goal.mode === 'new-season'
        ? (media.episodeCount ?? 0) - goal.currentEpisode + 1
        : (media.episodeCount ?? 0)

    if (remainingEpisodes <= 0) return null

    return checkFeasibility(goal.targetDate, remainingEpisodes, runtime, schedule)
  }, [goal, media, runtime, schedule])

  if (loading) return <PlannerSkeleton />

  if (error || !media) {
    return (
      <main
        id="main-content"
        className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
      >
        <p className="text-parchment font-sans text-lg">
          We couldn&apos;t load this title.
        </p>
        <p className="text-parchment-dim max-w-sm font-sans text-sm">
          Check your connection and try again, or search for something else.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="secondary" onClick={() => router.push('/search')}>
            Search
          </Button>
        </div>
      </main>
    )
  }

  const generateLabel = !hasFreeTime && effectiveGoal.mode === 'standard'
    ? 'Pick at least one day'
    : !goalIsComplete(effectiveGoal)
      ? 'Finish setting your goal'
      : 'Generate Watch Plan →'

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <MediaSummary media={media} />

        {/* Runtime override for TV */}
        {isTV && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="episode-runtime"
              className="text-parchment-dim font-mono text-xs tracking-widest uppercase"
            >
              Minutes per episode
            </label>
            <div className="flex items-center gap-4">
              <input
                id="episode-runtime"
                type="number"
                min={1}
                max={180}
                value={runtime}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    setEpisodeRuntime(null)
                    return
                  }
                  setEpisodeRuntime(
                    Math.min(180, Math.max(1, Math.round(Number(value))))
                  )
                }}
                className="bg-ink border-line-strong text-parchment focus:border-gold/60 w-24 rounded-sm border px-3 py-2 font-mono text-sm focus:outline-none"
              />
              <span className="text-parchment-faint font-sans text-xs">
                TMDB suggests {media.episodeRuntime ?? 24} min
              </span>
            </div>
          </div>
        )}

        {/* Goal mode — series only */}
        {isTV && (
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-parchment text-2xl">
              What&apos;s your goal?
            </h2>
            <GoalModeSelector
              value={goal}
              onChange={setGoal}
              totalEpisodes={media.episodeCount}
            />
            {feasibility && <FeasibilityIndicator feasibility={feasibility} />}
          </div>
        )}

        <div className="grid gap-10 md:grid-cols-2">
          {/* Left — day/time selector */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-parchment text-2xl">
              When are you free?
            </h2>
            <DaySelector schedule={schedule} onChange={setSchedule} />
          </div>

          {/* Right — pace + generate */}
          <div className="flex flex-col gap-4">
            {isTV && goal.mode === 'standard' && (
              <>
                <h2 className="font-display text-parchment text-2xl">
                  What&apos;s your pace?
                </h2>
                <PaceSelector
                  value={pace}
                  onChange={setPace}
                  estimates={paceEstimates}
                />
              </>
            )}

            {/* Live preview — same builder as the results page */}
            <div
              aria-live="polite"
              className="border-gold/30 bg-ink rounded-sm border p-5"
            >
              <p className="text-parchment-dim mb-2 font-mono text-xs tracking-widest">
                {preview ? "YOU'LL FINISH ON" : 'YOUR PLAN'}
              </p>
              {preview ? (
                <>
                  <p className="font-display text-gold text-3xl leading-tight whitespace-pre-line">
                    {preview.headline}
                  </p>
                  <p className="text-parchment-dim mt-1 font-mono text-xs tabular-nums">
                    {preview.detail}
                  </p>
                </>
              ) : (
                <p className="text-parchment-dim font-sans text-sm">
                  {!hasFreeTime && effectiveGoal.mode === 'standard'
                    ? 'Pick the days you’re free and we’ll show your finish date here.'
                    : 'Finish setting your goal to see your finish date.'}
                </p>
              )}
            </div>

            {isTV && goal.mode === 'standard' && (
              <SmartSuggestions
                schedule={schedule}
                pace={pace}
                episodeRuntime={runtime}
                totalEpisodes={media.episodeCount ?? 0}
                mediaType={media.mediaType}
              />
            )}

            <Button
              onClick={handleGenerate}
              className="mt-2 w-full"
              disabled={!canPlan}
            >
              {generateLabel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
