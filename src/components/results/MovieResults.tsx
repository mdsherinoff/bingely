'use client'

import Image from 'next/image'
import { MoviePlan } from '@/lib/scheduler'
import { MediaItem } from '@/types/media'
import MovieSessionCard from './MovieSessionCard'
import MovieCalendar from './MovieCalendar'
import WhereToWatch from '@/components/plan/WhereToWatch'
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
            className="border-line bg-ink flex flex-col gap-1 rounded-sm border p-4"
          >
            <p className="text-parchment-faint font-mono text-xs tracking-widest">
              {s.label}
            </p>
            <p className="text-parchment font-mono text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      <WhereToWatch id={media.id} type="movie" />

      {/* Calendar */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-parchment text-2xl">
          Viewing calendar
        </h2>
        <div className="border-line rounded-sm border p-6">
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
            <div className="border-line relative aspect-[2/3] overflow-hidden rounded-sm border">
              <Image
                src={media.posterPath}
                alt=""
                fill
                sizes="(min-width: 768px) 300px, 100vw"
                className="poster-color object-cover"
              />
            </div>
          )}

          {/* Export */}
          <div className="border-line flex flex-col gap-3 border-t pt-4">
            <p className="text-parchment-faint font-mono text-xs tracking-widest">
              EXPORT
            </p>
            <ExportButton
              plan={exportPlan}
              title={media.title}
              releaseYear={media.releaseYear}
              posterUrl={media.posterPath}
              genres={media.genres}
              moviePlan={moviePlan}
            />
            <ShareButton />
          </div>
        </div>
      </div>
    </div>
  )
}
