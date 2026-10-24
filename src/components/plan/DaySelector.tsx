'use client'

import { WeekSchedule, TimeWindow } from '@/types/media'
import { DAYS, windowMinutes, weeklyMinutes } from '@/lib/scheduleUtils'

interface DaySelectorProps {
  schedule: WeekSchedule
  onChange: (schedule: WeekSchedule) => void
}

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function crossesMidnight(w: TimeWindow): boolean {
  return w.end < w.start
}

export default function DaySelector({ schedule, onChange }: DaySelectorProps) {
  const enabledDays = DAYS.filter((d) => schedule[d]?.enabled)
  const weekly = weeklyMinutes(schedule)

  const setDay = (day: string, next: Partial<WeekSchedule[string]>) =>
    onChange({ ...schedule, [day]: { ...schedule[day], ...next } })

  const toggleDay = (day: string) =>
    setDay(day, { enabled: !schedule[day].enabled })

  const updateWindow = (
    day: string,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    const windows = [...schedule[day].windows]
    windows[index] = { ...windows[index], [field]: value }
    setDay(day, { windows })
  }

  const addWindow = (day: string) =>
    setDay(day, {
      windows: [...schedule[day].windows, { start: '19:00', end: '21:00' }],
    })

  const removeWindow = (day: string, index: number) => {
    const windows = schedule[day].windows.filter((_, i) => i !== index)
    setDay(day, {
      windows: windows.length > 0 ? windows : [{ start: '19:00', end: '21:00' }],
    })
  }

  // Copy one day's times to every selected day — most people watch at
  // the same time on the days they watch
  const applyToAll = (fromDay: string) => {
    const windows = schedule[fromDay].windows
    const next = { ...schedule }
    for (const day of enabledDays) {
      next[day] = { ...next[day], windows: windows.map((w) => ({ ...w })) }
    }
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Day toggles */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day) => {
          const on = schedule[day].enabled
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={on}
              aria-label={day}
              className={`flex min-h-[44px] items-center justify-center rounded-sm border font-mono text-xs tracking-wide transition-colors ${
                on
                  ? 'border-gold bg-gold text-espresso font-bold'
                  : 'border-line-strong text-parchment-dim hover:border-gold/50 hover:text-parchment'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          )
        })}
      </div>

      {enabledDays.length === 0 ? (
        <p className="text-parchment-faint font-sans text-sm">
          Pick the days you usually have time to watch.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {enabledDays.map((day, dayIndex) => {
            const d = schedule[day]
            return (
              <div
                key={day}
                className="border-line bg-ink flex flex-col gap-2 rounded-sm border p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-parchment font-sans text-sm font-medium">
                    {day}
                  </span>
                  {dayIndex === 0 && enabledDays.length > 1 && (
                    <button
                      type="button"
                      onClick={() => applyToAll(day)}
                      className="text-parchment-faint hover:text-gold font-sans text-xs transition-colors"
                    >
                      Use these times every day
                    </button>
                  )}
                </div>

                {d.windows.map((window, i) => {
                  const mins = windowMinutes(window)
                  return (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        aria-label={`${day} start time`}
                        value={window.start}
                        onChange={(e) =>
                          updateWindow(day, i, 'start', e.target.value)
                        }
                        className="bg-espresso border-line-strong text-parchment focus:border-gold/60 rounded-sm border px-2.5 py-1.5 font-mono text-sm focus:outline-none"
                      />
                      <span className="text-parchment-faint font-sans text-xs">
                        to
                      </span>
                      <input
                        type="time"
                        aria-label={`${day} end time`}
                        value={window.end}
                        onChange={(e) =>
                          updateWindow(day, i, 'end', e.target.value)
                        }
                        className="bg-espresso border-line-strong text-parchment focus:border-gold/60 rounded-sm border px-2.5 py-1.5 font-mono text-sm focus:outline-none"
                      />
                      <span
                        className={`font-mono text-xs tabular-nums ${mins === 0 ? 'text-rose' : 'text-parchment-faint'}`}
                      >
                        {mins === 0
                          ? 'no time'
                          : `${formatDuration(mins)}${crossesMidnight(window) ? ' · past midnight' : ''}`}
                      </span>
                      {d.windows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWindow(day, i)}
                          aria-label={`Remove ${day} time slot`}
                          className="text-parchment-faint hover:text-rose ml-auto px-1 font-mono text-xs transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}

                <button
                  type="button"
                  onClick={() => addWindow(day)}
                  className="text-parchment-faint hover:text-gold w-fit font-sans text-xs transition-colors"
                >
                  + Add another time slot
                </button>
              </div>
            )
          })}

          <p className="text-parchment-dim font-sans text-sm">
            <span className="text-gold font-mono tabular-nums">
              {formatDuration(weekly)}
            </span>{' '}
            free each week
          </p>
        </div>
      )}
    </div>
  )
}
