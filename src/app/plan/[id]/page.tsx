'use client'

import { useState, use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMediaDetails } from '@/hooks/useMediaDetails'
import {
  defaultSchedule,
  weeklyEpisodes,
  weeklyMinutes,
} from '@/lib/scheduleUtils'
import {
  AvailabilityConfig,
  PaceMode,
  WeekSchedule,
  MediaType,
} from '@/types/media'
import MediaSummary from '@/components/plan/MediaSummary'
import DaySelector from '@/components/plan/DaySelector'
import PaceSelector from '@/components/plan/PaceSelector'
import { Button } from '@/components/ui'
import GoalModeSelector from '@/components/plan/GoalModeSelector'
import { WatchGoal } from '@/types/media'
import { checkFeasibility, PlanFeasibility } from '@/lib/scheduler'
import FeasibilityIndicator from '@/components/plan/FeasibilityIndicator'
import SmartSuggestions from '@/components/plan/SmartSuggestions'

const paceMultiplier: Record<PaceMode, number> = {
  casual: 0.6,
  balanced: 0.8,
  binge: 1.0,
  hardcore: 1.2,
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

  const [schedule, setSchedule] = useState<WeekSchedule>(defaultSchedule())
  const [pace, setPace] = useState<PaceMode>('balanced')
  const [episodeRuntime, setEpisodeRuntime] = useState<number | null>(null)
  const [goal, setGoal] = useState<WatchGoal>({ mode: 'standard' })

  const runtime =
    episodeRuntime ?? media?.episodeRuntime ?? media?.runtime ?? 24

  const rawEpsPerWeek = weeklyEpisodes(schedule, runtime)
  const adjustedEpsPerWeek = Math.max(
    1,
    Math.floor(rawEpsPerWeek * paceMultiplier[pace])
  )

  const handleGenerate = () => {
    const config: AvailabilityConfig = {
      schedule,
      pace,
      episodeRuntime: runtime,
    }
    const encoded = encodeURIComponent(JSON.stringify(config))
    const goalEncoded = encodeURIComponent(JSON.stringify(goal))
    router.push(
      `/plan/${id}/results?type=${type}&config=${encoded}&goal=${goalEncoded}`
    )
  }

  const feasibility: PlanFeasibility | null = useMemo(() => {
    if ((goal.mode !== 'finish-before' && goal.mode !== 'new-season') || !media)
      return null

    const targetDate =
      goal.mode === 'finish-before' ? goal.targetDate : goal.targetDate
    const remainingEpisodes =
      goal.mode === 'new-season'
        ? (media.episodeCount ?? 0) - goal.currentEpisode + 1
        : (media.episodeCount ?? 0)

    if (!targetDate || remainingEpisodes <= 0) return null

    return checkFeasibility(targetDate, remainingEpisodes, runtime, schedule)
  }, [goal, media, runtime, schedule])

  if (loading) {
    return (
      <main
        id="main-content"
        className="bg-espresso flex min-h-screen items-center justify-center"
      >
        <p className="text-parchment/30 animate-pulse font-mono text-xs tracking-widest">
          LOADING...
        </p>
      </main>
    )
  }

  if (error || !media) {
    return (
      <main
        id="main-content"
        className="bg-espresso flex min-h-screen items-center justify-center"
      >
        <p className="font-body text-rose">Failed to load media details</p>
      </main>
    )
  }

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        {/* Media summary */}
        <MediaSummary media={media} />

        {/* Runtime override for TV */}
        {media.mediaType === 'tv' && (
          <div className="flex flex-col gap-2">
            <label className="text-parchment/50 font-mono text-xs tracking-widest uppercase">
              Minutes per episode
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={180}
                value={runtime}
                onChange={(e) => setEpisodeRuntime(Number(e.target.value))}
                className="bg-ink border-gold/20 text-parchment focus:border-gold/50 w-24 rounded-sm border px-3 py-2 font-mono text-sm focus:outline-none"
              />
              <span className="text-parchment/30 font-mono text-xs">
                TMDB suggests {media.episodeRuntime ?? 24} min
              </span>
            </div>
          </div>
        )}

        {/* Goal mode */}
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-parchment text-2xl">
            What's your goal?
          </h2>
          <GoalModeSelector
            value={goal}
            onChange={setGoal}
            totalEpisodes={media?.episodeCount}
          />
          {feasibility && <FeasibilityIndicator feasibility={feasibility} />}
        </div>

        {/* Form */}
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
            <h2 className="font-display text-parchment text-2xl">
              What's your pace?
            </h2>
            <PaceSelector value={pace} onChange={setPace} />

            {/* Live preview */}
            <div className="border-gold/10 bg-ink mt-2 rounded-sm border p-4">
              <p className="text-parchment/30 mb-3 font-mono text-xs tracking-widest">
                ESTIMATED PLAN
              </p>
              {media.mediaType === 'tv' ? (
                <>
                  <p className="font-body text-parchment text-lg">
                    {adjustedEpsPerWeek} episodes / week
                  </p>
                  <p className="text-gold/60 mt-1 font-mono text-xs">
                    {adjustedEpsPerWeek > 0
                      ? `Done in ~${Math.ceil((media.episodeCount || 0) / adjustedEpsPerWeek)} weeks`
                      : 'Select at least one day'}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-body text-parchment text-lg">
                    {media.runtime} min total
                  </p>
                  <p className="text-gold/60 mt-1 font-mono text-xs">
                    {adjustedEpsPerWeek > 0
                      ? (() => {
                          const weeksNeeded = Math.ceil(
                            ((media.runtime ?? 0) /
                              (weeklyMinutes(schedule) * paceMultiplier[pace] ||
                                1)) *
                              60
                          )
                          return weeksNeeded <= 1
                            ? 'Finishable in one week'
                            : `Done in ~${weeksNeeded} weeks`
                        })()
                      : 'Select at least one day'}
                  </p>
                </>
              )}
            </div>

            {/* Smart suggestions */}
            {media.mediaType === 'tv' && (
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
              disabled={adjustedEpsPerWeek === 0 && media.mediaType === 'tv'}
            >
              Generate Watch Plan →
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
