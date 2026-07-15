'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  WeekSchedule,
  PaceMode,
  AvailabilityConfig,
  WatchGoal,
  MediaType,
} from '@/types/media'
import { defaultSchedule, weeklyMinutes } from '@/lib/scheduleUtils'
import DaySelector from './DaySelector'
import PaceSelector from './PaceSelector'
import GoalModeSelector from './GoalModeSelector'
import SmartSuggestions from './SmartSuggestions'
import FeasibilityIndicator from './FeasibilityIndicator'
import { Button } from '@/components/ui'
import { checkFeasibility } from '@/lib/scheduler'
import { encodeState } from '@/lib/urlState'

interface AvailabilityFormProps {
  totalRuntime: number
  totalItems: number
  itemLabel: string
  episodeRuntime: number
  mediaType: 'movie' | 'tv'
  resultsPath: string
  exactItems?: { title: string; runtime: number; mediaType: MediaType }[]
  // Custom lists live only in the creator's localStorage, so a shared
  // results link can't look the title up by id on another device —
  // carry it in the URL so the results page can rebuild the list
  // from the link alone.
  shareTitle?: string
}

const paceMultiplier: Record<PaceMode, number> = {
  casual: 0.6,
  balanced: 0.8,
  binge: 1.0,
  hardcore: 1.2,
}

export default function AvailabilityForm({
  totalRuntime,
  totalItems,
  itemLabel,
  episodeRuntime,
  mediaType,
  resultsPath,
  exactItems,
  shareTitle,
}: AvailabilityFormProps) {
  const router = useRouter()
  const [schedule, setSchedule] = useState<WeekSchedule>(defaultSchedule())
  const [pace, setPace] = useState<PaceMode>('balanced')
  const [goal, setGoal] = useState<WatchGoal>({ mode: 'standard' })
  const [customRuntime, setCustomRuntime] = useState(episodeRuntime)

  const weeklyMins = weeklyMinutes(schedule)
  const rawItemsPerWeek =
    customRuntime > 0 ? Math.floor(weeklyMins / customRuntime) : 0
  const adjustedItemsPerWeek = Math.max(
    1,
    Math.floor(rawItemsPerWeek * paceMultiplier[pace])
  )
  const weeksToFinish =
    adjustedItemsPerWeek > 0
      ? Math.ceil(totalItems / adjustedItemsPerWeek)
      : null

  const feasibility = useMemo(() => {
    if (goal.mode !== 'finish-before' && goal.mode !== 'new-season') return null
    const targetDate =
      goal.mode === 'finish-before' ? goal.targetDate : goal.targetDate
    if (!targetDate) return null
    return checkFeasibility(targetDate, totalItems, customRuntime, schedule)
  }, [goal, totalItems, customRuntime, schedule])

  const handleGenerate = () => {
    const config: AvailabilityConfig = {
      schedule,
      pace,
      episodeRuntime: customRuntime,
    }
    const encoded = encodeState(config)
    const goalEncoded = encodeState(goal)
    const itemsEncoded = exactItems ? `&items=${encodeState(exactItems)}` : ''
    const titleEncoded = shareTitle
      ? `&title=${encodeURIComponent(shareTitle)}`
      : ''
    router.push(
      `${resultsPath}?config=${encoded}&goal=${goalEncoded}${itemsEncoded}${titleEncoded}`
    )
  }

  const totalHours = Math.round((totalRuntime / 60) * 10) / 10

  return (
    <div className="flex flex-col gap-10">
      {/* Summary */}
      <div className="border-line bg-ink flex flex-col gap-3 rounded-sm border p-5">
        <p className="text-parchment-faint font-mono text-xs tracking-widest">
          WHAT YOU'RE PLANNING
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-parchment-faint mb-1 font-mono text-xs tracking-widest">
              {itemLabel.toUpperCase()}
            </p>
            <p className="text-parchment font-mono text-2xl">{totalItems}</p>
          </div>
          <div>
            <p className="text-parchment-faint mb-1 font-mono text-xs tracking-widest">
              TOTAL
            </p>
            <p className="text-parchment font-mono text-2xl">{totalHours}h</p>
          </div>
          <div>
            <p className="text-parchment-faint mb-1 font-mono text-xs tracking-widest">
              AVG RUNTIME
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={300}
                value={customRuntime}
                onChange={(e) => {
                  const value = e.target.value
                  setCustomRuntime(
                    value === ''
                      ? episodeRuntime
                      : Math.min(300, Math.max(1, Math.round(Number(value))))
                  )
                }}
                className="bg-espresso border-line-strong text-parchment focus:border-gold/50 w-16 rounded-sm border px-2 py-1 font-mono text-sm focus:outline-none"
              />
              <span className="text-parchment-faint font-mono text-xs">min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Goal mode */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-parchment text-2xl">
          What's your goal?
        </h2>
        <GoalModeSelector
          value={goal}
          onChange={setGoal}
          totalEpisodes={totalItems}
        />
        {feasibility && <FeasibilityIndicator feasibility={feasibility} />}
      </div>

      {/* Schedule + pace */}
      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-parchment text-2xl">
            When are you free?
          </h2>
          <DaySelector schedule={schedule} onChange={setSchedule} />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-parchment text-2xl">
            What's your pace?
          </h2>
          <PaceSelector value={pace} onChange={setPace} />

          {/* Live estimate */}
          <div className="border-line bg-ink mt-2 rounded-sm border p-4">
            <p className="text-parchment-faint mb-3 font-mono text-xs tracking-widest">
              ESTIMATED PLAN
            </p>
            <p className="text-parchment font-mono text-lg">
              {adjustedItemsPerWeek} {itemLabel} / week
            </p>
            <p className="text-gold mt-1 font-mono text-xs">
              {weeksToFinish
                ? `Done in ~${weeksToFinish} weeks`
                : 'Select at least one day'}
            </p>
          </div>

          {/* Smart suggestions */}
          <SmartSuggestions
            schedule={schedule}
            pace={pace}
            episodeRuntime={customRuntime}
            totalEpisodes={totalItems}
            mediaType={mediaType}
          />

          <Button
            onClick={handleGenerate}
            className="mt-2 w-full"
            disabled={!weeksToFinish}
          >
            Generate Watch Plan →
          </Button>
        </div>
      </div>
    </div>
  )
}
