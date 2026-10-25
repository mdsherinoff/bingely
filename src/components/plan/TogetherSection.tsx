'use client'

import { WeekSchedule } from '@/types/media'
import { weeklyMinutes } from '@/lib/scheduleUtils'
import DaySelector from './DaySelector'

interface TogetherSectionProps {
  enabled: boolean
  onToggle: (on: boolean) => void
  theirs: WeekSchedule
  onTheirsChange: (schedule: WeekSchedule) => void
  // Time you both have free (already intersected)
  shared: WeekSchedule
}

function hours(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

// Plan a show for two: the plan only uses time both people are free
export default function TogetherSection({
  enabled,
  onToggle,
  theirs,
  onTheirsChange,
  shared,
}: TogetherSectionProps) {
  const sharedMins = weeklyMinutes(shared)

  return (
    <div className="border-line flex flex-col gap-4 rounded-sm border p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-gold mt-1 h-4 w-4"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-parchment font-sans text-sm font-medium">
            Watching with someone?
          </span>
          <span className="text-parchment-dim font-sans text-xs">
            Add their free time and the plan only uses hours you both have.
          </span>
        </span>
      </label>

      {enabled && (
        <div className="flex flex-col gap-3">
          <p className="text-parchment-dim font-mono text-xs tracking-widest">
            THEIR FREE TIME
          </p>
          <DaySelector schedule={theirs} onChange={onTheirsChange} />
          <p
            aria-live="polite"
            className={`rounded-sm px-3 py-2 font-sans text-sm ${
              sharedMins > 0 ? 'bg-gold/10 text-parchment' : 'bg-rose/10 text-rose'
            }`}
          >
            {sharedMins > 0 ? (
              <>
                You share{' '}
                <span className="text-gold font-mono tabular-nums">
                  {hours(sharedMins)}
                </span>{' '}
                a week — the plan is built around that.
              </>
            ) : (
              'You don’t have any free time in common yet. Try adding a day or widening a time slot.'
            )}
          </p>
        </div>
      )}
    </div>
  )
}
