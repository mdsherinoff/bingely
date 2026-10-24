'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  WeekSchedule,
  PaceMode,
  AvailabilityConfig,
  MediaType,
} from '@/types/media'
import { defaultSchedule, weeklyMinutes } from '@/lib/scheduleUtils'
import DaySelector from './DaySelector'
import PaceSelector from './PaceSelector'
import SmartSuggestions from './SmartSuggestions'
import { Button } from '@/components/ui'
import { buildListPreview, generateListPlan, listKind } from '@/lib/scheduler'
import { encodeState } from '@/lib/urlState'

interface AvailabilityFormProps {
  totalRuntime: number
  totalItems: number
  itemLabel: string
  episodeRuntime: number
  mediaType: 'movie' | 'tv'
  resultsPath: string
  exactItems: { title: string; runtime: number; mediaType: MediaType }[]
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
  const [schedule, setSchedule] = useState<WeekSchedule>(
    initialConfig?.schedule ?? defaultSchedule()
  )
  const [pace, setPace] = useState<PaceMode>(initialConfig?.pace ?? 'balanced')

  const kind = listKind(exactItems)
  const hasFreeTime = weeklyMinutes(schedule) > 0
  // Films are slotted session by session into your real free time, so
  // pace only changes anything when series are involved
  const usesPace = kind !== 'movies'

  const config: AvailabilityConfig = useMemo(
    () => ({ schedule, pace, episodeRuntime }),
    [schedule, pace, episodeRuntime]
  )

  // Same generators the results page uses, so this always matches
  const preview = useMemo(
    () => buildListPreview(config, exactItems),
    [config, exactItems]
  )

  const paceEstimates = useMemo(() => {
    if (kind !== 'tv' || !hasFreeTime) return undefined
    return Object.fromEntries(
      PACES.map((p) => {
        const plan = generateListPlan({ ...config, pace: p }, exactItems, p)
        return [p, `~${plan.totalWeeks} week${plan.totalWeeks === 1 ? '' : 's'}`]
      })
    ) as Partial<Record<PaceMode, string>>
  }, [kind, hasFreeTime, config, exactItems])

  const handleGenerate = () => {
    if (!hasFreeTime) return
    const encoded = encodeState(config)
    const itemsEncoded = `&items=${encodeState(exactItems)}`
    const titleEncoded = shareTitle
      ? `&title=${encodeURIComponent(shareTitle)}`
      : ''
    router.push(`${resultsPath}?config=${encoded}${itemsEncoded}${titleEncoded}`)
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
              schedule={schedule}
              pace={pace}
              episodeRuntime={episodeRuntime}
              totalEpisodes={totalItems}
              mediaType={mediaType}
            />
          )}

          <Button
            onClick={handleGenerate}
            className="mt-2 w-full"
            disabled={!hasFreeTime}
          >
            {hasFreeTime ? 'Generate Watch Plan →' : 'Pick at least one day'}
          </Button>
        </div>
      </div>
    </div>
  )
}
