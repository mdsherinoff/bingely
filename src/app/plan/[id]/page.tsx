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
import { encodeState, decodeState } from '@/lib/urlState'

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

  // Arriving via "Edit Plan" on a results page pre-fills these instead
  // of the defaults, so editing someone else's plan starts from what
  // they chose.
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
    const encoded = encodeState(config)
    const goalEncoded = encodeState(goal)
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
        <p className="text-parchment-faint animate-pulse font-mono text-xs tracking-widest">
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
        <p className="text-rose font-mono">Failed to load media details</p>
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
            <label className="text-parchment-dim font-mono text-xs tracking-widest uppercase">
              Minutes per episode
            </label>
            <div className="flex items-center gap-4">
              <input
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
                className="bg-ink border-line-strong text-parchment focus:border-gold/50 w-24 rounded-sm border px-3 py-2 font-mono text-sm focus:outline-none"
              />
              <span className="text-parchment-faint font-mono text-xs">
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
            <div className="border-line bg-ink mt-2 rounded-sm border p-4">
              <p className="text-parchment-faint mb-3 font-mono text-xs tracking-widest">
                ESTIMATED PLAN
              </p>
              {media.mediaType === 'tv' ? (
                <>
                  <p className="text-parchment font-mono text-lg">
                    {adjustedEpsPerWeek} episodes / week
                  </p>
                  <p className="text-gold mt-1 font-mono text-xs">
                    {adjustedEpsPerWeek > 0
                      ? `Done in ~${Math.ceil((media.episodeCount || 0) / adjustedEpsPerWeek)} weeks`
                      : 'Select at least one day'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-parchment font-mono text-lg">
                    {media.runtime} min total
                  </p>
                  <p className="text-gold mt-1 font-mono text-xs">
                    {(() => {
                      const availableMinsPerWeek =
                        weeklyMinutes(schedule) * paceMultiplier[pace]
                      if (availableMinsPerWeek <= 0)
                        return 'Select at least one day'
                      const weeksNeeded = Math.ceil(
                        (media.runtime ?? 0) / availableMinsPerWeek
                      )
                      return weeksNeeded <= 1
                        ? 'Finishable in one week'
                        : `Done in ~${weeksNeeded} weeks`
                    })()}
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
