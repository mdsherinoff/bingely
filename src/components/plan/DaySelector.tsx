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

  const updateWindow = (
    day: string,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const windows = [...schedule[day].windows]
    windows[index] = { ...windows[index], [field]: value }
    onChange({
      ...schedule,
      [day]: { ...schedule[day], windows },
    })
  }

  const addWindow = (day: string) => {
    const windows = [...schedule[day].windows, { start: '19:00', end: '21:00' }]
    onChange({
      ...schedule,
      [day]: { ...schedule[day], windows },
    })
  }

  const removeWindow = (day: string, index: number) => {
    const windows = schedule[day].windows.filter((_, i) => i !== index)
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        windows:
          windows.length > 0 ? windows : [{ start: '19:00', end: '21:00' }],
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
            {/* Day toggle */}
            <button
              onClick={() => toggleDay(day)}
              aria-pressed={d.enabled}
              aria-label={`${day} — ${d.enabled ? 'enabled' : 'disabled'}`}
              className="group flex min-h-[44px] w-full items-center gap-3"
            >
              <div
                className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border transition-colors ${d.enabled ? 'bg-gold border-gold' : 'border-parchment/20'} `}
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

            {/* Time windows */}
            {d.enabled && (
              <div className="mt-3 ml-7 flex flex-col gap-2">
                {d.windows.map((window, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={window.start}
                      onChange={(e) =>
                        updateWindow(day, i, 'start', e.target.value)
                      }
                      className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 rounded-sm border px-3 py-1.5 font-mono text-xs focus:outline-none"
                    />
                    <span className="text-parchment/30 font-mono text-xs">
                      to
                    </span>
                    <input
                      type="time"
                      value={window.end}
                      onChange={(e) =>
                        updateWindow(day, i, 'end', e.target.value)
                      }
                      className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 rounded-sm border px-3 py-1.5 font-mono text-xs focus:outline-none"
                    />
                    {d.windows.length > 1 && (
                      <button
                        onClick={() => removeWindow(day, i)}
                        aria-label="Remove time window"
                        className="text-parchment/20 hover:text-rose/60 px-1 font-mono text-xs transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {/* Add window */}
                <button
                  onClick={() => addWindow(day)}
                  className="text-parchment/30 hover:text-gold/60 mt-1 flex w-fit items-center gap-1.5 font-mono text-xs transition-colors"
                >
                  <span>+</span>
                  <span className="tracking-widest">ADD TIME SLOT</span>
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
