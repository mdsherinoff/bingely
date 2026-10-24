'use client'

import { MoviePlan } from '@/lib/scheduler'
import { CustomList } from '@/types/media'
import MovieCalendar from './MovieCalendar'
import ExportButton from './ExportButton'
import ShareButton from './ShareButton'
import { WatchPlan } from '@/types/media'

interface ListMovieResultsProps {
  moviePlan: MoviePlan
  list: CustomList
  exportPlan: WatchPlan
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${period}`
}

export default function ListMovieResults({
  moviePlan,
  list,
  exportPlan,
}: ListMovieResultsProps) {
  const totalHours = Math.round((moviePlan.totalRuntime / 60) * 10) / 10

  // Group sessions by item — each item completes when isComplete = true
  const itemSessions: {
    item: (typeof list.items)[0]
    sessions: typeof moviePlan.sessions
  }[] = []
  let currentSessions: typeof moviePlan.sessions = []
  let itemIndex = 0

  for (const session of moviePlan.sessions) {
    currentSessions.push(session)
    if (session.isComplete) {
      itemSessions.push({
        item: list.items[itemIndex],
        sessions: currentSessions,
      })
      currentSessions = []
      itemIndex++
    }
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'FINISH DATE', value: moviePlan.completionDate },
          { label: 'TITLES', value: `${list.items.length}` },
          { label: 'TOTAL RUNTIME', value: `${totalHours}h` },
          { label: 'SESSIONS', value: `${moviePlan.totalSessions}` },
        ].map((s) => (
          <div
            key={s.label}
            className="border-line bg-ink flex flex-col gap-1 rounded-sm border p-4"
          >
            <p className="text-parchment-faint font-mono text-xs tracking-widest">
              {s.label}
            </p>
            <p className="text-parchment font-mono text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-parchment text-2xl">
          Viewing calendar
        </h2>
        <div className="border-line rounded-sm border p-6">
          <MovieCalendar sessions={moviePlan.sessions} />
        </div>
      </div>

      {/* Per-title breakdown */}
      <div className="grid gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-2">
          <h2 className="font-display text-parchment text-2xl">
            Title by title
          </h2>
          {itemSessions.map(({ item, sessions }, i) => (
            <div
              key={item.tmdbId}
              className="border-line flex flex-col gap-3 rounded-sm border p-5"
            >
              {/* Title header */}
              <div className="flex items-start gap-3">
                {item.posterPath && (
                  <img
                    src={item.posterPath}
                    alt={item.title}
                    className="poster-color aspect-[2/3] w-10 flex-shrink-0 rounded-sm object-cover"
                  />
                )}
                <div className="flex flex-col gap-0.5">
                  <p className="text-parchment-faint font-mono text-xs tracking-widest">
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p className="text-parchment font-mono text-base">
                    {item.title}
                  </p>
                  <p className="text-parchment-faint font-mono text-xs">
                    {item.runtime} min · {sessions.length} session
                    {sessions.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Sessions for this title */}
              <div className="ml-0 flex flex-col gap-2 md:ml-13">
                {sessions.map((s) => (
                  <div
                    key={s.sessionNumber}
                    className="border-line flex items-center justify-between rounded-sm border px-3 py-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="text-parchment-dim font-mono text-sm">
                        {s.date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-parchment-faint font-mono text-xs">
                        {formatTime(s.start)} — {formatTime(s.end)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-mono text-xs">
                        {s.durationMins} min
                      </p>
                      {sessions.length > 1 && (
                        <p className="text-parchment-faint font-mono text-xs">
                          mins {s.minuteStart}–{s.minuteEnd}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right — export */}
        <div className="flex flex-col gap-4">
          <div className="border-line flex flex-col gap-3 rounded-sm border p-5">
            <p className="text-parchment-faint font-mono text-xs tracking-widest">
              YOUR LIST
            </p>
            {list.items.map((item, i) => (
              <div key={item.tmdbId} className="flex items-center gap-2">
                <span className="text-parchment-faint w-5 flex-shrink-0 font-mono text-xs">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-parchment-dim flex-1 truncate font-mono text-xs">
                  {item.title}
                </p>
                <span className="text-parchment-faint flex-shrink-0 font-mono text-xs">
                  {item.runtime}m
                </span>
              </div>
            ))}
          </div>

          <div className="border-line flex flex-col gap-3 border-t pt-4">
            <p className="text-parchment-faint font-mono text-xs tracking-widest">
              EXPORT
            </p>
            {/* Pass the session plan so the PDF matches the sessions on
                screen rather than a week-based approximation */}
            <ExportButton
              plan={exportPlan}
              moviePlan={moviePlan}
              title={list.title}
              releaseYear={new Date().getFullYear().toString()}
            />
            <ShareButton title={list.title} />
          </div>
        </div>
      </div>
    </div>
  )
}
