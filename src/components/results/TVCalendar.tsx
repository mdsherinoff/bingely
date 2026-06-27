'use client'

import { useState } from 'react'
import { WeeklyBlock } from '@/types/media'
import { AvailabilityConfig } from '@/types/media'
import { DAYS } from '@/lib/scheduleUtils'
import { windowMinutes } from '@/lib/scheduleUtils'

interface TVCalendarProps {
  config: AvailabilityConfig
  weeklyBlocks: WeeklyBlock[]
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

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${period}`
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TVCalendar({ config, weeklyBlocks }: TVCalendarProps) {
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const baseWeekStart = getWeekStart(today)
  const currentWeekStart = new Date(baseWeekStart)
  currentWeekStart.setDate(baseWeekStart.getDate() + weekOffset * 7)

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart)
    d.setDate(currentWeekStart.getDate() + i)
    return d
  })

  const maxOffset = Math.min(weeklyBlocks.length - 1, 51)

  // Which days are active in the schedule
  const activeDayNames = DAYS.filter((d) => config.schedule[d]?.enabled)

  // Get episodes for this week from weeklyBlocks
  const currentBlock = weeklyBlocks[weekOffset]

  const weekLabel = currentWeekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
  const weekEndLabel = weekDays[6].toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Distribute episodes across active days for this week
  let episodesLeft = currentBlock?.episodes ?? 0
  const dayEpisodes: Record<string, { eps: number; windows: string[] }> = {}

  for (const dayName of activeDayNames) {
    if (episodesLeft <= 0) break
    const windows = config.schedule[dayName]?.windows ?? []
    const totalMins = windows.reduce((acc, w) => acc + windowMinutes(w), 0)
    const eps = Math.floor(totalMins / config.episodeRuntime)
    const assigned = Math.min(eps, episodesLeft)
    if (assigned > 0) {
      dayEpisodes[dayName] = {
        eps: assigned,
        windows: windows.map(
          (w) => `${formatTime(w.start)}–${formatTime(w.end)}`
        ),
      }
      episodesLeft -= assigned
    }
  }

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
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-parchment/40 font-mono text-xs tracking-widest">
            {weekLabel} — {weekEndLabel}
          </p>
          {currentBlock && (
            <p className="text-gold/50 font-mono text-xs">
              Week {currentBlock.week} · Eps {currentBlock.startEpisode}–
              {currentBlock.endEpisode}
            </p>
          )}
        </div>
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
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-parchment/20 py-1 text-center font-mono text-xs tracking-widest"
          >
            {label}
          </div>
        ))}

        {weekDays.map((day, i) => {
          const dayName = DAYS[i]
          const info = dayEpisodes[dayName]
          const isToday = sameDay(day, new Date())

          return (
            <div
              key={i}
              className={`flex min-h-[80px] flex-col gap-1 rounded-sm border p-2 ${
                info
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
              {info && (
                <div className="bg-gold/20 border-gold/30 flex flex-col gap-0.5 rounded-sm border px-1 py-1">
                  <p className="text-gold font-mono text-xs leading-tight">
                    {info.eps} eps
                  </p>
                  {info.windows.map((w, wi) => (
                    <p
                      key={wi}
                      className="text-gold/50 font-mono text-xs leading-tight"
                    >
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        <div className="bg-gold/20 border-gold/30 h-3 w-3 rounded-sm border" />
        <p className="text-parchment/30 font-mono text-xs">
          Viewing day — shows episodes and time windows
        </p>
      </div>
    </div>
  )
}
