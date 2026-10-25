'use client'

import { useMemo, useState } from 'react'
import { AvailabilityConfig, Season, WeeklyBlock } from '@/types/media'
import { scheduleSeriesSessions, formatClock } from '@/lib/sessions'
import { episodeRangeLabel } from '@/lib/episodes'

interface TVCalendarProps {
  config: AvailabilityConfig
  weeklyBlocks: WeeklyBlock[]
  runtime: number
  seasons?: Season[]
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TVCalendar({
  config,
  weeklyBlocks,
  runtime,
  seasons,
}: TVCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)

  // The same dated sessions the calendar export uses, so what you see
  // here is exactly what lands in your calendar
  const sessions = useMemo(
    () => scheduleSeriesSessions(config, weeklyBlocks, runtime),
    [config, weeklyBlocks, runtime]
  )

  const baseWeekStart = getWeekStart(new Date())
  const lastSession = sessions[sessions.length - 1]
  const maxOffset = lastSession
    ? Math.round(
        (getWeekStart(lastSession.date).getTime() - baseWeekStart.getTime()) /
          (7 * 86400000)
      )
    : 0

  const weekStart = new Date(baseWeekStart)
  weekStart.setDate(baseWeekStart.getDate() + weekOffset * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const weekSessions = sessions.filter(
    (s) => s.date >= weekDays[0] && s.date <= weekDays[6]
  )
  const rangeLabel =
    weekSessions.length > 0
      ? episodeRangeLabel(
          weekSessions[0].startEpisode,
          weekSessions[weekSessions.length - 1].endEpisode,
          seasons
        )
      : 'No viewing this week'

  const weekLabel = weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
  const weekEndLabel = weekDays[6].toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
          disabled={weekOffset === 0}
          className="text-parchment-faint hover:text-parchment-dim min-h-[44px] px-2 font-mono text-xs transition-colors disabled:opacity-20"
        >
          ← PREV
        </button>
        <div className="flex flex-col items-center gap-0.5 text-center">
          <p className="text-parchment-dim font-mono text-xs tracking-widest">
            {weekLabel} — {weekEndLabel}
          </p>
          <p className="text-gold font-sans text-xs">{rangeLabel}</p>
        </div>
        <button
          onClick={() => setWeekOffset((o) => Math.min(maxOffset, o + 1))}
          disabled={weekOffset >= maxOffset}
          className="text-parchment-faint hover:text-parchment-dim min-h-[44px] px-2 font-mono text-xs transition-colors disabled:opacity-20"
        >
          NEXT →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-parchment-faint py-1 text-center font-mono text-xs tracking-widest"
          >
            {label}
          </div>
        ))}

        {weekDays.map((day, i) => {
          const daySessions = weekSessions.filter((s) => sameDay(s.date, day))
          const eps = daySessions.reduce((a, s) => a + s.episodes, 0)
          const isToday = sameDay(day, new Date())

          return (
            <div
              key={i}
              className={`flex min-h-[80px] min-w-0 flex-col gap-1 overflow-hidden rounded-sm border p-1 sm:p-2 ${
                eps > 0
                  ? 'border-gold/30 bg-ink'
                  : isToday
                    ? 'border-gold/50 bg-espresso'
                    : 'border-line bg-espresso'
              }`}
            >
              <p
                className={`text-right font-mono text-xs ${isToday ? 'text-gold' : 'text-parchment-faint'}`}
              >
                {day.getDate()}
              </p>
              {eps > 0 && (
                <div className="bg-gold/20 border-gold/30 flex flex-col gap-0.5 rounded-sm border px-1 py-1">
                  <p className="text-gold font-mono text-[10px] leading-tight sm:text-xs">
                    {eps} ep{eps === 1 ? '' : 's'}
                  </p>
                  {/* Times don't fit a phone-width day cell */}
                  {daySessions.map((s, si) => (
                    <p
                      key={si}
                      className="text-gold hidden font-mono text-xs leading-tight sm:block"
                    >
                      {formatClock(s.startMinute)}–{formatClock(s.endMinute)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-gold/20 border-gold/30 h-3 w-3 rounded-sm border" />
        <p className="text-parchment-faint font-sans text-xs">
          Viewing day — episodes and when you&apos;ll watch them
        </p>
      </div>
    </div>
  )
}
