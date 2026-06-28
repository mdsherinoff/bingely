import { MediaItem } from '@/types/media'
import { Badge } from '@/components/ui'

interface MediaSummaryProps {
  media: MediaItem
}

export default function MediaSummary({ media }: MediaSummaryProps) {
  const runtime =
    media.mediaType === 'movie'
      ? `${media.runtime} min`
      : `${media.episodeCount} episodes · ${media.episodeRuntime} min each`

  const totalHours =
    media.mediaType === 'movie'
      ? Math.round(((media.runtime || 0) / 60) * 10) / 10
      : Math.round(
          ((media.episodeCount || 0) * (media.episodeRuntime || 24)) / 60
        )

  return (
    <div className="flex items-start gap-4">
      {/* Poster — smaller on mobile */}
      <div className="bg-ink border-gold/10 aspect-[2/3] w-16 flex-shrink-0 overflow-hidden rounded-sm border sm:w-24">
        {media.posterPath ? (
          <img
            src={media.posterPath}
            alt={media.title}
            className="poster-color h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-gold/20 font-mono text-2xl">◎</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col gap-2">
        <div>
          <h1 className="font-display text-parchment text-3xl leading-tight sm:text-4xl">
            {media.title}
          </h1>
          <p className="text-parchment/30 mt-1 font-mono text-xs">
            {media.releaseYear}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={media.mediaType === 'tv' ? 'rose' : 'gold'}>
            {media.mediaType === 'tv' ? 'Series' : 'Film'}
          </Badge>
          {media.genres.slice(0, 2).map((g) => (
            <Badge key={g} variant="muted">
              {g}
            </Badge>
          ))}
        </div>
        <p className="text-parchment/40 font-mono text-xs">{runtime}</p>
        <p className="text-gold/70 font-mono text-xs">
          {totalHours} hours total
        </p>
      </div>
    </div>
  )
}