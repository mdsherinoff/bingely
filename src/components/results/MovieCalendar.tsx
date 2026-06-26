'use client'

import { useState } from 'react'
import { MovieSession } from '@/lib/scheduler'

interface MovieCalendarProps {
  sessions: MovieSession[]
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

export default function MovieCalendar({ sessions }: MovieCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)

  if (sessions.length === 0) return null

  const firstSession = sessions[0].date
  const baseWeekStart = getWeekStart(firstSession)
  const currentWeekStart = new Date(baseWeekStart)
  currentWeekStart.setDate(baseWeekStart.getDate() + weekOffset * 7)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart)
    d.setDate(currentWeekStart.getDate() + i)
    return d
  })

  const lastSession = sessions[sessions.length - 1].date
  const lastWeekStart = getWeekStart(lastSession)
  const maxOffset = Math.ceil(
    (lastWeekStart.getTime() - baseWeekStart.getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  )

  const weekLabel = currentWeekStart.toLocaleDateString('en-US', {
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
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
          disabled={weekOffset === 0}
          className="text-parchment/30 hover:text-parchment/60 px-2 py-1 font-mono text-xs transition-colors disabled:opacity-20"
        >
          ← PREV
        </button>
        <p className="text-parchment/40 font-mono text-xs tracking-widest">
          {weekLabel} — {weekEndLabel}
        </p>
        <button
          onClick={() => setWeekOffset((o) => Math.min(maxOffset, o + 1))}
          disabled={weekOffset >= maxOffset}
          className="text-parchment/30 hover:text-parchment/60 px-2 py-1 font-mono text-xs transition-colors disabled:opacity-20"
        >
          NEXT →
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day labels */}
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-parchment/20 py-1 text-center font-mono text-xs tracking-widest"
          >
            {label}
          </div>
        ))}

        {/* Day cells */}
        {weekDays.map((day, i) => {
          const daySessions = sessions.filter((s) => sameDay(s.date, day))
          const isToday = sameDay(day, new Date())

          return (
            <div
              key={i}
              className={`flex min-h-[80px] flex-col gap-1 rounded-sm border p-2 ${
                daySessions.length > 0
                  ? 'border-gold/30 bg-ink'
                  : isToday
                    ? 'border-parchment/10 bg-espresso'
                    : 'border-gold/5 bg-espresso'
              } `}
            >
              <p
                className={`text-right font-mono text-xs ${isToday ? 'text-gold' : 'text-parchment/20'} `}
              >
                {day.getDate()}
              </p>
              {daySessions.map((s) => (
                <div
                  key={s.sessionNumber}
                  className="bg-gold/20 border-gold/30 rounded-sm border px-1 py-0.5"
                >
                  <p className="text-gold font-mono text-xs leading-tight">
                    S{s.sessionNumber}
                  </p>
                  <p className="text-gold/60 font-mono text-xs leading-tight">
                    {s.durationMins}m
                  </p>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        <div className="bg-gold/20 border-gold/30 h-3 w-3 rounded-sm border" />
        <p className="text-parchment/30 font-mono text-xs">
          Viewing session (S# = session number)
        </p>
      </div>
    </div>
  )
}
