'use client'

import { MixedListPlan } from '@/lib/scheduler'
import { CustomList, WatchPlan } from '@/types/media'
import MovieCalendar from './MovieCalendar'
import WeekRow from './WeekRow'
import MilestoneCard from './MilestoneCard'
import ExportButton from './ExportButton'
import ShareButton from './ShareButton'

interface MixedListResultsProps {
  mixedPlan: MixedListPlan
  list: CustomList
  exportPlan: WatchPlan
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${period}`
}

export default function MixedListResults({
  mixedPlan,
  list,
  exportPlan,
}: MixedListResultsProps) {
  const { moviePlan, tvPlan, totalHours, overallCompletionDate } = mixedPlan

  return (
    <div className="flex flex-col gap-12">
      {/* Overall summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'FINISH DATE', value: overallCompletionDate },
          { label: 'TITLES', value: `${list.items.length}` },
          { label: 'TOTAL HOURS', value: `${totalHours}h` },
          {
            label: 'BREAKDOWN',
            value: `${mixedPlan.movieItems.length} films · ${mixedPlan.tvItems.length} series`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border-gold/10 bg-ink flex flex-col gap-1 rounded-sm border p-4"
          >
            <p className="text-parchment/30 font-mono text-xs tracking-widest">
              {s.label}
            </p>
            <p className="font-body text-parchment text-base leading-tight">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Films section */}
      {moviePlan && moviePlan.sessions.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-parchment text-2xl">Films</h2>
            <span className="text-parchment/30 font-mono text-xs tracking-widest">
              {mixedPlan.movieItems.length} titles · {moviePlan.totalSessions}{' '}
              sessions
            </span>
          </div>

          {/* Calendar */}
          <div className="border-gold/10 rounded-sm border p-6">
            <MovieCalendar sessions={moviePlan.sessions} />
          </div>

          {/* Per-film session breakdown */}
          <div className="flex flex-col gap-4">
            {(() => {
              const filmItems = list.items.filter(
                (i) => i.mediaType === 'movie'
              )
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
                    item: filmItems[itemIndex],
                    sessions: currentSessions,
                  })
                  currentSessions = []
                  itemIndex++
                }
              }

              return itemSessions.map(({ item, sessions }, i) => (
                <div
                  key={item.tmdbId}
                  className="border-gold/10 flex flex-col gap-3 rounded-sm border p-5"
                >
                  <div className="flex items-start gap-3">
                    {item.posterPath && (
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="aspect-[2/3] w-10 flex-shrink-0 rounded-sm object-cover"
                      />
                    )}
                    <div className="flex flex-col gap-0.5">
                      <p className="text-parchment/30 font-mono text-xs tracking-widest">
                        FILM {String(i + 1).padStart(2, '0')}
                      </p>
                      <p className="font-body text-parchment text-base">
                        {item.title}
                      </p>
                      <p className="text-parchment/30 font-mono text-xs">
                        {item.runtime} min · {sessions.length} session
                        {sessions.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {sessions.map((s) => (
                      <div
                        key={s.sessionNumber}
                        className="border-gold/10 flex items-center justify-between rounded-sm border px-3 py-2"
                      >
                        <div className="flex flex-col gap-0.5">
                          <p className="font-body text-parchment/70 text-sm">
                            {s.date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-parchment/30 font-mono text-xs">
                            {formatTime(s.start)} — {formatTime(s.end)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-mono text-xs">
                            {s.durationMins} min
                          </p>
                          {sessions.length > 1 && (
                            <p className="text-parchment/20 font-mono text-xs">
                              mins {s.minuteStart}–{s.minuteEnd}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      )}

      {/* Divider between films and series */}
      {moviePlan && tvPlan && <div className="border-gold/10 border-t" />}

      {/* Series section */}
      {tvPlan && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-parchment text-2xl">Series</h2>
            <span className="text-parchment/30 font-mono text-xs tracking-widest">
              {mixedPlan.tvItems.length} titles · {tvPlan.totalWeeks} weeks
            </span>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="flex flex-col gap-3 md:col-span-2">
              <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto pr-2">
                {tvPlan.weeklyBlocks.map((block, i) => (
                  <WeekRow
                    key={block.week}
                    block={block}
                    totalEpisodes={tvPlan.totalEpisodes}
                    index={i}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="font-display text-parchment text-xl">
                Milestones
              </h3>
              <div className="flex flex-col">
                {tvPlan.milestones.map((m, i) => (
                  <MilestoneCard
                    key={m.percent}
                    milestone={m}
                    isLast={i === tvPlan.milestones.length - 1}
                  />
                ))}
              </div>

              {/* Series list */}
              <div className="border-gold/10 flex flex-col gap-2 border-t pt-4">
                <p className="text-parchment/30 mb-1 font-mono text-xs tracking-widest">
                  SERIES IN LIST
                </p>
                {list.items
                  .filter((i) => i.mediaType === 'tv')
                  .map((item, i) => (
                    <div key={item.tmdbId} className="flex items-center gap-2">
                      <span className="text-parchment/20 w-5 font-mono text-xs">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="font-body text-parchment/60 flex-1 truncate text-xs">
                        {item.title}
                      </p>
                      <span className="text-parchment/20 font-mono text-xs">
                        {item.runtime}m/ep
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export */}
      <div className="border-gold/10 flex flex-col gap-3 border-t pt-6">
        <p className="text-parchment/30 font-mono text-xs tracking-widest">
          EXPORT
        </p>
        <div className="flex gap-3">
          <ExportButton
            plan={exportPlan}
            title={list.title}
            releaseYear={new Date().getFullYear().toString()}
          />
          <ShareButton />
        </div>
      </div>
    </div>
  )
}
