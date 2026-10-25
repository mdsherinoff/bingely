'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { generateWatchPlan } from '@/lib/scheduler'
import { DAYS } from '@/lib/scheduleUtils'
import { WeekSchedule } from '@/types/media'

const ONE_PIECE_ID = 37854
// Used until the live count loads (and if it can't)
const FALLBACK_EPISODES = 1180
const RUNTIME = 24

// Where each arc begins, so the timeline shows when you'd reach it
const ARCS = [
  { label: 'East Blue', episode: 1 },
  { label: 'Alabasta', episode: 92 },
  { label: 'Enies Lobby', episode: 264 },
  { label: 'Marineford', episode: 457 },
  { label: 'Wano', episode: 890 },
]

// Spread a weekly total evenly across the week (the demo only needs the
// total; the real planner takes actual days and times)
function scheduleFor(hoursPerWeek: number): WeekSchedule {
  const perDay = Math.round((hoursPerWeek * 60) / 7)
  const end = 19 * 60 + perDay
  const hhmm = (m: number) =>
    `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  return Object.fromEntries(
    DAYS.map((d) => [
      d,
      { enabled: perDay > 0, windows: [{ start: '19:00', end: hhmm(end) }] },
    ])
  )
}

function duration(weeks: number): string {
  if (weeks < 9) return `${weeks} week${weeks === 1 ? '' : 's'}`
  const months = Math.round(weeks / 4.35)
  if (months < 24) return `${months} months`
  return `${(weeks / 52).toFixed(1)} years`
}

export default function ExamplePlan() {
  const [hours, setHours] = useState(10)
  const [episodes, setEpisodes] = useState(FALLBACK_EPISODES)

  useEffect(() => {
    fetch(`/api/media/${ONE_PIECE_ID}?type=tv`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.episodeCount > 0) setEpisodes(d.episodeCount)
      })
      .catch(() => {})
  }, [])

  // The same scheduler the real planner uses
  const plan = useMemo(
    () =>
      generateWatchPlan(
        { schedule: scheduleFor(hours), pace: 'binge', episodeRuntime: RUNTIME },
        episodes,
        'tv'
      ),
    [hours, episodes]
  )

  const weekOf = (episode: number) =>
    Math.max(1, Math.ceil(episode / plan.episodesPerWeek))

  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <p className="text-gold font-mono text-xs tracking-[0.3em] uppercase">
            Try it
          </p>
          <h2 className="font-display text-parchment text-5xl leading-tight text-balance">
            One Piece in {duration(plan.totalWeeks)}
          </h2>
          <p className="text-parchment-dim font-sans text-lg leading-relaxed">
            {`${episodes.toLocaleString()} episodes sounds impossible. Drag to set how much time you have each week and see exactly when you’d reach the end.`}
          </p>

          <div className="flex flex-col gap-3">
            <label
              htmlFor="demo-hours"
              className="text-parchment flex items-baseline justify-between font-sans text-sm"
            >
              <span>Free time each week</span>
              <span className="text-gold font-mono text-lg tabular-nums">
                {hours}h
              </span>
            </label>
            <input
              id="demo-hours"
              type="range"
              min={2}
              max={35}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              aria-valuetext={`${hours} hours a week`}
              className="accent-gold w-full"
            />
            <div className="text-parchment-faint flex justify-between font-mono text-[10px]">
              <span>2h</span>
              <span>35h</span>
            </div>
          </div>

          <div aria-live="polite" className="border-gold/30 bg-ink rounded-sm border p-5">
            <p className="text-parchment-dim font-mono text-xs tracking-widest">
              YOU&apos;D FINISH ON
            </p>
            <p className="font-display text-gold text-3xl">{plan.completionDate}</p>
            <p className="text-parchment-dim mt-1 font-mono text-xs tabular-nums">
              {plan.episodesPerWeek} episodes a week · {plan.totalWeeks} weeks
            </p>
          </div>

          <Link
            href={`/plan/${ONE_PIECE_ID}?type=tv`}
            className="text-gold w-fit font-sans text-sm hover:underline"
          >
            Plan it with your real schedule →
          </Link>
        </div>

        {/* Arc timeline — recalculated live */}
        <div className="border-line bg-ink flex flex-col gap-1 rounded-sm border p-6">
          <p className="text-parchment-faint mb-4 font-mono text-xs tracking-widest">
            WHEN YOU&apos;D REACH EACH ARC
          </p>
          {ARCS.filter((a) => a.episode <= episodes).map((arc, i) => (
            <div key={arc.label} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`mt-1 h-3 w-3 rounded-full border ${
                    i === 0 ? 'bg-gold border-gold' : 'border-gold/50'
                  }`}
                />
                {i < ARCS.length - 1 && <div className="bg-line min-h-[2.5rem] w-px flex-1" />}
              </div>
              <div className="flex flex-col gap-0.5 pb-5">
                <span className="text-parchment-faint font-mono text-xs tabular-nums">
                  WEEK {weekOf(arc.episode)}
                </span>
                <span className="text-parchment font-sans text-base">
                  {arc.label} arc
                </span>
                <span className="text-parchment-faint font-mono text-xs">
                  from episode {arc.episode}
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-start gap-4">
            <div className="bg-gold mt-1 h-3 w-3 rounded-full" />
            <div className="flex flex-col gap-0.5">
              <span className="text-gold font-mono text-xs tabular-nums">
                WEEK {plan.totalWeeks}
              </span>
              <span className="text-parchment font-sans text-base">
                {`Caught up — all ${episodes.toLocaleString()} episodes`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
