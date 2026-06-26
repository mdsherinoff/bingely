'use client'

import { WeekSchedule } from '@/types/media'
import { DAYS } from '@/lib/scheduleUtils'

interface DaySelectorProps {
  schedule: WeekSchedule
  onChange: (schedule: WeekSchedule) => void
}

export default function DaySelector({ schedule, onChange }: DaySelectorProps) {
  const toggleDay = (day: string) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled,
      },
    })
  }

  const updateWindow = (day: string, field: 'start' | 'end', value: string) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        windows: [{ ...schedule[day].windows[0], [field]: value }],
      },
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {DAYS.map((day) => {
        const d = schedule[day]
        return (
          <div
            key={day}
            className={`rounded-sm border p-4 transition-colors ${d.enabled ? 'border-gold/30 bg-ink' : 'border-gold/10 bg-espresso'} `}
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => toggleDay(day)}
                aria-pressed={d.enabled}
                aria-label={`${day} — ${d.enabled ? 'enabled' : 'disabled'}`}
                className="group flex min-h-[44px] w-full items-center gap-3"
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-sm border transition-colors ${d.enabled ? 'bg-gold border-gold' : 'border-parchment/20'} `}
                >
                  {d.enabled && (
                    <span className="text-espresso font-mono text-xs">✓</span>
                  )}
                </div>
                <span
                  className={`font-mono text-xs tracking-widest transition-colors ${d.enabled ? 'text-parchment' : 'text-parchment/30'} `}
                >
                  {day.toUpperCase()}
                </span>
              </button>
            </div>

            {d.enabled && (
              <div className="ml-7 flex items-center gap-3">
                <input
                  type="time"
                  value={d.windows[0].start}
                  onChange={(e) => updateWindow(day, 'start', e.target.value)}
                  className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 rounded-sm border px-3 py-1.5 font-mono text-xs focus:outline-none"
                />
                <span className="text-parchment/30 font-mono text-xs">to</span>
                <input
                  type="time"
                  value={d.windows[0].end}
                  onChange={(e) => updateWindow(day, 'end', e.target.value)}
                  className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 rounded-sm border px-3 py-1.5 font-mono text-xs focus:outline-none"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
