'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { CustomListItem, WatchPlan } from '@/types/media'
import { QueuePlan, QueueSession } from '@/lib/queue'
import { formatClock } from '@/lib/sessions'
import { queueSessionLabel } from '@/lib/ics'
import { episodeRangeLabel } from '@/lib/episodes'
import { formatRuntime, itemRuntime, seasonsFromCounts } from '@/lib/listItems'
import { Badge } from '@/components/ui'
import ExportButton from './ExportButton'

interface QueueResultsProps {
  items: CustomListItem[]
  queue: QueuePlan
  watchPlan: WatchPlan
  title: string
}

const WEEKS_SHOWN = 3

function shortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dayHeading(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function weekStart(d: Date): Date {
  const w = new Date(d)
  const day = w.getDay()
  w.setDate(w.getDate() + (day === 0 ? -6 : 1 - day))
  w.setHours(0, 0, 0, 0)
  return w
}

interface DayGroup {
  date: Date
  sessions: QueueSession[]
}

interface WeekGroup {
  start: Date
  days: DayGroup[]
}

function groupByWeek(sessions: QueueSession[]): WeekGroup[] {
  const weeks: WeekGroup[] = []
  for (const s of sessions) {
    const ws = weekStart(s.date)
    let week = weeks[weeks.length - 1]
    if (!week || week.start.getTime() !== ws.getTime()) {
      week = { start: ws, days: [] }
      weeks.push(week)
    }
    let day = week.days[week.days.length - 1]
    if (!day || day.date.getTime() !== s.date.getTime()) {
      day = { date: s.date, sessions: [] }
      week.days.push(day)
    }
    day.sessions.push(s)
  }
  return weeks
}

// Everything in a list, booked in the order it was arranged: the titles
// with when each starts and ends, then every sitting night by night
export default function QueueResults({
  items,
  queue,
  watchPlan,
  title,
}: QueueResultsProps) {
  const [weeksShown, setWeeksShown] = useState(WEEKS_SHOWN)
  const weeks = useMemo(() => groupByWeek(queue.sessions), [queue.sessions])
  const seasons = useMemo(
    () => items.map((i) => seasonsFromCounts(i.seasons)),
    [items]
  )
  // Films split across more than one sitting are labelled "part n"
  const splitFilms = useMemo(
    () =>
      new Set(
        queue.sessions
          .filter((s) => s.part > 1 && s.fromEpisode === undefined)
          .map((s) => s.itemIndex)
      ),
    [queue.sessions]
  )

  const films = items.filter((i) => i.mediaType === 'movie').length
  const series = items.length - films
  const mix = [
    films ? `${films} film${films === 1 ? '' : 's'}` : '',
    series ? `${series} series` : '',
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-col gap-12">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'FINISH DATE', value: queue.completionDate },
          { label: 'TITLES', value: mix || '0' },
          { label: 'WATCH TIME', value: `${queue.totalHours}h` },
          {
            label: 'SITTINGS',
            value: `${queue.sessions.length} over ~${queue.totalWeeks} wk${queue.totalWeeks === 1 ? '' : 's'}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border-line bg-ink flex flex-col gap-1 rounded-sm border p-4"
          >
            <p className="text-parchment-faint font-mono text-xs tracking-widest">
              {s.label}
            </p>
            <p className="text-parchment font-mono text-base leading-tight">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {!queue.complete && (
        <p
          role="status"
          className="border-rose/40 text-parchment rounded-sm border p-4 font-sans text-sm"
        >
          This list won&apos;t fit in the free time you picked within the next
          ten years. Add more days or longer evenings to see a finish date.
        </p>
      )}

      <section aria-labelledby="order" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="order" className="font-display text-parchment text-2xl">
            In your order
          </h2>
          <p className="text-parchment-faint font-sans text-xs">
            Each title starts once the one before it is done
          </p>
        </div>
        <ol className="flex flex-col gap-2">
          {items.map((item, i) => {
            const summary = queue.items[i]
            const isSeries = item.mediaType === 'tv'
            const start = item.startEpisode ?? 1
            const episodes = item.episodes ?? 0
            const watching =
              isSeries && episodes > 0
                ? `${episodeRangeLabel(start, episodes, seasons[i])} · ${episodes - start + 1} ep${episodes - start + 1 === 1 ? '' : 's'}`
                : null
            const when = summary?.startDate
              ? summary.finishDate &&
                summary.finishDate.getTime() !== summary.startDate.getTime()
                ? `${shortDate(summary.startDate)} → ${shortDate(summary.finishDate)}`
                : shortDate(summary.startDate)
              : 'Not scheduled'
            return (
              <li
                key={`${item.tmdbId}-${i}`}
                className="border-line flex items-center gap-3 rounded-sm border p-3"
              >
                <span className="text-parchment-faint w-6 flex-shrink-0 font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.posterPath && (
                  <div className="relative aspect-[2/3] w-8 flex-shrink-0 overflow-hidden rounded-sm">
                    <Image
                      src={item.posterPath}
                      alt=""
                      fill
                      sizes="32px"
                      className="poster-color object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-parchment truncate font-sans text-sm font-medium">
                    {item.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge variant={isSeries ? 'rose' : 'gold'}>
                      {isSeries ? 'Series' : 'Film'}
                    </Badge>
                    <span className="text-parchment-faint font-mono text-xs">
                      {watching ? `${watching} · ` : ''}
                      {formatRuntime(itemRuntime(item))}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-gold font-mono text-xs tabular-nums">
                    {when}
                  </p>
                  {summary && summary.sessions > 1 && (
                    <p className="text-parchment-faint font-mono text-xs">
                      {summary.sessions} sittings
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-labelledby="nights" className="flex flex-col gap-4">
        <h2 id="nights" className="font-display text-parchment text-2xl">
          Night by night
        </h2>
        <div className="flex flex-col gap-6">
          {weeks.slice(0, weeksShown).map((week) => (
            <div key={week.start.toISOString()} className="flex flex-col gap-2">
              <p className="text-parchment-faint font-mono text-xs tracking-widest">
                WEEK OF {shortDate(week.start).toUpperCase()}
              </p>
              <ul className="flex flex-col gap-2">
                {week.days.map((day) => (
                  <li
                    key={day.date.toISOString()}
                    className="border-line bg-ink flex flex-col gap-2 rounded-sm border p-3 sm:flex-row sm:gap-4"
                  >
                    <p className="text-parchment-dim w-40 flex-shrink-0 font-sans text-sm">
                      {dayHeading(day.date)}
                    </p>
                    <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
                      {day.sessions.map((s, si) => (
                        <li
                          key={si}
                          className="flex flex-wrap items-baseline gap-x-3"
                        >
                          <span className="text-gold w-32 flex-shrink-0 font-mono text-xs tabular-nums">
                            {formatClock(s.startMinute)}–
                            {formatClock(s.endMinute)}
                          </span>
                          <span className="text-parchment min-w-0 flex-1 font-sans text-sm">
                            {queueSessionLabel(
                              s,
                              items[s.itemIndex]?.title ?? '',
                              seasons[s.itemIndex],
                              splitFilms.has(s.itemIndex)
                            )}
                            {s.completesItem && (
                              <span className="text-parchment-faint ml-2 font-mono text-xs">
                                ✓ finishes
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {weeks.length > weeksShown && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setWeeksShown((n) => n + 4)}
              className="border-line-strong text-parchment hover:border-gold/60 min-h-[44px] rounded-sm border px-5 font-sans text-sm transition-colors"
            >
              Show next {Math.min(4, weeks.length - weeksShown)} weeks
            </button>
            <button
              type="button"
              onClick={() => setWeeksShown(weeks.length)}
              className="text-parchment-faint hover:text-gold min-h-[44px] px-2 font-sans text-sm transition-colors"
            >
              Show all {queue.sessions.length} sittings
            </button>
          </div>
        )}
      </section>

      <div className="border-line flex flex-col gap-3 border-t pt-6">
        <p className="text-parchment-faint font-mono text-xs tracking-widest">
          EXPORT
        </p>
        <div>
          <ExportButton
            plan={watchPlan}
            title={title}
            releaseYear={new Date().getFullYear().toString()}
          />
        </div>
      </div>
    </div>
  )
}
