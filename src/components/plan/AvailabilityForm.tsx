'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  WeekSchedule,
  PaceMode,
  AvailabilityConfig,
  SharedListItem,
} from '@/types/media'
import {
  defaultSchedule,
  intersectSchedules,
  weeklyMinutes,
} from '@/lib/scheduleUtils'
import TogetherSection from './TogetherSection'
import DaySelector from './DaySelector'
import PaceSelector from './PaceSelector'
import SmartSuggestions from './SmartSuggestions'
import { Button } from '@/components/ui'
import { buildListPreview, listKind } from '@/lib/scheduler'
import { generateQueuePlan } from '@/lib/queue'
import { encodeState } from '@/lib/urlState'

interface AvailabilityFormProps {
  totalRuntime: number
  totalItems: number
  itemLabel: string
  episodeRuntime: number
  mediaType: 'movie' | 'tv'
  resultsPath: string
  // In watch order. Carried whole in the results link (posters and
  // episode data included) so a shared plan rebuilds the list exactly.
  exactItems: SharedListItem[]
  // Custom lists live only in the creator's localStorage, so a shared
  // results link can't look the title up by id on another device —
  // carry it in the URL so the results page can rebuild the list
  // from the link alone.
  shareTitle?: string
  // When arriving via "Edit this plan" on a results page, pre-fill the
  // form with that plan's settings instead of the defaults, so editing a
  // shared plan starts from what the sender chose.
  initialConfig?: AvailabilityConfig
}

const PACES: PaceMode[] = ['casual', 'balanced', 'binge', 'hardcore']

export default function AvailabilityForm({
  totalRuntime,
  totalItems,
  itemLabel,
  episodeRuntime,
  mediaType,
  resultsPath,
  exactItems,
  shareTitle,
  initialConfig,
}: AvailabilityFormProps) {
  const router = useRouter()
  // Your own free time; with "watch together" on, the plan uses only the
  // overlap with theirs
  const [schedule, setSchedule] = useState<WeekSchedule>(
    initialConfig?.together?.mine ??
      initialConfig?.schedule ??
      defaultSchedule()
  )
  const [together, setTogether] = useState(Boolean(initialConfig?.together))
  const [theirs, setTheirs] = useState<WeekSchedule>(
    initialConfig?.together?.theirs ?? defaultSchedule()
  )
  const effectiveSchedule = useMemo(
    () => (together ? intersectSchedules(schedule, theirs) : schedule),
    [together, schedule, theirs]
  )
  const [pace, setPace] = useState<PaceMode>(initialConfig?.pace ?? 'balanced')

  const kind = listKind(exactItems)
  const hasFreeTime = weeklyMinutes(effectiveSchedule) > 0
  // Films are slotted session by session into your real free time, so
  // pace only changes anything when series are involved
  const usesPace = kind !== 'movies'

  const config: AvailabilityConfig = useMemo(
    () => ({
      schedule: effectiveSchedule,
      pace,
      episodeRuntime,
      ...(together ? { together: { mine: schedule, theirs } } : {}),
    }),
    [effectiveSchedule, pace, episodeRuntime, together, schedule, theirs]
  )

  // Same generators the results page uses, so this always matches
  const preview = useMemo(
    () => buildListPreview(config, exactItems),
    [config, exactItems]
  )

  const paceEstimates = useMemo(() => {
    if (!usesPace || !hasFreeTime || exactItems.length === 0) return undefined
    return Object.fromEntries(
      PACES.map((p) => {
        const plan = generateQueuePlan({ ...config, pace: p }, exactItems)
        return [
          p,
          plan.complete
            ? `~${plan.totalWeeks} week${plan.totalWeeks === 1 ? '' : 's'}`
            : 'Too long',
        ]
      })
    ) as Partial<Record<PaceMode, string>>
  }, [usesPace, hasFreeTime, config, exactItems])

  const canGenerate = hasFreeTime && exactItems.length > 0

  const handleGenerate = () => {
    if (!canGenerate) return
    const encoded = encodeState(config)
    const itemsEncoded = `&items=${encodeState(exactItems)}`
    const titleEncoded = shareTitle
      ? `&title=${encodeURIComponent(shareTitle)}`
      : ''
    router.push(
      `${resultsPath}?config=${encoded}${itemsEncoded}${titleEncoded}`
    )
  }

  const totalHours = Math.round((totalRuntime / 60) * 10) / 10

  return (
    <div className="flex flex-col gap-10">
      {/* Summary */}
      <div className="border-line bg-ink grid grid-cols-2 gap-4 rounded-sm border p-5">
        <div>
          <p className="text-parchment-faint mb-1 font-mono text-xs tracking-widest">
            {itemLabel.toUpperCase()}
          </p>
          <p className="text-parchment font-mono text-2xl">{totalItems}</p>
        </div>
        <div>
          <p className="text-parchment-faint mb-1 font-mono text-xs tracking-widest">
            TOTAL WATCH TIME
          </p>
          <p className="text-parchment font-mono text-2xl">{totalHours}h</p>
        </div>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-parchment text-2xl">
            When are you free?
          </h2>
          <DaySelector schedule={schedule} onChange={setSchedule} />
          <TogetherSection
            enabled={together}
            onToggle={setTogether}
            theirs={theirs}
            onTheirsChange={setTheirs}
            shared={effectiveSchedule}
          />
        </div>

        <div className="flex flex-col gap-4">
          {usesPace && (
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

          {/* Live preview — same generators as the results page */}
          <div
            aria-live="polite"
            className="border-gold/30 bg-ink rounded-sm border p-5"
          >
            <p className="text-parchment-dim mb-2 font-mono text-xs tracking-widest">
              {preview ? "YOU'LL FINISH ON" : 'YOUR PLAN'}
            </p>
            {preview ? (
              <>
                <p className="font-display text-gold text-3xl leading-tight">
                  {preview.completionDate}
                </p>
                {preview.summary && (
                  <p className="text-parchment-dim mt-1 font-mono text-xs tabular-nums">
                    {preview.summary}
                  </p>
                )}
              </>
            ) : (
              <p className="text-parchment-dim font-sans text-sm">
                Pick the days you&apos;re free and we&apos;ll show your finish
                date here.
              </p>
            )}
          </div>

          {usesPace && (
            <SmartSuggestions
              schedule={effectiveSchedule}
              pace={pace}
              episodeRuntime={episodeRuntime}
              totalEpisodes={totalItems}
              mediaType={mediaType}
            />
          )}

          <Button
            onClick={handleGenerate}
            className="mt-2 w-full"
            disabled={!canGenerate}
          >
            {exactItems.length === 0
              ? 'Add at least one title'
              : hasFreeTime
                ? 'Generate Watch Plan →'
                : 'Pick at least one day'}
          </Button>
        </div>
      </div>
    </div>
  )
}
