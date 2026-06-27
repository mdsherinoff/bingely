'use client'

import { MoviePlan } from '@/lib/scheduler'
import { MediaItem, AvailabilityConfig } from '@/types/media'
import MovieSessionCard from './MovieSessionCard'
import MovieCalendar from './MovieCalendar'
import ExportButton from './ExportButton'
import ShareButton from './ShareButton'
import { WatchPlan } from '@/types/media'

interface MovieResultsProps {
  moviePlan: MoviePlan
  media: MediaItem
  exportPlan: WatchPlan
}

export default function MovieResults({
  moviePlan,
  media,
  exportPlan,
}: MovieResultsProps) {
  return (
    <div className="flex flex-col gap-12">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'FINISH DATE', value: moviePlan.completionDate },
          { label: 'SESSIONS', value: `${moviePlan.totalSessions}` },
          { label: 'RUNTIME', value: `${moviePlan.totalRuntime} min` },
          {
            label: 'TOTAL HOURS',
            value: `${Math.round((moviePlan.totalRuntime / 60) * 10) / 10}h`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="border-gold/10 bg-ink flex flex-col gap-1 rounded-sm border p-4"
          >
            <p className="text-parchment/30 font-mono text-xs tracking-widest">
              {s.label}
            </p>
            <p className="font-body text-parchment text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-parchment text-2xl">
          Viewing calendar
        </h2>
        <div className="border-gold/10 rounded-sm border p-6">
          <MovieCalendar sessions={moviePlan.sessions} />
        </div>
      </div>

      {/* Session list + export */}
      <div className="grid gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-4 md:col-span-2">
          <h2 className="font-display text-parchment text-2xl">
            Session breakdown
          </h2>
          <div className="flex flex-col gap-3">
            {moviePlan.sessions.map((session) => (
              <MovieSessionCard
                key={session.sessionNumber}
                session={session}
                totalRuntime={moviePlan.totalRuntime}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Poster */}
          {media.posterPath && (
            <div className="border-gold/10 aspect-[2/3] overflow-hidden rounded-sm border">
              <img
                src={media.posterPath}
                alt={media.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Export */}
          <div className="border-gold/10 flex flex-col gap-3 border-t pt-4">
            <p className="text-parchment/30 font-mono text-xs tracking-widest">
              EXPORT
            </p>
            <ExportButton
              plan={exportPlan}
              title={media.title}
              releaseYear={media.releaseYear}
              posterUrl={media.posterPath}
              genres={media.genres}
            />
            <ShareButton />
          </div>
        </div>
      </div>
    </div>
  )
}
